<script setup>
import BoliLogo from '../icons/BoliLogo.vue'
</script>

<template>
  <div>
    <BoliLogo class="icon"/>
  </div>
</template>

<style scoped>
.icon {
  fill: var(--light);
  height: 180px;
  margin-left: -40px;
  margin-bottom: 50px;
}

.icon:hover{
  fill: var(--lightCyan);
  transition-duration: .2s;
}

@media only screen and (max-width: 768px) {
  .icon {
    height: 100px;
    margin-left: 0;
    margin-bottom: 0;
  }
}
</style>
