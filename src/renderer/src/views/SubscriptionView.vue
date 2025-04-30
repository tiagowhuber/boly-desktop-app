<script setup lang="ts">
import Loading from '@/components/LoadingIcon.vue'
import AlertModal from '@/components/AlertModal.vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import useSubscription from '../stores/subscription'
import { useAuth, useUser, usePayment } from '../stores'

const auth = useAuth()
const user = useUser()
const paymentStore = usePayment()
const router = useRouter()
const showModal = ref(false)
const userPlan = ref('none') // 'free', 'monthly', 'yearly', or 'none'
const i18n = useI18n()
const { t } = i18n

// Payment method state
const hasPaymentMethods = ref(false)
const webpayForm = ref<HTMLFormElement | null>(null)
const webpayUrl = computed(() => paymentStore.enrollmentUrl)
const webpayToken = computed(() => paymentStore.enrollmentToken)
const showEnrollmentRedirectModal = ref(false)

const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  if (auth.isLoggedIn && user.userId) {
    try {
      subscriptionStore.getUserSubscriptions(user.userId, { token: auth.token })
        .then(success => {
          console.log('subscriptions', subscriptions.value.length)
          if (success && subscriptions.value.length > 0) {
            const activeSubscription = subscriptions.value.find(sub => sub.is_active === 1)
            if (activeSubscription) {
              userPlan.value = getPlanType(activeSubscription.plan_id)
            }
          }
        })
      
      fetchPaymentMethods()
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    }
  }
  
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const subscriptionStore = useSubscription()
const { subscriptions, error, loading } = storeToRefs(subscriptionStore)

const PLAN_TYPES = {
  1: 'free',
  2: 'monthly',
  3: 'yearly'
}

const getPlanType = (planId: number): string => {
  return PLAN_TYPES[planId as keyof typeof PLAN_TYPES] || 'none'
}

const fetchPaymentMethods = async () => {
  if (!auth.isLoggedIn || !user.userId) return
  
  try {
    const paymentMethods = await paymentStore.fetchPaymentMethods(user.userId, auth.token)
    hasPaymentMethods.value = paymentMethods.length > 0
  } catch (err) {
    console.error('Error fetching payment methods:', err)
  }
}

const addPaymentMethod = async () => {
  try {
    showEnrollmentRedirectModal.value = true

    await paymentStore.createEnrollment(
      user.username,
      user.email,
      `${window.location.origin}/payment-methods/callback?returnTo=/subscription`,
      auth.token
    )
    
    setTimeout(() => {
      if (webpayForm.value) {
        webpayForm.value.submit()
      } else {
        showEnrollmentRedirectModal.value = false
      }
    }, 100)
  } catch (err) {
    console.error('Error creating enrollment:', err)
    showEnrollmentRedirectModal.value = false
  }
}

async function handleSubscription(planType: string) {
  if (isCurrentPlan(planType)) return

  if (auth.isLoggedIn && user.userId) {
    try {
      // For free subscription, just create it without payment
      if (planType === 'free') {
        const planId = Object.entries(PLAN_TYPES).find(([id, type]) => type === planType)?.[0]
        
        if (!planId) {
          console.error('Invalid plan type')
          return
        }
        
        const success = await subscriptionStore.createSubscription(user.userId, parseInt(planId), { token: auth.token })
        
        if (success) {
          userPlan.value = planType
          //showModal.value = true
        }
        return
      }
      
      if ((planType === 'monthly' || planType === 'yearly') && !hasPaymentMethods.value) {
        addPaymentMethod()
        return
      }
      
      const planId = Object.entries(PLAN_TYPES).find(([id, type]) => type === planType)?.[0]
      
      if (!planId) {
        console.error('Invalid plan type')
        return
      }
        const planIdNumber = parseInt(planId)
      
      const amount = i18n.locale.value === 'en'
        ? (planType === 'monthly' ? 8 : 90)
        : (planType === 'monthly' ? 8000 : 90000)
      const currency = i18n.locale.value === 'en' ? 'USD' : 'CLP'
      
      try {
        if (paymentStore.paymentMethods.length === 0) {
          await fetchPaymentMethods()
        }
        
        if (paymentStore.paymentMethods.length === 0) {
          console.error('No payment methods available')
          paymentStore.error = 'No payment methods available. Please add a payment method.'
          return
        }
        
        const paymentMethod = paymentStore.paymentMethods[0]

        const success = await subscriptionStore.subscribeWithOneClick(
          user.userId,
          planIdNumber,
          user.username,
          paymentMethod.tbk_user,
          amount,
          { token: auth.token },
          currency
        )
        
        if (success) {
          userPlan.value = planType
          showModal.value = true
        } else if (subscriptionStore.error) {
          paymentStore.error = subscriptionStore.error
        }
      } catch (err) {
        console.error('Error in payment process:', err)
        paymentStore.error = 'An unexpected error occurred. Please try again later.'
      }
    } catch (err) {
      console.error('Error in subscription process:', err)
      paymentStore.error = 'An unexpected error occurred. Please try again later.'
    }
  } else {
    router.push('/login')
  }
}

const isCurrentPlan = (plan: string) => {
  return userPlan.value === plan
}

const buttonText = (plan: string) => {
  return isCurrentPlan(plan) ? t('current_plan').toUpperCase() : t('subscribe').toUpperCase()
}

const buttonClass = (plan: string) => {
  return isCurrentPlan(plan) ? 'btn-blue' : 'btn-purple'
}
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  <div class="section" v-else :class="{ 'mobile-section': isMobile }">
    <h1 class="title-bold" :class="{ 'mobile-title': isMobile }">{{ t('subscription_plans').toUpperCase() }}</h1>
    
    <!-- Desktop layout -->
    <div v-if="!isMobile" class="plan-container">
      <div class="plan">
        <h2>{{ t('free_plan').toUpperCase() }}</h2>
        <div class="credits">200 créditos</div>
        <div class="details">
          <li>{{ t('free_feature_1') }}</li>
          <li>{{ t('free_feature_2') }}</li>
          <li>{{ t('free_feature_3') }}</li>
        </div>
        <h3 class="price">{{ t('free').toUpperCase() }}</h3>
        <button 
          :class="buttonClass('free')" 
          @click="handleSubscription('free')">
          {{ buttonText('free') }}
        </button>
      </div>
      <div class="plan">
        <h2>{{ t('monthly_plan').toUpperCase() }}</h2>
        <div class="credits">1000 créditos</div>
        <div class="details">
          <li>{{ t('monthly_feature_1') }}</li>
          <li>{{ t('monthly_feature_2') }}</li>
          <li>{{ t('monthly_feature_3') }}</li>
          <li>{{ t('monthly_feature_4') }}</li>
        </div>
        <h3 class="price">{{ `$8 USD / ${t('month').toUpperCase()}` }}</h3>
        <button 
          :class="buttonClass('monthly')" 
          @click="handleSubscription('monthly')">
          {{ buttonText('monthly') }}
        </button>
      </div>
      <div class="plan">
        <h2>{{ t('yearly_plan').toUpperCase() }}</h2>
        <div class="credits">12000 créditos</div>
        <div class="details">
          <li>{{ t('yearly_feature_1') }}</li>
          <li>{{ t('yearly_feature_2') }}</li>
          <li>{{ t('yearly_feature_3') }}</li>
        </div>
        <h3 class="price">{{ `$90 USD / ${t('year').toUpperCase()}` }}</h3>
        <button 
          :class="buttonClass('yearly')" 
          @click="handleSubscription('yearly')">
          {{ buttonText('yearly') }}
        </button>
      </div>
    </div>
    
    <!-- Mobile layout -->
    <div v-else class="mobile-plan-container">
      <div class="mobile-plan">
        <h2>{{ t('free_plan').toUpperCase() }}</h2>
        <div class="mobile-credits">200 créditos</div>
        <div class="mobile-details">
          <li>{{ t('free_feature_1') }}</li>
          <li>{{ t('free_feature_2') }}</li>
          <li>{{ t('free_feature_3') }}</li>
        </div>
        <div class="mobile-plan-footer">
          <h3 class="mobile-price">{{ t('free').toUpperCase() }}</h3>
          <button 
            :class="[buttonClass('free'), 'mobile-button']" 
            @click="handleSubscription('free')">
            {{ buttonText('free') }}
          </button>
        </div>
      </div>
      
      <div class="mobile-plan">
        <h2>{{ t('monthly_plan').toUpperCase() }}</h2>
        <div class="mobile-credits">1000 créditos</div>
        <div class="mobile-details">
          <li>{{ t('monthly_feature_1') }}</li>
          <li>{{ t('monthly_feature_2') }}</li>
          <li>{{ t('monthly_feature_3') }}</li>
          <li>{{ t('monthly_feature_4') }}</li>
        </div>
        <div class="mobile-plan-footer">
          <h3 class="mobile-price">{{ `$8 USD / ${t('month').toUpperCase()}` }}</h3>
          <button 
            :class="[buttonClass('monthly'), 'mobile-button']" 
            @click="handleSubscription('monthly')">
            {{ buttonText('monthly') }}
          </button>
        </div>
      </div>
      
      <div class="mobile-plan">
        <h2>{{ t('yearly_plan').toUpperCase() }}</h2>
        <div class="mobile-credits">12000 créditos</div>
        <div class="mobile-details">
          <li>{{ t('yearly_feature_1') }}</li>
          <li>{{ t('yearly_feature_2') }}</li>
          <li>{{ t('yearly_feature_3') }}</li>
        </div>
        <div class="mobile-plan-footer">
          <h3 class="mobile-price">{{ `$90 USD / ${t('year').toUpperCase()}` }}</h3>
          <button 
            :class="[buttonClass('yearly'), 'mobile-button']" 
            @click="handleSubscription('yearly')">
            {{ buttonText('yearly') }}
          </button>
        </div>
      </div>
    </div>    <!-- Modal to show subscription success -->
    <Teleport to="body">
      <AlertModal :show="showModal" @close="showModal = false">
        <template #header>
          <h3>{{ t('subscription_success') }}</h3>
        </template>
        <template #body>
          <p>{{ t('subscription_success_message') }}</p>
        </template>
      </AlertModal>
    </Teleport>
      <!-- Enrollment Redirect Modal -->
    <Teleport to="body">
      <AlertModal :show="showEnrollmentRedirectModal" @close="showEnrollmentRedirectModal = false">
        <template #header>
          <h3>{{ t('redirecting') }}</h3>
        </template>
        <template #body>
          <p>{{ t('redirecting_to_payment_setup') }}</p>
          <Loading />
        </template>
      </AlertModal>
    </Teleport>
    
    <!-- WebPay OneClick Form (hidden) -->
    <form 
      ref="webpayForm" 
      method="post" 
      :action="webpayUrl" 
      style="display: none;"
    >
      <input type="hidden" name="TBK_TOKEN" :value="webpayToken" />
    </form>
    
    <!-- Display error if any -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.title-bold {
  width: 100%;
  text-align: start;
  font-size: 300%;
}

.mobile-title {
  font-size: 180%;
  text-align: center;
  margin-bottom: 20px;
}

p {
  color: var(--light);
  width: 100%;
  text-align: left;
  margin-top: 0px;
}

.plan-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 40px;
}

.plan {
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 20px;
  padding: 20px;
  align-items: center;
}

.plan h2 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
}

.credits {
  font-size: 80%;
  width: 150px;
  padding: 14px;
  border-bottom: 2px solid var(--boly-button-purple);
  margin-bottom: 10px;
}

.details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 80%;
  color: #ffffffc4;
  text-align: left;
  margin-bottom: 10px;
}

.details li {
  margin-bottom: 5px;
  font-size: 80%;
  text-align: left;
  text-justify: distribute-all-lines;
  list-style-type: none;
  padding-bottom: 10px;
  border-bottom: 1px dotted var(--boly-button-purple);
}

.details li:last-child {
  border: none;
  background-image: none;
}

.price {
  font-weight: bold;
  color: var(--boly-highlight);
  font-size: 1.3rem;
}

button {
  width: 80%;
  margin: 20px 0px;
  border: none;
  border-radius: 20px;
  color: white;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: larger;
}

.btn-purple {
  background-color: var(--boly-button-purple);
}

.btn-blue {
  background-color: #3498db;
}

.btn-purple:hover {
  cursor: pointer;
  animation-name: onHover;
  animation-duration: 0.2s;
  animation-timing-function: ease-in;
}

@keyframes onHover {
  0% {
    background-color: var(--boly-button-purple);
  }
  100% {
    background-color: var(--boly-button-purple-hover);
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--boly-bg-dark);
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  max-width: 500px;
}

.error-message {
  color: #e74c3c;
  margin-top: 20px;
  text-align: center;
  font-weight: bold;
}

/* Mobile styles */
.mobile-section {
  padding: 1rem 0.5rem;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  overflow-x: hidden;
}

.mobile-plan-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 10px;
  box-sizing: border-box;
}

.mobile-plan {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 15px;
  padding: 15px;
  box-sizing: border-box;
}

.mobile-plan h2 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  font-size: 1.4rem;
  text-align: center;
  margin-bottom: 10px;
}

.mobile-credits {
  font-size: 90%;
  width: 150px;
  padding: 10px;
  border-bottom: 2px solid var(--boly-button-purple);
  margin: 0 auto 10px auto;
  text-align: center;
}

.mobile-details {
  display: flex;
  flex-direction: column;
  width: 100%;
  color: #ffffffc4;
  text-align: left;
  margin-bottom: 10px;
}

.mobile-details li {
  margin-bottom: 5px;
  font-size: 90%;
  text-align: left;
  list-style-type: none;
  padding-bottom: 8px;
  border-bottom: 1px dotted var(--boly-button-purple);
}

.mobile-details li:last-child {
  border: none;
}

.mobile-plan-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.mobile-price {
  font-weight: bold;
  color: var(--boly-highlight);
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
}

.mobile-button {
  width: auto;
  margin: 0;
  padding: 8px 15px;
  font-size: 0.9rem;
  flex: 1;
}

.mobile-modal-content {
  width: 90%;
  max-width: 350px;
  padding: 20px;
}

.mobile-modal-content h2 {
  font-size: 1.4rem;
}

.mobile-modal-content p {
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .mobile-plan h2 {
    font-size: 1.2rem;
  }
  
  .mobile-price {
    font-size: 1rem;
  }
  
  .mobile-plan-footer {
    flex-direction: column;
    gap: 10px;
  }
  
  .mobile-button {
    width: 100%;
  }
}
</style>