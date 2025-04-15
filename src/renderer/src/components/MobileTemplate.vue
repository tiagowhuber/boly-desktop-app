<script setup lang="ts">
import { ref } from 'vue'

interface MobileTemplateProps {
  title?: string;
  footer?: boolean;
}

const props = defineProps<MobileTemplateProps>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

function goBack(): void {
  emit('back')
}
</script>

<template>
  <div class="mobile-template">
    <div class="mobile-header" v-if="title">
      <button class="back-button" @click="goBack">
        <span>&#8592;</span>
      </button>
      <h1>{{ title }}</h1>
    </div>
    
    <div class="mobile-content">
      <slot></slot>
    </div>
    
    <div class="mobile-footer" v-if="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.mobile-template {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  min-height: calc(100vh - 80px);
  overflow-x: hidden;
}

.mobile-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--boly-bg-dark-transparent);
  position: sticky;
  top: 0;
  z-index: 5;
}

.mobile-header h1 {
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  font-size: 1.5rem;
  margin: 0;
  flex: 1;
  text-align: center;
}

.back-button {
  background: none;
  border: none;
  color: var(--light);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-content {
  flex: 1;
  padding: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.mobile-footer {
  padding: 1rem;
  background-color: var(--boly-bg-dark-transparent);
}
</style>