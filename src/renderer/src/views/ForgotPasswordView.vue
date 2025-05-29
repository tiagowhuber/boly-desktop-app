<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/stores';
import { useI18n } from 'vue-i18n';
import AlertModal from '@/components/AlertModal.vue';

const i18n = useI18n();
const auth = useAuth();

const email = ref<string>('');
const showModal = ref<boolean>(false);
const modalTitle = ref<string>('');
const modalMessage = ref<string>('');

function modalCallback(): void {
  showModal.value = false;
}

async function submit(): Promise<void> {
  if (email.value.length === 0) {
    modalTitle.value = i18n.t("notification") as string;
    modalMessage.value = i18n.t("modal_email_required") as string; 
    showModal.value = true;
    return;
  }

  try {
    await auth.requestPasswordReset(email.value);
    modalTitle.value = i18n.t("success") as string; 
    modalMessage.value = i18n.t("password_reset_email_sent") as string;
    showModal.value = true;
  } catch (error: any) {
    modalTitle.value = i18n.t("error") as string;
    modalMessage.value = error.message || (i18n.t("error_requesting_password_reset") as string); 
    showModal.value = true;
  }
}
</script>

<template>
  <div class="forgot-password-page-wrapper">
    <img src="@/assets/images/elements/11.png" alt="Decorative element" class="left-side-image" />
    <div class="forgot-password-container">
      <img src="@/assets/images/elements/9.png" alt="Decorative element" class="forgot-password-element-image top-image" />
      <h1 class="forgot-password-title">{{ $t('forgot_password_title').toUpperCase() }}</h1>
      <div class="fields">
        <form @submit.prevent="submit()">
          <p class="info-text">{{ $t('forgot_password_info_text') }}</p>
          <div class="form_group">
            <input type="email" v-model="email" class="form_field" placeholder="email" required />
            <label for="email" class="form_label">{{ $t('login_email') }}</label>
          </div>
          <button class="submit_button_text" type="submit">{{ $t('submit').toUpperCase() }}</button>
          <Teleport to="body">
            <AlertModal :show="showModal" @close="modalCallback">
              <template #header>
                <h3>{{ modalTitle }}</h3>
              </template>
              <template #body> {{ modalMessage }} </template>
            </AlertModal>
          </Teleport>
        </form>
        <div class="back-to-login">
          <RouterLink to="/login" style="color: white; text-decoration: underline;">{{ $t('back_to_login') }}</RouterLink>
        </div>
      </div>
      <img src="@/assets/images/elements/8.png" alt="Decorative element" class="forgot-password-element-image bottom-image" />
    </div>
    <img src="@/assets/images/elements/10.png" alt="Decorative element" class="right-side-image" />
  </div>
</template>

<style scoped>
h1 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

.forgot-password-page-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  padding: 1rem;
  min-height: 70vh;
}

.forgot-password-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  position: relative; /* Added for positioning decorative images */
}

.forgot-password-title {
  font-size: 2.5rem;
  text-align: center;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  letter-spacing: 0.1rem;
  margin-bottom: 1.5rem;
}

.info-text {
  text-align: center;
  margin-bottom: 1.5rem;
  font-family: 'Poppins', sans-serif;
}

.fields {
  width: 100%;
}

.form_group {
  position: relative;
  padding: 20px 0 0;
  margin-bottom: 1rem;
}

.form_field {
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

.form_field::placeholder {
  color: transparent;
}

.form_field:placeholder-shown~.form_label {
  cursor: text;
  top: 20px;
}

.form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  pointer-events: none;
  font-family: 'Poppins', sans-serif;
}

.form_field:focus {
  padding-bottom: 6px;
  border-width: 3px;
  border-image: linear-gradient(to right, white);
  border-image-slice: 1;
}

.form_field:focus~.form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  color: white;
  font-size: small;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.submit_button_text {
  height: 35px;
  padding: 0 15px;
  margin-top: 1rem;
  background-color: var(--boly-button-purple);
  color: white;
  border: none;
  border-radius: 15px;
  font-family: 'Anton', sans-serif;
  font-size: larger;
  cursor: pointer;
}

.submit_button_text:hover {
  transition: 0.2s;
  background-color: var(--boly-button-purple-hover);
}

.back-to-login {
  margin-top: 1.5rem;
  text-align: center;
  font-size: small;
  font-family: 'Poppins', sans-serif;
}

.back-to-login a {
  color: var(--lightGreen);
}

.back-to-login a:hover {
  color: var(--lightCyan);
}

.forgot-password-element-image {
  margin-top: 20px;
  width: 40px;
  height: auto;
}

.top-image {
  position: absolute;
  top: -50px; 
  align-self: center;
}

.bottom-image {
  position: absolute;
  bottom: -30px; 
  align-self: center;
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

@media screen and (max-width: 768px) {
  .forgot-password-page-wrapper {
    flex-direction: column;
  }
  .forgot-password-title {
    font-size: 2rem;
  }
  .forgot-password-container {
    padding: 1.5rem;
  }
  .right-side-image{
    width: 20px;
    margin: 1rem 0;
    top: 30px;
  }
  .left-side-image {
    width: 20px;
    margin: 1rem 0;
    top: -30px;
  }
  .forgot-password-element-image {
    width: 20px;
  }
}

@media screen and (max-width: 480px) {
  .forgot-password-title {
    font-size: 1.8rem;
  }
  .right-side-image, .left-side-image {
    width: 20px;
  }
  .forgot-password-element-image {
    width: 20px;
  }
}
</style>
