<script setup>
import GameList from '@/components/games/GameList.vue'
import FeaturedGame from '@/components/games/FeaturedGame.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Add mobile detection
const isMobile = ref(window.innerWidth <= 768)

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  // Add resize event listener
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  // Remove resize event listener
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="games-view" :class="{ 'mobile-games-view': isMobile }">
    <FeaturedGame />
    <GameList />
  </div>
</template>

<style scoped>
.games-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.mobile-games-view {
  width: 100%;
  padding: 0;
  overflow-x: hidden;
}
</style>
