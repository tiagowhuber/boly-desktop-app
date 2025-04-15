<script setup>
import Loading from '@/components/LoadingIcon.vue'
import SuccessIcon from '@/components/icons/SuccessIcon.vue'
import FailureIcon from '@/components/icons/FailureIcon.vue'
import CheckoutGameItem from '@/components/games/CheckoutGameItem.vue'
import { storeToRefs } from 'pinia'
import { useRouter,useRoute } from 'vue-router'
import { inject, onMounted } from 'vue'
import { ref } from 'vue'
import { useSubscription } from '@/stores/subscription'
import { useAuth } from '@/stores'

const auth = useAuth()

const subscriptionStore = useSubscription()
const { token, orderResult } = storeToRefs(subscriptionStore)

async function reqTransaction(_cart) {
  subscriptionStore.reqTransaction(_cart)
}

const router = useRouter()

const loadingOrder = ref(true);

async function checkSub(){
  const route = useRoute()
  const token = route.query.TBK_TOKEN
  await subscriptionStore.checkSub(token,auth)

  if(orderResult.value.status == 'AUTHORIZED'){
    
  }

}

const showModal = ref(false)

onMounted(() => {
  checkSub()
})

</script>

<template>
  <div class="loading_container" v-if="!orderResult">
    <Loading />
  </div>
  <!--<div class="section" v-else-if="orderResult.authorization_code == 0">-->
  <div class="section" v-else>
    <div class="result">
      <SuccessIcon class="big-icon" />
      <div>
        <p>{{ $t('postorder_congrats') }}</p>
        <br>
        <p>{{ JSON.stringify(orderResult) }}</p>
        <!--
        <p> code:  {{ orderResult.response_code }} </p>
        <p> tbk_user:  {{ orderResult.tbk_user }} </p>
        <p> authorization_code:  {{ orderResult.authorization_code }} </p>
        <p> card_type:  {{ orderResult.card_type }} </p>
        <p> card_number:  {{ orderResult.card_number }} </p>
      -->
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
  <!-- <div class="section" v-else>
    <div class="result">
      <FailureIcon class="big-icon" />
      <div>
        <p> {{$t('postorder_error')}}</p>
        <p> {{ orderResult.error_message }} </p>
      </div>
    </div>
    <RouterLink class="bold" to="/"><p>{{$t('return')}}</p></RouterLink>
  </div> -->
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

