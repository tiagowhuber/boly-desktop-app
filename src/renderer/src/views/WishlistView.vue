<script setup lang="ts">
import GameItem from '@renderer/components/games/GameItem.vue'
import Loading from '@renderer/components/LoadingIcon.vue'
import { useGames, useAuth, useUser } from '@renderer/stores'
import useWishlist from '@renderer/stores/wishlist'
import { onMounted, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const i18n = useI18n()
const router = useRouter()
const auth = useAuth()
const user = useUser()
const gamesStore = useGames()
const wishlistStore = useWishlist()

const { loading: gamesLoading, games } = storeToRefs(gamesStore)
const { loading: wishlistLoading, items: wishlistItems } = storeToRefs(wishlistStore)

const loading = ref(true)
const wishlistGames = ref<any[]>([])

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

  const filteredGames = []
  for (const game of gamesInWishlist) {
    const isOwned = user.userId !== undefined ? await gamesStore.ownsGame(game.game_id, user.userId) : false
    if (!isOwned) {
      filteredGames.push(game)
    }
  }
  
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
  await refreshData()
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
    
    <div v-if="wishlistGames.length > 0" class="list">
      <GameItem v-for="item in wishlistGames" :key="item.game_id" :item="item" />
    </div>
    <div v-else class="empty-wishlist">
      <p>{{ $t('no_wishlist_games') }}</p>
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
  background-color: var(--boly-button-blue);
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
  background-color: var(--boly-button-blue);
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
</style>