<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import WindowsIcon from '@/components/icons/WindowsIcon.vue'
import AppleIcon from '@/components/icons/AppleIcon.vue'
import StarIcon from '../icons/SolidStarIcon.vue'
import HeartIcon from '../icons/HeartIcon.vue'
import CustomGameMediaGallery from './CustomGameMediaGallery.vue'
import { useAuth, useUser, useGames, useCart, useDeveloper } from '@/stores'
import useWishlist from '@/stores/wishlist'
import { useI18n } from 'vue-i18n'
import type { Game } from '@/types'

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

const props = defineProps<{ item: Game }>();
console.log('GameDetails props:', props);
const i18n = useI18n();
const auth = useAuth();
const user = useUser();
const cart = useCart();
const router = useRouter();
const games = useGames();
const wishlist = useWishlist();

const developer = ref<any>(null);
const developerStore = useDeveloper();

const currency = computed(() => {
  return i18n.locale.value === 'en' ? 'USD' : 'CLP'
});

const game_images = ref<GameMedia[]>([]);

function GoToAchievements(): void {
  router.push('/games/' + props.item.game_id + '/achievements');
}

function goToLibrary(): void {
  router.push('/library');
}

function goToGames(): void {
  router.push('/games');
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

// function AddToCart(): void {
//   cart.addGameToCart({ game_id: props.item.game_id });
// }

const ownsCurrentGame = ref(false);
const hasSubscriptionAccess = ref(false);
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
        const accessInfo = await games.ownsGame(gameId, userId);
        ownsCurrentGame.value = accessInfo.owned;
        hasSubscriptionAccess.value = accessInfo.subscriptionAccess;
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
          const accessInfo = await games.ownsGame(gameId, userId);
          ownsCurrentGame.value = accessInfo.owned;
          hasSubscriptionAccess.value = accessInfo.subscriptionAccess;
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
      <div class="info-faq">
        <p>{{$t('general_info').toUpperCase()}}</p>
        <p>|</p>
        <p>{{$t('faq').toUpperCase()}}</p>
      </div>

      <div class="main-container">
        <!-- Replace carousel with GameMediaGallery component -->
        <div class="images" v-if="props.item?.game_id">
          <CustomGameMediaGallery 
            :gameId="Number(props.item.game_id)" 
            :showSectionTitles="false"
          />
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
                  <WindowsIcon v-if="props.item.game_type_id === 3 || props.item.game_type_id === 2" class="icon" />
                  <AppleIcon v-if="props.item.game_type_id === 2" class="icon" />
                  <!-- <LinuxIcon class="icon" /> -->
                </td>
              </tr>
            </table>
          </div>

          <div class="price">
            <p v-if="ownsCurrentGame">{{ $t('already_owned')}}</p>
            <p v-else-if="hasSubscriptionAccess">{{ $t('subscription_access')}}</p>
            <!-- <p v-else-if="(props.item.price as Record<string, number>)?.[i18n.locale.value] > 0">
              {{ currency === 'USD' ? 'USD' : 'CLP' }} {{ Intl.NumberFormat(i18n.locale.value === 'en' ? 'en-US' : 'es-CL', { style: 'currency', currency: currency, currencyDisplay: 'symbol' }).format((props.item.price as Record<string, number>)[i18n.locale.value]) }}
            </p>
            <p v-else>{{$t('claim_for_free')}}</p> -->
            <p v-else>{{$t('coming_soon')}}</p>
          </div>

          <div class="buttons">
            <div v-if="ownsCurrentGame || hasSubscriptionAccess">
              <button class="btn-purple" type="button" @click="goToLibrary" v-on:click.stop>
                {{ $t('view_in_library').toUpperCase() }}
              </button>

              <button class="btn-blue" type="button" @click="GoToAchievements()" v-on:click.stop>
                {{ $t('see_achievements').toUpperCase() }} <StarIcon/>
              </button>
            </div>
            <div v-else>
              <button 
                class="btn-blue" 
                v-if="cart.cart.includes(props.item.game_id)" 
                @click="router.push('/cart')"
              >
                {{ $t('view_in_cart').toUpperCase() }}
              </button>
              <!-- <button class="btn-purple" v-else @click="AddToCart">
                {{ $t('add_to_cart').toUpperCase() }}
              </button> -->
              
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

::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
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
  font-family: 'Poppins', sans-serif;
  width: 100%;
  margin-top: 20px;
}

.info-faq{
  font-size: small;
  margin-bottom: 30px;
}

.main-container{
  width: 100%;
  display: flex;
  gap: 1rem;
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