<script setup lang="ts">
import Loading from '@/components/LoadingIcon.vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth, useUser, usePayment, useSubscription } from '@/stores'
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const auth = useAuth()
const user = useUser()
const paymentStore = usePayment()
const subscriptionStore = useSubscription()
const { t, locale } = useI18n()

const loading = computed(() => paymentStore.loading || subscriptionStore.loading)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')
const isMobile = ref(window.innerWidth < 768)
const subscriptionProcessed = ref(false)
const subscriptionSuccess = ref(false)
const returnUrl = ref('/payment-methods')

// On component mount, confirm the enrollment
onMounted(async () => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768
  })

  // Check for returnTo in the URL
  const queryParams = new URLSearchParams(window.location.search)
  const returnTo = queryParams.get('returnTo')
  if (returnTo) {
    returnUrl.value = returnTo
  }

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

  await auth.checkToken()
  
  if (!user.username) {
    console.log('User data not immediately available, waiting...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!auth.isLoggedIn) {
      await auth.refreshToken()
    }
  }
  
  if (!user.username) {
    console.error('Username not available after waiting')
    error.value = true
    errorMessage.value = t('missing_username')
    return
  }
  
  try {
    // Confirm payment method enrollment
    await paymentStore.confirmEnrollment(tbkToken, user.username, auth.token)
    success.value = true
    error.value = false
    
    // Check if there's a pending subscription plan
    const pendingPlan = localStorage.getItem('pendingSubscriptionPlan')
    if (pendingPlan && user.userId) {
      try {
        // Fetch the newly added payment methods
        await paymentStore.fetchPaymentMethods(user.userId, auth.token)
        
        if (paymentStore.paymentMethods.length > 0) {
          const planId = getPlanIdFromType(pendingPlan)
          if (planId) {
            const amount = getAmountForPlan(pendingPlan)
            const currency = locale.value === 'en' ? 'USD' : 'CLP'
            
            // Subscribe the user with the first payment method
            const paymentMethod = paymentStore.paymentMethods[0]
            const subscribed = await subscriptionStore.subscribeWithOneClick(
              user.userId,
              planId,
              user.username,
              paymentMethod.tbk_user,
              amount,
              { token: auth.token },
              currency
            )
            
            subscriptionProcessed.value = true
            subscriptionSuccess.value = subscribed
            
            // Clear the pending subscription plan
            localStorage.removeItem('pendingSubscriptionPlan')
            
            if (subscribed) {
              // Redirect to the subscription page after a delay
              setTimeout(() => {
                router.push(returnUrl.value)
              }, 1500)
            }
          }
        }
      } catch (err) {
        console.error('Error processing automatic subscription:', err)
      }
    }
  } catch (err) {
    console.error('Error confirming enrollment:', err)
    error.value = true
    if (paymentStore.error && paymentStore.error.includes('canceled by the user')) {
      errorMessage.value = t('card_registration_canceled')
    } else {
      errorMessage.value = paymentStore.error || t('error_confirming_enrollment')
    }
    success.value = false
    
    // Clear pending subscription on error
    localStorage.removeItem('pendingSubscriptionPlan')
  }
})

const goToPaymentMethods = () => {
  router.push('/payment-methods')
}

const goToSubscription = () => {
  router.push('/subscription')
}

const getPlanIdFromType = (planType: string): number => {
  const PLAN_TYPES = {
    1: 'free',
    2: 'monthly',
    3: 'yearly'
  }
  
  const planEntry = Object.entries(PLAN_TYPES).find(([id, type]) => type === planType)
  return planEntry ? parseInt(planEntry[0]) : 0
}

const getAmountForPlan = (planType: string): number => {
  const isEnglish = locale.value === 'en'
  if (planType === 'monthly') {
    return isEnglish ? 8 : 8000
  } else if (planType === 'yearly') {
    return isEnglish ? 90 : 90000
  }
  return 0
}
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  
  <div :class="{ 'section': !isMobile, 'mobile-section': isMobile }">
    <div class="card" :class="{ 'mobile-card': isMobile }">
      <div v-if="success" class="success">
        <h2>{{ t('card_registration_success') }}</h2>
        <p v-if="!subscriptionProcessed">{{ t('card_registration_success_description') }}</p>
        
        <div v-if="subscriptionProcessed">
          <p v-if="subscriptionSuccess" class="subscription-success">
            {{ t('subscription_processed_success') }}
          </p>
          <p v-else class="subscription-error">
            {{ t('subscription_processed_error') }}
          </p>
        </div>
        
        <div class="buttons">
          <button @click="goToPaymentMethods" class="btn-blue">
            {{ t('view_payment_methods') }}
          </button>
          <button v-if="!subscriptionSuccess" @click="goToSubscription" class="btn-green">
            {{ t('go_to_subscriptions') }}
          </button>
        </div>
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
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  margin-bottom: 1rem;
}

.success h2, .error h2 {
  font-family: 'Poppins', sans-serif;
  margin-bottom: 1rem;
}

.success p, .error p {
  font-family: 'Poppins', sans-serif;
  margin-bottom: 1.5rem;
  color: var(--color-text-light);
}

.subscription-success {
  font-family: 'Poppins', sans-serif;
}

.subscription-error {
  color: #f56565 !important;
  font-weight: bold;
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