<script setup lang="ts">
import mainLogo from '@/assets/images/elements/1.webp'
</script>

<template>
  <div>
    <img :src="mainLogo" class="icon" alt="Boly" />
  </div>
</template>

<style scoped>
.icon {
  height: 130px;
  width: auto;
  margin-bottom: 40px;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.25));
  transition: transform 0.2s ease;
}

.icon:hover {
  transform: scale(1.04);
}

@media only screen and (max-width: 768px) {
  .icon {
    height: 80px;
    margin-bottom: 0;
  }
}
</style>
