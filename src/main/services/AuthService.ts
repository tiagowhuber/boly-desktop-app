import { WindowManager } from './WindowManager'
import axios from 'axios'
import { EventEmitter } from 'events'

export class AuthService extends EventEmitter {
  private static instance: AuthService
  private sessionMonitoringInterval: NodeJS.Timeout | null = null

  private constructor() {
    super()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Google Login functionality has been removed as per request.

  public async checkUserAuthentication(): Promise<boolean> {
    try {
      const currentToken = await WindowManager.getInstance().executeJavaScript(
        'localStorage.getItem("token")'
      )

      if (!currentToken) {
        console.log('No token found in localStorage - user has signed out')
        return false
      }

      // Validate session with backend
      try {
        // @ts-ignore
        const apiBaseUrl = import.meta.env.VITE_APP_API_URL
        const sessionResponse = await axios.post(
          `${apiBaseUrl}/v1/auth/validate-session`,
          {},
          {
            headers: { Authorization: `Bearer ${currentToken}` }
          }
        )

        if (sessionResponse.status !== 200) {
          console.log('Session validation failed with backend')
          return false
        }
      } catch (sessionError) {
        console.error('Backend session validation failed:', sessionError)
        return false
      }

      const base64Url = currentToken.split('.')[1]
      if (!base64Url) {
        return false
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          })
          .join('')
      )

      const tokenData = JSON.parse(jsonPayload)
      // Check if token is expired
      if (tokenData.exp && tokenData.exp < Date.now() / 1000) {
        console.log('Token is expired')
        return false
      }

      return true
    } catch (error: any) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  public startSessionMonitoring(): void {
    // Check session validity every 30 seconds
    this.sessionMonitoringInterval = setInterval(async () => {
      try {
        const currentToken = await WindowManager.getInstance().executeJavaScript(
          'localStorage.getItem("token")'
        )
        const currentSessionId = await WindowManager.getInstance().executeJavaScript(
          'localStorage.getItem("sessionId")'
        )

        if (!currentToken || !currentSessionId) {
          return // No active session
        }

        // Validate session with backend
        try {
          // @ts-ignore
          const apiBaseUrl = import.meta.env.VITE_APP_API_URL
          const sessionResponse = await axios.post(
            `${apiBaseUrl}/v1/auth/validate-session`,
            {},
            {
              headers: { Authorization: `Bearer ${currentToken}` }
            }
          )

          if (sessionResponse.status !== 200) {
            console.log('Session invalidated by server - logging out user')
            await this.handleSessionInvalidation()
          }
        } catch (sessionError) {
          console.error(
            'Session validation failed - another session may have been started:',
            sessionError
          )
          await this.handleSessionInvalidation()
        }
      } catch (error) {
        console.error('Error during session monitoring:', error)
      }
    }, 30000) // Check every 30 seconds
  }

  public stopSessionMonitoring(): void {
    if (this.sessionMonitoringInterval) {
      clearInterval(this.sessionMonitoringInterval)
      this.sessionMonitoringInterval = null
    }
  }

  public async handleSessionInvalidation(): Promise<void> {
    try {
      // Emit event so other services (like GameService) can react via index.ts orchestration
      this.emit('session-invalidated')

      // Clear local storage
      await WindowManager.getInstance().executeJavaScript(`
        localStorage.removeItem("token");
        localStorage.removeItem("sessionId");
      `)

      // Notify the renderer process to update UI
      WindowManager.getInstance().send('session-invalidated')
    } catch (error) {
      console.error('Error handling session invalidation:', error)
    }
  }
}
