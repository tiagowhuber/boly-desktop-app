<script setup lang="ts">
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import RemoveIcon from '@/components/icons/IconRemove.vue'
import XMarkIcon from '../icons/XMarkIcon.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/stores'
import type { Game } from '@/types'

// Type guard to check if price object has the locale key
function hasLocalePrice(price: Record<string, any> | null, locale: string): boolean {
  return !!price && typeof price === 'object' && locale in price;
}

const i18n = useI18n()
const router = useRouter()
const auth = useAuth()

const showModal = ref(false)
const props = defineProps<{
  game: Game
}>()

const currency = computed(() => {
  return i18n.locale.value === 'en' ? 'USD' : 'CLP'
})

const s3BaseUrl = computed(() => import.meta.env.VITE_S3_BASE_URL)
const gameDataBaseUrl = computed(() => `${s3BaseUrl.value}/${props.game.game_id}/`)

const emit = defineEmits<{
  (e: 'remove', game: Game): void
}>()

function RemoveItem(): void {
  emit('remove', props.game)
  showModal.value = false
}

function GoToGame(): void {
  const rel_url = '/games/' + props.game.game_id
  router.push(rel_url)
}

function getImageUrl(): string {
  if (!props.game) {
    return '/assets/images/1.jpg'
  }
  
  if (!props.game.banner_url) {
    return '/assets/images/1.jpg'
  }
  
  return props.game.banner_url
}

// Safe user ID access
const userId = computed(() => auth.isLoggedIn ? auth.token : null)
</script>

<template>
  <div class="item">
    <img :src="getImageUrl()" @click="GoToGame">
    <div class="details">
      <div>
        <p class="game-title">{{ props.game.name[i18n.locale.value] }}</p>
      </div>
    </div>
    <p class="price text_highlight">
      <template v-if="typeof props.game.price === 'object' && props.game.price !== null">
              {{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(hasLocalePrice(props.game.price, i18n.locale.value) ? (props.game.price as Record<string, number>)[i18n.locale.value] : 0) }}
            </template>
      <template v-else>
        {{ props.game.price !== null ? `${currency} ${Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format(props.game.price)}` : $t('price_unavailable') }}
      </template>
    </p>

    <div class="remove_button_container">
      <div class="remove_button" @click="showModal = true">
        <XMarkIcon class="icon" />
      </div>
    </div>
  </div>

  <Teleport to="body">
    <ConfirmModal :show="showModal" @close="showModal = false" @confirm="RemoveItem">
      <template #header>
        <h3>{{ $t('cart') }}</h3>
      </template>
      <template #body>{{ $t('modal_cart_remove_item', { item: props.game.name[i18n.locale.value as string] }) }}</template>
    </ConfirmModal>
  </Teleport>
</template>

<style scoped>
h3 {
  font-weight: bold;
}

.item {
  border-radius: 5px;
  overflow: hidden;
  height: 100px;
  width: 100%;
  transition: 0.1s;

  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 20px;
}

.item:hover {
  transition: 0.1s;
  scale: 1.03;
}

.item img {
  height: 100%;
  aspect-ratio: 1.666666;
  object-fit: cover;
  cursor: pointer;
}

.details {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.details > div {
  height: 50px;
  display: flex;
  align-items: center;
}

.details p {
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.price {
  padding: 0 2rem;
  font-weight: bold;
  
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
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
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

.remove_button_container {
  height: 100%;
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove_button {
  cursor: pointer;
  transition: 0.2s;

  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove_button > .icon {
  height: 24px;
  transition: 0.2s;
}

.remove_button:hover > .icon {
  fill: var(--lightGreen);
  transition: 0.2s;
}

.game-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--light);
  text-decoration: none;
}

/* Responsive styling for mobile phones */
@media (max-width: 480px) {
  .item {
    height: auto;
    min-height: 80px;
    padding: 0.5rem 0;
    flex-wrap: wrap;
  }
  
  .item img {
    height: 60px;
    min-width: 100px;
  }
  
  .details {
    padding: 0.5rem;
  }
  
  .game-title {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
  
  .price {
    padding: 0 0.75rem;
    font-size: 0.9rem;
  }
  
  .remove_button {
    width: 40px;
    height: 40px;
  }
  
  .remove_button > .icon {
    height: 20px;
  }
}
</style>
