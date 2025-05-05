<script setup lang="ts">
import GameItem from '@/components/games/GameItem.vue'
import Loading from '@/components/LoadingIcon.vue'
import { useGames } from '@/stores'
import { onMounted, ref, computed, watch, onBeforeUnmount, nextTick } from 'vue'
import { storeToRefs } from 'pinia'

const gamesStore = useGames()
const { loading, games } = storeToRefs(gamesStore)

const activeTab = ref('all')
const isMobile = ref(window.innerWidth <= 768)
const carouselRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)
const startX = ref(0)
const scrollLeft = ref(0)
const itemWidth = ref(0)

let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
async function refreshGames() {
  if (refreshTimeout) {
    return;
  }
  
  refreshTimeout = setTimeout(() => {
    refreshTimeout = null;
  }, 5000); // Only allow refresh every 5 seconds
  
  await gamesStore.getAll()
}

// Cache filtered games to prevent unnecessary recalculations
const filteredGames = computed(() => {
  const result = games.value.filter(game => {
    switch(activeTab.value) {
      case 'downloadable':
        return game.game_type_id === 3;
      case 'web':
        return game.game_type_id === 2;
      case 'dlc':
        return game.game_type_id === 1;
      default:
        return true;
    }
  });
  return result;
});

// Reset carousel position when tab changes
watch(activeTab, () => {
  resetCarousel();
});

// Reset carousel
async function resetCarousel() {
  await nextTick();
  if (carouselRef.value) {
    carouselRef.value.scrollLeft = 0;
    
    // Get item width after DOM update
    const items = carouselRef.value.querySelectorAll('.carousel-item');
    if (items.length > 0) {
      itemWidth.value = items[0].clientWidth;
    }
  }
}

// Carousel functions for mobile
function startDrag(e: MouseEvent | TouchEvent) {
  if (!isMobile.value || !carouselRef.value) return;
  
  isDragging.value = true;
  
  // Handle both mouse and touch events
  if (e instanceof MouseEvent) {
    startX.value = e.pageX;
  } else {
    startX.value = e.touches[0].pageX;
  }
  
  scrollLeft.value = carouselRef.value.scrollLeft;
  carouselRef.value.style.scrollBehavior = 'auto';
  carouselRef.value.style.cursor = 'grabbing';
}

function doDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value || !carouselRef.value) return;
  
  let x;
  if (e instanceof MouseEvent) {
    x = e.pageX;
    e.preventDefault(); // Prevent text selection during drag
  } else {
    x = e.touches[0].pageX;
  }
  
  const walkX = (x - startX.value) * 1.5; // Multiply by factor for faster scrolling
  carouselRef.value.scrollLeft = scrollLeft.value - walkX;
}

function endDrag() {
  if (!carouselRef.value) return;
  
  isDragging.value = false;
  carouselRef.value.style.cursor = 'grab';
  carouselRef.value.style.scrollBehavior = 'smooth';
  
  // Snap to the nearest item
  snapToNearestItem();
}

function snapToNearestItem() {
  if (!carouselRef.value || !itemWidth.value) return;
  
  const scrollPosition = carouselRef.value.scrollLeft;
  
  // Calculate the nearest item index
  const itemIndex = Math.round(scrollPosition / itemWidth.value);
  
  // Scroll to the nearest item
  carouselRef.value.scrollTo({
    left: itemIndex * itemWidth.value,
    behavior: 'smooth'
  });
}

// Navigate to next or previous slide
function navigateCarousel(direction: 'prev' | 'next') {
  if (!carouselRef.value || !itemWidth.value) return;
  
  carouselRef.value.style.scrollBehavior = 'smooth';
  
  // Calculate current approximate index
  const currentIndex = Math.round(carouselRef.value.scrollLeft / itemWidth.value);
  let targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
  
  // Ensure targetIndex is within bounds
  const maxIndex = filteredGames.value.length - 1;
  targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));
  
  carouselRef.value.scrollLeft = targetIndex * itemWidth.value;
}

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  
  // Reset the carousel when screen size changes
  if (isMobile.value) {
    setTimeout(() => {
      resetCarousel();
    }, 100);
  }
}

onMounted(() => {
  if (!games.value.length) {
    refreshGames();
  }
  
  // Add resize event listener
  window.addEventListener('resize', handleResize);
  
  // Initial carousel setup
  resetCarousel();
})

onBeforeUnmount(() => {
  // Remove resize event listener
  window.removeEventListener('resize', handleResize);
})

watch(games, (newGames) => {
  console.log('Games updated:', newGames.length, 'games');
  resetCarousel();
}, { deep: true, flush: 'post' }) // Delay until after DOM updates
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  <div class="section" v-else :class="{ 'mobile-section': isMobile }">
    <!-- Desktop tabs layout -->
    <div v-if="!isMobile" class="tabs">
      <div 
        class="tab-button" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        {{ $t('all_games').toUpperCase() }}
      </div>
      <div 
        class="tab-button" 
        :class="{ active: activeTab === 'downloadable' }"
        @click="activeTab = 'downloadable'"
      >
        {{ $t('downloadable_games').toUpperCase() }}
      </div>
      <div 
        class="tab-button"
        :class="{ active: activeTab === 'web' }"
        @click="activeTab = 'web'"
      >
        {{ $t('web_games').toUpperCase() }}
      </div>
      <div 
        class="tab-button"
        :class="{ active: activeTab === 'dlc' }"
        @click="activeTab = 'dlc'"
      >
        {{ $t('downloadable_content').toUpperCase() }}
      </div>
    </div>
    
    <!-- Mobile layout with active tab on top -->
    <div v-if="isMobile" class="mobile-active-tab">
      <div 
        class="tab-button active mobile-active-tab-button"
        @click="activeTab = activeTab"
      >
        {{ $t(
          activeTab === 'all' ? 'all_games' : 
          activeTab === 'downloadable' ? 'downloadable_games' : 
          activeTab === 'web' ? 'web_games' : 
          'downloadable_content'
        ).toUpperCase() }}
      </div>
    </div>
    
    <!-- Standard grid display for desktop -->
    <div v-if="!isMobile" class="list">
      <GameItem 
        v-for="item in filteredGames" 
        :key="item.game_id" 
        :item="{...item, banner_url: item.banner_url || '', price: item.price as Record<string, number>}" 
      />
    </div>
    
    <!-- Regular Carousel display for mobile (non-infinite) -->
    <div class="mobile-carousel-wrapper" v-else>
      <!-- Navigation arrows - only show if there are enough items -->
      <button 
        class="carousel-control carousel-prev" 
        @click="navigateCarousel('prev')"
        aria-label="Previous"
        v-if="filteredGames.length > 1"
      >
        &#10094;
      </button>
      
      <div 
        ref="carouselRef"
        class="carousel-container"
        @mousedown="startDrag"
        @mousemove="doDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
        @touchstart="startDrag"
        @touchmove="doDrag"
        @touchend="endDrag"
      >
        <div class="carousel-track">
          <div 
            v-for="(item, index) in filteredGames" 
            :key="`${item.game_id}-${index}`"
            class="carousel-item"
          >
            <GameItem 
              :item="{...item, banner_url: item.banner_url || '', price: item.price as Record<string, number>}" 
              class="mobile-game-item"
            />
          </div>
        </div>
      </div>
      
      <button 
        class="carousel-control carousel-next" 
        @click="navigateCarousel('next')"
        aria-label="Next"
        v-if="filteredGames.length > 1"
      >
        &#10095;
      </button>
    </div>
    
    <!-- Mobile stacked inactive tabs below the carousel -->
    <div v-if="isMobile" class="mobile-inactive-tabs">
      <div 
        v-if="activeTab !== 'all'"
        class="tab-button mobile-tab"
        @click="activeTab = 'all'"
      >
        {{ $t('all_games').toUpperCase() }}
      </div>
      <div 
        v-if="activeTab !== 'downloadable'"
        class="tab-button mobile-tab"
        @click="activeTab = 'downloadable'"
      >
        {{ $t('downloadable_games').toUpperCase() }}
      </div>
      <div 
        v-if="activeTab !== 'web'"
        class="tab-button mobile-tab"
        @click="activeTab = 'web'"
      >
        {{ $t('web_games').toUpperCase() }}
      </div>
      <div 
        v-if="activeTab !== 'dlc'"
        class="tab-button mobile-tab"
        @click="activeTab = 'dlc'"
      >
        {{ $t('downloadable_content').toUpperCase() }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading_container {
  height: 400px;
  width: 1200px;
  border-top: 2px solid white;
  margin: auto;
}

.list {
  width: 90%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 20px;
  border-radius: 20px;
  justify-items: center;
}

.mobile-active-tab {
  width: 100%;
  padding: 5px 0;
  margin-bottom: 5px;
}

.mobile-active-tab-button {
  width: 100%;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-radius: 8px;
  margin: 0;
  background-color: var(--boly-button-pink);
  color: white;
  font-size: 1rem;
}

.mobile-inactive-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 5px;
  margin-top: 10px;
}

.mobile-carousel-wrapper {
  position: relative;
  width: 100%;
  padding: 0;
  margin: 5px 0;
  overflow: hidden;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  z-index: 10;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.carousel-control:hover {
  opacity: 1;
}

.carousel-prev {
  left: 5px;
}

.carousel-next {
  right: 5px;
}

.carousel-container {
  width: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none; 
  cursor: grab;
  padding: 10px 0;
  -webkit-overflow-scrolling: touch; 
}

.carousel-container::-webkit-scrollbar {
  display: none; 
}

.carousel-track {
  display: flex;
  padding: 0 10px;
}

.carousel-item {
  flex: 0 0 auto;
  width: 80%; 
  padding: 0 5px;
  scroll-snap-align: center;
  transition: transform 0.3s ease;
}

.tabs{
  padding-top: 40px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 5px;
}

.tab-button{
  flex-grow: .35;
  font-family: "Anton", serif;
  font-size: medium;
  background-color: var(--boly-button-pink);
  padding: 10px;
  transition-duration: .2s;
  border-radius: 5px;
  cursor: pointer;
}

.mobile-tab {
  width: 100%;
  flex-basis: 100%;
  margin-bottom: 4px;
  font-size: small;
  padding: 8px 4px;
  text-align: center;
  background-color: var(--boly-bg-dark-transparent);
}

.tab-button:hover{
  flex-grow: .4;
  background-color: var(--boly-button-pink);
  transition-duration: .2s;
}

.mobile-tab:hover {
  flex-grow: 0;
  transform: scale(1.02);
  background-color: var(--boly-button-pink);
}

.tab-button.active {
  background-color: var(--boly-button-pink);
  color: white;
}

.section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.mobile-section {
  padding: 0.5rem;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.mobile-game-item) {
  width: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
  transform: scale(0.98); 
}

.carousel-item:hover {
  transform: scale(1.02);
  z-index: 1;
}

@media (max-width: 600px) {
  .carousel-item {
    width: 90%;
  }
  
  .carousel-control {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
  
  .mobile-active-tab-button {
    font-size: 0.9rem;
    padding: 8px;
  }
  
  :deep(.mobile-game-item) {
    transform: scale(0.95);
  }
}

@media (max-width: 400px) {
  .carousel-item {
    width: 95%;
  }
  
  .mobile-tab {
    font-size: x-small;
    padding: 6px 2px;
  }
  
  .mobile-active-tab-button {
    font-size: 0.8rem;
    padding: 6px;
  }
  
  .carousel-control {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
  
  :deep(.mobile-game-item) {
    transform: scale(0.9);
  }
}

/* Handle various device heights */
@media (max-height: 750px) {
  .mobile-section {
    padding-top: 0;
  }
  
  :deep(.mobile-main) {
    padding: 4px;
  }
}

/*very short screens */
@media (max-height: 600px) {
  :deep(.mobile-main) {
    gap: 0;
    padding: 3px;
  }
  
  :deep(.mobile-main > img) {
    height: 90px;
  }
  
  .carousel-container {
    padding: 5px 0;
  }
  
  .mobile-active-tab-button {
    padding: 5px;
  }
  
  .mobile-tab {
    padding: 5px 2px;
  }
}

@media (max-width: 360px) and (max-height: 640px) {
  .mobile-tab {
    font-size: 0.6rem;
    padding: 4px 2px;
  }
  
  .mobile-active-tab-button {
    font-size: 0.7rem;
    padding: 4px;
  }
  
  :deep(.mobile-game-item) {
    transform: scale(0.85);
  }
  
  .carousel-control {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>