<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
  message: string
  type?: 'success' | 'error'
  actionLabel?: string
}>()

const emit = defineEmits<{
  close: []
  action: []
}>()

let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.show,
  (val) => {
    if (timer) clearTimeout(timer)
    if (val) {
      timer = setTimeout(() => emit('close'), 5000)
    }
  }
)

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="show" class="toast" :class="type === 'error' ? 'toast-error' : 'toast-success'">
        <span class="toast-message">{{ message }}</span>
        <div class="toast-actions">
          <button v-if="actionLabel" class="toast-action-btn" @click="emit('action')">
            {{ actionLabel }}
          </button>
          <button class="toast-close-btn" @click="emit('close')">✕</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 8px;
  padding: 14px 16px;
  min-width: 280px;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.toast-success {
  background-color: #1e3a2f;
  border: 1px solid #2ecc71;
  border-left: 4px solid #2ecc71;
}

.toast-error {
  background-color: #3a1e1e;
  border: 1px solid #e74c3c;
  border-left: 4px solid #e74c3c;
}

.toast-message {
  flex: 1;
  font-size: 0.95rem;
}

.toast-success .toast-message {
  color: #e8f8ee;
}

.toast-error .toast-message {
  color: #f8e8e8;
}

.toast-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.toast-action-btn {
  background-color: #2ecc71;
  color: #0d1f16;
  border: none;
  border-radius: 5px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Anton', Impact, sans-serif;
  letter-spacing: 0.5px;
}

.toast-action-btn:hover {
  background-color: #27ae60;
}

.toast-close-btn {
  background: transparent;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
}

.toast-success .toast-close-btn {
  color: #7ecfa0;
}

.toast-success .toast-close-btn:hover {
  color: #e8f8ee;
}

.toast-error .toast-close-btn {
  color: #cf7e7e;
}

.toast-error .toast-close-btn:hover {
  color: #f8e8e8;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
