<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth, useAchievements, useGames } from '@/stores' 
import useGameRoutes from '@/desktop-stores/gameRoutes'
import type { Game, Achievement } from '@/types'
import PlayIcon from '@/components/icons/PlayIcon.vue'
import LoadingSpinnerIcon from '@/components/icons/LoadingSpinnerIcon.vue'
import DownloadIcon from '@/components/icons/DownloadIcon.vue'
import ClockhistoryIcon from '@/components/icons/ClockhistoryIcon.vue'
import VerticalDotsIcon from '@/components/icons/VerticalDotsIcon.vue'
import router from '@/router'

const props = defineProps<{
  item: Game
}>()

const i18n = useI18n()
const auth = useAuth()
const achievementsStore = useAchievements()
const gamesStore = useGames() 
const gameRoutesStore = useGameRoutes()
const loading = ref(false)
const isDownloading = ref(false)
const isInstalling = ref(false)
const isRunning = ref(false)
const gameAchievements = ref<Achievement[]>([])
const achievementsLoading = ref(true)
const playTime = ref<number | null>(null) 
const playTimeLoading = ref(true) 
const showOptionsMenu = ref(false)

console.log('LibraryItem received game:', props.item)

const isWebGame = computed(() => {
  return (
    props.item.file_name?.desktop &&
    typeof props.item.file_name.desktop === 'string' &&
    !props.item.file_name.desktop.endsWith('.exe')
  )
})

//const gameDataBaseUrl = import.meta.env.VITE_S3_BASE_URL + '/' + props.item.game_id + '/'


const displayedAchievements = computed(() => {
  return gameAchievements.value.slice(0, 4);
});

const hasAchievements = computed(() => {
  return gameAchievements.value.length > 0;
});

// const gameCompletionPercentage = computed(() => {
//   if (!gameAchievements.value.length) return 0;
  
//   const totalAchievements = gameAchievements.value.length;
//   const completedAchievements = gameAchievements.value.filter(a => 
//     a.progress === 100 || a.progress === undefined
//   ).length;
  
//   return Math.floor((completedAchievements / totalAchievements) * 100);
// });

async function fetchGameAchievements() {
  if (!props.item.game_id || !auth.token) return;
  
  achievementsLoading.value = true;
  try {
    await achievementsStore.fetchAchievements(props.item.game_id, { token: auth.token });
    gameAchievements.value = [...achievementsStore.achievements];
  } catch (error) {
    console.error('Error fetching achievements:', error);
  } finally {
    achievementsLoading.value = false;
  }
}

async function fetchPlayTime() {
  if (!props.item.game_id || !auth.token) return;

  playTimeLoading.value = true;
  try {
    const time = await gamesStore.getPlayTime(props.item.game_id, { token: auth.token });
    playTime.value = time;
    console.log('Fetched play time:', playTime.value);
  } catch (error) {
    console.error('Error fetching play time:', error);
    playTime.value = null; 
  } finally {
    playTimeLoading.value = false;
  }
}

function toggleOptionsMenu(event: Event) {
  event.stopPropagation();
  showOptionsMenu.value = !showOptionsMenu.value;
}

async function uninstallGame(event: Event) {
  event.stopPropagation();
  showOptionsMenu.value = false;
  
  if (!props.item.game_id) return;
  
  try {
    const uninstaller = gameRoutesStore.localUninstallers.find(u => u.gameId === props.item.game_id);
    
    if (uninstaller && uninstaller.route) {
      console.log('Uninstalling game:', props.item.game_id, 'using:', uninstaller.route);
      
      const result = await window.electronAPI.uninstallGame({
        game_id: props.item.game_id,
        uninstallerPath: uninstaller.route
      });
      
      if (result.success) {
        console.log('Game uninstalled successfully:', result.message);
        
        gameRoutesStore.removeGameFromRoute({ gameId: props.item.game_id, route: props.item.game_Path || '' });
        gameRoutesStore.removeUninstallerFromRoute({ gameId: props.item.game_id, route: uninstaller.route });
        
        props.item.isInstalled = false;
        props.item.game_Path = '';
      } else {
        console.error('Uninstall failed:', result.error);
      }
    } else {
      console.warn('No uninstaller found for game:', props.item.game_id);
    }
  } catch (error) {
    console.error('Error uninstalling game:', error);
  }
}

onMounted(() => {
  fetchGameAchievements();
  fetchPlayTime(); 
  
  // Check if this game is currently running
  if (props.item.game_id) {
    window.electronAPI.isGameRunning(props.item.game_id).then((running: boolean) => {
      isRunning.value = running;
    });
  }
  
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.options-container')) {
      showOptionsMenu.value = false;
    }
  };
    document.addEventListener('click', handleClickOutside);
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
  
 //todo: use the download store
  window.electronAPI.onDownloadComplete((data) => {
    if (data.gameId === props.item.game_id) {
      loading.value = false;
      isDownloading.value = false;
      props.item.isInstalled = false;
      props.item.game_Path = data.installPath;
      isInstalling.value = true;
    }
  });
  
  window.electronAPI.onDownloadError((data) => {
    if (data.gameId === props.item.game_id) {
      loading.value = false;
      isDownloading.value = false;
      isInstalling.value = false;
    }
  });

  window.electronAPI.onInstallStarted((data) => {
    if (data.gameId === props.item.game_id) {
      loading.value = true;
      isInstalling.value = true;
    }
  });

  window.electronAPI.onInstallComplete((data) => {
    if (data.gameId === props.item.game_id) {
      loading.value = false;
      isInstalling.value = false;
      isDownloading.value = false;
      props.item.isInstalled = true;
      props.item.game_Path = data.installPath;
      console.log('Setting game path to:', props.item.game_Path);
      
    }
  });

  window.electronAPI.onInstallError((data) => {
    if (data.gameId === props.item.game_id) {
      loading.value = false;
      isInstalling.value = false;
    }
  });

  window.electronAPI.onGameStarted((data) => {
    if (data.gameId === props.item.game_id) {
      isRunning.value = true;
      loading.value = false;
    }
  });

  window.electronAPI.onGameStopped((data) => {
    if (data.gameId === props.item.game_id) {
      isRunning.value = false;
    }
  });
});

async function Play() {
  if (props.item.file_name?.desktop && 
        typeof props.item.file_name.desktop === 'string' && 
        !props.item.file_name.desktop.endsWith('.exe')) {
      // This is an HTML game, navigate to the route
      router.push(props.item.file_name.desktop);
  } else if (props.item.game_id) {
    console.log("clicked")
    loading.value = true; // Set loading while game is starting
    
    try {
      const result = await window.electronAPI.playGame({
        game_id: props.item.game_id,
        appPath: props.item.game_Path,
        token: auth.token
      });
      
      // If there was an error starting the game, reset loading state
      if (result && result.error) {
        console.error('Failed to start game:', result.error);
        loading.value = false;
      }
      // If successful, loading state will be cleared when game-started event is received
    } catch (error) {
      console.error('Error starting game:', error);
      loading.value = false;
    }
  }
}


async function Download() {
  if (loading.value || isDownloading.value) return;
  loading.value = true;
  isDownloading.value = true;
  
  try {
    if (props.item.game_id) {
      const gameName = props.item.name[i18n.locale.value] || props.item.name.es || "Game";
      
      window.electronAPI.downloadGame({
        game_id: props.item.game_id,
        token: auth.token,
        gameName: gameName
      });
    }
  } catch (error) {
    console.error('Error initiating download:', error);
    loading.value = false;
    isDownloading.value = false;
  }
}

// function navigateToGameDetails() {
//   if (props.item.game_id) {
//     router.push(`/games/${props.item.game_id}`)
//   }
// }
</script>


<template>
  <!-- <div class="library-item" @click="navigateToGameDetails"> -->
    <div class="library-item" @click="Play">
    <img :src="props.item.banner_url" class="game-banner" />
    <div class="game-info">
      <div class="title-section">
        <h3>{{ props.item.name[i18n.locale.value].toUpperCase() }}</h3>
      </div>
      
      <div class="divider"></div>
      
      <!-- Achievements Section -->
      <div class="achievements-section">
        <h4 class="section-label">{{ $t('achievements') }}</h4>
        <div class="achievements-container">
          <div v-if="achievementsLoading" class="achievements-loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
          <div v-else-if="hasAchievements" class="achievements-icons">
            <div v-for="achievement in displayedAchievements" :key="achievement.id" class="achievement-icon-wrapper">
              <div class="achievement-tooltip">
                <strong>{{ achievement.name }}</strong>
                <p>{{ achievement.description }}</p>
              </div>
              <div class="achievement-frame">
                <img 
                  :src="achievement.icon_url" 
                  :class="{'achievement-icon': true, 'locked': achievement.progress !== undefined && achievement.progress < 100}" 
                  alt="Achievement Icon" 
                />
              </div>
              <div class="achievement-progress" v-if="(achievement.progress !== 100) && achievement.progress !== undefined">
                <div class="progress-bar" :style="{width: `${achievement.progress}%`}"></div>
              </div>
            </div>
          </div>
          <div v-else class="no-achievements">
            {{ $t('no_achievements') }}
          </div>
        </div>
      </div>

      <!-- Play Time Section -->
      <div class="play-time-section">
        <h4 class="section-label">{{ $t('play_time') }}</h4>
        <div class="play-time-container">
          <div v-if="playTimeLoading" class="play-time-loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </div>
          <div v-else-if="playTime !== null" class="play-time-value">
            <div class="time-display">
              <ClockhistoryIcon class="clock-icon" />
              <span>{{ $t('play_time') }}: {{ Math.floor(playTime / 60) }}h {{ playTime % 60 }}m</span>
            </div>
          </div>
          <div v-else class="no-play-time">
            {{ $t('no_play_time_recorded') }}
          </div>
        </div>
      </div>

      <div class="game-actions">
        <button
          :class=" [
            'action-button',
            props.item.isInstalled || isWebGame
              ? isRunning 
                ? 'running-button'
                : 'play-button'
              : isDownloading
                ? 'downloading-button'
                : isInstalling
                  ? 'installing-button'
                  : 'download-button'
          ]"
          :disabled="loading || isDownloading || isInstalling || isRunning"
          @click.stop="(props.item.isInstalled || isWebGame) && !isRunning ? Play() : Download()"
        >
          <span class="button-text">{{
            props.item.isInstalled || isWebGame
              ? isRunning
                ? $t('running')
                : $t('play')
              : isDownloading
                ? $t('downloading')
                : isInstalling
                  ? $t('installing')
                  : $t('download')
          }}</span>
          <PlayIcon v-if="(props.item.isInstalled || isWebGame) && !isRunning" class="icon" />
          <PlayIcon v-else-if="isRunning" class="icon" />
          <LoadingSpinnerIcon v-else-if="isDownloading || isInstalling" class="icon" />
          <DownloadIcon v-else class="icon" />
        </button>
        
        <!-- Options Button -->
        <div class="options-container" v-if="props.item.isInstalled">
          <button
            class="options-button"
            @click.stop="toggleOptionsMenu"
            :class="{ active: showOptionsMenu }"
          >
            <VerticalDotsIcon class="options-icon" />
          </button>
          
          <!-- Options Dropdown -->
          <div class="options-dropdown" v-if="showOptionsMenu">
            <button class="dropdown-item uninstall-item" @click="uninstallGame">
              <span>{{ $t('uninstall') }}</span>
            </button>
          </div>
        </div>
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.library-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.game-banner {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-bottom: 3px solid var(--boly-button-blue);
}

.game-info {
  background: white;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.title-section h3 {
  font-family: 'Poppins', sans-serif;
  font-size: larger;
  color: black;
  font-weight: bold;
  margin: 0;
}

.completion-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
}

.completion-bar {
  width: 40px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.completion-progress {
  height: 100%;
  background: var(--boly-button-blue);
  border-radius: 3px;
}

.completion-text {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
}

/* Dividers between sections */
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
  margin: 0 1rem;
}

/* Achievements section */
.achievements-section {
  padding: 0rem 1rem;
  margin-bottom: 10px;
}

/* Play Time section */
.play-time-section {
  padding: 0rem 1rem;
  margin-bottom: 10px;
}

.play-time-container {
  min-height: 30px; /* Adjusted height */
  display: flex;
  justify-content: start;
  align-items: center;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 8px;
}

.play-time-value {
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem; /* Adjusted font size */
  color: black;
  font-weight: bold;
}

.no-play-time {
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7); /* Adjusted for better visibility */
  font-style: italic;
}

.play-time-loading {
  display: flex;
  justify-content: center;
  gap: 4px;
  align-items: center;
}

.section-label {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
  font-weight: 600;
}

.clock-icon {
  width: 16px;
  height: 16px;
  margin-right: 7px;
  margin-bottom: -3px;
}

/* Achievements section */
.achievements-section {
  padding: 0rem 1rem;
  margin-bottom: 10px;
}

.section-label {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
  font-weight: 600;
}

.achievements-container {
  min-height: 50px;
  display: flex;
  justify-content: start;
  align-items: center;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 8px;
}

.achievements-icons {
  display: flex;
  justify-content: start;
  gap: 10px;
}

.achievement-icon-wrapper {
  position: relative;
}

.achievement-frame {
  width: 34px;
  height: 34px;
  border-radius: 5px;
  padding: 2px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(3px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.achievement-icon-wrapper:hover .achievement-frame {
  background: rgba(var(--boly-button-blue-rgb, 30, 144, 255), 0.3);
  transform: translateY(-2px);
}

.achievement-icon {
  width: 30px;
  height: 30px;
  border-radius: 4px;
}

.achievement-icon.locked {
  filter: grayscale(100%);
  opacity: 0.6;
}

.achievement-icon-wrapper:hover .achievement-tooltip {
  display: block;
  opacity: 1;
}

.achievement-tooltip {
  display: block;
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: linear-gradient(to bottom, rgba(40, 44, 52, 0.95), rgba(25, 28, 36, 0.95));
  color: white;
  padding: 10px;
  border-radius: 6px;
  width: 200px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 100;
  font-size: 0.8rem;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.achievement-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: rgba(25, 28, 36, 0.95) transparent transparent transparent;
}

.achievement-tooltip strong {
  display: block;
  margin-bottom: 6px;
  color: var(--boly-button-blue);
}

.achievement-tooltip p {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  opacity: 0.8;
}

.achievement-progress {
  height: 3px;
  width: 30px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
  margin-left: 2px;
}

.progress-bar {
  height: 100%;
  background-color: var(--boly-button-blue);
}

.no-achievements {
  font-family: 'Poppins', sans-serif;
  font-size: 0.8rem;
  color: black;
  font-style: normal;
}

.achievements-loading {
  display: flex;
  justify-content: center;
  gap: 4px;
  align-items: center;
}

.loading-dot {
  width: 6px;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.6);
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

/* Game Actions Section */
.game-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.8rem 1rem 1.2rem;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-width: 150px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.play-button {
  background-color: #48ace4;
  color: white;
}

.play-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 12px rgba(30, 100, 200, 0.4);
  background-color: #5ebdf5;
}

.download-button {
  font-family: 'Poppins', sans-serif;
  background: var(--boly-button-pink);
  color: white;
}

.download-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  background: var(--boly-button-pink);
}

.downloading-button {
  font-family: 'Poppins', sans-serif;
  background: var(--boly-button-green); 
  color: white;
  cursor: progress;
  position: relative;
  overflow: hidden;
}

.installing-button {
  font-family: 'Poppins', sans-serif;
  background: var(--boly-button-green); 
  color: white;
  cursor: progress;
  position: relative;
  overflow: hidden;
}

.running-button {
  font-family: 'Poppins', sans-serif;
  background: var(--boly-button-blue);
  color: white;
  cursor: not-allowed;
  position: relative;
  overflow: hidden;
}

.downloading-button .icon,
.installing-button .icon {
  animation: pulse-glow 2s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 1));
  }
}

.downloading-button::after,
.installing-button::after,
.running-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shine 1.5s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.downloading-button:hover,
.installing-button:hover,
.running-button:hover {
  transform: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-text {
  font-family: 'Poppins', sans-serif;
  position: relative;
  z-index: 1;
}

.icon {
  width: 1.2em;
  height: 1.2em;
  position: relative;
  z-index: 1;
}

.download-button:disabled {
  opacity: 0.7;
  transform: none;
  cursor: not-allowed;
  box-shadow: none;
}

/* Options Button and Dropdown */
.options-container {
  position: relative;
}

.options-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.options-button:hover {
  background: rgba(0, 0, 0, 0.15);
  color: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.options-button.active {
  background: #48ace4;
  color: white;
}

.options-icon {
  width: 16px;
  height: 16px;
}

.options-dropdown {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-width: 120px;
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.uninstall-item:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

@media (max-width: 768px) {
  .library-item {
    width: 100%;
    max-width: 320px;
  }
  
  .options-dropdown {
    right: -8px;
  }
}
</style>
