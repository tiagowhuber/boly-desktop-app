<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser, useGames, useCart } from '@renderer/stores'
import CartIcon from '../icons/CartIcon.vue'
import CheckIcon from '../icons/CheckIcon.vue'
import XMarkIcon from '../icons/XMarkIcon.vue'
import PlusIcon from '../icons/PlusIcon.vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const router = useRouter()
const auth = useAuth()
const user = useUser()
const games = useGames()

const props = defineProps<{ 
  item: { 
    game_id: number;
    banner_url: string; // Changed from banner_uri to banner_url
    name: Record<string, string>; 
    price: Record<string, number> 
  } 
}>()

const buttonHovered = ref(false)
//const gameDataBaseUrl = import.meta.env.VITE_S3_BASE_URL + '/' + props.item.game_id + '/'
const loading = ref(false)
const shoppingCart = useCart()

const ownsCurrentGame = ref(false)

const currency = computed(() => {
  return i18n.locale.value === 'en' ? 'USD' : 'CLP'
})

onMounted(async () => {
  if (user.userId && props.item.game_id) {
    const userId = Number(user.userId);
    const gameId = Number(props.item.game_id);
    if (!isNaN(userId) && !isNaN(gameId)) {
      ownsCurrentGame.value = await games.ownsGame(gameId, userId);
    }
  }
})

function AddToCart() {
  shoppingCart.addGameToCart({ game_id: props.item.game_id })
}

async function ClaimFree() {
  if (!auth.isLoggedIn) {
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const response = await fetch(import.meta.env.VITE_APP_API_URL + '/api/v1/payment/claim-free', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        game_id: props.item.game_id
      })
    })
    if (response.ok) {
      ownsCurrentGame.value = true;
      router.go(0)
    }
  } catch (error) {
    console.error('Error claiming free game:', error)
  } finally {
    loading.value = false
  }
}

function GoToGame() {
  const rel_url = '/games/' + props.item.game_id
  console.log('Game ID:', props.item.game_id)
  console.log('rel_url: ' + rel_url)
  router.push(rel_url)
}
</script>

<template>
  <div class="item">
    <div class="main">
      <img class="image" :src="props.item.banner_url"
      @click="GoToGame"/>
      
      <p v-if="ownsCurrentGame">{{ $t('already_owned')}}</p>
      <p class="game-name">{{ props.item.name[i18n.locale.value].toUpperCase() }}</p>
      <p class="game-dev">{{ $t('developer') }}</p>

      <div class="price">
        <p v-if="ownsCurrentGame">{{ $t('already_owned')}}</p>
        <p v-else-if="props.item.price[i18n.locale.value] > 0">
          {{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(props.item.price[i18n.locale.value]) }}
        </p>
        <p v-else>{{$t('claim_for_free')}}</p>

        <div :class="ownsCurrentGame ? '':'buttons'" @mouseenter="buttonHovered = true" @mouseleave="buttonHovered = false">
          <button class="add-button" v-if="ownsCurrentGame"> <CheckIcon class="icon" /> </button>
  
          <button class="in-cart-button" v-else-if="shoppingCart.cart.includes(props.item.game_id)" @click="shoppingCart.removeGameFromCart({ game_id: props.item.game_id })"> 
            <p v-if="!buttonHovered">{{ $t('already_in_cart')}}</p>
            <p v-else>{{ $t('remove_from_cart')}}</p>

            <CheckIcon class="icon" v-if="!buttonHovered"/> 
            <XMarkIcon class="icon" v-else/> 
          </button>

          <button class="add-button" v-else-if="props.item.price[i18n.locale.value] > 0" @click="AddToCart">
            <CartIcon class="icon" v-if="!buttonHovered"/>
            <PlusIcon class="icon" v-else/>
          </button>
          
          <button class="add-button" v-else @click="ClaimFree"> <PlusIcon class="icon" /> </button>
        </div>
      </div>

      <!--
      <button
        class="owned-button"
        type="button"
        v-on:click.stop
        v-if="auth.ownsGame(props.item.id)"
      >
        <span class="button-text">
          <p class="text">{{ $t('already_owned')}}</p>
        </span>
        <span class="owned-icon"><CheckIcon class="icon"></CheckIcon></span>
      </button>
      <button
        class="buy-button"
        type="button"
        @click="ClaimFree"
        v-on:click.stop
        v-else-if="props.item.price == 0"
      >
        <span class="button-text">
          <p class="text">{{$t('claim_free')}}</p>
        </span>
        <span class="button-icon"><PlusIcon class="icon"></PlusIcon></span>
      </button>
      <button
        class="buy-button"
        type="button"
        @click="AddToCart"
        v-on:click.stop
        v-else-if="!shoppingCart.cart.includes(props.item.id)"
      >
        <span class="button-text">
          <p class="text">CLP$ {{ props.item.price }}</p>
        </span>
        <span class="button-icon"><CartIcon class="icon"></CartIcon></span>
      </button>
      <button
        class="buy-button-in-cart"
        type="button"
        @click="shoppingCart.removeGameFromCart(props.item)"
        @mouseenter="hoveringButton = true"
        @mouseleave="hoveringButton = false"
        v-else
        v-on:click.stop
      >
        <span class="button-text">
          <p class="text" v-if="!hoveringButton">{{ $t('already_in_cart')}}</p>
          <p class="text" v-else>{{ $t('remove_from_cart')}}</p>
        </span>
        <span class="button-icon-in-cart" v-if="!hoveringButton"
          ><CheckIcon class="icon"></CheckIcon
        ></span>
        <span class="button-icon-in-cart" v-else><XMarkIcon class="icon"></XMarkIcon></span>
      </button>
      -->
    </div>

      <!--
      <button
        class="owned-button"
        type="button"
        v-on:click.stop
        v-if="auth.ownsGame(props.item.id)"
      >
        <span class="button-text">
          <p class="text">{{ $t('already_owned')}}</p>
        </span>
        <span class="owned-icon"><CheckIcon class="icon"></CheckIcon></span>
      </button>
      <button
        class="buy-button"
        type="button"
        @click="ClaimFree"
        v-on:click.stop
        v-else-if="props.item.price == 0"
      >
        <span class="button-text">
          <p class="text">{{$t('claim_free')}}</p>
        </span>
        <span class="button-icon"><PlusIcon class="icon"></PlusIcon></span>
      </button>
      <button
        class="buy-button"
        type="button"
        @click="AddToCart"
        v-on:click.stop
        v-else-if="!shoppingCart.cart.includes(props.item.id)"
      >
        <span class="button-text">
          <p class="text">CLP$ {{ props.item.price }}</p>
        </span>
        <span class="button-icon"><CartIcon class="icon"></CartIcon></span>
      </button>
      <button
        class="buy-button-in-cart"
        type="button"
        @click="shoppingCart.removeGameFromCart(props.item)"
        @mouseenter="hoveringButton = true"
        @mouseleave="hoveringButton = false"
        v-else
        v-on:click.stop
      >
        <span class="button-text">
          <p class="text" v-if="!hoveringButton">{{ $t('already_in_cart')}}</p>
          <p class="text" v-else>{{ $t('remove_from_cart')}}</p>
        </span>
        <span class="button-icon-in-cart" v-if="!hoveringButton"
          ><CheckIcon class="icon"></CheckIcon
        ></span>
        <span class="button-icon-in-cart" v-else><XMarkIcon class="icon"></XMarkIcon></span>
      </button>
      -->
  </div>
</template>

<style scoped>
h3 {
  color: var(--light);
}

.item {
  width: 350px;
  border-radius: 5px;

  display: flex;
  overflow: hidden;

  transition:
    filter 0.2s ease,
    scale 0.2s ease;
}

.item:hover {
  transition:
    filter 0.2s ease,
    scale 0.2s ease;
  filter: brightness(1.05);
  scale: 1.05;
}

.hovered_item {
  transition:
    width 0.2s ease,
    margin-right 0.2s ease,
    box-shadow 0.2s ease;

  width: 470px;
  margin-right: -243px;

  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
}

.details {
  text-align: left;
  width: 100%;
  padding: 5px;
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
  cursor: pointer;
}

.game-name {
  font-family: "Anton", serif;
  font-style: italic;
  font-size: Larger;
}

.game-dev{
  color: rgba(179, 184, 212, 0.527);
  font-size: large;
}

.price{
  display: flex;
  text-align: left;
  padding: 10px 5px;
  flex-direction: row;
  align-items: center;
}

.price p{
  flex-grow: 1;
}

.buttons{
  transition: .2s;
}

.buttons:hover{
  scale: 1.1;
  transition: .2s;
}

.add-button{
  display: flex;
  height: 45px;
  width: 45px;
  border-radius: 50%;
  border: none;
  align-items: center;
  padding: none;
}

.add-button svg{
  margin: auto;
  fill: black;
}

.in-cart-button{
  background-color: var(--boly-bg-dark);
  display: flex;
  height: 45px;
  border-radius: 22.5px;
  border: none;
  align-items: center;
  padding: none;
}

.in-cart-button p{
  font-size: medium;
  color: white;
  padding: 0px 10px;
}

.in-cart-button svg{
  margin-right: 10px;
  fill: white;
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
  background-color: var(--lightGreen);
  overflow: hidden;
  cursor: pointer;
}

.owned-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0px;
  width: 100%;
  height: 40px;
  position: relative;
  border: none;
  background-color: rgb(69, 172, 69);
  overflow: hidden;
  cursor: pointer;
}

.owned-button .text {
  color: var(--light);
}

.buy-button-in-cart {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0px;
  width: 100%;
  height: 40px;
  position: relative;
  border: none;
  background-color: var(--bgGreen);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--lightGreen);
}

.buy-button-in-cart p {
  color: var(--lightGreen);
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
  background-color: var(--lightGreen);
  position: absolute;
  right: 0;
  transition: all 0.2s;
}

.button-icon > svg {
  fill: var(--bgGreen);
}

.button-icon-in-cart {
  width: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 5px;
  transition: all 0.2s;
}

.owned-icon {
  width: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(69, 172, 69);
  position: absolute;
  right: 0;
  transition: all 0.2s;
}

.button-icon-in-cart > .icon {
  fill: var(--lightGreen);
}

.buy-button:hover .button-icon {
  width: 100%;
  transition-duration: 0.2s;
  background-color: var(--lightCyan);
}

.buy-button:hover .button-text {
  color: transparent;
  transition-duration: 0.2s;
}

.main {
  min-width: 350px;
  display: flex;
  flex-direction: column;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 13px;
  padding: 10px;
  gap: .5rem;
}

.main > img {
  border-radius: 10px;
  width: 100%;
  height: 200px;
  aspect-ratio: 1.66666666;
  object-fit: cover;
  cursor: pointer;
}
</style>
