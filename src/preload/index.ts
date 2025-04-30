import { contextBridge,ipcRenderer  } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
//import { on } from 'events';
// @ts-ignore (define in dts)
window.ipcRenderer = require('electron').ipcRenderer;

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
console.log("contextIsolated: "+process.contextIsolated)
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)   
    contextBridge.exposeInMainWorld('electronAPI', {
      seleccionarArchivo: () => ipcRenderer.invoke('seleccionar-archivo'),
      seleccionarCarpeta: () => ipcRenderer.invoke('seleccionar-carpeta'),
      instalarDesdeZip: (rutaExe, rutaDestion) => ipcRenderer.invoke('instalar-desde-zip', rutaExe, rutaDestion),
      playGame:(appData) => ipcRenderer.invoke('play-game', appData),
      downloadGame:(appData) => ipcRenderer.invoke('download-game', appData),
      searchExeFiles: (baseDir) => ipcRenderer.invoke('search-exe-files', baseDir),
      // Download event listeners
      onDownloadStarted: (callback) => {
        ipcRenderer.on('download-started', (_event, ...args) => callback(...args));
      },
      onDownloadProgress: (callback) => {
        ipcRenderer.on('download-progress', (_event, ...args) => callback(...args));
      },
      onDownloadComplete: (callback) => {
        ipcRenderer.on('download-complete', (_event, ...args) => callback(...args));
      },
      onDownloadError: (callback) => {
        ipcRenderer.on('download-error', (_event, ...args) => callback(...args));
      },
      onInstallStarted: (callback) => {
        ipcRenderer.on('install-started', (_event, ...args) => callback(...args));
      },
      onInstallError: (callback) => {
        ipcRenderer.on('install-error', (_event, ...args) => callback(...args));
      },
      onInstallComplete: (callback) => {
        ipcRenderer.on('install-complete', (_event, ...args) => callback(...args));
      },
      // Cleanup
      removeAllListeners: (channel) => {
        if (['download-started', 'download-progress', 'download-complete', 'download-error', 'install-started', 'install-error', 'install-complete'].includes(channel)) {
          ipcRenderer.removeAllListeners(channel);
        }
      }
    });
  } catch (error) {
    console.error(error)
  }
} else {
    // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.electronAPI = {
    seleccionarArchivo: () => ipcRenderer.invoke('seleccionar-archivo'),
    seleccionarCarpeta: () => ipcRenderer.invoke('seleccionar-carpeta'),
    instalarDesdeZip: (rutaExe, rutaDestion) => ipcRenderer.invoke('instalar-desde-zip', rutaExe, rutaDestion),
    playGame: (appData) => ipcRenderer.invoke('play-game', appData),
    downloadGame:(appData) => ipcRenderer.invoke('download-game', appData),
    searchExeFiles: (baseDir) => ipcRenderer.invoke('search-exe-files', baseDir),
    // Download event listeners
    onDownloadStarted: (callback) => {
      ipcRenderer.on('download-started', (_event, ...args) => callback(...args));
    },
    onDownloadProgress: (callback) => {
      ipcRenderer.on('download-progress', (_event, ...args) => callback(...args));
    },
    onDownloadComplete: (callback) => {
      ipcRenderer.on('download-complete', (_event, ...args) => callback(...args));
    },
    onDownloadError: (callback) => {
      ipcRenderer.on('download-error', (_event, ...args) => callback(...args));
    },
    onInstallStarted: (callback) => {
      ipcRenderer.on('install-started', (_event, ...args) => callback(...args));
    },
    onInstallError: (callback) => {
      ipcRenderer.on('install-error', (_event, ...args) => callback(...args));
    },
    onInstallComplete: (callback) => {
      ipcRenderer.on('install-complete', (_event, ...args) => callback(...args));
    },
    // Cleanup
    removeAllListeners: (channel) => {
      if (['download-started', 'download-progress', 'download-complete', 'download-error', 'install-started', 'install-error', 'install-complete'].includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    }
  }
  
}
