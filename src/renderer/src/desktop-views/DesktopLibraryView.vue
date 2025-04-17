<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import DesktopLibraryItem from '@/desktop-components/DesktopLibraryItem.vue'
import Loading from '@/components/LoadingIcon.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser, useGames, useAchievements } from '../stores'
import useGameRoutes from '../desktop-stores/gameRoutes'
import axios from 'axios'
import type { Game} from '@/types'

const auth = useAuth()
const user = useUser()
const games = useGames()
const achievementsStore = useAchievements()
const router = useRouter()
const isLoading = ref(true)
const ownedGames = ref<Game[]>([])
const allOwnedGames = ref<Game[]>([])
const gameRoutesStore = useGameRoutes()
const isSearchingGames = ref(false)
const showInstalledOnly = ref(true)

// const gameRoutes = useGameRoutes()
const gameRoutes=[
{
      "gameId": 2,
      "route": "\"D:Juegos\\test\\Body Defense.exe\""
    }
]
// Redirect if not logged in
if (!auth.isLoggedIn) {
  router.back()
}

async function loadGames() {
  isSearchingGames.value = true;
  try {
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
    const response = await axios.get(`/v1/games/user/${user.userId}`)
    if (response.status === 200 && response.data) {
      const gamesList = response.data[0]?.game || []
      console.log('Extracted games list:', gamesList)
      
      await loadGames();
      const localGames = gameRoutesStore.getRouteItems;
      console.log('Local games:', localGames);
      
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
        
        return game;
      });
      
      updateDisplayedGames();
    }
  } catch (error) {
    console.error('Error fetching owned games:', error)
  }
}

// update displayed games based on filter settings
function updateDisplayedGames() {
  if (showInstalledOnly.value) {
    ownedGames.value = allOwnedGames.value.filter(game => game.isInstalled);
  } else {
    ownedGames.value = [...allOwnedGames.value];
  }
}

function toggleGamesView() {
  showInstalledOnly.value = !showInstalledOnly.value;
  updateDisplayedGames();
}

onMounted(async () => {
  if (auth.isLoggedIn && user.userId) {
    try {
      await loadGames()
      
      const response = await axios.get(`/v1/users/${user.userId}`)
      if (response.status === 200) {
        user.setUser(response.data)
        await fetchOwnedGames()
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      isLoading.value = false
    }
  } else {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="loading_container" v-if="isLoading">
    <Loading />
  </div>  <div class="section" v-else>
    <div class="main-container">
      <div>
        <div class="title-container">
          <h1>{{ $t('user_games', { user: user.username }) }}</h1>
        </div>
      </div>
      <div class="title-container">
        <div class="game-count">{{ $t('all_games') }} ({{ ownedGames.length }})</div>
        <button class="filter-button" @click="toggleGamesView">
          {{ showInstalledOnly ? $t('show_all_games') : $t('show_installed_only') }}
        </button>
      </div>
      <div v-if="ownedGames.length > 0" class="list">
        <DesktopLibraryItem v-for="item in ownedGames" :key="item.game_id" :item="item" />
      </div>
      <div v-else class="empty-library">
        <p>{{ $t('no_owned_games') }}</p>
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
}

.title-container h1 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
}

.game-count {
  text-align: center;
  width: 300px;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  padding: 2px 40px;
  border-radius: 5px;
  background-color: var(--boly-button-pink);
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
  transition: opacity 0.2s;
  margin-left: 1rem;
}

.filter-button:hover {
  opacity: 0.9;
}
</style>
