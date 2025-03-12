<script setup>
import Loading from '@renderer/components/LoadingIcon.vue'
import SuccessIcon from '@renderer/components/icons/SuccessIcon.vue'
import FailureIcon from '@renderer/components/icons/FailureIcon.vue'
import CheckoutGameItem from '@renderer/components/games/CheckoutGameItem.vue'
import { storeToRefs } from 'pinia'
import { useRouter,useRoute } from 'vue-router'
import { inject, onMounted } from 'vue'
import { ref } from 'vue'
import { useGames } from '../stores/games.js'
import { usePayment } from '../stores/payment.js'

const paymentStore = usePayment()
const { transactionUrl, token, orderResult } = storeToRefs(paymentStore)

async function reqTransaction(_cart) {
  paymentStore.reqTransaction(_cart)
}

const router = useRouter()

const loadingOrder = ref(true);

async function checkOrder(){
  const route = useRoute()
  const token = route.query.token_ws
  await paymentStore.checkOrder(token)

  if(orderResult.value.status == 'AUTHORIZED'){
    shoppingCart.clearCart()
    orderCart = await paymentStore.getOrderCart(orderResult.value.buy_order)
    
    await gamesStore.fetchData()
  }

  loadingOrder.value = false;
  console.log( orderCart )
}

const showModal = ref(false)

const shoppingCart = inject('cart')
const { cart } = storeToRefs(shoppingCart)

const gamesStore = useGames()
const { loading, games } = storeToRefs(gamesStore)

let orderCart = []
onMounted(() => {
  checkOrder()
})

</script>

<template>
  <div class="loading_container" v-if="loading || loadingOrder">
    <Loading />
  </div>
  <div class="section" v-else-if="orderResult.status == 'AUTHORIZED'">
    <div class="result">
      <SuccessIcon class="big-icon" />
      <div>
        <p>{{ $t('postorder_congrats') }}</p>
        <br>
        <p> {{ $t('postorder_transaction_id') }}:  {{ orderResult.buy_order }} </p>
        <p> {{ $t('postorder_date') }}: {{ orderResult.transaction_date }} </p>
      </div>
    </div>
    <p> {{ $t('postorder_article_list') }}</p>
    <div class="list">
      <CheckoutGameItem
        v-for="item in orderCart"
        :key="item.id"
        :item="item"
      />
    </div>
    <RouterLink class="bold" to="/"><p>Volver</p></RouterLink>
  </div>
  <div class="section" v-else>
    <div class="result">
      <FailureIcon class="big-icon" />
      <div>
        <p> {{$t('postorder_error')}}</p>
        <p> {{ orderResult.error_message }} </p>
      </div>
    </div>
    <RouterLink class="bold" to="/"><p>{{$t('return')}}</p></RouterLink>
  </div>
</template>

<style scoped>

.big-icon{
  fill: var(--bgGreen);
  height: 150px;
  width: 150px;
}

.result{
  margin-top: 30px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 3rem;
}

.result p{
  font-size: larger;
}

.list {
  display: flex;
  width: 100%;
  justify-content: start;
  gap: 1rem;
  flex-wrap: wrap;
}

p {
  width: 100%;
  text-align: left;
  margin-top: 0px;
}

.text_highlight_dark {
  font-size: 16px;
  color: var(--dark);
}

.bold:hover{
  color: var(--lightGreen)
}
</style>

