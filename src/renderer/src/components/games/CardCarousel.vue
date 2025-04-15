<script setup>
import ChevronLeft from '@/components/icons/ChevronLeft.vue'
import ChevronRight from '@/components/icons/ChevronRight.vue'
</script>

<template>
  <div class="images_carousel">
    <div class="images_container">
      <div><img src="https://pbs.twimg.com/media/GM_h4kfWIAA6ZAB?format=jpg&name=small" /></div>
      <div><img src="https://pbs.twimg.com/media/Fsb7WvxWwAIptcP?format=jpg&name=small" /></div>
      <div><img src="https://pbs.twimg.com/media/GEY2MSjWcAAJJXH?format=jpg&name=small" /></div>
    </div>
    <div class="arrow_container arrow_left"><ChevronLeft></ChevronLeft></div>
    <div class="arrow_container arrow_right"><ChevronRight></ChevronRight></div>
    <div class="dots_container">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  </div>
</template>

<style scoped>
.images_carousel {
  display: grid;
  grid-template-columns: repeat(9, 11%);
  grid-template-rows: repeat(4, 25%);
}

.images_carousel > * {
  grid-column: 1 / 10;
  grid-row: 1 / 5;
}

.images_container {
  width: 100%;
  height: 100%;
  display: flex;
  gap: 1rem;
}

.images_container > div {
  flex: 1;
}

.images_container > div > img {
  border-radius: 5px;
}

.images_container > div:hover > img {
  filter: brightness(1.1);
}

.images_container > div:not(:hover) > img {
  filter: brightness(0.75);
}

.images_container img {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  object-fit: cover;
}

.arrow_left {
  z-index: 1;
  grid-column: 1 / 2;
  grid-row: 1 / 5;
}

.arrow_right {
  z-index: 1;
  grid-column: 9 / 10;
  grid-row: 1 / 5;
}

.arrow_container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.arrow_container svg {
  height: 24px;
  width: 24px;
  fill: var(--light);
  opacity: 0.5;
  transition-duration: 0.2s;
}

.arrow_container:hover {
  cursor: pointer;
}

.arrow_left {
  background: linear-gradient(-90deg, transparent, rgba(0, 0, 0, 0.5));
}
.arrow_left:hover {
  background: linear-gradient(-90deg, transparent, rgba(0, 0, 0, 0.9));
}

.arrow_right {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.5));
}

.arrow_right:hover {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.9));
}

.arrow_container:hover svg {
  opacity: 1;
  transition-duration: 0.2s;
}

.dots_container {
  z-index: 1;
  margin: auto;
  grid-row: 4 / 5;
  display: flex;
  gap: 8px;
}

.dots_container > div {
  border-radius: 8px;
  width: 11px;
  height: 11px;
  background-color: var(--light);
  opacity: 0.25;
}

.dots_container > div:hover {
  background-color: var(--light);
  opacity: 1;
}
</style>
