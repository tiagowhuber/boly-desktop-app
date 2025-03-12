<script setup>
import CartItem from '@renderer/components/games/CartItem.vue'
import ConfirmModal from '@renderer/components/ConfirmModal.vue'
import RemoveIcon from '@renderer/components/icons/IconRemove.vue'
import Loading from '@renderer/components/LoadingIcon.vue'
import TrashCanXMarkIcon from '@renderer/components/icons/TrashCanXMarkIcon.vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { inject, onMounted,watch,computed } from 'vue'
import { ref } from 'vue'
import { useGames } from '../stores/games.js'
import { usePayment } from '../stores/payment.js'
import { useAuth, useUser } from '@renderer/stores'

const discountCode = ref('')
let currentDiscountCode = ""

const auth = useAuth()
const user = useUser()
const paymentStore = usePayment()
const { transactionUrl, token,discount,totalPrice } = storeToRefs(paymentStore)
const showModal = ref(false)
const shoppingCart = inject('cart')
const { cart } = storeToRefs(shoppingCart)

const gamesStore = useGames()
const { loading, games } = storeToRefs(gamesStore)
const router = useRouter()

if(!auth.isLoggedIn && !auth.verifying){
  router.back()
}

async function reqTransaction() {
  let userId = user.userId
  isReadyToPay = await paymentStore.reqTransaction(shoppingCart.cart,userId,currentDiscountCode)
}

async function refreshGames() {
  gamesStore.fetchData()
}

let isReadyToPay = false
let cartCost = 0
let percentage = 0
let finalCost = cartCost*(1-0.01*percentage)
let isCodeValid = false
let isCodeInvalid = false
onMounted(() => {
  if (shoppingCart.cart.length == 0) {
    router.back()
  } else {
    refreshGames()
  }
})

computed({
  checkCodeValid(){
    return this.isCodeValid
  },
  checkCodeInvalid(){
    return this.isCodeInvalid
  },
})

watch(()=> isCodeInvalid,(newVal) =>{
})
watch(()=> gamesStore.loading,(newVal) =>{
  paymentStore.updateDiscount(0)
  const actualPrice = gamesStore.getTotalCost(shoppingCart.cart)
  paymentStore.getTotalCostWithDiscount(actualPrice)
})
watch(()=> paymentStore.orderId,(newVal) =>{
})


async function checkDiscountCode(){
  if(this.discountCode.length==0){
    paymentStore.updateDiscount(0)
    const actualPrice = gamesStore.getTotalCost(shoppingCart.cart)
    paymentStore.getTotalCostWithDiscount(actualPrice)
    isCodeValid = false
    isCodeInvalid = false
    return;
  }
  try {
    const response = await fetch(import.meta.env.VITE_APP_API_URL+'/api/v1/discount_codes/'+ this.discountCode)
    
    const data = await response.json()
    
    percentage = data["percentage"]?data["percentage"]:0
    isCodeValid = data["percentage"]&&data["percentage"]!=0?true:false
    isCodeInvalid = data["percentage"]&&data["percentage"]!=0?false:true
    paymentStore.updateDiscount(percentage)
    const actualPrice = gamesStore.getTotalCost(shoppingCart.cart)
    paymentStore.getTotalCostWithDiscount(actualPrice)
    currentDiscountCode = this.discountCode
  } catch (error) {
    paymentStore.updateDiscount(0)
    const actualPrice = gamesStore.getTotalCost(shoppingCart.cart)
    paymentStore.getTotalCostWithDiscount(actualPrice)
  }
  
}

function Clear() {
  shoppingCart.clearCart()
  this.showModal = false
  router.back()
}
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  <div class="section" v-else>
    <div class="list">
      <CartItem
        v-for="item in games.filter((x) => cart.includes(x._id))"
        :key="item.id"
        :item="item"
      />
    </div>
    <p :value=finalCost class="total text_highlight">
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
        <!-- <button>Aplicar codigo</button> -->
        <input type="submit" class="pay_button text" value="Aplicar código" />
      </div>
      </form>
    </div>
    <div class="buttons">
      <input v-if="transactionUrl" type="button" class="pay_button text"  value="Confirmar carrito" disabled/>
      <input v-else type="button" class="pay_button text" @click="reqTransaction" value="Confirmar carrito"/>
      <form method="post" :action="transactionUrl">
        <input type="hidden" name="token_ws" :value="token" />
        <input v-if="transactionUrl" type="submit" class="pay_button  text" value="Ir a pagar" />
        <input v-else type="submit" class="pay_button" value="Ir a pagar" disabled/>
      </form>
    </div>
  </div>
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