<!-- <script setup lang="ts">
import CartItem from '@/components/games/CartItem.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import RemoveIcon from '@/components/icons/IconRemove.vue'
import Loading from '@/components/LoadingIcon.vue'
import TrashCanXMarkIcon from '@/components/icons/TrashCanXMarkIcon.vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { inject, onMounted, watch, computed } from 'vue'
import { ref } from 'vue'
import { useGames } from '../stores'
import usePayment from '../stores/payment'
import { useAuth, useUser } from '@/stores'
import type { Game } from '@/types'

interface DiscountCodeResponse {
  percentage?: number;
  [key: string]: any;
}

interface CartStore {
  cart: number[];
  clearCart: () => void;
}

const discountCode = ref<string>('')
let currentDiscountCode: string = ""

const auth = useAuth()
const user = useUser()
const paymentStore = usePayment()
const { transactionUrl, token, discount, totalPrice } = storeToRefs(paymentStore)
const showModal = ref<boolean>(false)
const shoppingCart = inject<CartStore>('cart')!
const cart = computed(() => shoppingCart.cart)

const gamesStore = useGames()
const { loading, games } = storeToRefs(gamesStore)
const router = useRouter()

if(!auth.isLoggedIn && !auth.verifying){
  router.back()
}

async function reqTransaction(): Promise<void> {
  const userId = user.userId || 0
  isReadyToPay = await paymentStore.reqTransaction(shoppingCart.cart, userId, currentDiscountCode)
}

async function refreshGames(): Promise<void> {
  gamesStore.getAll()
}

let isReadyToPay: boolean = false
let cartCost: number = 0
let percentage: number = 0
let finalCost: number = cartCost * (1 - 0.01 * percentage)
let isCodeValid: boolean = false
let isCodeInvalid: boolean = false

onMounted(() => {
  if (shoppingCart.cart.length === 0) {
    router.back()
  } else {
    refreshGames()
  }
})

const checkCodeValid = computed(() => {
  return isCodeValid
})

const checkCodeInvalid = computed(() => {
  return isCodeInvalid
})

watch(() => isCodeInvalid, (newVal: boolean) => {
  // This watcher is empty in the original code
})

watch(() => gamesStore.loading, (newVal: boolean) => {
  paymentStore.updateDiscount(0)
  const actualPrice = gamesStore.getTotalCost(shoppingCart.cart)
  paymentStore.getTotalCostWithDiscount(actualPrice)
})

watch(() => paymentStore.orderId, (newVal: string | number) => {
  // This watcher is empty in the original code
})

async function checkDiscountCode(): Promise<void> {
  if(discountCode.value.length === 0){
    paymentStore.updateDiscount(0)
    const actualPrice = gamesStore.getTotalCost(shoppingCart.cart)
    paymentStore.getTotalCostWithDiscount(actualPrice)
    isCodeValid = false
    isCodeInvalid = false
    return;
  }
  try {
    const response = await fetch(import.meta.env.VITE_APP_API_URL+'/api/v1/discount_codes/'+ discountCode.value)
    
    const data = await response.json() as DiscountCodeResponse
    
    percentage = data.percentage ? data.percentage : 0
    isCodeValid = data.percentage && data.percentage !== 0 ? true : false
    isCodeInvalid = data.percentage && data.percentage !== 0 ? false : true
    paymentStore.updateDiscount(percentage)
    const actualPrice = gamesStore.getTotalCost(shoppingCart.cart)
    paymentStore.getTotalCostWithDiscount(actualPrice)
    currentDiscountCode = discountCode.value
  } catch (error) {
    paymentStore.updateDiscount(0)
    const actualPrice = gamesStore.getTotalCost(shoppingCart.cart)
    paymentStore.getTotalCostWithDiscount(actualPrice)
  }
}

function Clear(): void {
  shoppingCart.clearCart()
  showModal.value = false
  router.back()
}
</script> -->

<template>
  <!-- <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  <div class="section" v-else>
    <div class="list">
      <CartItem
        v-for="item in games.filter((x) => cart.includes(x.game_id))"
        :key="item.game_id"
        :game="item"
      />
    </div>
    <p :value="finalCost" class="total text_highlight">
      Total &emsp; CLP$ {{ totalPrice }}
    </p>
    <div>

    </div>
      <label v-if="isCodeValid">Code valid</label>
      <label v-if="isCodeInvalid">Code invalid</label>
      <div class="fields">
      <form @submit.prevent="checkDiscountCode()">
        <div class="form_group">
          <input v-model="discountCode" class="form_field" placeholder="Codigo de descuento" />
          <label for="name" class="form_label"></label>
        </div>
        <div class="buttons">
        <button>Aplicar codigo</button> -->
        <!-- <input type="submit" class="pay_button text" value="Aplicar código" />
      </div>
      </form>
    </div>
    <div class="buttons">
      <input v-if="transactionUrl" type="button" class="pay_button text"  value="Confirmar carrito" disabled/>
      <input v-else type="button" class="pay_button text" @click="reqTransaction" value="Confirmar carrito"/>
      <form method="post" :action="transactionUrl || '#'">
        <input type="hidden" name="token_ws" :value="token" />
        <input v-if="transactionUrl" type="submit" class="pay_button  text" value="Ir a pagar" />
        <input v-else type="submit" class="pay_button" value="Ir a pagar" disabled/>
      </form>
    </div> -->
  <!-- </div> -->
</template>

<style scoped>
.list {
  display: flex;
  width: 100%;
  justify-content: start;
  gap: 1rem;
  flex-wrap: wrap;
}

p {
  color: var(--light);
  width: 100%;
  text-align: left;
  margin-top: 0px;
}

.total {
  text-align: right;
}

.pay_button:hover {
  background-color: var(--highlighthover);
  transition: 0.1s;
}
.pay_button {
  padding: 0 1.5rem;
  height: 50px;
  background-color: var(--highlight);
  color: white;
}

.pay_button:disabled{
  border: 1px solid #999999;
  background-color: #cccccc;
  color: #666666;
}
</style>