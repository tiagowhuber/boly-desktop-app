<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useGames, useAuth } from '@renderer/stores'
import type { Game } from '@renderer/types'
import PlayIcon from '@renderer/components/icons/PlayIcon.vue'
import DownloadIcon from '@renderer/components/icons/DownloadIcon.vue'

const props = defineProps<{
  item: Game
}>()

const i18n = useI18n()
const router = useRouter()
const games = useGames()
const auth = useAuth()
const loading = ref(false)

// Log the item object to inspect its properties
console.log('LibraryItem received game:', props.item)

const gameDataBaseUrl = import.meta.env.VITE_S3_BASE_URL + '/' + props.item.game_id + '/'

// Log the constructed URL for debugging
console.log('Constructed image URL:', gameDataBaseUrl + props.item.banner_url)

async function Play() {
  if (props.item.game_id) {
    router.push(`/games/${props.item.game_id}/play`)
  }
}

async function Download() {
  if (loading.value) return
  loading.value = true
  try {
    if (props.item.game_id && auth.token) {
      await games.downloadGame(props.item.game_id, { token: auth.token })
    }
  } catch (error) {
    console.error('Error downloading game:', error)
  } finally {
    loading.value = false
  }
}

function navigateToGameDetails() {
  if (props.item.game_id) {
    router.push(`/games/${props.item.game_id}`)
  }
}
//gameDataBaseUrl + props.item.banner_url" :alt="props.item.name[i18n.locale.value]
</script>

<template>
  <div class="library-item" @click="navigateToGameDetails">
    <img :src="props.item.banner_url" class="game-banner" />
    <div class="game-info">
      <h3>{{ props.item.name[i18n.locale.value] }}</h3>
      <div class="game-actions">
        <button v-if="props.item.game_type_id === 2" class="play-button" @click.stop="Play">
          {{ $t('play') }} <PlayIcon class="icon" />
        </button>
        <button v-else class="download-button" :disabled="loading" @click.stop="Download">
          {{ loading ? $t('downloading') : $t('download') }} <DownloadIcon class="icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.library-item {
  width: 290px;
  border-radius: 20px;
  overflow: hidden;
  background: var(--color-background-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.library-item:hover {
  transform: translateY(-4px);
}

.game-banner {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.game-info {
  padding: 1rem;
}

.game-info h3 {
  margin: 0 0 1rem;
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
}

.game-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.play-button, .download-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  cursor: pointer;
  transition: background-color 0.2s;
}

.play-button {
  background-color: var(--boly-button-blue);
  color: white;
}

.download-button {
  background-color: var(--color-background-mute);
  color: var(--color-text);
}

.play-button:hover, .download-button:hover {
  opacity: 0.9;
}

.icon {
  width: 1.2em;
  height: 1.2em;
}

.download-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
