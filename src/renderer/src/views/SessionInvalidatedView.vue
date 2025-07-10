<script setup lang="ts">
import { useRouter } from 'vue-router'
import WarningPersonIcon from '@/components/icons/WarningPersonIcon.vue'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const closeApp = () => {
  if (window.electron && window.electron.ipcRenderer) {
    // Send close app request to main process
    window.electron.ipcRenderer.invoke('close-app')
  } else {
    // Fallback for web/dev environment
    window.close()
  }
}
</script>

<template>
  <div class="session-invalidated-container">
    <div class="session-invalidated-card">
      <div class="icon-container">
        <WarningPersonIcon class="warning-icon" />
      </div>
      
      <h1 class="title">{{ $t('sessionInvalidated.title') }}</h1>
      <p class="message">{{ $t('sessionInvalidated.message') }}</p>
      
      <div class="actions">
        <button 
          @click="goToLogin" 
          class="primary-button"
        >
          {{ $t('sessionInvalidated.loginButton') }}
        </button>
        
        <button 
          @click="closeApp" 
          class="secondary-button"
        >
          {{ $t('sessionInvalidated.closeButton') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-invalidated-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.session-invalidated-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-container {
  margin-bottom: 24px;
}

.warning-icon {
  width: 64px;
  height: 64px;
  color: #f59e0b;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.3;
}

.message {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 32px;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.primary-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.secondary-button {
  background: transparent;
  color: #6b7280;
  border: 2px solid #d1d5db;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.secondary-button:hover {
  border-color: #9ca3af;
  color: #4b5563;
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .session-invalidated-card {
    padding: 32px 24px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .primary-button,
  .secondary-button {
    width: 100%;
  }
}
</style>
