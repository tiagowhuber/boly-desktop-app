<script setup lang="ts"></script>

<template>
  <div class="loading_container">
    <div class="loader"></div>
    <div class="loader2"></div>
  </div>
</template>

<style>
/* From Uiverse.io by Fernando-sv */
.loader {
  border: 8px solid var(--lightGreen);
  border-left-color: transparent;
  border-top-color: transparent;
  border-radius: 50%;
  width: 54px;
  height: 54px;
  animation: spin89345 1s reverse linear infinite;
}

.loading_container{
  position: relative;
  width: 100%;
  height: 100%;
}

@keyframes spin89345 {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}


.loader2 {
  position: absolute;
  border: 8px solid var(--boly-button-purple);
  border-left-color: transparent;
  border-top-color: transparent;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin89345 2s linear infinite;
}

@keyframes spin89345 {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>