<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth, useAchievements, useGames, useUser} from '@/stores'
import type { Achievement, Game} from '@/types'

const route = useRoute()
const { locale } = useI18n()
const achievementsStore = useAchievements()
const authStore = useAuth()
const user = useUser()
const gamesStore = useGames()

const error = ref<string | null>(null)
const game = ref<Game | null>(null)

const gameId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

const loading = computed(() => achievementsStore.loading || gamesStore.loading)
const achievements = computed<Achievement[]>(() => achievementsStore.achievements)

const gameTitle = computed(() => {
  if (game.value?.name) {
    const name = game.value.name as { [key: string]: string }
    return name[locale.value] || name.en || ''
  }
  
  if (achievementsStore.inspectedGame.name) {
    const name = achievementsStore.inspectedGame.name as { [key: string]: string }
    return name[locale.value] || name.en || ''
  }
  
  return ''
})

function getAchievementName(achievement: Achievement): string {
  if (!achievement.name) return '';
  return (locale.value in achievement.name ? achievement.name[locale.value as keyof typeof achievement.name] : achievement.name.en) || '';
}

function getAchievementDescription(achievement: Achievement): string {
  if (!achievement.description) return '';
  return (locale.value in achievement.description ? achievement.description[locale.value as keyof typeof achievement.description] : achievement.description.en) || '';
}

async function fetchGameData() {
  if (!gameId.value) return
  
  try {
    const fetchedGame = await gamesStore.getById(gameId.value)
    if (fetchedGame) {
      game.value = fetchedGame
    }
  } catch (err) {
    console.error('Failed to fetch game data:', err)
  }
}

async function fetchAchievementsData() {
  error.value = null;
  if (!gameId.value) {
    error.value = 'Invalid game ID';
    return;
  }
  
  if (!authStore.token) {
    error.value = 'Authentication required';
    return;
  }
  
  try {
    await achievementsStore.fetchAchievements(gameId.value, { token: authStore.token });
    if (user.userId) {
      await achievementsStore.fetchUserProgress(user.userId, { token: authStore.token });
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch achievements';
  }
}

function retryFetch() {
  fetchGameData()
  fetchAchievementsData()
}

onMounted(() => {
  fetchGameData()
  fetchAchievementsData()
})

watch(() => gameId.value, () => {
  fetchGameData()
  fetchAchievementsData()
})
</script>

<template>
  <div class="achievements-container">
    <h1 class="title-bold">{{ gameTitle.toUpperCase() }} {{ $t('achievements').toUpperCase() }}</h1>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      {{ $t('loading_achievements') }}
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retryFetch" class="retry-button">{{ $t('retry') }}</button>
    </div>
    
    <div v-else-if="achievements.length === 0" class="no-achievements">
      {{ $t('no_achievements_found') }}
    </div>
    
    <div v-else class="achievements-list">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        class="achievement-item"
      >
        <div class="achievement-icon">
          <img 
            :src="achievement.icon_url || '/images/default-achievement.png'" 
            :alt="getAchievementName(achievement)"
          />
        </div>
        <div class="achievement-content">
          <h3 class="achievement-title">
            {{ getAchievementName(achievement) }}
            <span v-if="achievement.secret" class="secret-badge">{{ $t('secret') }}</span>
          </h3>
          <p class="achievement-description">
            {{ getAchievementDescription(achievement) }}
          </p>
          <div v-if="typeof achievement.progress === 'number'" class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{width: `${((achievement.current_progress || 0) / achievement.progress) * 100}%`}"
              ></div>
            </div>
            <span class="progress-text">{{ achievement.current_progress || 0 }}/{{ achievement.progress }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achievements-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  color: #e74c3c;
  padding: 2rem;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: bold;
}

.retry-button:hover {
  background-color: #2980b9;
}

.no-achievements {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 80%;
  margin: 0 auto; /* This centers the list */
}

.achievement-item {
  display: flex;
  border: 1px solid #221742;
  border-radius: 8px;
  padding: 1rem;
  background-color: #221742;
  width: 100%;
}

.achievement-icon {
  position: relative;
  width: 64px;
  height: 64px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.achievement-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.achievement-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.achievement-title {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  color: white;
}

.achievement-description {
  margin: 0;
  color: #ffffffc4;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

.progress-container {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
  width: 40px;
  text-align: right;
}

.secret-badge {
  font-size: 0.7rem;
  background-color: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.title-bold {
  width: 100%;
  text-align: left;
  font-size: 300%;
  padding-left: 2rem;
  margin-bottom: 2rem;
  position: relative;
  left: 0;
}
</style>
