<script setup>
import AlertModal from '@renderer/components/AlertModal.vue'
import ConfirmModal from '@renderer/components/ConfirmModal.vue'
import BuyIcon from '@renderer/components/icons/IconBuy.vue'
import OkIcon from '@renderer/components/icons/TickIcon.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const router = useRouter()

const showModal = ref(false)
const props = defineProps(['item'])
console.log(props.item)

const shoppingCart = inject('cart')

function TestAlert() {
  shoppingCart.addGameToCart(props.item)
  this.showModal = false
}

function GoToGame() {
  const rel_url = '/games/' + props.item._id
  console.log('rel_url: ' + rel_url)
  router.push(rel_url)
}
</script>

<template>
  <div class="item">
    <img class="image" :src="props.item.img" @click="GoToGame" />
    <button
      class="buy-button"
      type="button"
      @click="showModal = true"
      v-if="!shoppingCart.cart.includes(props.item._id)"
    >
      <span class="button-text">
        <p class="text_highlight poppins">
          {{ props.item.currency }}$ {{ props.item.price.$numberDecimal }}
        </p>
      </span>
      <span class="button-icon"><BuyIcon></BuyIcon></span>
    </button>
    <button class="buy-button-inCart" type="button" @click="GoToGame" v-else>
      <span class="button-text">
        <p class="text_highlight poppins">Already in cart!</p>
      </span>
      <span class="button-icon-inCart"><OkIcon></OkIcon></span>
    </button>
    <div class="details">
      <h3 class="text_highlight">{{ props.item.name[i18n.locale.value] }}</h3>
      <div>
        <p class="text">{{ props.item.description[i18n.locale.value] }}</p>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <ConfirmModal :show="showModal" @close="showModal = false" @confirm="TestAlert()">
      <template #header>
        <h3>Add game to cart</h3>
      </template>
      <template #body> Do you want to add {{ props.item.name[i18n.locale.value] }} to the shopping cart? </template>
    </ConfirmModal>
  </Teleport>
</template>

<style scoped>
.item {
  border-radius: 5px;
  overflow: hidden;
  width: 227px;
  transition: 0.1s;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background-color: var(--dark);
}

.item:hover {
  transition: 0.1s;
  background-color: var(--darkhover);
}

.item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.details {
  text-align: center;
  width: 100%;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
}

.details > div {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.details p {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.details > :last-child {
}

.buy-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0px;
  width: 100%;
  height: 40px;
  position: relative;
  border: none;
  background-color: var(--highlight);
  overflow: hidden;
  cursor: pointer;
  color: white;
}

.buy-button-inCart {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0px;
  width: 100%;
  height: 40px;
  position: relative;
  border: none;
  background-color: #41d74b;
  overflow: hidden;
  cursor: pointer;
  color: white;
}

.button-text {
  width: 100%;
  height: 100%;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.button-icon {
  width: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--highlight);
  position: absolute;
  right: 0;
  transition: all 0.2s;
}

.button-icon-inCart {
  width: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #41d74b;
  position: absolute;
  right: 0;
  transition: all 0.2s;
}

.buy-button:hover .button-icon {
  width: 100%;
  transition-duration: 0.2s;
}

.buy-button:hover .button-text {
  color: transparent;
  transition-duration: 0.2s;
}
</style>
