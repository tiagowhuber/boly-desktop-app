<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth, useUser, useGames } from '@/stores'
import type { Game } from '@/types'
import ClockhistoryIcon from '@/components/icons/ClockhistoryIcon.vue'
import LoadingIcon from '@/components/LoadingIcon.vue'
import axios from 'axios'

const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuth()
const user = useUser()
const gamesStore = useGames()

const isLoading = ref(true)
const userGames = ref<Game[]>([])
const subscriptionGames = ref<Game[]>([])
const playTimes = ref<{ [gameId: number]: number }>({})
const playTimeLoading = ref<{ [gameId: number]: boolean }>({})
const activeSection = ref<'owned' | 'subscription'>('owned')

// Redirect if not logged in
if (!auth.isLoggedIn) {
  router.push('/login')
}

const gameTitle = (game: Game) => {
  if (game.name && typeof game.name === 'object') {
    const name = game.name as { [key: string]: string }
    return name[locale.value] || name.en || 'Unknown Game'
  }
  return 'Unknown Game'
}

const formatPlayTime = (minutes: number): string => {
  if (minutes === 0) return '0h 0m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

async function fetchUserGames() {
  if (!user.userId) return
  
  try {
    const response = await axios.get(`/v1/games/user/${user.userId}`)
    if (response.status === 200 && response.data) {
      const gamesList = response.data[0]?.game || []
      console.log('Extracted games list for stats:', gamesList)
      
      userGames.value = gamesList.map((game: Game) => {
        if (!game.banner_url) {
          game.banner_url = 'banner.jpg'
        }
        return game
      })

      // Fetch play time for each game
      for (const game of userGames.value) {
        await fetchPlayTimeForGame(game.game_id)
      }
    }
  } catch (error) {
    console.error('Error fetching user games:', error)
  }
}

async function fetchSubscriptionGames() {
  if (!user.userId) return

  try {
    const response = await gamesStore.getSubscriptionGames(user.userId)
    subscriptionGames.value = response.map((game: Game) => {
      if (!game.banner_url) {
        game.banner_url = 'banner.jpg'
      }
      return game
    })

    // Fetch play time for each subscription game
    for (const game of subscriptionGames.value) {
      await fetchPlayTimeForGame(game.game_id)
    }
  } catch (error) {
    console.error('Error fetching subscription games:', error)
  }
}

async function fetchPlayTimeForGame(gameId: number) {
  if (!auth.token) return
  
  playTimeLoading.value[gameId] = true
  try {
    const time = await gamesStore.getPlayTime(gameId, { token: auth.token })
    playTimes.value[gameId] = time || 0
    console.log(`Fetched play time for game ${gameId}:`, time)
  } catch (error) {
    console.error(`Error fetching play time for game ${gameId}:`, error)
    playTimes.value[gameId] = 0
  } finally {
    playTimeLoading.value[gameId] = false
  }
}

function viewAchievements(gameId: number) {
  router.push(`/games/${gameId}/achievements`)
}

function viewGameDetails(gameId: number) {
  router.push(`/games/${gameId}`)
}

const totalPlayTime = computed(() => {
  const currentGames = activeSection.value === 'owned' ? userGames.value : subscriptionGames.value
  return currentGames.reduce((total, game) => {
    return total + (playTimes.value[game.game_id] || 0)
  }, 0)
})

const sortedGames = computed(() => {
  const currentGames = activeSection.value === 'owned' ? userGames.value : subscriptionGames.value
  return [...currentGames].sort((a, b) => {
    const timeA = playTimes.value[a.game_id] || 0
    const timeB = playTimes.value[b.game_id] || 0
    return timeB - timeA // Sort by play time descending
  })
})

const currentGamesCount = computed(() => {
  return activeSection.value === 'owned' ? userGames.value.length : subscriptionGames.value.length
})

onMounted(async () => {
  if (auth.isLoggedIn && user.userId) {
    try {
      // First fetch user data
      const response = await axios.get(`/v1/users/${user.userId}`)
      if (response.status === 200) {
        user.setUser(response.data)
        // Check for subscription and fetch appropriate games
        await user.checkSubscription()
        
        // Fetch owned games and their play times
        await fetchUserGames()
        
        // If user has subscription, fetch subscription games
        if (user.isSubscribed) {
          await fetchSubscriptionGames()
        }
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
  <div class="stats-container">
    <div v-if="isLoading" class="loading-container">
      <LoadingIcon />
    </div>
    
    <div v-else class="main-content">
      <div class="header-section">
        <h1 class="title-bold">{{ $t('game_stats').toUpperCase() }}</h1>
        
        <!-- Section Buttons -->
        <div v-if="user.isSubscribed" class="section-buttons">
          <button 
            class="section-button" 
            :class="{ active: activeSection === 'owned' }"
            @click="activeSection = 'owned'"
          >
            {{ $t('my_games') }} ({{ userGames.length }})
          </button>
          <button 
            class="section-button" 
            :class="{ active: activeSection === 'subscription' }"
            @click="activeSection = 'subscription'"
          >
            {{ $t('subscription_access_games') }} ({{ subscriptionGames.length }})
          </button>
        </div>
        <div v-else class="single-section-title">
          {{ $t('my_games') }} ({{ userGames.length }})
        </div>
        
        <div class="total-stats">
          <div class="total-play-time">
            <ClockhistoryIcon class="clock-icon" />
            <span class="total-time-label">{{ $t('total') }} {{ $t('play_time') }}:</span>
            <span class="total-time-value">{{ formatPlayTime(totalPlayTime) }}</span>
          </div>
          <div class="games-count">
            <span>{{ activeSection === 'owned' ? $t('my_games') : $t('subscription_access_games') }}: {{ currentGamesCount }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State for Owned Games -->
      <div v-if="activeSection === 'owned' && userGames.length === 0" class="empty-stats">
        <p>{{ $t('no_owned_games') }}</p>
        <button class="browse-button" @click="router.push('/games')">
          {{ $t('browse_games') }}
        </button>
      </div>

      <!-- Empty State for Subscription Games -->
      <div v-if="activeSection === 'subscription' && subscriptionGames.length === 0" class="empty-stats">
        <p>{{ $t('no_subscription_games') }}</p>
        <button class="browse-button" @click="router.push('/subscription')">
          {{ $t('subscribe') }}
        </button>
      </div>

      <!-- Games Stats List -->
      <div v-if="sortedGames.length > 0" class="games-stats-list">
        <div 
          v-for="game in sortedGames" 
          :key="game.game_id"
          class="game-stat-card"
        >
          <div class="game-image" @click="viewGameDetails(game.game_id)">
            <img :src="game.banner_url" :alt="gameTitle(game)" />
            <div class="game-overlay">
              <span class="view-details">{{ $t('see_more') }}</span>
            </div>
          </div>
          
          <div class="game-info">
            <h3 class="game-title" @click="viewGameDetails(game.game_id)">
              {{ gameTitle(game).toUpperCase() }}
            </h3>
            
            <div class="play-time-section">
              <div class="play-time-container">
                <div v-if="playTimeLoading[game.game_id]" class="play-time-loading">
                  <span class="loading-dot"></span>
                  <span class="loading-dot"></span>
                  <span class="loading-dot"></span>
                </div>
                <div v-else class="play-time-display">
                  <ClockhistoryIcon class="clock-icon" />
                  <span class="play-time-value">{{ formatPlayTime(playTimes[game.game_id] || 0) }}</span>
                </div>
              </div>
            </div>

            <div class="game-actions">
              <button 
                class="achievements-button"
                @click="viewAchievements(game.game_id)"
              >
                {{ $t('see_achievements') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 70vh;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.main-content {
  width: 100%;
}

.header-section {
  margin-bottom: 2rem;
}

.section-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.section-button {
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  padding: 8px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--boly-button-pink);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.section-button.active {
  background-color: var(--boly-button-blue);
}

.section-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.single-section-title {
  text-align: center;
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  padding: 8px 20px;
  background-color: var(--boly-button-pink);
  color: white;
  border-radius: 5px;
  display: inline-block;
  margin-left: 50%;
  transform: translateX(-50%);
}

.title-bold {
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.total-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.total-play-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--boly-button-blue);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
}

.games-count {
  background: var(--boly-button-pink);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
}

.clock-icon {
  width: 20px;
  height: 20px;
}

.total-time-label {
  font-size: 1rem;
}

.total-time-value {
  font-size: 1.1rem;
  font-weight: 700;
}

.empty-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  gap: 2rem;
}

.empty-stats p {
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
  border-radius: 8px;
  background-color: var(--boly-button-pink);
  color: white;
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.browse-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.games-stats-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.game-stat-card {
  display: flex;
  background: var(--boly-bg-dark-blue);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  min-height: 120px;
}

.game-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.game-image {
  border-radius: 8px;
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
  overflow: hidden;
}

.game-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-image:hover .game-overlay {
  opacity: 1;
}

.game-image:hover img {
  transform: scale(1.05);
}

.view-details {
  color: white;
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  font-size: 0.9rem;
  text-align: center;
}

.game-info {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.game-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: bold;
  color: var(--color-text);
  margin: 0 0 0.75rem 0;
  cursor: pointer;
  transition: color 0.2s ease;
  line-height: 1.2;
}

.game-title:hover {
  color: var(--boly-button-blue);
}

.play-time-section {
  margin-bottom: 0.75rem;
}

.play-time-container {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  padding: 0.5rem;
  min-height: 35px;
}

.play-time-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.play-time-display .clock-icon {
  width: 16px;
  height: 16px;
}

.play-time-value {
  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  color: var(--color-text);
  font-size: 0.9rem;
}

.play-time-loading {
  display: flex;
  justify-content: center;
  gap: 4px;
  align-items: center;
  width: 100%;
}

.loading-dot {
  width: 6px;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  animation: dot-pulse 1.4s infinite ease-in-out;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-pulse {
  0%, 100% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.game-actions {
  display: flex;
  justify-content: flex-end;
}

.achievements-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: var(--boly-button-blue);
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.achievements-button:hover {
  background: var(--boly-button-light-blue);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .title-bold {
    font-size: 2rem;
  }
  
  .section-buttons {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
  
  .section-button {
    width: 280px;
    max-width: 90%;
  }
  
  .single-section-title {
    font-size: 1rem;
    padding: 6px 16px;
    width: 280px;
    max-width: 90%;
  }
  
  .total-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .games-stats-list {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .game-stat-card {
    flex-direction: column;
    min-height: auto;
  }
  
  .game-image {
    width: 100%;
    height: 180px;
  }
}

@media (max-width: 480px) {
  .stats-container {
    padding: 0.5rem;
  }
  
  .title-bold {
    font-size: 1.5rem;
  }
  
  .game-info {
    padding: 0.75rem;
  }
}
</style>
