<script setup lang="ts">
import SkeletonBase from './SkeletonBase.vue'

withDefaults(
  defineProps<{
    rows?: number
    rowHeight?: string
  }>(),
  {
    rows: 4,
    rowHeight: '72px'
  }
)
</script>

<template>
  <div class="skeleton-list" aria-hidden="true">
    <div class="skeleton-list-row" v-for="n in rows" :key="n" :style="{ height: rowHeight }">
      <SkeletonBase :width="rowHeight" :height="rowHeight" radius="10px" />
      <div class="skeleton-list-text">
        <SkeletonBase width="45%" height="1.1rem" />
        <SkeletonBase width="25%" height="0.9rem" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-list {
  width: 90%;
  max-width: 900px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-list-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px;
  box-sizing: content-box;
}

.skeleton-list-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
</style>
