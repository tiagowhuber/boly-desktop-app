<script setup>
import { useAuth, useUser } from '@/stores'
import { useRoute, useRouter } from 'vue-router'
import EditIcon from '@/components/icons/EditIcon.vue'
import LocaleSelector from '@/components/forms/LocaleSelector.vue'
import TrashCanXMarkIcon from '@/components/icons/TrashCanXMarkIcon.vue'
import TagAbove from '@/components/forms/TagAbove.vue'
import Loading from '@/components/LoadingIcon.vue'
import { onMounted, ref } from 'vue';
import AlertModal from '@/components/AlertModal.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const user = useUser()

if(!auth.isLoggedIn && !auth.verifying){
  router.back()
}

const game = ref({})
const gameDataBaseUrl = ref('')
const loading = ref(true)

const bannerFile = ref(null);
const mediaFiles = ref([]);
const deleteMediaFiles = ref([]);
const backgroundFile = ref(null);

const showModal = ref(false)
const modalWarning = ref('')

const selectedLocale = ref('en')
const changeLocale = (newLocale) => {
  selectedLocale.value = newLocale;
  console.log(newLocale)
}

const reload = ref(false)
function closeModal(){
  if(reload.value){
    auth.checkToken()
  }

  showModal.value = false;
}

function SetDeleteMedia(media){
  
  if(deleteMediaFiles.value.includes(media)){
    const index = deleteMediaFiles.value.indexOf(media);
    deleteMediaFiles.value.splice(index, 1);
  }
  else deleteMediaFiles.value.push(media)

  console.log(deleteMediaFiles.value)
}

async function ApplyGameChanges(){
  try {

    const patch = {
      name: game.value.name,
      description: game.value.description,
      price: game.value.price,
    }

    const response = await fetch(import.meta.env.VITE_APP_API_URL+'/api/v1/games/'+ game.value.id +'/updateData', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify(patch)
    })

    showModal.value = true

    if (response) {
      const data = await response.json()

      if (response.status == 200) {
        modalWarning.value = "Data successfully updated."
      }
      else{
        modalWarning.value = JSON.stringify(data)
      }
    } else {
      modalWarning.value = JSON.stringify(data)
    }
  } catch (error) {
    console.log(error)
  }
}

async function UploadFiles(){
  const formData = new FormData();

  if (bannerFile.value) {
    formData.append('banner', bannerFile.value);
  }

  if (mediaFiles.value.length) {
    Array.from(mediaFiles.value).forEach(file => {
      formData.append('media', file);
    });
  }

  if (backgroundFile.value) {
    formData.append('background', backgroundFile.value);
  }

  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1])  // Log each key/value pair in FormData
  }

  try {
    const response = await fetch(import.meta.env.VITE_APP_API_URL+'/api/v1/games/'+ game.value.id +'/updateImages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`
      },
      body: formData,
    })

    await fetch(import.meta.env.VITE_APP_API_URL+'/api/v1/games/'+ game.value.id +'/deleteMedia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify( {mediaUrls: deleteMediaFiles.value} ),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Files uploaded successfully', data)

      showModal.value = true;
      modalWarning.value = "Changes applied successfully."
    } else {
      showModal.value = true;
      modalWarning.value = 'Error uploading files:' + await response.text()
    }
  } catch (error) {
    showModal.value = true;
    modalWarning.value = 'Upload failed'
    console.error('Upload failed:', error)
  }
};

onMounted(async () => {
  try {
    const url = import.meta.env.VITE_APP_API_URL+'/api/v1/games/' + route.params.game
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)
    
    game.value = data
    gameDataBaseUrl.value = import.meta.env.VITE_S3_BASE_URL + '/' + game.value.id + '/'

    loading.value = false
  } catch (error) {
    console.error(error)
  } finally {
    console.log('finally')
  }
})

const handleBannerUpload = (event) => {
  bannerFile.value = event.target.files[0];
};

const handleBackgroundUpload = (event) => {
  backgroundFile.value = event.target.files[0];
};

const handleMediaUpload = (event) => {
  mediaFiles.value = event.target.files;
};
</script>

<template>
  <div class="loading_container" v-if="auth.verifying || loading">
    <Loading />
  </div>
  <div v-else class="section">
    <h1 class="title-bold">{{$t('edit_game_title')}}</h1>
    <div class="mform">
      <div class="input-container">
        <h2>{{$t('game_data')}}</h2>
        <LocaleSelector @languageChanged="changeLocale"/>
      </div>
      <div class="input-container">
        <div class="fullsize">
          <br>
          <TagAbove>
            {{$t('game_name')}}
            <template #child>
              <input
                class="text"
                type="text"
                :placeholder="$t('game_name')"
                v-model="game.name[selectedLocale]"
              />
            </template>
          </TagAbove>
          <br>
          <TagAbove>
            {{$t('game_price')}}
            <template #child>
              <input
                class="text"
                type="number"
                placeholder="0"
                v-model="game.price"
                :disabled="!game.is_preview"
              />
            </template>
          </TagAbove>
        </div>
        <div class="halfsize">
          <TagAbove>
          {{$t('game_description')}}
          <template #child>
            <textarea
              class="text"
              type="text"
              :placeholder="$t('game_description')"
              v-model="game.description[selectedLocale]"
            ></textarea>
          </template>
          </TagAbove>
        </div>
      </div>
      <button class="apply-button" @click="ApplyGameChanges()">{{$t('apply')}}</button>
    </div>
    <div class="mform">
      <h2>{{$t('game_media')}}</h2>
      <form @submit.prevent="UploadFiles()">
          <div class="input-container">
            <TagAbove class="halfsize">
              <p>{{$t('banner')}}</p>
              <br>
              <template #child>
                <img :src="gameDataBaseUrl + game.banner_uri">
                <input type="file" id="banner" @change="handleBannerUpload" />
              </template>
            </TagAbove>
            <TagAbove class="halfsize">
              <p>{{$t('background')}}</p>
              <br>
              <template #child>
                <img :src="gameDataBaseUrl + game.background_uri">
                <input type="file" id="background" @change="handleBackgroundUpload" />
              </template>
            </TagAbove>
          </div>
          <br>
          <TagAbove>
            <p>{{$t('media')}}</p>
            <br>
            <template #child>
              <div class="media-list">
                <div class="media-img" v-for="item in game.media" :key="item" :style="deleteMediaFiles.includes(item) ? 'border: 2px red solid;' : ''">
                  <img :src="gameDataBaseUrl + item" :style="deleteMediaFiles.includes(item) ? 'filter: grayscale(100%) sepia(100%) hue-rotate(-50deg) saturate(400%) brightness(60%);': ''">
                  <div class="xmark" @click="SetDeleteMedia(item)">
                    <TrashCanXMarkIcon v-if="!deleteMediaFiles.includes(item)"/>
                    <p v-if="deleteMediaFiles.includes(item)">Marcado para eliminar (Clic para cancelar)</p>
                    <p v-else>Quitar archivo multimedia</p>
                  </div>
                </div>
              </div>
              <input type="file" id="media" multiple @change="handleMediaUpload" />
            </template>
          </TagAbove>
          <br>
          <button type="submit" class="apply-button">{{$t('apply')}}</button>
        </form>
    </div>

    <Teleport to="body">
      <AlertModal :show="showModal" @close="closeModal()">
        <template #header>
          <h3>{{$t('notification')}}</h3>
        </template>
        <template #body> {{ modalWarning }} </template>
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
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  text-align: left;
  width: 100%;
}

.mform {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 20px;
  padding: 30px;
  gap: 20px;
}

.input-container{
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

input,
textarea {
  resize: none;
  max-width: 100%;
  outline: none;
  padding: 1rem 1rem;
  border-radius: 1rem;
  background-color: var(--boly-bg-dark-transparent);
  border: none;
  margin-top: 5px;
}

textarea {
  height: 200px;
}

.fullsize{
  width: 100%;
}

.halfsize {
  width: 50%;
}

.apply-button{
  padding: 0px;
  color: var(--light);
  width: 200px;
  background-color: var(--boly-button-purple);
  border: none;
}

.apply-button:hover{
  background-color: var(--boly-button-purple-hover);
}

button{
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: larger;
  margin-top: 10px;
  color: var(--light);
  background-color: var(--boly-button-purple);
  justify-content: center;
  border-radius: 5px;
  border: none;
}

.media-list{
  flex: 1;
  display: flex;
  justify-content: space-around;
  gap: 20px;
  flex-wrap: wrap;
}

img {
  width: 100%;
}

.media-img{
  width: 32%;
  height: 250px;
  display: flex;
  flex-direction: column;
}

.xmark {
  font-size: 75%;
  display: flex;
  flex: 1;
  cursor: pointer;
  background-color: rgba(255, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
}

.xmark > svg{
  width: 50px;
  height: 25px;
  fill: white;
}
</style>
