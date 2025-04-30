import { defineStore } from 'pinia';
import { ref } from 'vue';

const useDownloadStore = defineStore('download', () => {
  const isDownloading = ref(false);
  const downloadProgress = ref(0);
  const downloadingGameName = ref('');
  const downloadingGameId = ref(0);
  const isInstalling = ref(false);
  
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

    window.electronAPI.onInstallStarted((data) => {
      console.log('Install started:', data);
      isInstalling.value = false;
    });

    window.electronAPI.onInstallError((data) => {
      console.error('Install error:', data);
      isInstalling.value = false;
    });

    window.electronAPI.onInstallComplete((data) => {
      console.log('Install complete:', data);
      isInstalling.value = true;
    });
  }

  function cleanupDownloadListeners() {
    try {
      window.electronAPI.removeAllListeners('download-started');
      window.electronAPI.removeAllListeners('download-progress');
      window.electronAPI.removeAllListeners('download-complete');
      window.electronAPI.removeAllListeners('download-error');
      window.electronAPI.removeAllListeners('install-started');
      window.electronAPI.removeAllListeners('install-error');
      window.electronAPI.removeAllListeners('install-complete');
    } catch (error) {
      console.error('Error cleaning up download listeners:', error);
    }
  }

  return {
    isDownloading,
    downloadProgress,
    downloadingGameName,
    downloadingGameId,
    isInstalling,
    setupDownloadListeners,
    cleanupDownloadListeners
  };
});

export default useDownloadStore;