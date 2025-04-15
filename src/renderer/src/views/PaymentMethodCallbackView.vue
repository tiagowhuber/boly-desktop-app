<script setup lang="ts">
import Loading from '@/components/LoadingIcon.vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser, usePayment } from '@/stores'
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const auth = useAuth()
const user = useUser()
const paymentStore = usePayment()
const { t } = useI18n()

const loading = computed(() => paymentStore.loading)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')
const isMobile = ref(window.innerWidth < 768)

// On component mount, confirm the enrollment
onMounted(async () => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })

  const queryParams = new URLSearchParams(window.location.search)
  const tbkToken = queryParams.get('TBK_TOKEN')
  
  if (!tbkToken) {
    error.value = true
    errorMessage.value = t('missing_token')
    return
  }
  
  // Retrieve stored token to compare
  const savedToken = localStorage.getItem('tbk_enrollment_token')
  if (savedToken !== tbkToken) {
    console.warn('Token mismatch', { savedToken, tbkToken })
  }

  if (!user.username) {
    console.error('Username not available')
    error.value = true
    errorMessage.value = t('missing_username')
    return
  }
  
  try {
    await paymentStore.confirmEnrollment(tbkToken, user.username, auth.token)
    success.value = true
    error.value = false
  } catch (err) {
    console.error('Error confirming enrollment:', err)
    error.value = true
    if (paymentStore.error && paymentStore.error.includes('canceled by the user')) {
      errorMessage.value = t('card_registration_canceled')
    } else {
      errorMessage.value = paymentStore.error || t('error_confirming_enrollment')
    }
    success.value = false
  }
})

const goToPaymentMethods = () => {
  router.push('/payment-methods')
}
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  
  <div :class="{ 'section': !isMobile, 'mobile-section': isMobile }">
    <div class="card" :class="{ 'mobile-card': isMobile }">
      <div v-if="success" class="success">
        <div class="icon">✅</div>
        <h2>{{ t('card_registration_success') }}</h2>
        <p>{{ t('card_registration_success_description') }}</p>
        <button @click="goToPaymentMethods" class="btn-blue">
          {{ t('view_payment_methods') }}
        </button>
      </div>
      <div v-else-if="error" class="error">
        <h2>{{ t('card_registration_error') }}</h2>
        <p>{{ errorMessage }}</p>
        <div class="buttons">
          <button @click="goToPaymentMethods" class="btn-blue">
            {{ t('view_payment_methods') }}
          </button>
          <button @click="router.push('/payment-methods?addCard=true')" class="btn-green">
            {{ t('try_again') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.mobile-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 1rem;
}

.card {
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 8px;
  padding: 2rem;
  width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.mobile-card {
  width: 90%;
  padding: 1rem;
}

.icon {
  font-size: 48px;
  margin-bottom: 1rem;
}

.success h2, .error h2 {
  margin-bottom: 1rem;
}

.success p, .error p {
  margin-bottom: 1.5rem;
  color: var(--color-text-light);
}

.btn-blue {
  background-color: var(--boly-button-purple);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-blue:hover {
  background-color: var(--boly-button-purple);
}

.btn-green {
  background-color: var(--boly-button-purple);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 1rem;
}

.btn-green:hover {
  background-color: var(--boly-button-purple);
}

.loading_container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>