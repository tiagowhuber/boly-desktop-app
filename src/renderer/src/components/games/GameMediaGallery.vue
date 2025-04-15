<template>
  <div class="game-media-gallery">
    <h3 v-if="title" class="gallery-title">{{ title }}</h3>
    
    <div v-if="loading" class="loading-container">
      <LoadingIcon />
    </div>
    
    <div v-else-if="!hasMedia" class="no-media">
      <slot name="no-media">No media available</slot>
    </div>
    
    <div v-else class="media-container">
      <!-- Images section -->
      <div v-if="images.length > 0" class="images-section">
        <h4 v-if="showSectionTitles">Screenshots</h4>
        <div class="images-grid">
          <div 
            v-for="image in images" 
            :key="image.media_id" 
            class="image-item"
            @click="openMedia(image)"
          >
            <img :src="image.media_url" :alt="getAltText(image)" loading="lazy" />
          </div>
        </div>
      </div>
      
      <!-- Videos section -->
      <div v-if="videos.length > 0" class="videos-section">
        <h4 v-if="showSectionTitles">Videos</h4>
        <div class="videos-grid">
          <div 
            v-for="video in videos" 
            :key="video.media_id" 
            class="video-item"
          >
            <video 
              controls 
              :src="video.media_url" 
              preload="metadata"
            ></video>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal for fullscreen image view -->
    <ModalComponent v-if="showModal" @close="closeModal">
      <div class="media-modal">
        <img v-if="selectedMedia?.media_type === 'image'" :src="selectedMedia?.media_url" :alt="getAltText(selectedMedia)" />
        <video 
          v-else-if="selectedMedia?.media_type === 'video'"
          controls 
          autoplay 
          :src="selectedMedia?.media_url"
        ></video>
      </div>
    </ModalComponent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import LoadingIcon from '../LoadingIcon.vue'
import ModalComponent from '../ModalComponent.vue'
import { useGames } from '@/stores'

const props = defineProps({
  gameId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  showSectionTitles: {
    type: Boolean,
    default: true
  },
  mediaType: {
    type: String,
    default: 'all',
    validator: (value: string) => ['all', 'image', 'video'].includes(value)
  }
})

const gameStore = useGames()
const loading = ref(true)
const mediaItems = ref<any[]>([])
const selectedMedia = ref<any>(null)
const showModal = ref(false)

const images = computed(() => {
  return mediaItems.value
    .filter(item => item.media_type === 'image')
    .sort((a, b) => a.display_order - b.display_order)
})

const videos = computed(() => {
  return mediaItems.value
    .filter(item => item.media_type === 'video')
    .sort((a, b) => a.display_order - b.display_order)
})

const hasMedia = computed(() => mediaItems.value.length > 0)

async function loadMedia() {
  loading.value = true
  try {
    const data = await gameStore.getGameMedia(props.gameId, props.mediaType)
    mediaItems.value = data
  } catch (error) {
    console.error('Failed to load game media:', error)
  } finally {
    loading.value = false
  }
}

function openMedia(media: any) {
  selectedMedia.value = media
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedMedia.value = null
}

function getAltText(media: any) {
  return media?.title || `Game media ${media?.media_id}`
}

onMounted(() => {
  loadMedia()
})

watch(() => props.gameId, (newId) => {
  if (newId) {
    loadMedia()
  }
})

watch(() => props.mediaType, () => {
  loadMedia()
})
</script>

<style scoped>
.game-media-gallery {
  margin: 20px 0;
}

.gallery-title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.no-media {
  text-align: center;
  color: #888;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.images-section, .videos-section {
  margin-bottom: 2rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.image-item {
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  height: 150px;
  transition: transform 0.2s ease;
}

.image-item:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-item video {
  width: 100%;
  max-height: 220px;
}

.media-modal {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.media-modal img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.media-modal video {
  max-width: 90%;
  max-height: 90%;
}

@media (max-width: 768px) {
  .images-grid, .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .image-item {
    height: 120px;
  }
}
</style>