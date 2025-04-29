<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';

const props = defineProps<{
  progress: number;
  gameName: string;
  isVisible: boolean;
}>();

const progressWidth = computed(() => {
  return `${props.progress}%`;
});

const formattedProgress = computed(() => {
  return props.progress.toFixed(1);
});

const animatedProgress = ref(0);
const isRendered = ref(false);
const shouldShow = ref(props.isVisible);

let hideTimeout: number | null = null;

watch(() => props.progress, (newValue) => {
  requestAnimationFrame(() => {
    animatedProgress.value = newValue;
  });
}, { immediate: true });

watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    if (hideTimeout !== null) {
      window.clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    shouldShow.value = true;
    setTimeout(() => {
      isRendered.value = true;
    }, 10);
  } else {
    isRendered.value = false;
    hideTimeout = window.setTimeout(() => {
      shouldShow.value = false;
      hideTimeout = null;
    }, 300); 
  }
}, { immediate: true });

onBeforeUnmount(() => {
  if (hideTimeout !== null) {
    window.clearTimeout(hideTimeout);
  }
});
</script>

<template>
  <div v-if="shouldShow" :class="['download-progress-bar', { 'is-visible': isRendered }]">
    <div class="download-info">
      <span class="game-name">{{ $t('downloading') }}: {{ gameName }}</span>
      <span class="percentage">{{ formattedProgress }}%</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progressWidth }"></div>
    </div>
  </div>
</template>

<style scoped>
.download-progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(20, 20, 30, 0.85);
  z-index: 9999;
  padding: 8px 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  pointer-events: none; 
  backdrop-filter: blur(5px); 
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.download-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.85rem;
  color: var(--color-text-light, #eee);
}

.game-name {
  font-weight: 500;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.percentage {
  font-weight: 600;
}

.progress-bar-container {
  height: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, var(--color-primary, #8c52ff) 0%, var(--color-secondary, #5e17eb) 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(140, 82, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>