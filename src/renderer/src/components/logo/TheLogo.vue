<script setup>
import BoliIcon from '../icons/BoliIcon.vue'
</script>

<template>
  <div>
    <BoliIcon class="icon"/>
  </div>
</template>

<style scoped>

.icon {
  fill: var(--light);
  height: 85px;
  margin-left: -30px;
}

.icon:hover{
  fill: var(--lightCyan);
  transition-duration: .2s;
}
</style>
