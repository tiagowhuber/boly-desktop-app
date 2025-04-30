<template>
  <svg class="spinner-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle class="spinner-track" cx="12" cy="12" r="10" stroke-width="2" fill="none" stroke="rgba(255, 255, 255, 0.3)"/>
    <circle class="spinner-circle" cx="12" cy="12" r="10" stroke-width="2" fill="none" stroke="white" stroke-linecap="round" stroke-dasharray="63" stroke-dashoffset="0">
    </circle>
  </svg>
</template>

<style scoped>
.spinner-icon {
  width: 100%;
  height: 100%;
  transform-origin: center;
  animation: rotate 1.5s linear infinite;
}

.spinner-circle {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 63;
  }
  50% {
    stroke-dashoffset: 15;
  }
  100% {
    stroke-dashoffset: 63;
  }
}
</style>
