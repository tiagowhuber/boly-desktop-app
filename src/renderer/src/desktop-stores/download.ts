import { defineStore } from 'pinia';
import { ref } from 'vue';

const useDownloadStore = defineStore('download', () => {
  const isDownloading = ref(false);
  const downloadProgress = ref(0);
  const downloadingGameName = ref('');
  const downloadingGameId = ref(0);
  
  function setupDownloadListeners() {
    // Clear any existing listeners first
    cleanupDownloadListeners();
    
    window.electronAPI.onDownloadStarted((data) => {
      console.log('Download started:', data);
      isDownloading.value = true;
      downloadProgress.value = 0;
      downloadingGameId.value = data.gameId;
      downloadingGameName.value = data.gameName;
    });

    window.electronAPI.onDownloadProgress((data) => {
      if (data.gameId === downloadingGameId.value) {
        downloadProgress.value = data.progress;
      }
    });

    window.electronAPI.onDownloadComplete((data) => {
      console.log('Download complete:', data);
      if (data.gameId === downloadingGameId.value) {
        setTimeout(() => {
          isDownloading.value = false;
        }, 2000);
      }
    });

    window.electronAPI.onDownloadError((data) => {
      console.error('Download error:', data);
      if (data.gameId === downloadingGameId.value) {
        setTimeout(() => {
          isDownloading.value = false;
        }, 5000);
      }
    });
  }

  function cleanupDownloadListeners() {
    try {
      window.electronAPI.removeAllListeners('download-started');
      window.electronAPI.removeAllListeners('download-progress');
      window.electronAPI.removeAllListeners('download-complete');
      window.electronAPI.removeAllListeners('download-error');
    } catch (error) {
      console.error('Error cleaning up download listeners:', error);
    }
  }

  return {
    isDownloading,
    downloadProgress,
    downloadingGameName,
    downloadingGameId,
    setupDownloadListeners,
    cleanupDownloadListeners
  };
});

export default useDownloadStore;