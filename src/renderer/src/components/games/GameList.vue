<script setup lang="ts">
import GameItem from '@renderer/components/games/GameItem.vue'
import Loading from '@renderer/components/LoadingIcon.vue'
import { useGames } from '@renderer/stores'
import { onMounted, ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const gamesStore = useGames()
const { loading, games } = storeToRefs(gamesStore)

const activeTab = ref('all')

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
        return game.game_type_id === 1;
      case 'web':
        return game.game_type_id === 2;
      case 'dlc':
        return game.game_type_id === 3;
      default:
        return true;
    }
  });
  return result;
});

watch(games, (newGames) => {
  console.log('Games updated:', newGames.length, 'games');
}, { deep: true, flush: 'post' }) // Delay until after DOM updates

onMounted(() => {
  if (!games.value.length) {
    refreshGames()
  }
})
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  <div class="section" v-else>
    <div class="tabs">
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
    <div class="list">
      <GameItem v-for="item in filteredGames" :key="item.game_id" :item="{...item, banner_url: item.banner_url || '', price: item.price as Record<string, number>}" />
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
 display: flex;
 justify-content: flex-start;
 gap: 2rem;
 flex-wrap: wrap;
 padding: 20px;
 border-radius: 20px;
}

.tabs{
  border-top: 2px solid white;
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
  background-color: var(--boly-button-blue);
  padding: 10px;
  transition-duration: .2s;
  border-radius: 5px;
  cursor: pointer;
}

.tab-button:hover{
  flex-grow: .4;
  background-color: var(--boly-button-blue-hover);
  transition-duration: .2s;
}

.tab-button.active {
  background-color: var(--boly-button-blue);
  color: white;
}
</style>
