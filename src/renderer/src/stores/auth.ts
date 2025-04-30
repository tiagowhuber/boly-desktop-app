import axios from 'axios'
import { defineStore } from 'pinia'
import { jwtDecode } from "jwt-decode";
import { useUser } from '.'
import type { Router } from 'vue-router'
import type { User } from '@/types';

const useAuth = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    isLoggedIn: false,
    error: undefined,
    verifying: false,
    lastTokenCheck: 0
  }),
  actions: {
    async login(email: string, password: string, router: Router) {
      try {
        const response = await axios.post('/v1/auth', {
          email: email,
          password: password
        })
        if (response.status == 200) {
          localStorage.setItem('token', response.data.token)

          const user = useUser()
          
          const decodedData = jwtDecode<User>(response.data.token)
          user.setUser(decodedData)

          this.token = response.data.token
          this.isLoggedIn = true
          
          router.push('/');
        } else {
          this.error = response.data.message
          console.error(this.error);
        }
      } catch (error: any) {
        console.log(error)
        this.error = error.message
        console.error(this.error);
      }
    },
    async googleLogin(credential: string, router: Router) {
      try {
        const response = await axios.post('/v1/auth/google', {
          credential: credential
        })
        if (response.status == 200) {
          localStorage.setItem('token', response.data.token)

          const user = useUser()
          
          const decodedData = jwtDecode<User>(response.data.token)
          user.setUser(decodedData)

          this.token = response.data.token
          this.isLoggedIn = true
        
          router.push('/');
        }
      } catch (error) {
        console.log(error)
        console.error(error);
      }
    },    
    
    async checkToken(forceLoad = false) {
      if (!forceLoad) {
        // Prevent multiple simultaneous checks
        if (this.verifying) {
          return;
        }

        // Only check once every 5 seconds maximum
        const now = Date.now();
        if (now - this.lastTokenCheck < 5000) {
          return;
        }
      }
      
      this.lastTokenCheck = Date.now();
      this.verifying = true;
      
      try {
        if (!localStorage.getItem('token')) {
          this.isLoggedIn = false;
          this.verifying = false;
          return;
        }

        const tokenData = jwtDecode(localStorage.getItem('token')!)
        if (tokenData.exp! < Date.now() / 1000) {
          await this.refreshToken()
        } else {
          const user = useUser()
          user.setUser(tokenData as User)
          this.isLoggedIn = true
          this.token = localStorage.getItem('token')!
          axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          
          if (forceLoad && user.userId) {
            try {
              const response = await axios.get(`/v1/users/${user.userId}`)
              if (response.status === 200) {
                user.setUser(response.data)
              }
            } catch (userError) {
              console.error('Error fetching complete user data:', userError)
            }
          }
        }
      } catch (error) {
        console.error('Token validation error:', error)
        // Clear invalid token state
        this.token = ''
        localStorage.removeItem('token')
        this.isLoggedIn = false
        throw error; 
      } finally {
        this.verifying = false
      }
    },
    async refreshToken() {
      try {
        const response = await axios.post('/v1/auth/refresh', {
          token: this.token
        })
        if (response.status == 200) {
          const user = useUser()
          const userData = response.data.user;
          user.setUser(userData)
          this.isLoggedIn = true
          this.token = response.data.token;
          localStorage.setItem('token', response.data.token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        }
      } catch (error) {
        console.log(error)
      }
    },
    async register(email: string, username: string, password: string) {
      try {
        const response = await axios.post('/v1/users', {
          email,
          username,
          password
      });
      return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    logout() {
      const user = useUser()
      this.token = ''
      localStorage.removeItem('token')
      this.isLoggedIn = false 
      this.error = undefined
      user.clearUser()
    }
  }
})

export default useAuth