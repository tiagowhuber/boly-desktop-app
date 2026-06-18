<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isMaximized = ref(false)

function minimize(): void {
  window.electronAPI.windowMinimize()
}

async function toggleMaximize(): Promise<void> {
  isMaximized.value = await window.electronAPI.windowMaximizeToggle()
}

function close(): void {
  window.electronAPI.windowClose()
}

onMounted(async () => {
  isMaximized.value = await window.electronAPI.windowIsMaximized()
  // Keep the icon in sync when the window is maximized/restored by other means
  // (double-click, snap, OS shortcuts).
  window.electronAPI.onWindowMaximized((value) => {
    isMaximized.value = value
  })
})
</script>

<template>
  <!-- Full-width draggable title region; only the buttons opt out of dragging -->
  <div class="title-bar">
    <div class="window-controls">
      <button class="ctrl minimize" :title="'Minimize'" @click="minimize">
        <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
          <rect x="1" y="5" width="9" height="1.2" fill="currentColor" />
        </svg>
      </button>
      <button
        class="ctrl maximize"
        :title="isMaximized ? 'Restore' : 'Maximize'"
        @click="toggleMaximize"
      >
        <svg v-if="!isMaximized" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
          <rect
            x="1.5"
            y="1.5"
            width="8"
            height="8"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
          />
        </svg>
        <svg v-else width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
          <rect
            x="1.5"
            y="3"
            width="6.5"
            height="6.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.2"
          />
          <path d="M3.5 3 V1.5 H9.5 V7.5 H8" fill="none" stroke="currentColor" stroke-width="1.2" />
        </svg>
      </button>
      <button class="ctrl close" :title="'Close'" @click="close">
        <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
          <path
            d="M1.5 1.5 L9.5 9.5 M9.5 1.5 L1.5 9.5"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 36px;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  z-index: 2000;
  /* Transparent strip across the top that drags the window.
     It only covers the navbar's empty top padding, so it blocks no nav clicks. */
  -webkit-app-region: drag;
}

.window-controls {
  display: flex;
  align-items: stretch;
  height: 100%;
  /* The buttons themselves must stay clickable, not draggable */
  -webkit-app-region: no-drag;
}

.ctrl {
  width: 44px;
  height: 100%;
  border: none;
  background: transparent;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
  /* slight drop-shadow so icons stay legible over any background */
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
}

.ctrl:hover {
  background-color: rgba(255, 255, 255, 0.18);
}

.ctrl.close:hover {
  background-color: #e53935;
  color: #ffffff;
}

.ctrl:active {
  background-color: rgba(255, 255, 255, 0.28);
}

.ctrl.close:active {
  background-color: #c62828;
}
</style>
