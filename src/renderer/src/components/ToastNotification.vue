<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
  message: string
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
      <div v-if="show" class="toast">
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
  background-color: #1e3a2f;
  border: 1px solid #2ecc71;
  border-left: 4px solid #2ecc71;
  border-radius: 8px;
  padding: 14px 16px;
  min-width: 280px;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.toast-message {
  flex: 1;
  color: #e8f8ee;
  font-size: 0.95rem;
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
  color: #7ecfa0;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
}

.toast-close-btn:hover {
  color: #e8f8ee;
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
