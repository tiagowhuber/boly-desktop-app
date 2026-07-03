<script setup lang="ts">
import SkeletonBase from './SkeletonBase.vue'
</script>

<template>
  <div class="skeleton-detail" aria-hidden="true">
    <SkeletonBase class="skeleton-detail-title" width="40%" height="2.2rem" />
    <div class="skeleton-detail-body">
      <SkeletonBase class="skeleton-detail-media" width="55%" height="380px" radius="12px" />
      <div class="skeleton-detail-side">
        <SkeletonBase width="60%" height="1.6rem" />
        <SkeletonBase height="48px" radius="24px" />
        <SkeletonBase height="48px" radius="24px" />
        <SkeletonBase height="48px" radius="24px" />
      </div>
    </div>
    <div class="skeleton-detail-text">
      <SkeletonBase width="90%" />
      <SkeletonBase width="75%" />
      <SkeletonBase width="85%" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-detail {
  width: 90%;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-detail-body {
  display: flex;
  gap: 2rem;
}

.skeleton-detail-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-detail-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .skeleton-detail-body {
    flex-direction: column;
  }

  /* SkeletonBase sets size via inline style, so override needs !important */
  .skeleton-detail-media {
    width: 100% !important;
    height: 220px !important;
  }
}
</style>
