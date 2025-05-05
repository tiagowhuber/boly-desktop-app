<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AlertModal from '@/components/AlertModal.vue'
import TermsModal from '@/components/TermsModal.vue'
import { router } from '../router/index'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/stores'

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
        modalWarning.value = response.data?.message || i18n.t("modal_register_error");
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function signGoogle() {
  window.electronAPI.loginWithGoogle()
}
</script>

<template>
  <div class="register-page-wrapper">
    <img src="@/assets/images/elements/11.png" alt="Decorative element" class="left-side-image" />
    <div class="register-container">
      <img src="@/assets/images/elements/9.png" alt="Decorative element" class="register-element-image top-image" />
      <div class="fields">
        <form @submit.prevent="openTerms()">
          <h1 class="register-title">{{$t('register').toUpperCase()}}</h1>
          <div class="form_group">
            <input type="email" v-model="email" class="form_field" placeholder="email" />
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
          <button class="register_button_text">{{$t('register').toLocaleUpperCase()}}</button>
          
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
        <div class="google-login">
          <form @submit.prevent="signGoogle()">
            <button class="google-login-button">
              <div class="google-logo-container">
                <img src="@/assets/svgs/google.svg" alt="Google" class="google-logo">
              </div>
              <span class="google-text">{{ $t('login_google') }}</span>
            </button>
          </form>
          <!-- <GoogleLogin :callback="handleGoogleLogin" /> -->
        </div>
        <div class="login">
          <p>{{$t('yes_account')}}</p>
          <RouterLink to="/login" style="color: white; text-decoration: underline;">{{$t('login')}}</RouterLink>
        </div>
      </div>
      <img src="@/assets/images/elements/8.png" alt="Decorative element" class="register-element-image bottom-image" />
    </div>
    <img src="@/assets/images/elements/10.png" alt="Decorative element" class="right-side-image" />
  </div>
</template>

<style scoped>
.register-page-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  padding: 0 1rem;
}

.register-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.register-element-image {
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
  .register-page-wrapper {
    flex-direction: column;
  }

  .right-side-image, .left-side-image {
    width: 20px;
    margin: 1rem 0;
  }

  .register-element-image {
    width: 20px;
  }
}

@media screen and (max-width: 480px) {
  .right-side-image, .left-side-image {
    width: 20px;
  }

  .register-element-image {
    width: 20px;
  }
}

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

.register-title{
  font-size: 3rem;
  text-align: center;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  transform: rotate(-1.5deg);
  letter-spacing: 0.2rem;
}

.register-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.register-container .fields {
  min-width: 300px;
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
  border-bottom: 2px solid white;
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
  color: white;
  pointer-events: none;
}

.register-container .fields .form_field:focus {
  padding-bottom: 6px;
  border-width: 3px;
  border-image: linear-gradient(to right, white);
  border-image-slice: 1;
}

.register-container .fields .form_field:focus ~ .form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  color: white;
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
  background-color: var(--boly-button-purple);
  border-radius: 15px;
  border: none; 
}

.register-container form button:hover {
  transition: 0.2s;
  background-color: var(--boly-button-purple-hover );
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

.google-login {
  display: stretch;
}

.google-sign-in-button {
  display: stretch;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: rgba(0, 0, 0, 0.54);
  border: 1px solid #dadce0;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  height: 40px;
  padding: 0;
  width: 100%;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.21px;
  transition: background-color 0.218s, border-color 0.218s, box-shadow 0.218s;
  cursor: pointer;
}

.google-sign-in-button:hover {
  background-color: #f7f8f8;
  border-color: #d2d2d2;
  box-shadow: 0 1px 1px 0 rgba(66, 133, 244, 0.3),
              0 1px 3px 1px rgba(66, 133, 244, 0.15);
}

.google-sign-in-button:active {
  background-color: #f1f1f1;
}

.google-icon {
  padding: 0 12px;
  display: flex;
  align-items: center;
}

.google-text {
  padding-right: 12px;
  flex-grow: 1;
  text-align: center;
  color: white;
}

.google-login-button {
  display: flex;
  align-items: center;
  height: 40px;
  width: 100%;
  margin-top: 1rem;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background-color: white;
  color: rgba(0, 0, 0, 0.54);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.21px;
  cursor: pointer;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  transition: background-color 0.218s, border-color 0.218s, box-shadow 0.218s;
  position: relative;
  overflow: visible;
  padding: 0;
}

.google-login-button:hover {
  background-color: #f7f8f8;
  border-color: #d2d2d2;
  box-shadow: 0 1px 1px 0 rgba(66, 133, 244, 0.3),
              0 1px 3px 1px rgba(66, 133, 244, 0.15);
}

.google-logo {
  margin-left: 30px;
  width: 18px;
  height: 18px;
  display: block;
}

.register-container .login {
  font-size: small;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light);
}

.register_button_text {
  font-family: 'Anton', sans-serif;
  font-size: larger;
  color: white;
}
</style>