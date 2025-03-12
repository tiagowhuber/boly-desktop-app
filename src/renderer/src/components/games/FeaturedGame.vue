<script setup lang="ts">
import Loading from '@renderer/components/LoadingIcon.vue'
import { useAuth, useGames, useUser} from '@renderer/stores'
import { computed, inject, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import { useRouter } from 'vue-router';

const router = useRouter();
const i18n = useI18n();
const gamesStore = useGames()
const auth = useAuth()
const user = useUser()
const { loading, games } = storeToRefs(gamesStore)
const featuredGames = ref<any[]>([])

const gameDataBaseUrl = import.meta.env.VITE_S3_BASE_URL;

async function refreshGames() {
  await gamesStore.getAll()
}

const shoppingCart = inject<any>('cart')

function AddToCart(item: any) {
  shoppingCart.addGameToCart({ game_id: item.game_id })
}

const featuredIds = ref<number[]>([1,2])

const carouselRef = ref<any>();
const currentSlide = ref<number>(0);

const settings = {
  itemsToShow: 1,
  snapAlign: 'center',
  wrapAround: true,
  autoplay: 8000,
  pauseAutoplayOnHover: true,
  transition: 300, 
  mouseDrag: false,
  touchDrag: false
}

function next() {
  carouselRef.value.next();
  carouselRef.value.updateSlidesData()
}

function prev() {
  carouselRef.value.prev();
  carouselRef.value.updateSlidesData()
}

function moveToSlide(i: number){
  carouselRef.value.slideTo(i);
  carouselRef.value.updateSlidesData()
}

onMounted(async () => {
  await refreshGames()
  console.log('Games:', games.value);

  const gameMap = new Map(games.value.map((game: any) => [game.game_id, game]));
  featuredGames.value = featuredIds.value.map(id => gameMap.get(id)).filter(game => game !== undefined);
  console.log('Featured Games:', featuredGames.value);
})

function GoToGame(id: number) {
  router.push('/games/' + id)
}

</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  <div class="section" v-else>
    <div class="carousel-container">
      <carousel v-bind="settings" ref="carouselRef" v-model="currentSlide">
        <slide v-for="item in featuredGames" :key="item.game_id">
          <div class="main" v-if="item != null">
            <div class="image-wrapper">
              <img 
                :src="item.banner_url" 
                @click="GoToGame(item.game_id)"
                loading="lazy"
              >
            </div>
            <div class="details">
              <h3>{{ $t('featured').toUpperCase() }}</h3>
              <h2>{{ item.name[i18n.locale.value].toUpperCase() }}</h2>
              <p class="dev"> {{ $t('developer') }}</p>
              <p class="desc">{{item.description[i18n.locale.value]}}</p>
              
              <div>
                <button class="btn-orange" @click="GoToGame(item.game_id)"> {{ $t('see_more').toUpperCase() }}</button>
                <template v-if="user.userId && !gamesStore.ownsGame(item.game_id, user.userId)">
                  <button class="btn-blue" v-if="shoppingCart.cart.includes(item.game_id)" @click="shoppingCart.removeGameFromCart({ game_id: item.game_id })">{{ $t('remove_from_cart_nq').toUpperCase() }}</button>
                  <button class="btn-purple" v-else @click="AddToCart(item)">{{ $t('add_to_cart').toUpperCase() }}</button>
                </template>

              </div>
            </div>
          </div>
        </slide>

        <template #addons>
          <navigation />
        </template>
      </carousel>
    </div>
    <div class="nav-counter">
      <span 
        v-for="i in featuredGames.length" 
        :key="i" 
        @click="moveToSlide(i-1)"
        class="nav-dot"
        :class="{ active: currentSlide === i-1 }"
      >
        {{ currentSlide === i-1 ? '●' : '○' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.carousel-container {
  flex-direction: column;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 15px;
  align-items: center;
  overflow: hidden;
  width: 100%;
}

.image-wrapper {
  position: relative;
  width: 500px;
  height: 300px;
  overflow: hidden;
  border-radius: 15px;
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

.nav-dot {
  transition: transform 0.2s ease, color 0.2s ease;
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

.details{
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.details h2{
  font-family: "Anton", serif;
  font-style: italic;
}

.details h3{
  text-align: start;
  color: var(--boly-featured-green);
  font-family: "Anton", serif;
  font-style: italic;
}

.details .dev{
  color: rgba(179, 184, 212, 0.527);
  padding: 10px 0px;
}

.details .desc{
  min-height: 100px;
}

button {
  height: 30px;
  margin-top: 10px;
  font-family: "Anton", serif;
  font-size: large;
  color: var(--light);
  border: none;
  justify-content: center;
  border-radius: 5px;
  flex-grow: 1;
  transition: .2s;
}

.details > div{
  display: flex;
  gap: 1rem;
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
</style>

<style>

.carousel-container .carousel__icon{
  fill: white;
  transition: .2s;
}

.carousel-container .carousel__icon:hover{
  transition: .2s;
  scale: 1.5;
}
</style>
