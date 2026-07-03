<script setup lang="ts">
import SkeletonCard from './SkeletonCard.vue'

withDefaults(
  defineProps<{
    count?: number
    columns?: number
  }>(),
  {
    count: 6,
    columns: 3
  }
)
</script>

<template>
  <div class="skeleton-grid" aria-hidden="true" :style="{ '--skeleton-grid-columns': columns }">
    <SkeletonCard v-for="n in count" :key="n" />
  </div>
</template>

<style scoped>
.skeleton-grid {
  width: 90%;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(var(--skeleton-grid-columns, 3), 1fr);
  gap: 2rem;
  padding: 20px;
  justify-items: center;
}

@media (max-width: 768px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
    width: 100%;
  }
}
</style>
