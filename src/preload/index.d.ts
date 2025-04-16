import { ElectronAPI } from '@electron-toolkit/preload'

interface ElectronAPIExtended {
  seleccionarArchivo: () => Promise<string>;
  seleccionarCarpeta: () => Promise<string>;
  instalarDesdeZip: (rutaExe: string, rutaDestion: string) => Promise<any>;
  playGame: (appData: any) => Promise<any>;
  searchExeFiles: (baseDir?: string) => Promise<{files?: string[], error?: string}>;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: ElectronAPIExtended
  }
}
