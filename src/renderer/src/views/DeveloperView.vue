<!-- <script setup lang="ts">
import Loading from '@/components/LoadingIcon.vue'
import PlusIcon from '@/components/icons/PlusIcon.vue'
import TagAbove from '@/components/forms/TagAbove.vue'
import XMarkIcon from '@/components/icons/XMarkIcon.vue'
import DeveloperGameItem from '@/components/games/DeveloperGameItem.vue'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { useAuth, useUser } from '@/stores'
import { useGames } from '@/stores'
import { storeToRefs } from 'pinia'
import type { Game, User, Auth } from '@/types'

const router = useRouter()
const auth = useAuth()
const user = useUser()
const gamesStore = useGames()

if (!auth.isLoggedIn && !auth.token) {
  router.back()
}

const { loading, games } = storeToRefs(gamesStore)

const hasUserData = computed((): boolean => 
  auth.isLoggedIn && Array.isArray(user.DevelopedGames)
)

const previewGames = computed((): Game[] => 
  hasUserData.value ? user.DevelopedGames.filter((x: Game) => x.is_preview) : []
)

const publishedGames = computed((): Game[] => 
  hasUserData.value ? user.DevelopedGames.filter((x: Game) => !x.is_preview) : []
)

const hasPreviewGames = computed((): boolean => previewGames.value.length > 0)
const hasPublishedGames = computed((): boolean => publishedGames.value.length > 0)

const file_input = ref<HTMLInputElement | null>(null)
const images = ref<string[]>([])
const fileError = ref<string>('')

function addImages(): void {
  try {
    const files = file_input.value?.files
    if (!files?.length) {
      fileError.value = 'No file selected'
      return
    }
    const fileReader = new FileReader()
    fileReader.onerror = () => {
      fileError.value = 'Error reading file'
    }
    fileReader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target?.result) {
        images.value.push(event.target.result as string)
        fileError.value = ''
      }
    }
    fileReader.readAsDataURL(files[0])
  } catch (error) {
    fileError.value = 'Error processing file'
    console.error(error)
  }
}

function onSubmit(e: Event): void {
  e.preventDefault()
}

function goToPreview(): void {
  router.push('/upload')
}
</script>

<template>
  <div class="loading_container" v-if="auth.verifying">
    <Loading />
  </div>
  <template v-else-if="hasUserData">
    <div class="section">
      <h1 class="title-bold">{{ $t('developer_title')}}</h1>

      <div class="container" v-if="!hasPreviewGames">
        <h1>{{ $t('developer_create_preview')}}</h1>
        <p>{{ $t('developer_create_preview_desc')}}</p>
        <br>
        <button class="btn-purple" @click="goToPreview">{{ $t('developer_create_preview_button')}}</button>
      </div>
      <div class="container" v-else>
        <h1>{{ $t('developer_game_preview')}}</h1>
        <p>{{ $t('developer_create_preview_desc')}}</p>
        <br>
        <div class="list">
          <DeveloperGameItem
            v-for="item in previewGames"
            :key="item.id"
            :item="item"
          />
        </div>
      </div>
  
      <div class="container" v-if="hasPublishedGames">
        <h1>{{ $t('developer_published')}}</h1>
        <p>{{ $t('developer_published_desc')}}</p>
        <br>
        <div class="list">
          <DeveloperGameItem
            v-for="item in publishedGames"
            :key="item.id"
            :item="item"
          />
        </div>
      </div>
      <p v-if="fileError" class="error-text">{{ fileError }}</p>
    </div>
  </template>
</template>

<style scoped>
.title-bold{
  width: 100%;
  text-align: start;
  font-size: 300%;
}

h2 {
  text-align: left;
  width: 100%;
}

.container{
  width: 100%;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 20px;
  padding: 30px;
}

.container p{
  text-align: left;
}

.container h1{
  text-align: left;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
}

.mform {
  width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mform > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.list {
  display: flex;
  width: 100%;
  justify-content: start;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-purple{
  background-color: var(--boly-button-purple);
  color: var(--light);
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 120%;
  border-radius: 10px;
  border: none;
  height: 50px;
}

.btn-purple:hover{
  background-color: var(--boly-button-purple-hover);
}

.error-text {
  color: red;
  font-size: 0.9em;
  margin-top: 5px;
}
</style> -->
<template>
</template>