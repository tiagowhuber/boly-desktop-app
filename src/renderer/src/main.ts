import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useAuth } from '@renderer/stores'
import vue3GoogleLogin from 'vue3-google-login'
import axios from 'axios'

const pinia = createPinia()
const app = createApp(App)

app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID
})
app.use(pinia)
app.use(router)
app.use(i18n)

const auth = useAuth()

axios.defaults.baseURL = import.meta.env.VITE_APP_API_URL
axios.interceptors.request.use((config) => {  
  const token = localStorage.getItem('token')
  if (token) {
    auth.checkToken()
  }
  return config
})

app.mount('#app')
