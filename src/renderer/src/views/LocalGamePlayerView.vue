<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useGameRoutes from '@/desktop-stores/gameRoutes'
import { usePlayTimeTracking } from '@/composables/usePlayTimeTracking'

// Plays a build that was downloaded and extracted locally and turned out to be
// a web bundle (Unity WebGL, Godot HTML5, a Vite/Three.js export) rather than
// an executable.
//
// The build runs in an <iframe> on the boly-game:// scheme, not in this
// renderer's own context: it is third-party code, and an iframe on a different
// origin gets no Node integration and no access to the app's stores or token.
// Nothing about the game needs to know it is running inside Boly.

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const gameRoutes = useGameRoutes()
const { startPlayTimeTracking, cleanupTracking, initializeTracking } = usePlayTimeTracking()

const gameUrl = ref<string | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)

const gameId = Number(route.params.game)

onMounted(async () => {
  initializeTracking()

  if (!Number.isInteger(gameId) || gameId <= 0) {
    error.value = t('local_player_invalid_game')
    isLoading.value = false
    return
  }

  const installed = gameRoutes.getRouteItems.find((entry) => entry.gameId === gameId)
  if (!installed || installed.kind !== 'html') {
    // Either never installed, or installed as an executable — which is not
    // this view's job.
    error.value = t('local_player_not_installed')
    isLoading.value = false
    return
  }

  try {
    const result = await window.electronAPI.prepareLocalGame({
      game_id: gameId,
      // Older entries predate the root being recorded; the entry point's own
      // folder is the best available fallback for those.
      root: installed.root ?? installed.route.replace(/[\\/][^\\/]*$/, ''),
      entryPath: installed.route
    })

    if (!result.ok) {
      error.value = result.error
      isLoading.value = false
      return
    }

    gameUrl.value = result.url
    isLoading.value = false
    startPlayTimeTracking(gameId)
  } catch (e) {
    console.error('Failed to prepare local game:', e)
    error.value = t('local_player_load_error')
    isLoading.value = false
  }
})

onUnmounted(async () => {
  // Records the session before the view goes away; the iframe is torn down with
  // it, so the game stops at the same moment.
  await cleanupTracking()
})

function goBack(): void {
  router.back()
}
</script>

<template>
  <div class="local-player">
    <div class="player-bar">
      <button type="button" class="back-link" @click="goBack">← {{ t('back') }}</button>
    </div>

    <div v-if="isLoading" class="player-state">
      {{ t('local_player_loading') }}
    </div>

    <div v-else-if="error" class="player-state player-error">
      <p>{{ error }}</p>
      <button type="button" class="back-link" @click="goBack">{{ t('back') }}</button>
    </div>

    <!-- allow-same-origin is required: engines use IndexedDB and WebAssembly,
         both of which need a real origin. It is safe here because the frame is
         on boly-game://<id>, an origin of its own that shares nothing with the
         app's renderer — it does not inherit this window's. What the sandbox
         still withholds is what a game has no business doing: navigating the
         app away from itself, and opening popups.
         Fullscreen is granted through allowfullscreen/allow, not the sandbox,
         which has no token for it. -->
    <iframe
      v-else-if="gameUrl"
      :src="gameUrl"
      class="game-frame"
      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-modals allow-forms"
      allow="autoplay; fullscreen; gamepad; xr-spatial-tracking"
      allowfullscreen
    ></iframe>
  </div>
</template>

<style scoped>
.local-player {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
}

.player-bar {
  flex: none;
  padding: 12px 20px;
}

.back-link {
  background: none;
  border: none;
  color: var(--color-text, #fff);
  cursor: pointer;
  font: inherit;
  opacity: 0.8;
}

.back-link:hover {
  opacity: 1;
}

.game-frame {
  flex: 1;
  min-height: 0;
  width: 100%;
  border: none;
  display: block;
  background: #000;
}

.player-state {
  flex: 1;
  display: grid;
  place-content: center;
  gap: 16px;
  text-align: center;
  opacity: 0.85;
}

.player-error {
  color: var(--color-danger, #ff6b6b);
}
</style>
