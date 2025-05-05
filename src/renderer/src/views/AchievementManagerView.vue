<script setup lang="ts">
import EditableGrid from '@/components/forms/EditableAchievementsGrid.vue'
import LocaleSelector from '@/components/forms/LocaleSelector.vue'
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import Loading from '@/components/LoadingIcon.vue'
import { onMounted, ref } from 'vue'
import { useAuth } from '@/stores'
import { useAchievements } from '@/stores'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Achievement } from '@/types'

const i18n = useI18n()
const selectedLocale = ref('en')

const router = useRouter()
const auth = useAuth()

if(!auth.isLoggedIn){
  router.back()
}

const searchQuery = ref('')
const gridColumns = ['achievement_code', 'name', 'description', 'unlock_requirement', 'type', 'secret'] as const
const gridColumnNames = {
  achievement_code: 'ach_code',
  name: 'ach_name',
  description: 'ach_desc',
  unlock_requirement: 'ach_unlock',
  type: 'ach_type',
  secret: 'ach_secret',
} as const

const route = useRoute()
const achievementStore = useAchievements()

const showAlert = ref(false)
const showConfirm = ref(false)
const modalText = ref('')

async function fetchData(): Promise<void> {
  await achievementStore.fetchAchievements(Number(route.params.game), { token: auth.token })
}

onMounted(() => {
  if(auth.isLoggedIn) fetchData()
})

const idToRemove = ref(0)
function removeHandler(id: number): void {
  idToRemove.value = id
  showConfirm.value = true

  const code = achievementStore.achievements.find((a: Achievement) => a.id === idToRemove.value)?.achievement_code
  modalText.value = `Are you sure you want to remove the achievement "${code}"?`
}

function remove(): void {
  achievementStore.achievements = achievementStore.achievements.filter((entry: Achievement) => entry.id !== idToRemove.value)
  showConfirm.value = false
}

function addHandler(): void {
  const achievementIds = achievementStore.achievements.map((ach: Achievement) => ach.id)
  achievementIds.push(0)
  const minId = Math.min(...achievementIds)

  const newAchievement: Achievement = {
    id: minId - 1,
    achievement_code: "NEW_ACHIEVEMENT",
    name: {es: 'Nuevo logro', en: 'New achievement'},
    description: {es: '', en: ''},
    unlock_requirement: 10,
    type: "PROGRESS",
    secret: false,
    gameId: achievementStore.inspectedGame.game_id!,
  }

  achievementStore.achievements.push(newAchievement)
}

async function saveChanges(): Promise<void> {
  const response = await achievementStore.updateAchievements({ token: auth.token })
  modalText.value = i18n.t(response.message, {error: response.error})
  showAlert.value = true
}

const changeLocale = (newLocale: string): void => {
  selectedLocale.value = newLocale
}

const getLocalizedGameName = (locale: string): string => {
  return achievementStore.inspectedGame.name?.[locale] || ''
}

</script>

<template>
  <div class="loading_container" v-if="achievementStore.loading">
    <Loading />
  </div>
  <div class="section" v-else>
    <h1 class="title-bold">{{$t('achievement_manager_title')}}</h1>
    <div class="mform">
      <h2>{{$t('achievement_manager_subtitle', {game: getLocalizedGameName(i18n.locale.value)})}}</h2>

      <form id="search" class="filter">
        <div>
          {{$t('filter')}} 
          <input name="query" v-model="searchQuery">
        </div>
        <LocaleSelector class="locale-selector" @languageChanged="changeLocale"/>
      </form>

      <EditableGrid @remove-achievement="removeHandler" @add-achievement="addHandler"
        :data="achievementStore.achievements"
        :columns="[...gridColumns]"
        :columnNames="gridColumnNames"
        :filter-key="searchQuery"
        :locale="selectedLocale">
      </EditableGrid>

      <button class="apply-button btn-purple" @click="saveChanges">{{$t('apply')}}</button>
    </div>

    <Teleport to="body">
      <ConfirmModal :show="showConfirm" @close="showConfirm = false" @confirm="remove">
        <template #header>
          <h3>{{$t('remove_achievement')}}</h3>
        </template>
        <template #body> {{ modalText }}</template>
      </ConfirmModal>

      <AlertModal :show="showAlert" @close="showAlert = false">
        <template #header>
          <h3>{{$t('notification')}}</h3>
        </template>
        <template #body> {{ modalText }} </template>
      </AlertModal>
    </Teleport>
  </div>
</template>

<style scoped>
.title-bold{
  width: 100%;
  text-align: start;
  font-size: 300%;
}

h2 {
  text-align: left;
}

.mform {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 20px;
  padding: 30px;
}

.halfsize {
  width: 50%;
}

.filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.input-container{
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

input,
textarea {
  color: var(--light);
  resize: vertical;
  max-width: 100%;
  padding: 1rem 1rem;
  border-radius: 1rem;
  background-color: var(--boly-bg-dark-transparent);
  border: none;
}

.apply-button{
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 120%;
  color: var(--light);
  width: 200px;
  border: none;
  border-radius: 10px;
  margin-bottom: 10px;
}
</style>
