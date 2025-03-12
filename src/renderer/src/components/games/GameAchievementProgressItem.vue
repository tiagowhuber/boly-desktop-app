<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const i18n = useI18n();

const props = defineProps({
  item: Object,
});

// Compute progress as a percentage for the progress bar
const progressPercentage = computed(() => {
  return Math.min((props.item.userProgress.progress / props.item.unlock_requirement) * 100, 100);
});

const isUnlocked = computed(()=> {
  return props.item.userProgress.progress >= props.item.unlock_requirement;
})
</script>

<template>
  <div class="achievement">
    <div v-if="!props.item.secret || isUnlocked">
      <h3>{{ props.item.name[i18n.locale.value] }}</h3>
      <p>{{ props.item.description[i18n.locale.value] }}</p>
    </div>
    <div v-else>
      <h3>{{ $t('ach_secret_title') }}</h3>
      <p>{{ $t('ach_secret_subtitle') }}</p>
    </div>
    
    <div v-if="!props.item.secret || isUnlocked" class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
    </div>
    <div class="progress-text">
      <p v-if="props.item.type == 'PROGRESS'">{{ props.item.userProgress.progress }} / {{ !props.item.secret? props.item.unlock_requirement : '?' }}</p>
      <p v-if="isUnlocked">{{ $t('ach_achievement_unlocked')}}</p>
    </div>
  </div>
</template>

<style scoped>
h3{
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
}

.achievement {
  margin-bottom: 20px;
  text-align: left;
}

.progress-bar-container {
  width: 100%;
  background-color: #dcdbd5;
  border-radius: 10px;
  overflow: hidden;
  height: 5px;
  margin: 10px 0;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s;
}

.progress-text{
  display: flex;
  flex-direction: row;
  gap: 2rem;
  color: #4caf50;
}

</style>
