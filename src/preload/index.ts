import { contextBridge,ipcRenderer  } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
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
      instalarDesdeZip: (rutaExe, rutaDestion) => ipcRenderer.invoke('instalar-desde-zip', rutaExe, rutaDestion)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  // window.electronAPI = {
  //   seleccionarArchivo: () => ipcRenderer.invoke('seleccionar-archivo'),
  //   seleccionarCarpeta: () => ipcRenderer.invoke('seleccionar-carpeta'),
  //   instalarDesdeZip: (zipPath, destPath) => ipcRenderer.invoke('instalar-desde-zip', zipPath, destPath)
  // }
  
}
