import { spawn, exec } from 'child_process'
import axios from 'axios'
import { WindowManager } from './WindowManager'
import { AuthService } from './AuthService'

interface ActiveGameSession {
  pid: number
  game_id: number
  token: string
  sessionStartTime: number
  lastRecordedPlayTimeMinutes: number
  intervalId?: NodeJS.Timeout
}

export default class GameService {
  private static instance: GameService
  private activeGameSession: ActiveGameSession | null = null
  private gameSessionLaunching = false
  private PLAYTIME_UPDATE_INTERVAL_MS = 60 * 1000 // every 1 minute

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService()
    }
    return GameService.instance
  }

  public isActive(gameId: number): boolean {
    return this.activeGameSession !== null && this.activeGameSession.game_id === gameId
  }

  public hasActiveSession(): boolean {
    return this.activeGameSession !== null
  }

  public async fetchInitialPlayTime(token: string, game_id: number): Promise<number> {
    try {
      // @ts-ignore
      const apiBaseUrl = import.meta.env.VITE_APP_API_URL
      const response = await axios.get(`${apiBaseUrl}/v1/games/${game_id}/playtime`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data && typeof response.data.play_time === 'number') {
        return response.data.play_time
      }
      return 0
    } catch (error) {
      console.error('Failed to fetch initial playtime:', error)
      return 0
    }
  }

  public async sendPlayTimeUpdate(
    token: string,
    game_id: number,
    totalPlayTimeMinutes: number
  ): Promise<boolean> {
    try {
      // @ts-ignore
      const apiBaseUrl = import.meta.env.VITE_APP_API_URL
      await axios.post(
        `${apiBaseUrl}/v1/games/updatePlayTime`,
        {
          game_id: game_id,
          play_time: Math.round(totalPlayTimeMinutes)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      console.log(`Playtime updated for game ${game_id}: ${totalPlayTimeMinutes} minutes`)
      return true
    } catch (error: any) {
      console.error('Failed to send playtime update:', error)
      if (error.response && error.response.status === 403) {
        console.error('Authentication failed - user may not be signed in')
        return false
      }
      return true
    }
  }

  public stopPlaytimeTracking(): void {
    if (this.activeGameSession && this.activeGameSession.intervalId) {
      clearInterval(this.activeGameSession.intervalId)
    }

    const stoppedGameId = this.activeGameSession?.game_id
    this.activeGameSession = null
    this.gameSessionLaunching = false

    if (stoppedGameId) {
      WindowManager.getInstance().send('game-stopped', {
        gameId: stoppedGameId
      })
    }

    console.log('Playtime tracking stopped.')
  }

  public async cleanupActiveGameSession(): Promise<void> {
    if (this.activeGameSession) {
      console.log(`Terminating active game session with PID: ${this.activeGameSession.pid}`)

      try {
        const endTime = Date.now()
        const sessionDurationMinutes =
          (endTime - this.activeGameSession.sessionStartTime) / (1000 * 60)
        const finalTotalPlayTimeMinutes =
          this.activeGameSession.lastRecordedPlayTimeMinutes + sessionDurationMinutes

        await this.sendPlayTimeUpdate(
          this.activeGameSession.token,
          this.activeGameSession.game_id,
          finalTotalPlayTimeMinutes
        )

        const gamePid = this.activeGameSession.pid

        if (process.platform === 'win32') {
          exec(`taskkill /pid ${gamePid} /f /t`, (err) => {
            if (err) console.error('Error killing game process:', err)
          })
        } else {
          try {
            process.kill(gamePid, 'SIGTERM')
            setTimeout(() => {
              try {
                process.kill(gamePid, 'SIGKILL')
              } catch {
                // Ignore if already dead
              }
            }, 3000)
          } catch {
            console.log('Game process already terminated or not found')
          }
        }
        this.stopPlaytimeTracking()
      } catch (error) {
        console.error('Error during game session cleanup:', error)
        this.stopPlaytimeTracking()
      }
    }
  }

  public async playGame(appData: any): Promise<any> {
    const { appPath, game_id, token } = appData

    if (this.activeGameSession) {
      console.warn('Another game session is already active. Please stop it first.')
      return { error: 'Another game session is active.' }
    }

    if (this.gameSessionLaunching) {
      console.warn('A game is already being launched. Please wait.')
      return { error: 'A game is already being launched. Please wait.' }
    }

    this.gameSessionLaunching = true

    try {
      console.log('Game path: ' + appPath)
      console.log('Game ID: ' + game_id)

      const reqValidate = { game_id, token }

      // @ts-ignore
      const apiBaseUrl = import.meta.env.VITE_APP_API_URL
      const validationResponse = await axios.post(`${apiBaseUrl}/v1/validate/`, reqValidate, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (validationResponse.data && validationResponse.data.tempKey) {
        console.log('Validation successful:', validationResponse.data)

        const lastRecordedPlayTimeMinutes = await this.fetchInitialPlayTime(token, game_id)

        const args = `-game_id ${reqValidate.game_id} -key ${validationResponse.data.tempKey} -token ${token}`
        const appProcess = spawn('"' + appPath + '"', args.split(' '), {
          shell: true,
          detached: false
        })

        if (!appProcess.pid) {
          console.error('Failed to launch application or get PID.')
          this.gameSessionLaunching = false
          return { error: 'Failed to launch game process.' }
        }

        console.log(`Game started with PID: ${appProcess.pid}`)
        this.activeGameSession = {
          pid: appProcess.pid,
          game_id: game_id,
          token: token,
          sessionStartTime: Date.now(),
          lastRecordedPlayTimeMinutes: lastRecordedPlayTimeMinutes
        }

        this.gameSessionLaunching = false

        WindowManager.getInstance().send('game-started', {
          gameId: game_id,
          pid: appProcess.pid
        })

        this.activeGameSession.intervalId = setInterval(async () => {
          if (this.activeGameSession) {
            try {
              process.kill(this.activeGameSession.pid, 0)

              // Check if user is still authenticated using AuthService singleton
              const isAuthenticated = await AuthService.getInstance().checkUserAuthentication()
              if (!isAuthenticated) {
                console.log('User is no longer authenticated. Terminating game...')
                await this.cleanupActiveGameSession()
                return
              }

              const currentTime = Date.now()
              const sessionDurationMinutes =
                (currentTime - this.activeGameSession.sessionStartTime) / (1000 * 60)
              const newTotalPlayTimeMinutes =
                this.activeGameSession.lastRecordedPlayTimeMinutes + sessionDurationMinutes

              const updateSuccess = await this.sendPlayTimeUpdate(
                this.activeGameSession.token,
                this.activeGameSession.game_id,
                newTotalPlayTimeMinutes
              )

              if (!updateSuccess) {
                await this.cleanupActiveGameSession()
                return
              }
            } catch {
              // Process died
              this.cleanupActiveGameSession()
            }
          }
        }, this.PLAYTIME_UPDATE_INTERVAL_MS)

        appProcess.on('exit', async () => {
          this.cleanupActiveGameSession()
        })

        appProcess.on('error', async () => {
          this.cleanupActiveGameSession()
        })

        return { success: true, pid: appProcess.pid }
      } else {
        this.gameSessionLaunching = false
        return { error: 'Game validation failed.' }
      }
    } catch (error: any) {
      console.error('Error in play-game handler:', error.message)
      this.gameSessionLaunching = false
      await this.cleanupActiveGameSession()
      return { error: 'Failed to play game: ' + error.message }
    }
  }
}
