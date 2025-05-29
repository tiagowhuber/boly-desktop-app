<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useAuth } from '@/stores';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const auth = useAuth();
const { t } = useI18n();

const verificationStatus = ref<'pending' | 'success' | 'error'>('pending');
const message = ref('');

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    verificationStatus.value = 'error';
    message.value = t('verify_email.missing_token');
    return;
  }

  try {
    const response = await auth.verifyEmail(token);
    verificationStatus.value = 'success';
    message.value = response.message || t('verify_email.success_default');
  } catch (error: any) {
    verificationStatus.value = 'error';
    message.value = error.message || t('verify_email.error_default');
    console.error('Email verification error:', error);
  }
});
</script>

<template>
  <div class="verify-email-container">
    <div v-if="verificationStatus === 'pending'" class="status-message">
      <p>{{ t('verify_email_verifying') }}</p>
    </div>
    <div v-else-if="verificationStatus === 'success'" class="status-message success-message">
      <h2>{{ t('verify_email_success_title') }}</h2>
      <p>{{ t('email_verified_success') }}</p>
      <RouterLink to="/" class="home-link">{{ t('back_to_home') }}</RouterLink>
    </div>
    <div v-else-if="verificationStatus === 'error'" class="status-message error-message">
      <h2>{{ t('verify_email.error_title') }}</h2>
      <p>{{ t('email_verified_error') }}</p>
      <RouterLink to="/" class="home-link">{{ t('back_to_home') }}</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.verify-email-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
  color: var(--light);
}

.status-message {
  padding: 2rem;
  border-radius: 8px;
  background-color: var(--dark-purple); 
  max-width: 500px;
  width: 100%;
}

.status-message h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 2rem;
}

.status-message p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.success-message {
  border-left: 5px solid var(--boly-green); 
}

.error-message {
  border-left: 5px solid var(--danger); 
}

.home-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--boly-button-purple);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.home-link:hover {
  background-color: var(--boly-button-purple-hover);
}

</style>
