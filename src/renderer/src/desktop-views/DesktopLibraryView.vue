<script lang="ts" setup>
//import { useI18n } from 'vue-i18n'
import DesktopLibraryItem from '@/desktop-components/DesktopLibraryItem.vue'
import Loading from '@/components/LoadingIcon.vue'
import { onMounted, ref, onBeforeUnmount } from 'vue' 
import { useRouter } from 'vue-router'
import { useAuth, useUser, useSubscription, useGames } from '../stores'
import useGameRoutes from '../desktop-stores/gameRoutes'
import axios from 'axios'
import type { Game, Subscription} from '@/types'
import { storeToRefs } from 'pinia'

const auth = useAuth()
const user = useUser()
const subscriptionStore = useSubscription()
const games = useGames()
//const achievementsStore = useAchievements()
const gameRoutesStore = useGameRoutes()
const router = useRouter()
const isLoading = ref(true)
const ownedGames = ref<Game[]>([])
const allOwnedGames = ref<Game[]>([])
const isSearchingGames = ref(false)
const showInstalledOnly = ref(false)
const showSubscriptionGames = ref(false)
const currentSubscription = ref<Subscription | null>(null)
const { subscriptions } = storeToRefs(subscriptionStore)

if (!auth.isLoggedIn) {
  router.back()
}

function setupLibraryDownloadHandlers() {
  window.electronAPI.onInstallStarted((data) => {
    console.log('Library detected install started:', data);
    
    const gameIndex = allOwnedGames.value.findIndex(g => g.game_id === data.gameId);
    if (gameIndex !== -1) {
      allOwnedGames.value[gameIndex].isInstalling = true;
      updateDisplayedGames();
    }
  });
  window.electronAPI.onInstallComplete((data) => {
    console.log('Library detected install complete:', data);
    
    const gameIndex = allOwnedGames.value.findIndex(g => g.game_id === data.gameId);
    if (gameIndex !== -1) {
      allOwnedGames.value[gameIndex].isInstalled = true;
      allOwnedGames.value[gameIndex].isInstalling = false;
      allOwnedGames.value[gameIndex].game_Path = data.installPath;
      console.log('Setting game path to:', allOwnedGames.value[gameIndex].game_Path);
      
      updateDisplayedGames();
    }
    
    loadGames();
  });
  
  window.electronAPI.onInstallError((data) => {
    console.error('Library detected install error:', data);
    
    const gameIndex = allOwnedGames.value.findIndex(g => g.game_id === data.gameId);
    if (gameIndex !== -1) {
      allOwnedGames.value[gameIndex].isInstalling = false;
      allOwnedGames.value[gameIndex].installError = data.error || 'Unknown installation error';
      updateDisplayedGames();
    }
  });
}

function cleanupLibraryDownloadHandlers() {
  try {
    window.electronAPI.removeAllListeners('install-complete');
    window.electronAPI.removeAllListeners('install-started');
    window.electronAPI.removeAllListeners('install-error');
  } catch (error) {
    console.error('Error cleaning up library download handlers:', error);
  }
}

async function loadGames() {
  isSearchingGames.value = true;
  try {
    console.log('Clearing previous game routes...');
    await gameRoutesStore.clearRoute();
    console.log('Searching for games in My Games folder...');
    await gameRoutesStore.searchForExes();
    console.log('Found games:', gameRoutesStore.getRouteItems);
  } catch (err) {
    console.error('Error searching for games:', err);
  } finally {
    isSearchingGames.value = false;
  }
}

async function fetchOwnedGames() {
  if (!user.userId) return

  try {
    if (currentSubscription.value?.plan_id != 1 && currentSubscription.value?.is_active) {
      console.log('User has active subscription. Loading all games.');
      await games.getAll();
      await loadGames();
      const localGames = gameRoutesStore.getRouteItems;
      
      allOwnedGames.value = games.games.map((game: Game) => {
        if (!game.banner_url) {
          game.banner_url = 'banner.jpg'
        }

        const found = localGames.find(localGame =>
          localGame.gameId === game.game_id
        );

        if (found !== undefined) {
          game.game_Path = found.route;
          game.isInstalled = true;
        } else {
          game.isInstalled = false;
        }
        
        game.isInstalling = false;
        game.installError = undefined;

        return game;
      });
    } else {
      // Code path for users without active subscription
      const response = await axios.get(`/v1/games/user/${user.userId}`)
      if (response.status === 200 && response.data) {
        const gamesList = response.data[0]?.game || []
        console.log('Extracted games list:', gamesList)

        await loadGames();
        const localGames = gameRoutesStore.getRouteItems;
        const localUninstallers = gameRoutesStore.getUninstallerItems;
        console.log('Local uninstallers:', JSON.stringify(localUninstallers));
        console.log('Local games:', JSON.stringify(localGames));

        allOwnedGames.value = gamesList.map((game: Game) => {
          if (!game.banner_url) {
            game.banner_url = 'banner.jpg'
          }

          // Check if game is installed locally (if has a matching gameId)
          const found = localGames.find(localGame =>
            localGame.gameId === game.game_id
          );

          if (found !== undefined) {
            game.game_Path = found.route;
            game.isInstalled = true;
          } else {
            game.isInstalled = false;
          }
          
          game.isInstalling = false;
          game.installError = undefined;

          return game;
        });
      }
    }

    updateDisplayedGames();
  } catch (error) {
    console.error('Error fetching owned games:', error)
  }
}

function updateDisplayedGames() {
  if (showSubscriptionGames.value) {
    games.getAll().then(() => {
      ownedGames.value = games.games;
    });
  } else if (showInstalledOnly.value) {
    ownedGames.value = allOwnedGames.value.filter(game => game.isInstalled);
  } else {
    ownedGames.value = [...allOwnedGames.value];
  }
}

function setFilter(filterType: 'installed' | 'owned' | 'subscription') {
  showInstalledOnly.value = false;
  showSubscriptionGames.value = false;
  
  if (filterType === 'installed') {
    showInstalledOnly.value = true;
    loadGames(); 
  } else if (filterType === 'subscription') {
    showSubscriptionGames.value = true;
  }
  
  updateDisplayedGames();
}

onMounted(async () => {
  if (auth.isLoggedIn && user.userId) {
    try {
      setupLibraryDownloadHandlers();
      const success = await subscriptionStore.getUserSubscriptions(user.userId, { token: auth.token })
      
      if (success && subscriptions.value.length > 0) {
        const activeSubscription = subscriptions.value.find(sub => sub.is_active === 1)
        if (activeSubscription) {
          currentSubscription.value = activeSubscription
        }
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      isLoading.value = false
    }

    try {
      const response = await axios.get(`/v1/users/${user.userId}`)
      if (response.status === 200) {
        user.setUser(response.data)
        await fetchOwnedGames()
        games.getAll().catch(err => {
          console.error('Error pre-fetching all games:', err)
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }

  } else {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  cleanupLibraryDownloadHandlers();
})
</script>

<template>
  <div class="loading_container" v-if="isLoading">
    <Loading />
  </div>
  <div class="section" v-else>
    <div class="main-container">
      <div>
        <div class="title-container">
          <h1>{{ $t('user_games', { user: user.username }) }}</h1>
        </div>
      </div>      
      <div class="title-container filter-controls">
        <div class="filter-buttons">
          <button
            class="filter-button"
            :class="{ active: showInstalledOnly }"
            @click="setFilter('installed')"
          >
            {{ $t('show_installed_only') }}
          </button>
          <button
            class="filter-button"
            :class="{ active: !showInstalledOnly && !showSubscriptionGames }"
            @click="setFilter('owned')"
          >
            {{ $t('show_all_owned_games') }}
          </button>
          <button
            v-if="currentSubscription?.plan_id != 1 && currentSubscription?.is_active && false"
            class="filter-button"
            :class="{ active: showSubscriptionGames }"
            @click="setFilter('subscription')"
          >
            {{ $t('subscription_games') }}
          </button>
        </div>
      </div>
      <div v-if="ownedGames.length > 0" class="list">
        <DesktopLibraryItem v-for="item in ownedGames" :key="item.game_id" :item="item" />
      </div>     
      <div v-else class="empty-library">
        <p>{{ showSubscriptionGames ? $t('no_subscription_games') : $t('no_owned_games') }}</p>
        <button class="browse-button" @click="router.push('/games')">{{ $t('browse_games') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  text-align: left;
  width: 100%;
}

.title-container {
  display: flex;
  flex-direction: row;
  justify-content: center; 
  align-items: center;
  margin-bottom: 20px; 
}

.title-container.filter-controls {
  justify-content: space-around; 
  width: 100%; 
  padding: 0 40px; 
  box-sizing: border-box; 
}


.title-container h1 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
}

.game-count {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  padding: 5px 15px;
  border-radius: 5px;
  background-color: var(--boly-button-pink);
  color: white;
  white-space: nowrap; 
}

.filter-buttons {
  display: flex;
  gap: 10px; 
}


.list {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 55px;
  flex-wrap: wrap;
  padding: 40px;
}

.loading_container {
  height: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-library {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 4rem;
  text-align: center;
}

.empty-library p {
  font-size: 1.2rem;
  color: var(--color-text);
  opacity: 0.8;
}

.browse-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 5px;
  background-color: var(--boly-button-pink);
  color: white;
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  font-size: 1.1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.browse-button:hover {
  opacity: 0.9;
}

.filter-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 5px;
  background-color: var(--boly-button-pink);
  color: white;
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s; 
  margin-left: 0;
}

.filter-button:hover {
  opacity: 0.9;
}

.filter-button.active {
  background-color: #48ace4; 
  opacity: 1; 
}
</style>
