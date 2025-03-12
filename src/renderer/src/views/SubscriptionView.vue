<script setup lang="ts">
import Loading from '@renderer/components/LoadingIcon.vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import useSubscription from '../stores/subscription'
import { useAuth, useUser } from '../stores'
import axios from 'axios'

const auth = useAuth()
const user = useUser()
const router = useRouter()
const showModal = ref(false)
const loading = ref(false)
const userPlan = ref('none') // 'free', 'monthly', 'yearly', or 'none'
const { t } = useI18n()

const subscriptionStore = useSubscription()
const { subscriptions, error } = storeToRefs(subscriptionStore)

// Mapping plan IDs to their types (assuming these are the correct IDs - adjust as needed)
const PLAN_TYPES = {
  1: 'free',
  2: 'monthly',
  3: 'yearly'
}

// Function to get plan type from plan ID
const getPlanType = (planId: number): string => {
  return PLAN_TYPES[planId as keyof typeof PLAN_TYPES] || 'none'
}

onMounted(async () => {
  loading.value = true
  if (auth.isLoggedIn && user.userId) {
    try {
      const success = await subscriptionStore.getUserSubscriptions(user.userId, { token: auth.token })
      console.log('subscriptions', subscriptions.value.length)
      if (success && subscriptions.value.length > 0) {
        const activeSubscription = subscriptions.value.find(sub => sub.is_active === 1)
        if (activeSubscription) {
          userPlan.value = getPlanType(activeSubscription.plan_id)
        }
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    }
  }
  loading.value = false
})

async function handleSubscription(planType: string) {
  if (isCurrentPlan(planType)) return

  if (auth.isLoggedIn && user.userId) {
    try {
      loading.value = true
      
      // Get the plan ID from the plan type
      const planId = Object.entries(PLAN_TYPES).find(([id, type]) => type === planType)?.[0]
      
      if (!planId) {
        console.error('Invalid plan type')
        return
      }
      
      // Create subscription
      const success = await subscriptionStore.createSubscription(user.userId, parseInt(planId), { token: auth.token })
      
      if (success) {
        userPlan.value = planType
        showModal.value = true
      }
    } catch (err) {
      console.error('Error creating subscription:', err)
    } finally {
      loading.value = false
    }
  } else {
    // Redirect to login if not logged in
    router.push('/login')
  }
}

// Helper functions to determine button text and class
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
  <div class="section" v-else>
    <h1 class="title-bold">{{ t('subscription_plans').toUpperCase() }}</h1>
    <div class="plan-container">
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

    <!-- Modal to show subscription success -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>{{ t('subscription_success') }}</h2>
        <p>{{ t('subscription_success_message') }}</p>
        <button class="btn-blue" @click="showModal = false">{{ t('close') }}</button>
      </div>
    </div>
    
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
  width: 100%;
  height: 100%;
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
</style>
