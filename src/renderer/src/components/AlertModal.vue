<script setup>
const props = defineProps(['show'])
</script>

<template>
  <Transition name="alert-modal">
    <div v-if="show" class="alert-modal-mask">
      <div class="alert-modal-container">
        <div class="alert-modal-header">
          <slot name="header"></slot>
        </div>

        <div class="alert-modal-body">
          <slot name="body"></slot>
        </div>

        <div class="alert-modal-footer">
          <button
              class="alert-modal-close-button"
              @click="$emit('close')"
            >{{$t('close')}}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.alert-modal-mask {
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

.alert-modal-container {
  width: 300px;
  margin: auto;
  padding: 20px 30px;
  border: var(--lightGreen) solid 2px;
  background-color: var(--boly-bg-darker);
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.alert-modal-header h3 {
  text-align: start;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  font-size: xx-large;
}

.alert-modal-body {
  margin: 20px 0;
  color: var(--light);
}

.alert-modal-close-button {
  height: 30px;
  padding: 0 15px;
  margin: 0 5px;
  float: right;
  background-color: transparent;
  color: var(--lightGreen);
  border: var(--lightGreen) solid 1px;
  border-radius: 2px;
}

.alert-modal-close-button:hover{
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

.alert-modal-enter-from {
  opacity: 0;
}

.alert-modal-leave-to {
  opacity: 0;
}

.alert-modal-enter-from .alert-modal-container,
.alert-modal-leave-to .alert-modal-container {
  -webkit-transform: translateY(-15px);
  transform: translateY(-15px);
}
</style>