<script setup>
import { inject, onMounted } from 'vue'
import PlayIcon from '../icons/PlayIcon.vue'

const selected = inject('selected_image')

const props = defineProps(['item_key', 'url', 'is_video', 'is_dragging'])
const href_path = '#' + props.item_key

function setDisplayData() {
  if (props.is_dragging == true) return
  selected.value = props.item_key
  document.location.href = href_path
}

onMounted(() => {
  const video = document.getElementsByClassName('video_player')[0]
  if (!video) return
  video.currentTime = 15
  console.log('video.currentTime ' + video.currentTime)
})
</script>

<template>
  <div
    :id="props.item_key"
    class="thumbnail_container"
    :class="{ active: selected === props.item_key, inactive: selected !== props.item_key }"
    @click="setDisplayData"
  >
    <img :src="props.url" v-if="!props.is_video" />
    <video class="video_player" v-else>
      <source :src="props.url" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <PlayIcon class="play_icon" v-if="props.is_video" />
    <div class="tip" v-if="selected === props.item_key"></div>
  </div>
</template>

<style scoped>
.thumbnail_container {
  transition-duration: 0s;
  height: 100%;
  padding: 3px;

  display: grid !important;
  grid-template-columns: 100%;
  grid-template-rows: 100%;

  cursor: pointer;
  user-select: none;
  -webkit-user-drag: none;
}

img,
video {
  user-select: none;
  -webkit-user-drag: none;
  object-fit: cover;

  grid-column: 1 / 2;
  grid-row: 1 / 2;
  height: 100%;
}

.play_icon {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  margin: auto;
  height: 24px;
  fill: var(--light);
  z-index: 1;
}

.active {
  transition-duration: 0s;
  padding: 1px;
  border: solid 2px var(--light);
}

.active > img,
.active > video {
  filter: brightness(1.1);
}

.inactive > img,
.inactive > video {
  filter: brightness(0.75);
}

img:hover,
video:hover {
  filter: brightness(1.1);
}

.tip {
  margin: -15px auto 0 auto;
  width: 0;
  height: 0;
  z-index: 2;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  border: solid 6px transparent;
  border-bottom: solid 6px var(--light);
}
</style>
