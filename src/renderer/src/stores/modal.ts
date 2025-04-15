import { defineStore } from 'pinia';

const useModal = defineStore('modal', {
  state: () => ({
    isVisible: false,
    title: '',
    message: '',
    // timeout: null as NodeJS.Timeout | null,
    timeout: null as number | null,
  }),
  
  actions: {
    showModal(title: string, message: string, duration = 3000) {
      // Clear any existing timeout
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      
      // Set modal content
      this.title = title;
      this.message = message;
      this.isVisible = true;
      
      // Auto-close after duration
      this.timeout = setTimeout(() => {
        this.hideModal();
      }, duration);
    },
    
    hideModal() {
      this.isVisible = false;
      this.title = '';
      this.message = '';
      
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
    }
  }
});

export default useModal;