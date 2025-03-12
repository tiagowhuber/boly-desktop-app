<script setup></script>

<template>
    <div class="loader"></div>
</template>

<style>
.loader {
  border: 5px solid var(--lightGreen);
  border-left-color: transparent;
  border-top-color: transparent;
  border-radius: 50%;
  width: 30px;
  height: 30px;
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
</style>