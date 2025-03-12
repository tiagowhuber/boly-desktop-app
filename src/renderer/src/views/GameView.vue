<script setup lang="ts">
import { ref, onMounted, inject, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameList from '@renderer/components/games/GameList.vue'
import GameDetails from '@renderer/components/games/GameDetails.vue'
import Loading from '../components/LoadingIcon.vue'
import { useAuth } from '../stores'
import { useI18n } from 'vue-i18n'
import { useGames } from '../stores/'
import axios from 'axios'
import type { Game } from '@renderer/types'

const i18n = useI18n()
const auth = useAuth()

const route = useRoute()

const game = ref<Game | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const gamesStore = useGames()
const router = useRouter()

watch(
  () => route.params.id,
  async (newId) => {
    console.log('GameView: Route param changed to:', newId);
    if (!newId) {
      error.value = 'No game ID provided'
      router.push('/games')
      return
    }
    await UpdateData(String(newId))
  },
  { immediate: true }
)

async function UpdateData(gameId: string): Promise<void> {
  loading.value = true
  error.value = null
  try {
    if (!gameId) {
      throw new Error('Game ID is required')
    }
    const response = await axios.get(`/v1/games/${gameId}`)
    const gameData = response.data
    if (!gameData) {
      throw new Error('Game not found')
    }
    game.value = {
      game_id: gameData.game_id,
      name: gameData.name,
      description: gameData.description,
      price: gameData.price,
      banner_url: gameData.banner_url,
      release_date: gameData.release_date,
      developer_id: gameData.developer_id,
      game_type_id: gameData.game_type_id,
      game_type: gameData.game_type
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    router.push('/games')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  <div v-else-if="error" class="error-container">
    {{ error }}
  </div>
  <div v-else>
    <GameDetails :item="game" />
  </div>
  <GameList />
</template>

<style scoped>
.loading_container{
  height: 800px;
}
.error-container {
  text-align: center;
  padding: 2rem;
  color: red;
}
</style>