<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import LoadingIcon from '../LoadingIcon.vue'
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

const sortedMediaItems = computed(() => {
  return mediaItems.value
    .sort((a, b) => a.display_order - b.display_order)
})

const hasMedia = computed(() => mediaItems.value.length > 0)

async function loadMedia() {
  loading.value = true
  try {
    const data = await gameStore.getGameMedia(props.gameId, props.mediaType)
    mediaItems.value = data
    
    if (data.length > 0) {
      selectedMedia.value = data[0]
    }
  } catch (error) {
    console.error('Failed to load game media:', error)
  } finally {
    loading.value = false
  }
}

function selectMedia(media: any) {
  selectedMedia.value = media
}

function getAltText(media: any) {
  return media?.title || `Game media ${media?.media_id}`
}

function isYouTubeUrl(url: string): boolean {
  if (!url) return false
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return ''
  
  let videoId = ''
  
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(new URL(url).search)
    videoId = urlParams.get('v') || ''
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  }
  
  if (!videoId) return ''
  
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
}

function getYouTubeThumbnailUrl(url: string): string {
  if (!url) return ''
  
  let videoId = ''
  
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(new URL(url).search)
    videoId = urlParams.get('v') || ''
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  }
  
  if (!videoId) return ''
  
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
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

<template>
  <div class="custom-game-media-gallery">
    <h3 v-if="title" class="gallery-title">{{ title }}</h3>
    
    <div v-if="loading" class="loading-container">
      <LoadingIcon />
    </div>
    
    <div v-else-if="!hasMedia" class="no-media">
      <slot name="no-media">No media available</slot>
    </div>
    
    <div v-else class="media-gallery">
      <!-- Main display area for the currently selected media -->
      <div class="main-media-display">
        <img 
          v-if="selectedMedia?.media_type === 'image'" 
          :src="selectedMedia?.media_url" 
          :alt="getAltText(selectedMedia)" 
          class="main-media"
        />
        
        <div v-else-if="selectedMedia?.media_type === 'video'" class="youtube-container">
          <iframe
            v-if="isYouTubeUrl(selectedMedia?.media_url)"
            :src="getYouTubeEmbedUrl(selectedMedia?.media_url)"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="youtube-embed"
          ></iframe>
          <video 
            v-else
            controls 
            :src="selectedMedia?.media_url" 
            class="main-media"
          ></video>
        </div>
      </div>
      
      <!-- Thumbnails row for all media items -->
      <div class="thumbnails-row">
        <div 
          v-for="media in sortedMediaItems" 
          :key="media.media_id" 
          :class="['thumbnail-item', { active: media.media_id === selectedMedia?.media_id }]"
          @click="selectMedia(media)"
        >
          <img 
            v-if="media.media_type === 'image'" 
            :src="media.media_url" 
            :alt="getAltText(media)" 
            loading="lazy" 
          />
          
          <div v-else-if="media.media_type === 'video'" class="video-thumbnail">
            <img 
              v-if="isYouTubeUrl(media.media_url)"
              :src="getYouTubeThumbnailUrl(media.media_url)"
              :alt="getAltText(media)"
              loading="lazy"
            />
            <video 
              v-else
              :src="media.media_url" 
              preload="metadata"
            ></video>
            <div class="play-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="48px" height="48px">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-game-media-gallery {
  width: 100%;
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

.media-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-media-display {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-media {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.youtube-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.youtube-embed {
  width: 100%;
  height: 100%;
}

.thumbnails-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.thumbnail-item {
  flex: 0 0 120px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 3px solid transparent;
  transition: all 0.2s ease;
}

.thumbnail-item.active {
  border-color: var(--boly-button-purple);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.thumbnail-item:hover:not(.active) {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.thumbnail-item img,
.thumbnail-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.8;
  pointer-events: none;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .main-media-display {
    height: 250px;
  }
  
  .thumbnails-row {
    gap: 0.5rem;
  }
  
  .thumbnail-item {
    flex: 0 0 80px;
    height: 60px;
  }
}
</style>
