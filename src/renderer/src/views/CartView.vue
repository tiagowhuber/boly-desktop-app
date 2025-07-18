<script setup lang="ts">
import CartItem from '@/components/games/CartItem.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import LoadingModal from '@/components/LoadingModal.vue'
import Loading from '@/components/LoadingIcon.vue'
import TrashCanXMarkIcon from '@/components/icons/TrashCanXMarkIcon.vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { onMounted, watch, computed, ref, onUnmounted } from 'vue'
import { useAuth, useGames, useCart, usePayment, useUser } from '@/stores'
import useCodes from '@/stores/codes'
import { useI18n } from 'vue-i18n'
import type { Game } from '@/types'

const auth = useAuth()
const user = useUser()
const router = useRouter()
const showModal = ref<boolean>(false)
const errorMessage = ref<string>('')
const isMobile = ref(window.innerWidth < 768)

// Update isMobile when window is resized
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const paymentStore = usePayment()
const { transactionUrl, token, loading: paymentLoading } = storeToRefs(paymentStore)

const codesStore = useCodes()
const { discountCode: discountValidation, validationError } = storeToRefs(codesStore)
const isValidating = computed(() => !!discountValidation.value)

// Local state for discount management
const discountCode = ref<string>('')
const isCodeValid = ref<boolean>(false)
const isCodeInvalid = ref<boolean>(false)
const appliedDiscount = ref<number>(0)
const appliedGameId = ref<number | undefined>(undefined)
const autoAppliedCode = ref<boolean>(false)

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

const total = computed<number>(() => {// This grabs the subtotal value from above and then checks for each game if it has a discount and then subscracts the discount from the subtotal
  const getGamePriceInCurrentLocale = (game: Game): number => {
    let priceForGame: string | number | undefined;
    if (typeof game.price === 'object' && game.price !== null) {
      priceForGame = (game.price as Record<string, string | number>)[i18n.locale.value];
    } else if (typeof game.price === 'number') {
      priceForGame = game.price;
    }

    if (typeof priceForGame === 'string') {
      const parsedPrice = parseFloat(priceForGame);
      return isNaN(parsedPrice) ? 0 : parsedPrice;
    }
    if (typeof priceForGame === 'number') {
      return priceForGame;
    }
    return 0; // Fallback 
  };

  let discountAmount = 0;

  if (isCodeValid.value && appliedDiscount.value > 0) {
    if (appliedGameId.value !== undefined) {
      // Discount applies to a specific game
      const specificGame = cartGames.value.find(game => game.game_id === appliedGameId.value);
      if (specificGame) {
        const specificGamePrice = getGamePriceInCurrentLocale(specificGame);
        discountAmount = specificGamePrice * (appliedDiscount.value / 100);
      }
      // If specificGame is not found (e.g., removed from cart after code validation),
      // discountAmount remains 0. The watch on cart.value should ideally reset the discount state.
    } else {
      // General discount applies to the subtotal
      discountAmount = subtotal.value * (appliedDiscount.value / 100);
    }
  }

  return Math.round(subtotal.value - discountAmount);
})

const redirect_form = ref<HTMLFormElement | null>(null)
const showRedirectModal = ref<boolean>(false)

async function checkCode(): Promise<void> {
  if (!discountCode.value) return
  
  if (!auth.isLoggedIn || !user.userId) {
    isCodeInvalid.value = true
    isCodeValid.value = false
    return
  }

  // Reset previous state
  isCodeInvalid.value = false
  isCodeValid.value = false
  autoAppliedCode.value = false // Reset auto-applied flag for manual codes
  
  const result = await codesStore.validateDiscountCode(discountCode.value, user.userId)
  
  if (result.success && result.data) {
    const validationData = result.data
    
    // Check if discount applies to any game in cart or is general
    const canApplyDiscount = !validationData.applies_to_game_id || cartGames.value.some(game => game.game_id === validationData.applies_to_game_id)
    
    if (canApplyDiscount) {
      isCodeValid.value = true
      isCodeInvalid.value = false
      appliedDiscount.value = validationData.discount_percentage || 0
      appliedGameId.value = validationData.applies_to_game_id
    } else {
      isCodeInvalid.value = true
      isCodeValid.value = false
      appliedDiscount.value = 0
      appliedGameId.value = undefined
    }
  } else {
    isCodeInvalid.value = true
    isCodeValid.value = false
    appliedDiscount.value = 0
    appliedGameId.value = undefined
  }
}

async function reqTransaction(): Promise<void> {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }

  errorMessage.value = ''
  
  // Check if the total is 0 (100% discount) - claim free games instead
  if (total.value === 0) {
    try {
      showRedirectModal.value = true
      
      // Claim each game in the cart as free
      if (!user.userId) {
        errorMessage.value = 'User ID is required'
        showRedirectModal.value = false
        return
      }      
      for (const gameId of cart.value) {
        const success = await paymentStore.claimFreeGameDiscount(gameId, user.userId, { token: auth.token }, isCodeValid.value ? discountCode.value : undefined)
        if (!success) {
          errorMessage.value = 'Failed to claim free game'
          showRedirectModal.value = false
          return
        }
      }
      
      // Clear cart and redirect on success
      cartStore.clearCart()
      resetDiscountState()
      showRedirectModal.value = false
      router.push('/library')
      return
    } catch (error) {
      console.error('Error claiming free games:', error)
      errorMessage.value = 'An unexpected error occurred while claiming free games'
      showRedirectModal.value = false
      return
    }
  }
  
  try {
    showRedirectModal.value = true
    
    // Encode game IDs and user ID as URL parameters
    const cartParams = new URLSearchParams({
      items: JSON.stringify(cart.value),
      userId: String(user.userId ?? 0)
    })
    
    // Redirect to external cart with game IDs and user ID
    const externalCartUrl = `http://localhost:5173/cart?${cartParams.toString()}`
    window.open(externalCartUrl, '_blank')
    
    // Clear the cart after successful redirect
    cartStore.clearCart()
    resetDiscountState()
    
    showRedirectModal.value = false
    
    // Navigate back or to a different page after clearing cart
    router.push('/')
  } catch (error) {
    console.error('Error redirecting to external cart:', error)
    errorMessage.value = 'An unexpected error occurred while redirecting to checkout'
    showRedirectModal.value = false
  }
}

function resetDiscountState(): void {
  discountCode.value = ''
  isCodeValid.value = false
  isCodeInvalid.value = false
  appliedDiscount.value = 0
  appliedGameId.value = undefined
  autoAppliedCode.value = false
  codesStore.resetState()
}

async function autoApplyBestDiscountCode(): Promise<void> {
  if (!auth.isLoggedIn || !user.userId || cart.value.length === 0) {
    return
  }

  try {
    const result = await codesStore.getUserDiscountCodes(user.userId)
    
    if (!result.success || !result.data || result.data.length === 0) {
      return
    }

    const userDiscountCodes = result.data
    let bestCode: any = null
    let bestDiscount = 0

    // Find the best applicable discount code
    for (const userCodeAssignment of userDiscountCodes) {
      const code = userCodeAssignment.discountCode
      
      // Skip if code is not active or already used
      if (!code.is_active || userCodeAssignment.used_at) {
        continue
      }
      // Skip codes that don't apply to games
      if (code.discount_type !== 'PERCENTAGE_ORDER') {
        continue
      }
      // Skip if code has expiration dates and is not valid now
      const now = new Date()
      if (code.valid_from && new Date(code.valid_from) > now) {
        continue
      }
      if (code.valid_until && new Date(code.valid_until) < now) {
        continue
      }

      // Check if code applies to games in cart
      if (code.applies_to_game_id) {
        // Code applies to specific game - check if it's in cart
        if (cart.value.includes(code.applies_to_game_id)) {
          const discountPercentage = code.discount_percentage || 0
          if (discountPercentage > bestDiscount) {
            bestCode = code
            bestDiscount = discountPercentage
          }
        }
      } else if (!code.applies_to_game_id) {
        // General order discount - applies to all games
        const discountPercentage = code.discount_percentage || 0
        if (discountPercentage > bestDiscount) {
          bestCode = code
          bestDiscount = discountPercentage
        }
      }
    }

    // Apply the best discount code found
    if (bestCode && bestDiscount > 0) {
      discountCode.value = bestCode.code
      isCodeValid.value = true
      isCodeInvalid.value = false
      appliedDiscount.value = bestDiscount
      appliedGameId.value = bestCode.applies_to_game_id
      autoAppliedCode.value = true
      
      console.log(`Auto-applied discount code: ${bestCode.code} (${bestDiscount}% off)`)
    }
  } catch (error) {
    console.error('Error auto-applying discount code:', error)
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
  resetDiscountState()
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
    
    // Auto-apply best discount code after games are loaded
    await autoApplyBestDiscountCode()
  }
  
  paymentStore.clearPaymentData()
})


watch(() => cart.value, async () => {
  if (cart.value.length > 0) {
    await refreshGames()
    // Reset discount when cart changes to avoid invalid discounts
    if (isCodeValid.value && appliedGameId.value) {
      // Check if the specific game the discount applies to is still in cart
      const gameStillInCart = cart.value.includes(appliedGameId.value)
      if (!gameStillInCart) {
        resetDiscountState()
        // Try to auto-apply a new discount after reset
        if (auth.isLoggedIn && user.userId) {
          await autoApplyBestDiscountCode()
        }
      }
    } else if (isCodeValid.value && !appliedGameId.value) {
      // General discount is still valid, keep it
    } else {
      // No discount applied, try to auto-apply one
      if (auth.isLoggedIn && user.userId) {
        await autoApplyBestDiscountCode()
      }
    }
  } else {
    resetDiscountState()
  }
}, { immediate: true })
</script>

<template>
  <div class="loading_container" v-if="loading || paymentLoading">
    <Loading />
  </div>
  <div class="cart-container" v-else>
    <h1 class="page-title">{{ $t('shopping_cart') }}</h1>
    
    <div v-if="cartGames.length > 0" class="cart-content" :class="{ 'mobile': isMobile }">
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
              :disabled="isValidating"
            />
            <button type="submit" class="apply-button" :disabled="isValidating || !discountCode">
              {{ isValidating ? $t('validating') : $t('apply_code') }}
            </button>
          </form>
          <p v-if="isCodeInvalid" class="error-text">
            {{ validationError || $t('invalid_discount_code') }}
          </p>
        </div>        
          <div v-else class="discount-applied">
          <div class="discount-content">
            <div class="checkmark-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="#4CAF50" stroke="#4CAF50" stroke-width="2"/>
                <path d="m9 12 2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="discount-details">
              <div class="code-applied">
                <strong>{{ discountCode }}</strong> {{ $t('discount_code_applied') }}
              </div>
              <div class="discount-amount">
                -{{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(subtotal - total) }} ({{ appliedDiscount }}% off)
              </div>
              <!-- <p v-if="autoAppliedCode" class="auto-applied">
                {{ $t('auto_applied_best_discount') || 'Best available discount automatically applied' }}
              </p> -->
              <p v-if="appliedGameId" class="game-specific">
                {{ $t('applies_to_specific_game') }}
              </p>
            </div>
          </div>
          <!-- <button class="remove-discount" @click="resetDiscountState()">
            Remove
          </button> -->
        </div>
        
        <div v-if="appliedDiscount > 0">
          <button class="remove-discount" @click="resetDiscountState()">
            {{ $t('remove_discount_code') }}
          </button>
        </div>

        <div class="summary-details">
          <div class="summary-row">
            <span>{{ $t('subtotal') }}</span>
            <span>{{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(subtotal) }}</span>
          </div>
            <div v-if="appliedDiscount > 0" class="summary-row discount">
            <span>{{ $t('discount') }}</span>
            <span>-{{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(subtotal - total) }}</span>
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

.cart-content.mobile {
  grid-template-columns: 1fr;
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
  font-family: 'Poppins', sans-serif;
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
  padding: 0.5rem 0.5rem;
  border-radius: 4px;
  border: none;
  background: var(--boly-button-pink);
  color: white;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
}

.apply-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: var(--error);
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.discount-applied {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border: 2px solid #4CAF50;
  border-radius: 8px;
  margin: 1rem 0;
}

.discount-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.checkmark-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.discount-details {
  flex: 1;
}

.code-applied {
  font-size: 1rem;
  color: white;
  margin-bottom: 0.25rem;
  font-family: 'Poppins', sans-serif;
}

.discount-amount {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.25rem;
  font-family: 'Poppins', sans-serif;
}

.remove-discount {
  background: none;
  border: none;
  color: #E91E63;
  border: 2px solid #E91E63;
  cursor: pointer;
  padding: 0.5rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.remove-discount:hover {
  background: rgba(233, 30, 99, 0.1);
}

.auto-applied {
  font-size: 0.8rem;
  color: var(--success, #4caf50);
  margin: 0.25rem 0 0 0;
  font-style: italic;
  font-family: 'Poppins', sans-serif;
}

.game-specific {
  font-size: 0.8rem;
  color: var(--boly-primary);
  margin: 0.25rem 0 0 0;
  font-style: italic;
  font-family: 'Poppins', sans-serif;
}

.summary-details {
  margin: 1.5rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-row span {
  font-family: 'Poppins', sans-serif;
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
  background: var(--boly-button-green);
  color: white;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.checkout-button:hover {
  background-color: var(--boly-button-green-hover);
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
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  font-family: 'Poppins', sans-serif;
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

/* Additional phone-specific adjustments */
@media (max-width: 480px) {
  .cart-container {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }
  
  .cart-items {
    padding: 0.75rem;
  }
  
  .cart-summary {
    padding: 1.25rem;
  }
  
  .discount-form {
    flex-direction: row;
    align-items: center;
  }
  
  .discount-input {
    flex: 1;
  }
  
  .apply-button {
    width: auto;
    padding: 0.5rem 0.75rem;
    white-space: nowrap;
  }
  
  .checkout-button {
    padding: 0.85rem;
    font-size: 1rem;
  }
  
  .clear-cart {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
  
  .summary-row.total {
    font-size: 1rem;
  }
}
</style>
