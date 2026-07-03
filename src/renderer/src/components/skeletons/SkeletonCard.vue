<script setup lang="ts">
import SkeletonBase from './SkeletonBase.vue'
</script>

<template>
  <div class="skeleton-card" aria-hidden="true">
    <SkeletonBase height="200px" radius="10px" />
    <SkeletonBase width="70%" height="1.2rem" />
    <SkeletonBase width="40%" height="1rem" />
    <div class="skeleton-card-footer">
      <SkeletonBase width="50%" height="1rem" />
      <SkeletonBase width="45px" height="45px" radius="50%" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 13px;
  padding: 10px;
  gap: 0.5rem;
}

.skeleton-card-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 5px;
}

@media (max-width: 768px) {
  .skeleton-card {
    max-width: 100%;
  }
}
</style>
