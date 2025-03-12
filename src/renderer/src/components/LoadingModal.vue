<script setup>
import Loading from '@renderer/components/LoadingIcon.vue'
const props = defineProps(['show'])
</script>

<template>
  <Transition name="loading-modal">
    <div v-if="show" class="loading-modal-mask">
      <div class="loading-modal-container">
        <div class="load-icon">
          <Loading/>
        </div>
        <div class="loading-modal-body">
          <slot name="body"></slot>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style>

.load-icon{
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #0a120bda;
  display: flex;
  transition: opacity 0.3s ease;
}

.loading-modal-container {
  margin: auto;
  padding: 20px 30px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

.loading-modal-header h3 {
  margin-top: 0;
  color: var(--lightGreen);
}

.loading-modal-body {
  font-size: xx-large;
  margin: 20px 0;
  color: var(--light);
  text-align: center;
}

.loading-modal-close-button {
  height: 30px;
  padding: 0 15px;
  margin: 0 5px;
  float: right;
  background-color: transparent;
  color: var(--lightGreen);
  border: var(--lightGreen) solid 1px;
  border-radius: 2px;
}

.loading-modal-close-button:hover{
  color: var(--lightCyan);
  border: var(--lightCyan) solid 1px;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.loading-modal-enter-from {
  opacity: 0;
}

.loading-modal-leave-to {
  opacity: 0;
}

.loading-modal-enter-from .loading-modal-container,
.loading-modal-leave-to .loading-modal-container {
  -webkit-transform: translateY(-15px);
  transform: translateY(-15px);
}
</style>