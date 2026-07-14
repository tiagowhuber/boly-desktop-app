<script setup lang="ts">
import SkeletonBase from '@/components/skeletons/SkeletonBase.vue'
import { useGames, useUser } from '@/stores'
import { computed, inject, onMounted, ref, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import { useRouter } from 'vue-router'
import { resolveImageUrl } from '@/utils/imageUrl'

const router = useRouter()
const i18n = useI18n()
const gamesStore = useGames()
const user = useUser()
const { loading, games } = storeToRefs(gamesStore)
const featuredGames = ref<any[]>([])
const isMobile = ref(window.innerWidth <= 768)

async function refreshGames() {
  await gamesStore.getAll()
}

const shoppingCart = inject<any>('cart')

function AddToCart(item: any) {
  shoppingCart.addGameToCart({ game_id: item.game_id })
}

const featuredIds = ref<number[]>([2, 5])

const carouselRef = ref<any>()
const currentSlide = ref<number>(0)

// Update carousel settings based on device type
const settings = computed(() => ({
  itemsToShow: 1,
  snapAlign: 'center',
  wrapAround: true,
  // autoplay: isMobile.value ? false : 8000,
  autoplay: isMobile.value ? undefined : 8000, //TODO check this
  pauseAutoplayOnHover: true,
  transition: 300,
  mouseDrag: isMobile.value,
  touchDrag: true
}))

function moveToSlide(i: number) {
  carouselRef.value.slideTo(i)
  carouselRef.value.updateSlidesData()
}

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(async () => {
  await refreshGames()
  console.log('Games:', games.value)

  const gameMap = new Map(games.value.map((game: any) => [game.game_id, game]))
  featuredGames.value = featuredIds.value
    .map((id) => gameMap.get(id))
    .filter((game) => game !== undefined)
  console.log('Featured Games:', featuredGames.value)

  // Add resize event listener
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // Clean up event listener
  window.removeEventListener('resize', handleResize)
})

function GoToGame(id: number) {
  router.push('/games/' + id)
}
</script>

<template>
  <div v-if="loading" class="skeleton-hero">
    <SkeletonBase height="380px" radius="15px" />
    <div class="skeleton-hero-text">
      <SkeletonBase width="35%" height="1.8rem" />
      <SkeletonBase width="55%" height="1rem" />
    </div>
  </div>
  <div v-else class="section">
    <div class="carousel-container" :class="{ 'mobile-carousel': isMobile }">
      <carousel v-bind="settings" ref="carouselRef" v-model="currentSlide">
        <slide v-for="item in featuredGames" :key="item.game_id">
          <div v-if="item != null" class="main" :class="{ 'mobile-main': isMobile }">
            <div class="image-wrapper" :class="{ 'mobile-image': isMobile }">
              <img :src="resolveImageUrl(item.banner_url)" loading="lazy" @click="GoToGame(item.game_id)" />
            </div>
            <div class="details" :class="{ 'mobile-details': isMobile }">
              <h3>{{ $t('featured').toUpperCase() }}</h3>
              <h2>{{ item.name[i18n.locale.value].toUpperCase() }}</h2>
              <!-- hardcoded bc item.developer is the id. will fix later -->
              <p class="dev">{{ $t('ff studios') }}</p>
              <p class="desc" :class="{ 'mobile-desc': isMobile }">
                {{ item.description[i18n.locale.value] }}
              </p>

              <div :class="{ 'mobile-buttons': isMobile }">
                <button
                  class="btn-pink"
                  :class="{ 'mobile-see-more': isMobile }"
                  @click="GoToGame(item.game_id)"
                >
                  {{ $t('see_more').toUpperCase() }}
                </button>
                <template v-if="user.userId && !gamesStore.ownsGame(item.game_id, user.userId)">
                  <button
                    v-if="shoppingCart.cart.includes(item.game_id)"
                    class="btn-blue"
                    @click="shoppingCart.removeGameFromCart({ game_id: item.game_id })"
                  >
                    {{ $t('remove_from_cart_nq').toUpperCase() }}
                  </button>
                  <button v-else class="btn-purple" @click="AddToCart(item)">
                    {{ $t('add_to_cart').toUpperCase() }}
                  </button>
                  <!-- <button class="btn-purple" v-else @click="">{{ $t('coming_soon').toUpperCase() }}</button> -->
                </template>
              </div>
            </div>
          </div>
        </slide>

        <template #addons>
          <navigation v-if="!isMobile" />
        </template>
      </carousel>
    </div>
    <div class="nav-counter" :class="{ 'mobile-nav-counter': isMobile }">
      <span
        v-for="i in featuredGames.length"
        :key="i"
        class="nav-dot"
        :class="{ active: currentSlide === i - 1 }"
        @click="moveToSlide(i - 1)"
      >
        {{ currentSlide === i - 1 ? '●' : '○' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.skeleton-hero {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 50px 0 20px;
}

.skeleton-hero-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.carousel-container {
  flex-direction: column;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 15px;
  align-items: center;
  overflow: hidden;
  width: 100%;
}

.mobile-carousel {
  margin: 0 auto;
  max-width: 100%;
  border-radius: 10px;
}

.image-wrapper {
  position: relative;
  width: 500px;
  height: 300px;
  overflow: hidden;
  border-radius: 15px;
}

.mobile-image {
  width: 100%;
  height: auto;
  max-height: 200px;
  border-radius: 8px;
}

.main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.main img:hover {
  transform: scale(1.02);
}

.nav-counter {
  height: 50px;
  display: flex;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 200%;
  justify-content: center;
  align-items: center;
}

.mobile-nav-counter {
  height: 40px;
  gap: 0.4rem;
  font-size: 150%;
}

.nav-dot {
  transition:
    transform 0.2s ease,
    color 0.2s ease;
  user-select: none;
}

.nav-dot:hover {
  transform: scale(1.2);
}

.nav-dot.active {
  color: white;
}

.main {
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 50px;
  gap: 3rem;
}

.mobile-main {
  flex-direction: column;
  padding: 15px;
  gap: 1rem;
}

.details {
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 50%;
}

.mobile-details {
  padding: 0 10px;
  max-width: 100%;
}

.details h2 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
}

.mobile-details h2 {
  font-size: 1.5rem;
  margin: 5px 0;
}

.details h3 {
  text-align: start;
  color: var(--boly-featured-green);
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
}

.mobile-details h3 {
  font-size: 1rem;
}

.details .dev {
  color: rgba(179, 184, 212, 0.527);
  padding: 10px 0px;
}

.mobile-details .dev {
  padding: 5px 0;
  font-size: 0.9rem;
}

.details .desc {
  min-height: 100px;
}

.mobile-desc {
  min-height: 50px;
  max-height: 80px;
  overflow-y: auto;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

button {
  height: 30px;
  margin-top: 10px;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: large;
  color: var(--light);
  border: none;
  justify-content: center;
  border-radius: 5px;
  flex-grow: 1;
  transition: 0.2s;
}

.details > div {
  display: flex;
  gap: 1rem;
}

.mobile-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.mobile-buttons button {
  padding: 5px 10px;
  margin-top: 5px;
  font-size: medium;
}

.mobile-buttons .mobile-see-more {
  width: 30%;
  font-size: 0.9rem;
  align-self: flex-start;
}

.mobile-buttons template {
  flex: 1;
  width: 100%;
}

.mobile-buttons {
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-buttons button {
  width: 100%;
  padding: 5px 0;
  margin-top: 5px;
  font-size: medium;
}
</style>

<style>
.carousel__slide {
  transform-style: preserve-3d;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.carousel__viewport {
  perspective: 1000px;
}

.carousel__track {
  transform-style: preserve-3d;
}

.carousel-container .carousel__icon {
  fill: white;
  transition: transform 0.2s ease;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
}

.carousel-container .carousel__icon:hover {
  transform: scale(1.2);
}

.carousel-container .carousel__icon {
  fill: white;
  transition: 0.2s;
}

.carousel-container .carousel__icon:hover {
  transition: 0.2s;
  scale: 1.5;
}

@media (max-width: 768px) {
  .carousel__slide {
    touch-action: pan-y;
  }

  .carousel-container .carousel__pagination {
    margin-top: 10px;
  }

  .carousel-container .carousel__pagination-button {
    padding: 5px;
  }
}
</style>
