<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/stores';
import { useI18n } from 'vue-i18n';
import AlertModal from '@/components/AlertModal.vue';

const auth = useAuth();
const route = useRoute();
const router = useRouter();
const i18n = useI18n();

const newPassword = ref<string>('');
const confirmNewPassword = ref<string>('');
const token = ref<string>('');

const showModal = ref<boolean>(false);
const modalMessage = ref<string>('');
const modalTitle = ref<string>('');
const isLoading = ref<boolean>(false);
const success = ref<boolean>(false);

onMounted(() => {
  if (route.query.token && typeof route.query.token === 'string') {
    token.value = route.query.token;
  } else {
    modalTitle.value = i18n.t('error_title');
    modalMessage.value = i18n.t('reset_password_invalid_token_on_mount');
    showModal.value = true;
  }
});

async function handleSubmit() {
  if (!token.value) {
    modalTitle.value = i18n.t('error_title');
    modalMessage.value = i18n.t('reset_password_token_missing');
    showModal.value = true;
    return;
  }

  if (newPassword.value.length < 8) {
    modalTitle.value = i18n.t('error_title');
    modalMessage.value = i18n.t('reset_password_too_short');
    showModal.value = true;
    return;
  }

  if (newPassword.value !== confirmNewPassword.value) {
    modalTitle.value = i18n.t('error_title');
    modalMessage.value = i18n.t('reset_password_mismatch');
    showModal.value = true;
    return;
  }

  isLoading.value = true;
  success.value = false;
  try {
    const response = await auth.confirmPasswordReset(token.value, newPassword.value);
    modalTitle.value = i18n.t('success_title');
    modalMessage.value = response.message || i18n.t('reset_password_success_message');
    success.value = true;
    showModal.value = true;
  } catch (error: any) {
    modalTitle.value = i18n.t('error_title');
    modalMessage.value = error.message || i18n.t('reset_password_error_generic');
    showModal.value = true;
  } finally {
    isLoading.value = false;
  }
}

function closeModal() {
  showModal.value = false;
  if (success.value) {
    router.push('/login');
  }
}
</script>

<template>
  <div class="confirm-password-reset-page-wrapper">
    <img src="@/assets/images/elements/11.png" alt="Decorative element" class="left-side-image" />
    <div class="confirm-password-reset-container">
      <img src="@/assets/images/elements/9.png" alt="Decorative element" class="confirm-password-reset-element-image top-image" />
      <div class="confirm-password-reset-card">
        <h1>{{ $t('reset_password_title') }}</h1>
        <form @submit.prevent="handleSubmit">
          <div class="form_group">
            <input type="password" v-model="newPassword" class="form_field" :placeholder="$t('new_password_placeholder')" required />
            <label class="form_label">{{ $t('new_password_label') }}</label>
          </div>
          <div class="form_group">
            <input type="password" v-model="confirmNewPassword" class="form_field" :placeholder="$t('confirm_new_password_placeholder')" required />
            <label class="form_label">{{ $t('confirm_new_password_label') }}</label>
          </div>
          <button type="submit" :disabled="isLoading || !token" class="submit-button">
            <span v-if="isLoading">{{ $t('reset_password_loading_button') }}...</span>
            <span v-else>{{ $t('reset_password_submit_button') }}</span>
          </button>
          <div class="back-to-login">
            <RouterLink to="/login" style="color: white; text-decoration: underline;">{{ $t('back_to_login') }}</RouterLink>
          </div>
        </form>
      </div>
      <img src="@/assets/images/elements/8.png" alt="Decorative element" class="confirm-password-reset-element-image bottom-image" />
    </div>
    <img src="@/assets/images/elements/10.png" alt="Decorative element" class="right-side-image" />
    <Teleport to="body">
      <AlertModal :show="showModal" @close="closeModal">
        <template #header>
          <h3>{{ modalTitle }}</h3>
        </template>
        <template #body>
          <p>{{ modalMessage }}</p>
        </template>
      </AlertModal>
    </Teleport>
  </div>
</template>

<style scoped>
.confirm-password-reset-page-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  padding: 1rem;
  min-height: 70vh;
}

.confirm-password-reset-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
  position: relative;
}

.confirm-password-reset-card {
  padding: 2rem 3rem;
  border-radius: 8px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  color: var(--color-text);
  z-index: 1; 
}

.confirm-password-reset-card h1 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 2.5rem;
  color: var(--boly-title-blue);
  margin-bottom: 2rem;
}

.form_group {
  position: relative;
  padding: 15px 0 0;
  margin-bottom: 1.5rem;
}

.form_field {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--color-text-soft);
  outline: 0;
  font-size: 1rem;
  color: var(--color-text);
  padding: 7px 0;
  background: transparent;
  transition: border-color 0.2s;
  border-radius: 0;
  border-bottom: 2px solid white;
}

.form_field::placeholder {
  color: transparent;
}

.form_field:placeholder-shown ~ .form_label {
  font-size: 1rem;
  cursor: text;
  top: 20px;
}

.form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  font-size: 0.8rem;
  color: var(--color-text-soft);
  pointer-events: none;
  font-family: 'Poppins', sans-serif;
}

.form_field:focus {
  padding-bottom: 6px;
  border-width: 3px;
  border-image-slice: 1;
}

.form_field:focus ~ .form_label {
  position: absolute;
  top: 0;
  display: block;
  transition: 0.2s;
  font-size: 0.8rem;
}

.submit-button {
  font-family: 'Anton', sans-serif;
  font-size: 1.2rem;
  padding: 0.75rem 1.5rem;
  margin-top: 1.5rem;
  background-color: var(--boly-button-purple);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  width: 100%;
  max-width: 350px;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--boly-button-purple-hover);
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.confirm-password-reset-element-image {
  width: 40px;
  height: auto;
  position: absolute; 
  z-index: 0; 
}

.top-image {
  top: 70px; 
  align-self: center;
}

.bottom-image {
  bottom: 30px; 
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

.back-to-login {
  margin-top: 1.5rem;
  text-align: center;
  font-size: small;
  font-family: 'Poppins', sans-serif;
}

@media screen and (max-width: 768px) {
  .confirm-password-reset-page-wrapper {
    flex-direction: column;
  }
  .confirm-password-reset-card {
    padding: 1.5rem 2rem;
  }
  .confirm-password-reset-card h1 {
    font-size: 2rem;
  }
  .right-side-image, .left-side-image {
    width: 20px;
    margin: 1rem 0;
  }
  .confirm-password-reset-element-image {
    width: 20px;
  }
}

@media screen and (max-width: 480px) {
  .confirm-password-reset-card {
    padding: 1.5rem;
  }
  .confirm-password-reset-card h1 {
    font-size: 1.8rem;
  }
  .submit-button {
    font-size: 1rem;
  }
  .right-side-image, .left-side-image {
    width: 20px;
  }
  .confirm-password-reset-element-image {
    width: 20px;
  }
}
</style>
