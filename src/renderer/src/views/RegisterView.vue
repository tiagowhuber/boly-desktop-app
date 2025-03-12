<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AlertModal from '@renderer/components/AlertModal.vue'
import TermsModal from '@renderer/components/TermsModal.vue'
import { router } from '../router/index'
import { useI18n } from 'vue-i18n'
import { GoogleLogin } from 'vue3-google-login'
import { useAuth } from '@renderer/stores'

interface GoogleLoginResponse {
  credential: string;
}

const i18n = useI18n();
const auth = useAuth();

const showModal = ref<boolean>(false)
const showTerms = ref<boolean>(false)
const modalWarning = ref<string>('')

const email = ref<string>('')
const username = ref<string>('')
const password = ref<string>('')
const repassword = ref<string>('')

function openTerms(): void {
  if (
    email.value.length == 0 ||
    username.value.length == 0 ||
    password.value.length == 0 ||
    repassword.value.length == 0
  ) {
    showModal.value = true
    modalWarning.value = i18n.t("modal_all_fields");
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
  if (!emailRegex.test(email.value)) {
    showModal.value = true;
    modalWarning.value = i18n.t("modal_invalid_email");
    return;
  }

  if (password.value != repassword.value) {
    showModal.value = true
    modalWarning.value = i18n.t("modal_same_passwords");
    return
  }

  if (password.value.length < 8 || !/[A-Z]/.test(password.value) || !/\d/.test(password.value)) {
    showModal.value = true
    modalWarning.value = i18n.t("modal_weak_password");
    return
  }

  showTerms.value = true;
}

async function submit(): Promise<void> {
  if (
    email.value.length === 0 ||
    username.value.length === 0 ||
    password.value.length === 0 ||
    repassword.value.length === 0
  ) {
    showTerms.value = false;
    showModal.value = true;
    modalWarning.value = i18n.t("modal_all_fields");
    return;
  }

  if (password.value !== repassword.value) {
    showTerms.value = false;
    showModal.value = true;
    modalWarning.value = i18n.t("modal_same_passwords");
    return;
  }

  // Print the registration data
  console.log("Register data:", { 
    email: email.value, 
    username: username.value, 
    password: password.value, 
    repassword: repassword.value 
  });

  try {
    const response = await auth.register(email.value, username.value, password.value);
    if (response) {
      showModal.value = true;
      password.value = '';
      repassword.value = '';

      if (response.status === 201) {
        modalWarning.value = i18n.t("modal_register_success");
        router.push({ path: '/login', query: { username: email.value } });
      } else if (response.status === 409) {
        modalWarning.value = i18n.t("modal_email_taken");
      } else {
        const data = await response.json();
        modalWarning.value = data.message || i18n.t("modal_register_error");
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function handleGoogleLogin(response: GoogleLoginResponse): Promise<void> {
  await auth.googleLogin(response.credential, router)
}
</script>

<template>
  <div class="register-container">
    <div class="fields">
      <form @submit.prevent="openTerms()">
        <h1>{{$t('register')}}</h1>
        <div class="form_group">
          <input type="email" v-model="email" class="form_field" placeholder="E-mail" />
          <label for="name" class="form_label">{{$t('email')}}</label>
        </div>
        <div class="form_group">
          <input type="text" v-model="username" class="form_field" placeholder="Username" />
          <label for="name" class="form_label">{{$t('username')}}</label>
        </div>
        <div class="form_group">
          <input type="password" v-model="password" class="form_field" placeholder="Password" />
          <label for="name" class="form_label">{{$t('password')}}</label>
        </div>
        <div class="form_group">
          <input type="password" v-model="repassword" class="form_field" placeholder="Repassword" />
          <label for="name" class="form_label">{{$t('repassword')}}</label>
        </div>
        <button>{{$t('register')}}</button>
        <GoogleLogin :callback="handleGoogleLogin" />
        <Teleport to="body">
          <AlertModal :show="showModal" @close="showModal = false">
            <template #header>
              <h3>{{$t('error')}}</h3>
            </template>
            <template #body>
              {{ modalWarning }}
            </template>
          </AlertModal>
          <TermsModal :show="showTerms" @close="showTerms = false" @confirm="showTerms = false; submit()">
            <template #header>
              <h3>{{$t('terms_of_service')}}</h3>
            </template>
          </TermsModal>
        </Teleport>
      </form>
      <div class="login">
        <p>{{$t('yes_account')}}</p>
        <RouterLink to="/login">{{$t('login')}}</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

a{
  color: var(--lightGreen)
}

a:hover{
  color: var(--lightCyan)
}

h1{
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
}

.register-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.register-container .fields {
  min-width: 300px;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 20px;
  padding: 2rem;
}

/* input form */

.register-container .fields .form_group {
  position: relative;
  padding: 20px 0 0;
}

.register-container .fields .form_field {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--boly-text-inactive-blue);
  border-radius: 0px;
  outline: 0;
  color: #fff;
  padding: 7px 0;
  background: transparent;
  transition: border-color 0.2s;
}

.register-container .fields .form_field::placeholder {
  color: transparent;
}

.register-container .fields .form_field:placeholder-shown ~ .form_label {
  cursor: text;
  top: 20px;
}

.register-container .fields .form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  color: var(--boly-text-inactive-blue);
  pointer-events: none;
}

.register-container .fields .form_field:focus {
  padding-bottom: 6px;
  border-width: 3px;
  border-image: linear-gradient(to right, var(--lightGreen), var(--lightGreen));
  border-image-slice: 1;
}

.register-container .fields .form_field:focus ~ .form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  color: var(--lightGreen);
  font-size: small;
}

.register-container .fields .form_field:required,
.form_field:invalid {
  box-shadow: none;
}

/* --- */

.register-container form {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.register-container form button {
  height: 35px;
  padding: 0 15px;
  margin-top: 1rem;
  float: right;
  background-color: var(--lightGreen);
  color: white;
  border: none;
  border-radius: 2px;
}

.register-container form button:hover {
  transition: 0.2s;
  background-color: var(--lightCyan);
}

.register-container form :deep(.google-button) {
  width: 100%;
  height: 35px;
  margin-top: 1rem;
  border-radius: 2px !important;
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-container .login {
  font-size: small;
  display: flex;
  align-items: center;
  color: var(--light);
}
</style>