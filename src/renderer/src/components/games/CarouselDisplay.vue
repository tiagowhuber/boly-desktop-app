<script setup>
import { provide, ref } from 'vue'
import MiniCarousel from './MiniCarousel.vue'

const props = defineProps(['images'])
const selected_image = ref('0')
provide('selected_image', selected_image)
</script>

<template>
  <div class="carousel_display">
    <img :src="props.images[selected_image].url" v-if="!props.images[selected_image].is_video" />
    <video id="video_player" controls v-else>
      <source :src="props.images[selected_image].url" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <MiniCarousel class="carousel" :data="props.images" />
  </div>
</template>

<style scoped>
.carousel_display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 50px;
}

video,
img {
  width: 100%;
  aspect-ratio: 1.77778;
  object-fit: contain;
  border-radius: 5px;
  background-color: black;
}

.carousel {
  width: 100%;
  height: 100px;
  z-index: 3;
  border-radius: 5px;
}
</style>
