<script setup>
import ChevronLeft from '@renderer/components/icons/ChevronLeft.vue'
import ChevronRight from '@renderer/components/icons/ChevronRight.vue'
import { inject, onMounted, ref } from 'vue'
import ThumbnailCard from './ThumbnailCard.vue'

const props = defineProps(['data'])
const is_dragging = ref(false)
const selected_image = inject('selected_image')

function OffsetSelected(amount) {
  let current = parseInt(selected_image.value)
  current = (current + amount + props.data.length) % props.data.length
  selected_image.value = current.toString()
  document.location.href = '#' + selected_image.value
}

onMounted(() => {
  let mouseDown = false
  let startX, scrollLeft
  const slider = document.getElementById('simple_carousel_parent')
  console.log(slider)

  const startDragging = (e) => {
    console.log('startDragging')
    slider.style.scrollBehavior = 'auto'
    mouseDown = true
    is_dragging.value = false
    startX = e.pageX - slider.offsetLeft
    scrollLeft = slider.scrollLeft
  }

  const stopDragging = (e) => {
    console.log('stopDragging')
    slider.style.scrollBehavior = 'smooth'
    mouseDown = false
  }

  const move = (e) => {
    e.preventDefault()
    if (!mouseDown) {
      return
    }
    const x = e.pageX - slider.offsetLeft
    const scroll = x - startX
    is_dragging.value = Math.abs(scroll) > 5
    slider.scrollLeft = scrollLeft - scroll
  }

  slider.addEventListener('mousemove', move, false)
  slider.addEventListener('mousedown', startDragging, false)
  slider.addEventListener('mouseup', stopDragging, false)
  slider.addEventListener('mouseleave', stopDragging, false)
})
</script>

<template>
  <div class="carousel">
    <button class="arrow_container arrow_left" @click="OffsetSelected(-1)">
      <ChevronLeft></ChevronLeft>
    </button>
    <div class="container_centerer">
      <div id="simple_carousel_parent" class="images_container">
        <ThumbnailCard
          v-for="item in props.data"
          :key="item.id"
          :item_key="item.id"
          :url="item.url"
          :is_video="item.is_video"
          :is_dragging="is_dragging"
        />
      </div>
    </div>
    <button class="arrow_container arrow_right" @click="OffsetSelected(1)">
      <ChevronRight></ChevronRight>
    </button>
  </div>
</template>

<style scoped>
.carousel {
  width: 100%;
  display: flex;
  background-color: black;
  border-radius: 5px;
}

.container_centerer {
  flex: 1;
  display: flex;
  padding-top: 6px;
  margin-top: -6px;
  height: calc(100% + 6px);
  overflow-x: hidden;
  overflow-y: visible;
  justify-content: start;
}

.images_container {
  padding: 1px 0px;
  padding-top: 6px;
  margin-top: -6px;
  height: calc(100% + 6px);
  display: flex;
  overflow-x: scroll;
  overflow-y: visible;
  scroll-behavior: smooth;
  scrollbar-width: none;
  float: left;
}

.images_container > * {
  margin-left: -2px;
}

.images_container > :first-child {
  margin-left: 0px !important;
}

.arrow_container {
  border: none;
  width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
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
  background-color: black;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}
.arrow_left:hover {
  background-color: rgb(14, 14, 14);
}

.arrow_right {
  background-color: black;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

.arrow_right:hover {
  background-color: rgb(14, 14, 14);
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
