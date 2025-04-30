<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AlertModal from '@/components/AlertModal.vue'

import { useAuth } from '@/stores'
import { useI18n } from 'vue-i18n'
import { GoogleLogin } from 'vue3-google-login'

interface GoogleResponse {
  credential: string
}

const i18n = useI18n()

const auth = useAuth()
const router = useRouter()

const showModal = ref<boolean>(false)
const modalWarning = ref<string>('')

const email = ref<string>('')
const password = ref<string>('')

function modalCallback(): void {
  showModal.value = false
  if (auth.isLoggedIn) router.push('/')
}

async function submit(): Promise<void> {
  console.log('submit')
  if (email.value.length === 0 || password.value.length === 0) {
    showModal.value = true
    modalWarning.value = i18n.t('modal_all_fields') as string
    return
  }

  await auth.login(email.value, password.value, router)

  if (auth.isLoggedIn) {
    router.push('/')
  } else {
    showModal.value = true
    modalWarning.value =
      (i18n.t('error') as string) + ': ' + (i18n.t('invalid_credentials') as string)
  }
}

async function handleGoogleLogin(response: GoogleResponse): Promise<void> {
  await auth.googleLogin(response.credential, router)
}
async function signGoogle() {
  window.electronAPI.loginWithGoogle()
}
</script>

<template>
  <div class="login-page-wrapper">
    <img src="@/assets/images/elements/11.png" alt="Decorative element" class="left-side-image" />
    <div class="login-container">
      <img
        src="@/assets/images/elements/9.png"
        alt="Decorative element"
        class="login-element-image top-image"
      />
      <div class="fields">
        <form @submit.prevent="submit()">
          <h1 class="login-title">{{ $t('login').toUpperCase() }}</h1>
          <div class="form_group">
            <input type="text" v-model="email" class="form_field" placeholder="email or username" />
            <label for="name" class="form_label">{{ $t('login_email') }}</label>
          </div>
          <div class="form_group">
            <input type="password" v-model="password" class="form_field" placeholder="Password" />
            <label for="name" class="form_label">{{ $t('password') }}</label>
          </div>
          <button class="login_button_text">{{ $t('login').toUpperCase() }}</button>

          <Teleport to="body">
            <AlertModal :show="showModal" @close="modalCallback">
              <template #header>
                <h3>{{ $t('notification') }}</h3>
              </template>
              <template #body> {{ modalWarning }} </template>
            </AlertModal>
          </Teleport>
        </form>
        <div class="login-container">
          <form @submit.prevent="signGoogle()">
          <button class="login_button_text" >
            {{ $t('login_google').toUpperCase() }}
          </button>
        </form>
          <!-- <GoogleLogin :callback="handleGoogleLogin" /> -->
        </div>
        <div class="register">
          <p>{{ $t('no_account') }}</p>
          <RouterLink to="/register" style="color: white; text-decoration: underline">{{
            $t('register')
          }}</RouterLink>
        </div>
      </div>
      <img
        src="@/assets/images/elements/8.png"
        alt="Decorative element"
        class="login-element-image bottom-image"
      />
    </div>
    <img src="@/assets/images/elements/10.png" alt="Decorative element" class="right-side-image" />
  </div>
</template>

<style scoped>
a {
  color: var(--lightGreen);
}

a:hover {
  color: var(--lightCyan);
}

h1 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

.login-page-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  padding: 0 1rem;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-title {
  font-size: 3rem;
  text-align: center;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  transform: rotate(-1.5deg);
  letter-spacing: 0.2rem;
}

.login-container .fields {
  min-width: 300px;
  border-radius: 20px;
  padding: 2rem;
}

/* input form */

.login-container .fields .form_group {
  position: relative;
  padding: 20px 0 0;
}

.login-container .fields .form_field {
  width: 100%;
  border: none;
  border-bottom: 2px solid white;
  border-radius: 0px;
  outline: 0;
  color: #fff;
  padding: 7px 0;
  background: transparent;
  transition: border-color 0.2s;
}

.login-container .fields .form_field::placeholder {
  color: transparent;
}

.login-container .fields .form_field:placeholder-shown ~ .form_label {
  cursor: text;
  top: 20px;
}

.login-container .fields .form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  /* color: var(--boly-text-inactive-blue); */
  pointer-events: none;
  font-family: 'Poppins', sans-serif;
}

.login-container .fields .form_field:focus {
  padding-bottom: 6px;
  border-width: 3px;
  border-image: linear-gradient(to right, white);
  border-image-slice: 1;
}

.login-container .fields .form_field:focus ~ .form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  color: white;
  font-size: small;
}

.login-container .fields .form_field:required,
.form_field:invalid {
  box-shadow: none;
}

/* --- */

.login-container form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-container form button {
  height: 35px;
  padding: 0 15px;
  margin-top: 1rem;
  float: right;
  background-color: var(--lightGreen);
  color: white;
  border: none;
  border-radius: 15px;
  background-color: var(--boly-button-purple);
}

.login-container form button:hover {
  transition: 0.2s;
  background-color: var(--boly-button-purple-hover);
}

.login-container form :deep(.google-button) {
  width: 100%;
  height: 35px;
  margin-top: 1rem;
  border-radius: 2px !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container .register {
  font-size: small;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light);
}

.login_button_text {
  font-family: 'Anton', sans-serif;
  font-size: larger;
}

.google-login {
  display: flex;
  justify-content: center;
}

.login-element-image {
  margin-top: 20px;
  width: 40px;
  height: auto;
}

.right-side-image {
  position: relative;
  width: 40px;
  height: auto;
  margin-left: 0.5rem;
}

.left-side-image {
  position: relative;
  width: 40px;
  height: auto;
  margin-right: 0.5rem;
}

/* Media queries for responsive design */
@media screen and (max-width: 768px) {
  .login-page-wrapper {
    flex-direction: column;
  }

  .right-side-image,
  .left-side-image {
    width: 20px;
    margin: 1rem 0;
  }

  .login-element-image {
    width: 20px;
  }
}

@media screen and (max-width: 480px) {
  .right-side-image,
  .left-side-image {
    width: 20px;
  }

  .login-element-image {
    width: 20px;
  }

  .login-title {
    font-size: 2rem;
  }
}
</style>
