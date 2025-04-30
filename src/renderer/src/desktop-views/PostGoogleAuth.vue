<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import Loading from '@/components/LoadingIcon.vue'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser, useGames, useAchievements } from '../stores'
import axios from 'axios'

const auth = useAuth()
const router = useRouter()

if (auth.isLoggedIn) {
}

onMounted(async () => {
  console.log(window.location)
  const valores = window.location.search;
  const urlParams = new URLSearchParams(valores);

//Accedemos a los valores
var auth_code = urlParams.get('code');

  /*
  https://oauth2.googleapis.com/token
  client_id	El ID de cliente obtenido de .
client_secret	El secreto de cliente obtenido de .
code	Es el código de autorización que se muestra en la solicitud inicial.
code_verifier	El verificador de código que creaste en el paso 1
grant_type	Como se define en la especificación de OAuth 2.0, el valor de este campo debe establecerse en authorization_code.
redirect_uri	Uno de los URIs de redireccionamiento que se enumeran para tu proyecto en el para el client_id determinado.
  */
  const data = new URLSearchParams({
    client_id: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID,
    client_secret: import.meta.env.VITE_APP_GOOGLE_CLIENT_SECRET,
    code: auth_code,
    code_verifier: import.meta.env.VITE_APP_GOOGLE_CODE,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:5173/post-google-login',
  })
  const response = await axios.post(`https://oauth2.googleapis.com/token`,data.toString(),{
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  auth.googleLogin(response.data.id_token,router)
  window.electronAPI.resolveGoogleLogin()
  //LLamar a google login con el id_token
})
</script>

<template>
  <div class="Section">testing</div>
</template>

<style scoped></style>
