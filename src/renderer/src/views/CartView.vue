<script setup lang="ts">
import CartItem from '@renderer/components/games/CartItem.vue'
import ConfirmModal from '@renderer/components/ConfirmModal.vue'
import LoadingModal from '@renderer/components/LoadingModal.vue'
import RemoveIcon from '@renderer/components/icons/IconRemove.vue'
import Loading from '@renderer/components/LoadingIcon.vue'
import TrashCanXMarkIcon from '@renderer/components/icons/TrashCanXMarkIcon.vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { inject, onMounted, watch, computed, ref } from 'vue'
import { useAuth, useGames, useCart, usePayment, useUser } from '@renderer/stores'
import { useI18n } from 'vue-i18n'
import type { Game } from '@renderer/types'

const auth = useAuth()
const user = useUser()
const router = useRouter()
const showModal = ref<boolean>(false)
const discountCode = ref<string>('')
const errorMessage = ref<string>('')

const paymentStore = usePayment()
const { transactionUrl, token, discount, totalPrice, isCodeValid, isCodeInvalid, loading: paymentLoading, error: paymentError } = storeToRefs(paymentStore)

const cartStore = useCart()
const { cart } = storeToRefs(cartStore)

const gamesStore = useGames()
const { loading, games } = storeToRefs(gamesStore)

const i18n = useI18n()

const s3BaseUrl = computed<string>(() => import.meta.env.VITE_S3_BASE_URL)

const currency = computed(() => {
  return i18n.locale.value === 'en' ? 'USD' : 'CLP'
})

const cartGames = computed<Game[]>(() => {
  return games.value.filter((game: Game) => {
    return cart.value.includes(game.game_id)
  })
})

const subtotal = computed<number>(() => {
  console.log('cartGames:', cartGames.value);
  return cartGames.value.reduce((sum: number, game: Game) => {
    if (typeof game.price === 'object' && game.price !== null) {
      // Use the price for the current locale, or 0 if not available
      const price = (game.price as Record<string, string | number>)[i18n.locale.value];
      return sum + (typeof price === 'string' ? parseFloat(price) : price);
    }
    console.log('game price:', game.price);
    return sum + (typeof game.price === 'number' ? game.price : 0);
  }, 0);
})

const total = computed<number>(() => {
  // Calculate the total with discount applied (discount is a percentage)
  return Math.round(subtotal.value * (1 - (discount.value || 0) * 0.01));
})

const redirect_form = ref<HTMLFormElement | null>(null)
const showRedirectModal = ref<boolean>(false)

async function checkCode(): Promise<void> {
  if (!discountCode.value) return
  await paymentStore.checkDiscountCode(subtotal.value, discountCode.value)
}

async function reqTransaction(): Promise<void> {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }

  errorMessage.value = ''
  const url = window.location.origin + "/postorder/"
  
  try {
    showRedirectModal.value = true
    const success = await paymentStore.reqTransaction(cart.value, user.userId ?? 0, discountCode.value, url)
    
    if (!success) {
      errorMessage.value = paymentError.value || 'Failed to process payment'
      showRedirectModal.value = false
      return
    }
    
    if (redirect_form.value) {
      redirect_form.value.submit()
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = 'An unexpected error occurred'
    showRedirectModal.value = false
  }
}

async function refreshGames(): Promise<void> {
  try {
    await gamesStore.getAll()
    // Check if games in cart are actually loaded
    const missingGames = cart.value.filter(gameId => 
      !games.value.some(game => game.game_id === gameId)
    )
    
    if (missingGames.length > 0) {
      console.warn('Some games in cart were not found in the loaded games list', missingGames)
    }
  } catch (error) {
    console.error('Failed to load games:', error)
  }
}

function Clear(): void {
  cartStore.clearCart()
  showModal.value = false
  router.back()
}

onMounted(async () => {
  if (cart.value.length === 0) {
    router.back()
    return
  }

  await refreshGames()
  if (auth.isLoggedIn && cart.value.length > 0) {
    for (const gameId of cart.value) {
      await gamesStore.ownsGame(gameId, user.userId ?? 0)
    }
  }
  
  paymentStore.clearPaymentData() 
})


watch(() => cart.value, async () => {
  if (cart.value.length > 0) {
    await refreshGames()
  }
}, { immediate: true })
</script>

<template>
  <div class="loading_container" v-if="loading || paymentLoading">
    <Loading />
  </div>
  <div class="cart-container" v-else>
    <h1 class="page-title">{{ $t('shopping_cart') }}</h1>
    
    <div v-if="cartGames.length > 0" class="cart-content">
      <div class="cart-items">
        <CartItem 
          v-for="game in cartGames" 
          :key="game.game_id"
          :game="game"
          :s3-base-url="s3BaseUrl"
          @remove="cartStore.removeGameFromCart(game)"
        />
      </div>
      
      <div class="cart-summary">
        <h2>{{ $t('order_summary') }}</h2>
        
        <div class="discount-section" v-if="!isCodeValid">
          <form @submit.prevent="checkCode" class="discount-form">
            <input 
              v-model="discountCode" 
              class="discount-input" 
              :placeholder="$t('discount_code')"
              :class="{ 'invalid': isCodeInvalid }"
            />
            <button type="submit" class="apply-button">{{ $t('apply_code') }}</button>
          </form>
          <p v-if="isCodeInvalid" class="error-text">{{ $t('invalid_discount_code') }}</p>
        </div>
        
        <div v-else class="discount-applied">
          <p>{{ $t('discount_applied') }}: {{ discount }}%</p>
          <button class="remove-discount" @click="discountCode = ''">
            <RemoveIcon />
          </button>
        </div>

        <div class="summary-details">
          <div class="summary-row">
            <span>{{ $t('subtotal') }}</span>
            <span>{{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(subtotal) }}</span>
          </div>
          
          <div v-if="discount > 0" class="summary-row discount">
            <span>{{ $t('discount') }}</span>
            <span>-{{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(subtotal * (discount * 0.01)) }}</span>
          </div>
          
          <div class="summary-row total">
            <span>{{ $t('total') }}</span>
            <span>{{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(total) }}</span>
          </div>
        </div>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="cart-actions">
          <button class="checkout-button" @click="reqTransaction" :disabled="paymentLoading">
            {{ $t('proceed_to_checkout') }}
          </button>
          
          <button class="clear-cart" @click="showModal = true">
            <TrashCanXMarkIcon class="icon" />
            {{ $t('empty_cart') }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="empty-cart">
      <h2>{{ $t('cart_empty') }}</h2>
      <router-link to="/" class="continue-shopping">
        {{ $t('continue_shopping') }}
      </router-link>
    </div>

    <form method="post" ref="redirect_form" :action="transactionUrl || ''" style="display: none;">
      <input type="hidden" name="token_ws" :value="token" />
    </form>
  </div>

  <Teleport to="body">
    <ConfirmModal :show="showModal" @close="showModal = false" @confirm="Clear">
      <template #header>
        <h3>{{ $t('cart') }}</h3>
      </template>
      <template #body>{{ $t('modal_empty_cart') }}</template>
    </ConfirmModal>
  
    <LoadingModal :show="showRedirectModal">
      <template #body>{{ $t('modal_cart_redirect') }}</template>
    </LoadingModal>
  </Teleport>
</template>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--light);
}

.page-title {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  text-align: center;
  font-weight: 700;
  font-size: 2.25rem;
  margin-bottom: 1.5rem;
  color: var(--boly-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid var(--boly-primary);
  padding-bottom: 0.5rem;
  width: fit-content;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.cart-items {
  background: var(--boly-bg-dark-transparent);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;  /* Add space between cart items */
}

/* Style for separation between cart items */
:deep(.cart-item) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

:deep(.cart-item:last-child) {
  border-bottom: none;
  padding-bottom: 0;
}

.cart-summary {
  background: var(--boly-bg-dark-transparent);
  border-radius: 8px;
  padding: 1.75rem;
  height: fit-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cart-summary h2 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 1.25rem;
  color: var(--boly-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.75rem;
}

.discount-section {
  margin: 1rem 0;
}

.discount-form {
  display: flex;
  gap: 0.5rem;
}

.discount-input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
}

.discount-input.invalid {
  border-color: var(--error);
}

.apply-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  background: var(--boly-button-blue);
  color: white;
  cursor: pointer;
}

.error-text {
  color: var(--error);
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.discount-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: rgba(0, 255, 0, 0.1);
  border-radius: 4px;
  margin: 1rem 0;
}

.remove-discount {
  background: none;
  border: none;
  color: var(--error);
  cursor: pointer;
  padding: 0.25rem;
}

.summary-details {
  margin: 1.5rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-row.total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: bold;
  font-size: 1.1rem;
}

.summary-row.discount {
  color: var(--success);
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.checkout-button {
  width: 100%;
  padding: 1.1rem;
  border-radius: 6px;
  border: none;
  background: var(--boly-button-purple);
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.checkout-button:hover {
  background-color: var(--boly-button-purple, #5e35b1);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.checkout-button:active {
  transform: translateY(0);
}

.checkout-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.clear-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border-radius: 6px;
  border: none;
  background: var(--error, #f44336);
  color: white;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.clear-cart:hover {
  background-color: var(--error-dark, #d32f2f);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.clear-cart:active {
  transform: translateY(0);
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--boly-bg-dark-transparent);
  border-radius: 8px;
  margin-top: 2rem;
}

.empty-cart h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.75rem;
  color: var(--light);
  margin-bottom: 1.5rem;
}

.continue-shopping {
  display: inline-block;
  margin-top: 1.25rem;
  padding: 0.8rem 1.75rem;
  border-radius: 6px;
  background: var(--boly-button-purple);
  color: white;
  text-decoration: none;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.continue-shopping:hover {
  background-color: var(--boly-button-purple-dark, #5e35b1);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.error-message {
  color: var(--error);
  margin-top: 1rem;
  text-align: center;
}

.loading_container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-summary {
    margin-top: 2rem;
  }
  
  .cart-item img {
    width: 100px;
    height: 56px;
  }
}
</style>
