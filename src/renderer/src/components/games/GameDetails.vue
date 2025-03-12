<script setup lang="ts">
import { ref, onMounted, inject, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StarRating from 'vue-star-rating'
import WindowsIcon from '@renderer/components/icons/WindowsIcon.vue'
import LinuxIcon from '@renderer/components/icons/LinuxIcon.vue'
import AppleIcon from '@renderer/components/icons/AppleIcon.vue'
import CheckIcon from '@renderer/components/icons/CheckIcon.vue'
import XMarkIcon from '@renderer/components/icons/XMarkIcon.vue'
import NextIcon from '@renderer/components/icons/ChevronRight.vue'
import DownloadIcon from '../icons/DownloadIcon.vue'
import PlayIcon from '../icons/PlayIcon.vue'
import StarIcon from '../icons/SolidStarIcon.vue'
import HeartIcon from '../icons/HeartIcon.vue'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import { useAuth, useUser, useGames, useCart, useDeveloper } from '@renderer/stores'
import useWishlist from '@renderer/stores/wishlist'
import { useI18n } from 'vue-i18n'
import type { Game } from '@renderer/types'

// Declare vue-star-rating in types/globals.d.ts instead
declare global {
  interface Window {
    StarRating: any;
  }
}

interface GameMedia {
  id: string;
  url: string;
  is_video: boolean;
}

interface LocalizedText {
  [key: string]: string;
}

interface Props {
  item: Game;
}

const props = defineProps<{ item: Game }>();
console.log('GameDetails props:', props);
const i18n = useI18n();
const auth = useAuth();
const user = useUser();
const cart = useCart();
const router = useRouter();
const games = useGames();
const wishlist = useWishlist();

const game = ref<Game>({} as Game);
const gameDataBaseUrl = ref('');
const hoveringButton1 = ref(false);
const carouselRef = ref();
const currentSlide = ref(0);
const loading = ref(false);
const developer = ref<any>(null);
const developerStore = useDeveloper();

const slideTo = (val: string | number) => {
  currentSlide.value = typeof val === 'string' ? parseInt(val, 10) : val;
};

const currency = computed(() => {
  return i18n.locale.value === 'en' ? 'USD' : 'CLP'
})

const galleryConfig = {
  itemsToShow: 1,
  mouseDrag: false,
  touchDrag: false,
  wrapAround: false,
};

const game_images = ref<GameMedia[]>([]);

function addToCart(game: Game): void {
  cart.addGameToCart({ game_id: game.game_id });
}

function goToLibrary(): void {
  router.push('/library');
}

function GoToAchievements(): void {
  router.push('/games/' + props.item.game_id + '/achievements');
}

async function Play(): Promise<void> {
  router.push('/webgame/' + props.item.game_id);
}

async function Download(): Promise<void> {
  const success = await games.downloadGame(props.item.game_id, auth);
  if (!success) {
    alert("download failed");
  }
}

function goToGames(): void {
  router.push('/games');
}

async function ClaimFree(game_id: string): Promise<boolean> {
  if (!auth.isLoggedIn) {
    router.push('/login');
    return false;
  }

  loading.value = true;
  try {
    const result = await games.claimFreeGame(Number(game_id), auth);
    if (result) {
      alert(JSON.stringify(result));
      router.go(0);
      return true;
    }
    return false;
  } catch (error) {
    console.log("error in transaction request ", error);
    return false;
  } finally {
    loading.value = false;
  }
}

function updateGameImages(): void {
  console.log('GameDetails: Starting to update game images');
  let count = 0;
  const gameDataBaseUrl = import.meta.env.VITE_S3_BASE_URL + '/' + props.item.game_id + '/';
  game_images.value = [];

  if (Array.isArray(props.item.banner_url)) {
    console.log('GameDetails: Processing media URLs:', props.item.banner_url.length, 'items');
    props.item.banner_url.forEach((media_uri: string) => {
      game_images.value.push({
        id: count.toString(),
        url: gameDataBaseUrl + media_uri,
        is_video: media_uri.endsWith(".mp4")
      });
      count++;
    });
    console.log('GameDetails: Finished processing media URLs');
  } else {
    console.log('GameDetails: No media URLs to process');
  }
}

function AddToCart(item: Game): void {
  cart.addGameToCart({ game_id: props.item.game_id });
}

const ownsCurrentGame = ref(false);
const isInWishlist = ref(false);

async function fetchDeveloperDetails(developerId: number): Promise<void> {
  if (!developerId) return;
  
  try {
    developer.value = await developerStore.fetchDeveloperById(developerId);
    console.log('Developer details:', developer.value);
  } catch (error) {
    console.error('Error fetching developer details:', error);
  }
}

function toggleWishlist(): void {
  if (!auth.isLoggedIn) {
    router.push('/login');
    return;
  }
  
  if (isInWishlist.value) {
    wishlist.removeFromWishlist(props.item.game_id.toString())
      .then(() => {
        isInWishlist.value = false;
      })
      .catch(error => {
        console.error("Failed to remove from wishlist:", error);
      });
  } else {
    wishlist.addToWishlist(props.item.game_id.toString())
      .then(() => {
        isInWishlist.value = true;
      })
      .catch(error => {
        console.error("Failed to add to wishlist:", error);
      });
  }
}

onMounted(async () => {
  if (props.item?.game_id) {
    console.log('GameDetails: Component mounted with game:', props.item.game_id);
    updateGameImages();
    
    if (props.item.developer_id) {
      await fetchDeveloperDetails(props.item.developer_id);
    }
    
    if (auth.isLoggedIn && user.userId) {
      const userId = Number(user.userId);
      const gameId = Number(props.item.game_id);
      if (!isNaN(userId) && !isNaN(gameId)) {
        ownsCurrentGame.value = await games.ownsGame(gameId, userId);
        isInWishlist.value = wishlist.isInWishlist(props.item.game_id.toString());
      }
    }
  }
});

watch(
  () => props.item,
  async (newItem: Game) => {
    if (newItem?.game_id) {
      console.log('GameDetails: Item prop changed:', newItem.game_id);
      updateGameImages();
      
      if (newItem.developer_id) {
        await fetchDeveloperDetails(newItem.developer_id);
      }
      
      if (auth.isLoggedIn && user.userId) {
        const userId = Number(user.userId);
        const gameId = Number(newItem.game_id);
        if (!isNaN(userId) && !isNaN(gameId)) {
          ownsCurrentGame.value = await games.ownsGame(gameId, userId);
          isInWishlist.value = wishlist.isInWishlist(newItem.game_id.toString());
        }
      }
    }
  }
);
</script>

<template>
  <div class="section" v-if="props.item">
    <div class="details">
      {{ console.log('GameDetails: Rendering template with game:', props.item.game_id) }}
      <h1>{{ ((props.item?.name as Record<string, string>)?.[i18n.locale.value] || (props.item?.name as Record<string, string>)?.['en'] || '') }}</h1>
      <p class="dev">{{ $t('developer') }}</p>
      <br>
      <star-rating 
      :rating="4.67" 
      :round-start-rating="false" 
      :read-only="true" 
      :show-rating="false" 
      :increment="0.01"
      :border-width="0" 
      :star-size="30"
      :active-color="'#FDBE11'"
      :inactive-color="'#7F7F7F7F'"
      />
      <div class="info-faq">
        <p>{{$t('general_info').toUpperCase()}}</p>
        <p>|</p>
        <p>{{$t('faq').toUpperCase()}}</p>
      </div>

      <div class="main-container">
        <div class="images" v-if="game_images != null">
          <Carousel id="gallery" class="viewport" v-bind="galleryConfig" ref="carouselRef" v-model="currentSlide">
            <Slide v-for="(img, index) in game_images" :key="index">
              <img :src="img.url" v-if="!img.is_video">
              <video id="video_player" controls v-else>
                <source :src="img.url" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Slide>
          </Carousel>
          <div class="thumbnails">
            <div v-for="(img, index) in game_images" :key="index" @click="slideTo(img.id)">
              <img :src="img.url" v-if="!img.is_video">
              <video id="video_player" v-else>
                <source :src="img.url" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
        <div class="dev-details">
          <div class="developer">
            <img v-if="developer?.picture_url" :src="developer.picture_url" :alt="developer?.name">
            <img v-else src="https://ffstudios.cl/wp-content/uploads/2023/09/logo-ffstudios.png">
            <br>
            <br>
            <table>
              <tr>
                <td>{{ $t('developer') }}</td>
                <td>{{ developer?.name || 'Unknown Developer' }}</td>
              </tr>
              <tr>
                <td>{{ $t('release_date') }}</td>
                <td>{{ props.item.release_date ? new Date(props.item.release_date).toLocaleDateString() : 'Unknown' }}</td>
              </tr>
              <tr>
                <td>{{ $t('game_platforms') }}</td>
                <td class="icon-row">
                  <WindowsIcon class="icon" />
                  <LinuxIcon class="icon" />
                  <AppleIcon class="icon" />
                </td>
              </tr>
            </table>
          </div>

          <div class="price">
            <p v-if="ownsCurrentGame">{{ $t('already_owned')}}</p>
            <p v-else-if="(props.item.price as Record<string, number>)?.[i18n.locale.value] > 0">
              {{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format((props.item.price as Record<string, number>)[i18n.locale.value]) }}
            </p>
            <p v-else>{{$t('claim_for_free')}}</p>
          </div>

          <div class="buttons">
            <div v-if="ownsCurrentGame">
              <button v-if="props.item.game_type_id === 2" class="btn-purple" type="button" @click="Play()" v-on:click.stop>
                {{ $t('play').toUpperCase() }} <PlayIcon/>
              </button>
              <button v-else class="btn-purple" type="button" @click="Download()" v-on:click.stop>
                {{ $t('download').toUpperCase() }} <DownloadIcon/>
              </button> 

              <button class="btn-blue" type="button" @click="GoToAchievements()" v-on:click.stop>
                {{ $t('see_achievements').toUpperCase() }} <StarIcon/>
              </button>
            </div>
            <div v-else>
              <button 
                class="btn-blue" 
                v-if="cart.cart.includes(props.item.game_id)" 
                @click="cart.removeGameFromCart({ game_id: props.item.game_id })"
              >
                {{ $t('remove_from_cart').toUpperCase() }}
              </button>
              <button class="btn-purple" v-else @click="AddToCart(props.item)">{{ $t('add_to_cart').toUpperCase() }}</button>
              
              <button 
                :class="['btn-wishlist', isInWishlist ? 'in-wishlist' : '']" 
                @click="toggleWishlist()"
              >
                {{ isInWishlist ? $t('remove from wishlist').toUpperCase() : $t('add to wishlist').toUpperCase() }}
                <HeartIcon :class="{ 'filled': isInWishlist }" />
              </button>
            </div>

            <button class="btn-dark" @click="goToGames()">{{ $t('continue_shopping').toUpperCase() }}</button>
          </div>
        </div>
      </div>
      <p class="desc">
        {{ (props.item.description as Record<string, string>)?.[i18n.locale.value] || (props.item.description as Record<string, string>)?.['en'] || '' }}
      </p>
    </div>
  </div>
</template>

<style>
.vue-star-rating{
  gap: .35rem;
}
</style>

<style scoped>

.details{
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.details h1{
  font-family: "Anton", serif;
  font-style: italic;
}

.details h3{
  color: var(--boly-featured-green);
  font-family: "Anton", serif;
  font-style: italic;
}

.details .dev{
  color: rgba(179, 184, 212, 0.527);
}

.price{
  display: flex;
  text-align: left;
  padding: 10px 5px;
  flex-direction: column;
  align-items: center;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 15px;
  margin: 10px 0px;
}

.price p{
  font-size: medium;
  font-weight: bold;
  flex-grow: 1;
}

.desc{
  width: 100%;
  margin-top: 20px;
}

.info-faq{
  font-size: small;
  margin-bottom: 30px;
}

.main-container{
  width: 100%;
}

.images{
  width: 750px;
}

.viewport{
  width: 100%;
  margin-bottom: 10px;
  border-radius: 20px;
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
}

.viewport img, .viewport video{
  border-radius: 20px;
  width: 100%;
  
}

.thumbnails{
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 15px;
  justify-content: start;
}

.thumbnails img, .thumbnails video{
  border-radius: 10px;
  max-height: 135px;
  cursor: pointer;
  
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5);
}

.thumbnails img:hover{
  filter: brightness(1.1);
}

.dev-details{
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  flex: 1;
}

.developer{
  min-height: 250px;
  background-color: var(--boly-bg-dark-transparent);
  font-size: large;
  padding: 50px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: start;
}

.developer img{
  max-width: 80%;
  margin: auto;
}

.developer tr{
  height: 30px;
}

.icon-row{
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.buttons{
  width: 100%;
}

button {
  width: 100%;
  font-family: "Anton", serif;
  font-size: larger;
  flex-grow: 1;
  margin-top: 10px;
  color: var(--light);
  justify-content: center;
  border-radius: 5px;
  border: none;
  transition: .2s;
}

.details > div{
  display: flex;
  gap: 1rem;
}

button svg{
  fill: white;
  height: 20px;
  padding-left: 5px;
}

.btn-purple{
  background-color: var(--boly-button-purple);
}

.btn-purple:hover{
  background-color: var(--boly-button-purple-hover);
}

.btn-dark{
  background-color: var(--boly-bg-dark-transparent);
}

.btn-dark:hover{
  background-color: var(--boly-bg-blue);
}

.btn-blue{
  background-color: var(--boly-button-blue);
}

.btn-blue:hover{
  background-color: var(--boly-button-blue-hover);
}

.btn-wishlist {
  background-color: var(--boly-bg-dark-transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-wishlist:hover {
  background-color: rgba(255, 80, 80, 0.7);
}

.btn-wishlist.in-wishlist {
  background-color: rgba(255, 80, 80, 0.8);
}

.btn-wishlist.in-wishlist:hover {
  background-color: rgba(255, 80, 80, 0.6);
}

.btn-wishlist svg {
  transition: fill 0.3s ease;
}

.btn-wishlist svg.filled {
  fill: red;
}
</style>
