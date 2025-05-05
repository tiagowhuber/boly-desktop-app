<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../stores'
import axios from 'axios'
import Loading from '@/components/LoadingIcon.vue'

const auth = useAuth()
const router = useRouter()

if (auth.isLoggedIn) {
}

onMounted(async () => {
  console.log(window.location)
  const valores = window.location.search
  const urlParams = new URLSearchParams(valores)

  //Accedemos a los valores
  var auth_code = urlParams.get('code')
  if (!auth_code) {
    throw new Error('No authorization code received from Google')
  }

  const data = new URLSearchParams({
    client_id: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_GOOGLE_CLIENT_SECRET,
    code: auth_code,
    code_verifier: import.meta.env.VITE_APP_GOOGLE_CODE,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:5173/post-google-login'
  })
  const response = await axios.post(`https://oauth2.googleapis.com/token`, data.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  auth.googleLogin(response.data.id_token, router)
  window.electronAPI.resolveGoogleLogin()
  //LLamar a google login con el id_token
})
</script>

<template>
  <div class="view-container">
    <div class="app-loading">
      <Loading />
    </div>
  </div>
  
</template>

<style scoped>
.view-container {
  flex-grow: 1;
}
</style>
