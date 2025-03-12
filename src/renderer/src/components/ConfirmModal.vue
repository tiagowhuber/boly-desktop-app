<script setup>
const props = defineProps(['show'])
</script>

<template>
  <Transition name="confirm-modal">
    <div v-if="show" class="confirm-modal-mask">
      <div class="confirm-modal-container">
        <div class="confirm-modal-header">
          <slot name="header"></slot>
        </div>

        <div class="confirm-modal-body">
          <slot name="body"></slot>
        </div>

        <div class="confirm-modal-footer">
          <button
              class="confirm-modal-close-button"
              @click="$emit('close')"
            >{{$t('close')}}
          </button><button
              class="confirm-modal-confirm-button"
              @click="$emit('confirm')"
            >{{$t('confirm')}}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.confirm-modal-mask {
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

.confirm-modal-container {
  min-width: 300px;
  margin: auto;
  padding: 20px 30px;
  border: var(--lightGreen) solid 2px;
  background-color: var(--boly-bg-darker);
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.confirm-modal-header h3 {
  text-align: start;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  font-size: xx-large;
}

.confirm-modal-body {
  margin: 20px 0;
  color: var(--light);
}

.confirm-modal-confirm-button {
  height: 30px;
  padding: 0 15px;
  margin: 0 5px;
  float: right;
  background-color: var(--lightGreen);
  color: white;
  border: none;
  border-radius: 2px;
}

.confirm-modal-confirm-button:hover{
  transition: .2s;
  background-color: var(--lightCyan);
}

.confirm-modal-close-button {
  height: 30px;
  padding: 0 15px;
  margin: 0 5px;
  float: right;
  background-color: transparent;
  color: var(--lightGreen);
  border: var(--lightGreen) solid 1px;
  border-radius: 2px;
}

.confirm-modal-close-button:hover{
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

.confirm-modal-enter-from {
  opacity: 0;
}

.confirm-modal-leave-to {
  opacity: 0;
}

.confirm-modal-enter-from .confirm-modal-container,
.confirm-modal-leave-to .confirm-modal-container {
  -webkit-transform: translateY(-15px);
  transform: translateY(-15px);
}
</style>