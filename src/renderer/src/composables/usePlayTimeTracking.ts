import { ref } from 'vue'
import { useAuth, useGames } from '@/stores'

/**
 * Playtime accounting for games that run inside this renderer (browser-playable
 * builds). Native games are tracked by the main process instead — see
 * src/main/services/GameService.ts — so the two never double count: a game is
 * either launched as a process or embedded here, never both.
 *
 * Mirrors the web storefront's composable of the same name so a game reports
 * the same numbers whichever client it was played in.
 */
export function usePlayTimeTracking() {
  const auth = useAuth()
  const gamesStore = useGames()

  const gameStartTime = ref<number>(0)
  const totalPlayTime = ref<number>(0)
  const currentGameId = ref<number | null>(null)
  const playTimeInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const isGameActive = ref<boolean>(false)

  const startPlayTimeTracking = (gameId: number) => {
    currentGameId.value = gameId
    gameStartTime.value = Date.now()
    isGameActive.value = true

    playTimeInterval.value = setInterval(() => {
      if (isGameActive.value && currentGameId.value) {
        updatePlayTime()
      }
    }, 30000) // 30 seconds
  }

  const updatePlayTime = async (isFinal: boolean = false) => {
    if (!currentGameId.value || !auth.token) return

    const currentTime = Date.now()
    const sessionTime = Math.floor((currentTime - gameStartTime.value) / 1000 / 60) // minutes

    if (sessionTime < 1 && !isFinal) return

    try {
      const currentTotal = await gamesStore.getPlayTime(currentGameId.value, { token: auth.token })
      const newTotal = currentTotal + sessionTime
      await gamesStore.updatePlayTime(currentGameId.value, newTotal, { token: auth.token })

      // Reset the window so the next tick only counts time since this update
      gameStartTime.value = currentTime
      totalPlayTime.value = newTotal
    } catch (error) {
      console.error('Failed to update playtime:', error)
    }
  }

  const stopPlayTimeTracking = async () => {
    if (playTimeInterval.value) {
      clearInterval(playTimeInterval.value)
      playTimeInterval.value = null
    }
    if (isGameActive.value && currentGameId.value) {
      await updatePlayTime(true)
      isGameActive.value = false
    }
  }

  // The app window can be hidden without the game being closed; don't bill
  // time the user wasn't there for.
  const handleVisibilityChange = () => {
    if (!isGameActive.value) return
    if (document.hidden) {
      updatePlayTime()
    } else {
      gameStartTime.value = Date.now()
    }
  }

  const handleBeforeUnload = async () => {
    if (isGameActive.value && currentGameId.value) {
      const sessionTime = Math.floor((Date.now() - gameStartTime.value) / 1000 / 60)
      if (sessionTime >= 1) {
        try {
          await updatePlayTime(true)
        } catch (error) {
          console.error('Failed to update playtime on unload:', error)
        }
      }
    }
  }

  const initializeTracking = () => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
  }

  const cleanupTracking = async () => {
    await stopPlayTimeTracking()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }

  return {
    currentGameId,
    totalPlayTime,
    isGameActive,
    startPlayTimeTracking,
    stopPlayTimeTracking,
    updatePlayTime,
    initializeTracking,
    cleanupTracking
  }
}

export default usePlayTimeTracking
