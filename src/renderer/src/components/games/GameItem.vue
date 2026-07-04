<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser, useGames, useCart, useDeveloper, usePayment } from '@/stores'
import CartIcon from '../icons/CartIcon.vue'
import CheckIcon from '../icons/CheckIcon.vue'
import XMarkIcon from '../icons/XMarkIcon.vue'
import PlusIcon from '../icons/PlusIcon.vue'
import { useI18n } from 'vue-i18n'
import { resolveImageUrl } from '@/utils/imageUrl'

const i18n = useI18n()

const router = useRouter()
const auth = useAuth()
const user = useUser()
const games = useGames()
const paymentStore = usePayment()

const props = defineProps<{
  loading?: boolean
  item: {
    game_id: number
    banner_url: string
    name: Record<string, string>
    price: Record<string, number>
    developer_id: number
  }
}>()

const buttonHovered = ref(false)
const isLoading = ref(false)
const shoppingCart = useCart()
const developerStore = useDeveloper()
const developerName = ref('')
const isMobile = ref(window.innerWidth <= 768)

const ownsCurrentGame = ref(false)
const hasSubscriptionAccess = ref(false)
// true until the per-card ownership + developer lookups settle; gates the inline skeletons
const metaLoading = ref(true)

const currency = computed(() => {
  return i18n.locale.value === 'en' ? 'USD' : 'CLP'
})

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(async () => {
  // Add resize event listener
  window.addEventListener('resize', handleResize)

  try {
    const tasks: Promise<void>[] = []
    if (user.userId && props.item.game_id) {
      const userId = Number(user.userId)
      const gameId = Number(props.item.game_id)
      if (!isNaN(userId) && !isNaN(gameId)) {
        tasks.push(
          games.ownsGame(gameId, userId).then((accessInfo) => {
            ownsCurrentGame.value = accessInfo.owned
            hasSubscriptionAccess.value = accessInfo.subscriptionAccess
          })
        )
      }
    }
    if (props.item.developer_id) {
      tasks.push(
        developerStore.fetchDeveloperById(props.item.developer_id).then((developerData) => {
          if (developerData && developerData.name) {
            developerName.value = developerData.name
          }
        })
      )
    }
    await Promise.all(tasks)
  } catch (error) {
    console.error('Error loading game card info:', error)
  } finally {
    metaLoading.value = false
  }
})

onBeforeUnmount(() => {
  // Remove resize event listener
  window.removeEventListener('resize', handleResize)
})

function AddToCart() {
  shoppingCart.addGameToCart({ game_id: props.item.game_id })
}

async function ClaimFree() {
  if (!auth.isLoggedIn || !user.userId) {
    router.push('/login')
    return
  }

  isLoading.value = true
  try {
    const result = await paymentStore.claimFreeGame(props.item.game_id, Number(user.userId), auth)
    if (result) {
      ownsCurrentGame.value = true
      router.go(0)
    }
  } catch (error) {
    console.error('Error claiming free game:', error)
  } finally {
    isLoading.value = false
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
  <div v-if="props.loading" class="item">
    <div class="main sk-main">
      <div class="sk sk-img"></div>
      <div class="sk sk-title"></div>
      <div class="sk sk-dev"></div>
      <div class="sk-footer">
        <div class="sk sk-price"></div>
        <div class="sk sk-btn"></div>
      </div>
    </div>
  </div>
  <div v-else class="item" :class="{ 'mobile-item': isMobile }">
    <div class="main" :class="{ 'mobile-main': isMobile }">
      <img class="image" :src="resolveImageUrl(props.item.banner_url)" @click="GoToGame" />

      <p class="game-name" :class="{ 'mobile-game-name': isMobile }">
        {{ props.item.name[i18n.locale.value].toUpperCase() }}
      </p>
      <div v-if="metaLoading" class="sk sk-on-light sk-dev-line"></div>
      <p v-else class="game-dev" :class="{ 'mobile-text': isMobile }">{{ developerName }}</p>
      <div v-if="metaLoading" class="price" :class="{ 'mobile-price': isMobile }">
        <div class="sk sk-on-light sk-price-line"></div>
        <div class="sk sk-on-light sk-btn"></div>
      </div>
      <div v-else class="price" :class="{ 'mobile-price': isMobile }">
        <p v-if="ownsCurrentGame" :class="{ 'mobile-price-text': isMobile }">
          {{ $t('already_owned') }}
        </p>
        <p v-else-if="hasSubscriptionAccess" :class="{ 'mobile-price-text': isMobile }">
          {{ $t('subscription_access') }}
        </p>
        <p v-else-if="props.item.price[i18n.locale.value] > 0" :class="{ 'mobile-price-text': isMobile }">
          {{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(props.item.price[i18n.locale.value]) }}
        </p>
        <p v-else :class="{ 'mobile-price-text': isMobile }">{{$t('claim_for_free')}}</p>

        <div
          :class="[ownsCurrentGame ? '' : 'buttons', isMobile ? 'mobile-buttons' : '']"
          @mouseenter="buttonHovered = true"
          @mouseleave="buttonHovered = false"
        >
          <button v-if="ownsCurrentGame" class="add-button"><CheckIcon class="icon" /></button>

          <button
            v-else-if="shoppingCart.cart.includes(props.item.game_id)"
            class="in-cart-button"
            :class="{ 'mobile-in-cart-button': isMobile }"
            @click="shoppingCart.removeGameFromCart({ game_id: props.item.game_id })"
          >
            <p v-if="!buttonHovered" :class="{ 'mobile-button-text': isMobile }">
              {{ $t('already_in_cart') }}
            </p>
            <p v-else :class="{ 'mobile-button-text': isMobile }">{{ $t('remove_from_cart') }}</p>

            <CheckIcon v-if="!buttonHovered" class="icon" />
            <XMarkIcon v-else class="icon" />
          </button>

          <button
            v-else-if="props.item.price[i18n.locale.value] > 0"
            class="add-button"
            :class="{ 'mobile-add-button': isMobile }"
            @click="AddToCart"
          >
            <!-- price[i18n.locale.value] > 0" @click="AddToCart"> -->
            <CartIcon v-if="!buttonHovered" class="icon" />
            <PlusIcon v-else class="icon" />
          </button>

          <button
            v-else
            class="add-button"
            :class="{ 'mobile-add-button': isMobile }"
            @click="ClaimFree"
          >
            <PlusIcon class="icon" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes skeleton-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.sk {
  background: linear-gradient(90deg, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.12) 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.6s infinite;
  border-radius: 6px;
}

.main.sk-main {
  background-color: rgba(255, 255, 255, 0.05);
}

.sk-img { width: 100%; height: 200px; border-radius: 10px; }
.sk-title { width: 70%; height: 18px; }
.sk-dev { width: 45%; height: 14px; }
.sk-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px;
}
.sk-price { width: 60px; height: 14px; }
.sk-btn { width: 45px; height: 45px; border-radius: 50%; }

/* inline placeholders for the lazily fetched dev name / ownership state; heights match
   the text lines they replace. They sit inside the white loaded card, so they need a
   gray shimmer instead of the white-alpha one used on the dark card-level skeleton */
.sk-on-light {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.08) 25%, rgba(0, 0, 0, 0.04) 50%, rgba(0, 0, 0, 0.08) 75%);
  background-size: 200% 100%;
}

.sk-dev-line { width: 45%; height: 1.35rem; align-self: center; }
.sk-price-line { width: 90px; height: 1.2rem; margin-bottom: 8px; }

h3 {
  color: var(--light);
}

.item {
  width: 100%;
  max-width: 300px;
  border-radius: 5px;
  display: flex;
  overflow: hidden;
  transition:
    filter 0.2s ease,
    scale 0.2s ease;
}

.mobile-item {
  max-width: 100%;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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
  font-family: 'Poppins', sans-serif;
  font-size: larger;
  color: black;
  font-weight: bold;
  margin: 0;
}

.mobile-game-name {
  font-size: 0.9rem;
}

.game-dev {
  font-family: 'Poppins', sans-serif;
  color: rgb(128, 128, 128);
  font-size: large;
  margin: 0;
}

.mobile-text {
  font-size: 0.85rem;
}

.price {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px 5px;
  font-family: 'Poppins', sans-serif;
  color: black;
}

.mobile-price {
  padding: 3px 2px;
}

.mobile-price-text {
  font-size: 0.8rem;
}

.price p {
  flex-grow: 1;
}

.buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
}

.mobile-buttons {
  margin-top: 2px;
}

.buttons:hover {
  scale: 1.1;
  transition: 0.2s;
}

.add-button {
  display: flex;
  height: 45px;
  width: 45px;
  border-radius: 50%;
  border: none;
  align-items: center;
  padding: none;
}

.mobile-add-button {
  height: 35px;
  width: 35px;
}

.add-button svg {
  margin: auto;
  fill: black;
}

.in-cart-button {
  background-color: var(--boly-bg-dark);
  display: flex;
  height: 45px;
  border-radius: 22.5px;
  border: none;
  align-items: center;
  padding: none;
}

.mobile-in-cart-button {
  height: 35px;
  border-radius: 17.5px;
}

.in-cart-button p {
  font-family: 'Poppins', sans-serif;
  font-size: medium;
  color: white;
  padding: 0px 10px;
}

.mobile-button-text {
  font-size: 0.7rem;
  padding: 0px 3px !important;
}

.in-cart-button svg {
  margin-right: 10px;
  fill: white;
}

.main {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 13px;
  padding: 10px;
  gap: 0.5rem;
}

.mobile-main {
  min-width: unset;
  max-width: 100%;
  padding: 6px;
  gap: 0.2rem;
}

.main > img {
  border-radius: 10px;
  width: 100%;
  height: 200px;
  aspect-ratio: 1.66666666;
  object-fit: cover;
  cursor: pointer;
}

.mobile-main > img {
  height: 120px;
  border-radius: 6px;
}

/* Media queries for different screen sizes */
@media (max-width: 600px) {
  .mobile-add-button {
    height: 30px;
    width: 30px;
  }

  .mobile-in-cart-button {
    height: 30px;
    border-radius: 15px;
  }

  .mobile-game-name {
    font-size: 0.8rem;
  }

  .mobile-text {
    font-size: 0.7rem;
  }

  .mobile-price-text {
    font-size: 0.7rem;
  }

  .mobile-main > img {
    height: 100px;
  }
}
</style>
