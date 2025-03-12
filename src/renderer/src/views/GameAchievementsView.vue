<script setup>
import { ref, onMounted, inject, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Loading from '../components/LoadingIcon.vue'
import GameAchievement from '../components/games/GameAchievementProgressItem.vue'
import CheckIcon from '@renderer/components/icons/CheckIcon.vue'
import XMarkIcon from '@renderer/components/icons/XMarkIcon.vue'
import { useAuth, useUser } from '../stores'
import { useAchievements } from '../stores/achievements'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const auth = useAuth()
const user = useUser()

const router = useRouter()
const route = useRoute()

if(!auth.isLoggedIn && !auth.verifying){
  router.back()
}

const game = ref({})
const loading = ref(true)
const gameDataBaseUrl = ref('')

const showModal = ref(false)
const achievementStore = useAchievements()

const achievements = ref({})

onMounted(async () => {
  try {
    // get game
    const url = import.meta.env.VITE_APP_API_URL+'/api/v1/games/' + route.params.id
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)
    
    game.value = data
    gameDataBaseUrl.value = import.meta.env.VITE_S3_BASE_URL + '/' + game.value.id + '/'

    // get user achievements
    achievements.value = await achievementStore.fetchUserProgress(route.params.id, auth);

    console.log(achievements.value)

    loading.value = false
  } catch (error) {
    console.error(error)
  } finally {
    console.log('finally')
  }
})
</script>

<template>
  <div class="unlocked_section">
    <div class="loading_container" v-if="loading">
      <Loading />
    </div>
    <img class="background_img" ref="background_img" :src="gameDataBaseUrl + game.background_uri" v-if="!loading" />
    <div class="section banner_section">
      <div class="banner">
        <div
          class="resume"
          v-if="!loading"
        >
          <h1 class="game_name title">{{$t('achievement_manager_subtitle', {game: game.name[i18n.locale.value]})}}</h1>
        </div>
      </div>
    </div>
  </div>
  <div class="section achievement-list" >
    <GameAchievement class="achievementItem" v-for="item in achievements" :key="item.id" :item="item"/>
  </div>
</template>

<style scoped>
.achievement-list{
  margin: 50px auto;
  width: 1200px;
  justify-content: center;
  background-color: var(--boly-bg-dark-transparent);
  padding: 40px;
  border-radius: 20px;
}

.achievementItem{
  width: 100%;
  align-items: start;
}

.text_highlight{
  color: lightslategray;
}

.unlocked_section {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 100%;
  height: 200px;
  border-top: 3px var(--boly-button-purple) solid;
  border-bottom: 3px var(--boly-button-purple) solid;
}

.unlocked_section > * {
  grid-column: 1;
  grid-row: 1;
}

.unlocked_section > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background_img {
  z-index: -1;
  transition-duration: 0.2s;
}

.gradient {
  background-image: linear-gradient(transparent, transparent, transparent, var(--light));
}

.banner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  width: 100%;
  height: 100%;
  text-align: left;
}

.resume {
  display: flex;
  flex-direction: column;
  margin: auto;
}

.game_name {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  font-size: 48px;
  text-shadow: 2px 2px #00000050;
  color: var(--light);
}

.game_description {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  color: var(--light);
}

</style>
