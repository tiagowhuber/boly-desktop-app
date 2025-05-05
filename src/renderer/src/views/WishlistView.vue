<script setup lang="ts">
import GameItem from '@/components/games/GameItem.vue'
import Loading from '@/components/LoadingIcon.vue'
import { useGames, useAuth, useUser } from '@/stores'
import useWishlist from '@/stores/wishlist'
import { onMounted, ref, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const i18n = useI18n()
const router = useRouter()
const auth = useAuth()
const user = useUser()
const gamesStore = useGames()
const wishlistStore = useWishlist()

//@ts-ignore
const { loading: gamesLoading, games } = storeToRefs(gamesStore)
//@ts-ignore
const { loading: wishlistLoading, items: wishlistItems } = storeToRefs(wishlistStore)

const loading = ref(true)
const wishlistGames = ref<any[]>([])
const isMobile = ref(window.innerWidth <= 768)

// Handle window resize for mobile detection
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

if (!auth.isLoggedIn && !auth.verifying) {
  router.back()
}

async function filterWishlistGames() {

  if (!games.value.length || !wishlistItems.value.length) {
    wishlistGames.value = []
    return
  }

  const gamesInWishlist = games.value.filter(game => 
    wishlistItems.value.some(item => item.game_game_id === game.game_id)
  )
  const filteredGames: typeof games.value = []
  for (const game of gamesInWishlist) {
    const ownership = user.userId !== undefined ? await gamesStore.ownsGame(game.game_id, user.userId) : { owned: false, subscriptionAccess: false }
    if (!ownership.owned) {
      filteredGames.push(game)
    }
  }
  
  console.log('Final wishlist games (after ownership check):', filteredGames.length, filteredGames); 
  wishlistGames.value = filteredGames
}

async function refreshData() {
  loading.value = true
  try {
    if (games.value.length === 0) {
      await gamesStore.getAll()
    }
    
    if (auth.isLoggedIn && user.userId) {
      await wishlistStore.fetchWishlist()
    }

    await filterWishlistGames()
  } catch (error) {
    console.error('Error refreshing wishlist data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await refreshData()
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch([wishlistItems, games], async () => {
  await filterWishlistGames()
})
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  <div class="section" v-else>
    <div class="wishlist-header">
      <h1 v-if="i18n.locale.value === 'es'">{{ $t('wishlist') }} {{ $t('of') }} {{ user.username }}</h1>
      <h1 v-else>{{ user.username }}'s {{ $t('wishlist') }}</h1>
    </div>
    <div class="game-count">{{ $t('all_games') }} ({{ wishlistGames.length }})</div>
    
    <div v-if="wishlistGames.length > 0" class="list" :class="{ 'mobile-list': isMobile }">
      <GameItem v-for="item in wishlistGames" 
                :key="item.game_id" 
                :item="item" 
                :class="{ 'mobile-item': isMobile }" />
    </div>
    <div v-else class="empty-wishlist">
      <p>{{ $t('no_wishlist_games') }}</p>
      <button class="browse-button" @click="router.push('/games')">{{ $t('browse_games') }}</button>
    </div>
    
    <div class="bottom-browse-section">
      <button class="browse-button" @click="router.push('/games')">{{ $t('browse_games') }}</button>
    </div>
  </div>
</template>

<style scoped>
.loading_container {
  height: 400px;
  width: 1200px;
  margin: auto;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.section {
  max-width: 1200px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wishlist-header {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.wishlist-header h1 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  margin: 0;
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
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 20px;
  border-radius: 20px;
}

.mobile-list {
  gap: 1rem;
  padding: 10px;
}

/* Style that will be applied to the GameItem component when on mobile */
:deep(.mobile-item) {
  transform: scale(0.85);
  margin: -10px;
}

@media (max-width: 768px) {
  .game-count {
    width: 80%;
    padding: 2px 10px;
  }
  
  .wishlist-header h1 {
    font-size: 1.5rem;
    text-align: center;
  }
}

.empty-wishlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 4rem;
  text-align: center;
  margin-top: 2rem;
}

.empty-wishlist p {
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

.bottom-browse-section {
  margin: 3rem auto 2rem;
  display: flex;
  justify-content: center;
}
</style>