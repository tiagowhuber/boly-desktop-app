<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref, computed } from 'vue'
import UnityWebgl from 'unity-webgl'
import UnityVue from 'unity-webgl/vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth, useGames } from '@/stores'
import { usePlayTimeTracking } from '@/composables/usePlayTimeTracking'

// Browser-playable builds run inside this window rather than as a spawned
// process, so everything here mirrors the web storefront's GamePlayer: the API
// hands back four presigned Unity WebGL URLs and the engine is booted with
// them. Access is decided server-side by /v1/games/url.

const gamesStore = useGames()
const route = useRoute()
const router = useRouter()
const auth = useAuth()

const isLoading = ref(true)
const loadingProgress = ref(0)
const loadingStatus = ref('Initializing...')
const errorMessage = ref<string | null>(null)

const { startPlayTimeTracking, cleanupTracking, initializeTracking } = usePlayTimeTracking()

// ?build=<id> plays a specific build instead of the game's live one, so an
// admin (or the game's developer) can review it before approving. The API
// restricts this to those roles.
const previewBuildId = computed(() => {
  const raw = route.query.build
  const value = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isInteger(value) && value > 0 ? value : undefined
})

// Unity keeps its asset cache in IndexedDB. A half-written cache from an
// interrupted download makes the engine fail to boot with an opaque error, so
// we detect that and clear it rather than leaving the user stuck.
const clearUnityCache = async () => {
  try {
    const databases = await indexedDB.databases()
    const unityDatabases = databases.filter(
      (db) => db.name && db.name.toLowerCase().includes('unity')
    )
    for (const db of unityDatabases) {
      if (!db.name) continue
      const deleteReq = indexedDB.deleteDatabase(db.name)
      await new Promise((resolve) => {
        deleteReq.onsuccess = () => resolve(true)
        deleteReq.onerror = () => resolve(false)
        deleteReq.onblocked = () => resolve(false)
      })
    }
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
    }
  } catch (error) {
    console.warn('Error clearing Unity cache:', error)
  }
}

const checkIndexedDBHealth = async (): Promise<boolean> => {
  try {
    const testDB = indexedDB.open('test-db-health', 1)
    return await new Promise((resolve) => {
      testDB.onsuccess = () => {
        testDB.result.close()
        indexedDB.deleteDatabase('test-db-health')
        resolve(true)
      }
      testDB.onerror = () => resolve(false)
      testDB.onblocked = () => resolve(false)
      setTimeout(() => resolve(false), 2000)
    })
  } catch {
    return false
  }
}

const onFullscreen = (): void => {
  gamesStore.unityPlayer?.setFullscreen(true)
}

const cleanupUnityPlayer = async () => {
  if (gamesStore.unityPlayer) {
    try {
      const player = gamesStore.unityPlayer as any
      if (typeof player.destroy === 'function') await player.destroy()
      else if (typeof player.quit === 'function') await player.quit()
      else if (typeof player.clear === 'function') player.clear()
    } catch (error) {
      console.warn('Error destroying Unity player:', error)
    }
  }
  gamesStore.setUnityPlayer(null)
  gamesStore.setLoadingUnity(true)
  await cleanupTracking()
}

const loadGame = async (gameId: number, retryCount = 0): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null
  loadingProgress.value = 0
  loadingStatus.value = 'Initializing...'

  try {
    loadingStatus.value = 'Cleaning up previous game...'
    loadingProgress.value = 10
    await cleanupUnityPlayer()

    loadingStatus.value = 'Checking cache health...'
    loadingProgress.value = 20
    const isDBHealthy = await checkIndexedDBHealth()
    if (!isDBHealthy && retryCount === 0) {
      loadingStatus.value = 'Clearing cache...'
      await clearUnityCache()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return loadGame(gameId, 1)
    }

    // Legacy games embedded in the app itself stored a Vue ROUTE (e.g.
    // "/sudoku-game") in file_name.desktop instead of a storage key. Only a
    // leading slash identifies one — S3 keys never start with "/".
    loadingStatus.value = 'Loading game data...'
    loadingProgress.value = 30
    const gameData = await gamesStore.getById(gameId)
    const legacyRoute = gameData?.file_name?.desktop
    if (typeof legacyRoute === 'string' && legacyRoute.startsWith('/')) {
      router.push(legacyRoute)
      isLoading.value = false
      return
    }

    loadingStatus.value = 'Fetching game files...'
    loadingProgress.value = 40
    const urls = await gamesStore.getGameUrl(
      gameId,
      true,
      { token: auth.token },
      previewBuildId.value
    )

    if (!urls || !urls.loader || !urls.data || !urls.framework || !urls.wasm) {
      console.error('Failed to fetch game URLs or URLs are invalid:', urls)
      errorMessage.value = 'This game could not be loaded.'
      isLoading.value = false
      return
    }

    loadingStatus.value = 'Initializing Unity WebGL...'
    loadingProgress.value = 60
    try {
      const unityInstance = new UnityWebgl({
        loaderUrl: urls.loader,
        dataUrl: urls.data,
        frameworkUrl: urls.framework,
        codeUrl: urls.wasm
      })

      unityInstance.on('progress', (progress: number) => {
        const unityProgress = Math.round(progress * 100)
        loadingProgress.value = 60 + unityProgress * 0.35
        loadingStatus.value = `Loading game assets... ${unityProgress}%`
      })

      unityInstance.on('loaded', () => {
        loadingProgress.value = 100
        loadingStatus.value = 'Game loaded successfully!'
        setTimeout(() => {
          isLoading.value = false
        }, 500)
      })

      unityInstance.on('error', (error: any) => {
        console.error('Unity loading error:', error)
        loadingStatus.value = 'Error loading game'
        errorMessage.value = 'The game engine failed to start.'
      })

      gamesStore.setUnityPlayer(unityInstance)
      startPlayTimeTracking(gameId)
    } catch (unityError: any) {
      const message = String(unityError?.message ?? '')
      const isCacheError =
        message.includes('IndexedDB') ||
        message.includes('Could not connect to database') ||
        message.includes('UnityCache')

      if (isCacheError && retryCount === 0) {
        await clearUnityCache()
        await new Promise((resolve) => setTimeout(resolve, 1500))
        return loadGame(gameId, 1)
      }
      throw unityError
    }
  } catch (error: any) {
    console.error('Error loading web game:', error)
    errorMessage.value =
      error?.response?.data?.message || 'This game could not be loaded.'
    isLoading.value = false
  }
}

watch(
  () => route.params.game,
  async (newGameId, oldGameId) => {
    if (!newGameId || newGameId === oldGameId) return
    if (!auth.isLoggedIn || !auth.token) return
    const gameId = parseInt(newGameId as string)
    if (!isNaN(gameId)) await loadGame(gameId)
  }
)

onMounted(async () => {
  isLoading.value = true
  initializeTracking()

  if (!auth.isLoggedIn || !auth.token) {
    router.push('/login')
    isLoading.value = false
    return
  }

  const idParam = route.params.game
  const gameId = parseInt(idParam as string)
  if (!idParam || isNaN(gameId)) {
    router.back()
    isLoading.value = false
    return
  }

  await loadGame(gameId)
})

onUnmounted(async () => {
  await cleanupUnityPlayer()
})
</script>

<template>
  <div class="player-shell">
    <div v-if="errorMessage" class="player-frame player-message">
      <p class="message-text">{{ errorMessage }}</p>
      <button class="play-button" @click="router.back()">{{ $t('back') }}</button>
    </div>

    <div v-else-if="gamesStore.loadingUnity || isLoading" class="player-frame player-message">
      <div class="message-text">Loading game {{ route.params.game }}...</div>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <div class="progress-text">{{ Math.round(loadingProgress) }}% - {{ loadingStatus }}</div>
      </div>
    </div>

    <div v-else class="player-frame">
      <UnityVue
        :key="`unity-${route.params.game}`"
        :unity="gamesStore.unityPlayer as any"
        tabindex="0"
      />
      <div class="buttons">
        <button class="play-button" @click="onFullscreen">Fullscreen</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-shell {
  display: flex;
  justify-content: center;
  padding: 1rem 0 2rem;
}

.player-frame {
  width: 960px;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.player-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  color: #fff;
}

.message-text {
  font-size: 1.2rem;
  text-align: center;
  padding: 0 1.5rem;
}

.progress-container {
  width: min(400px, 80%);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #fff;
  font-size: 0.85rem;
  text-align: center;
  opacity: 0.9;
}

.buttons {
  position: absolute;
  bottom: 12px;
  right: 12px;
}

.play-button {
  cursor: pointer;
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 10px;
  background-color: var(--lightGreen, #7dcb84);
  font-family: inherit;
  font-size: 0.9rem;
}

.play-button:hover {
  background-color: var(--lightCyan, #48ace4);
}
</style>
