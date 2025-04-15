<script setup>
import ChevronLeft from '@/components/icons/ChevronLeft.vue'
import ChevronRight from '@/components/icons/ChevronRight.vue'
import XMarkIcon from '@/components/icons/XMarkIcon.vue'
import { inject } from 'vue'

const props = defineProps(['show', 'images'])
const selected = inject('selected_main_image')
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask" @click="$emit('close')">
      <div class="modal-container" v-on:click.stop>
        <img :src="props.images[selected].url" />
        <button class="arrow_container arrow_left" @click="selected = (selected - 1 + props.images.length) % props.images.length">
          <ChevronLeft class="icon"></ChevronLeft>
        </button>
        <button class="arrow_container arrow_right" @click="selected = (selected + 1 + props.images.length) % props.images.length">
          <ChevronRight class="icon"></ChevronRight>
        </button>
        <button class="xmark" @click="$emit('close')">
          <XMarkIcon class="icon"></XMarkIcon>
        </button>
        <!--
        <button class="modal-close-button" @click="$emit('close')">Close</button>
        <button class="modal-confirm-button" @click="$emit('confirm')">Confirm</button>
        -->
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-container {
  max-width: 1200px;
  width: 100%;
  aspect-ratio: 1.7778;

  display: grid;
  grid-template-columns: 10% 80% auto 50px;
  grid-template-rows: 50px calc(100% - 50px);

  background-color: black;
  margin: auto;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

button {
  border: none;
}

.modal-header h3 {
  margin-top: 0;
  color: var(--highlight);
}

.modal-body {
  margin: 20px 0;
}

.modal-confirm-button {
  height: 30px;
  padding: 0 15px;
  margin: 0 5px;
  float: right;
  background-color: var(--highlight);
  color: white;
  border: none;
  border-radius: 2px;
}

.modal-confirm-button:hover {
  transition: 0.2s;
  background-color: var(--highlighthover);
}

.modal-close-button {
  height: 30px;
  padding: 0 15px;
  margin: 0 5px;
  float: right;
  background-color: #242424;
  color: var(--highlight);
  border: var(--highlight) solid 1px;
  border-radius: 2px;
}

.modal-close-button:hover {
  color: var(--highlighthover);
  border: var(--highlight) solid 1px;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: translateY(-15px);
  transform: translateY(-15px);
}

img {
  object-fit: contain;
  height: 100%;
  width: 100%;
  grid-column: 1 / 5;
  grid-row: 1 / 3;
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
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  background: linear-gradient(-90deg, transparent, rgba(0, 0, 0, 0.5));
}
.arrow_left:hover {
  background: linear-gradient(-90deg, transparent, rgba(0, 0, 0, 0.9));
}

.arrow_right {
  grid-column: 3 / 5;
  grid-row: 1 / 3;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.5));
}

.arrow_right:hover {
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.9));
}

.arrow_container:hover svg {
  opacity: 1;
  transition-duration: 0.2s;
}

.on_top {
  grid-column: 3 / 4;
  grid-row: 1;
  display: flex;
  justify-content: end;
}

.xmark {
  grid-column: 4 / 5;
  grid-row: 1;
  z-index: 3;
  opacity: 0.5;
  width: 50px;
  height: 50px;
  background-color: transparent;
  cursor: pointer;
}

.xmark > svg {
  margin: auto;
}

.xmark:hover {
  opacity: 1;
}
</style>
