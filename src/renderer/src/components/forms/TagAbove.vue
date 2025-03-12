<script setup>
// const props = defineProps(['tag'])
</script>

<template>
  <div>
    <p class="text">
      <slot></slot>
    </p>
    <slot name="child"></slot>
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
}

p {
  text-align: start;
}
</style>
