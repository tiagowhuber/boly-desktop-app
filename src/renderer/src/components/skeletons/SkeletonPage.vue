<script setup lang="ts">
import SkeletonBase from './SkeletonBase.vue'
import SkeletonGrid from './SkeletonGrid.vue'
</script>

<template>
  <div class="skeleton-page" aria-hidden="true">
    <SkeletonBase class="skeleton-page-heading" width="30%" height="2rem" />
    <SkeletonGrid :count="6" />
  </div>
</template>

<style scoped>
.skeleton-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 0;
}

@media (max-width: 768px) {
  /* SkeletonBase sets size via inline style, so override needs !important */
  .skeleton-page-heading {
    width: 60% !important;
  }
}
</style>
