import { ElectronAPI } from '@electron-toolkit/preload'

interface ElectronAPIExtended {
  seleccionarArchivo: () => Promise<string>;
  seleccionarCarpeta: () => Promise<string>;
  instalarDesdeZip: (rutaExe: string, rutaDestion: string) => Promise<any>;
  playGame: (appData: any) => Promise<any>;
  downloadGame: (appData: {game_id: int, token: string, gameName: string}) => Promise<any>;
  searchExeFiles: (baseDir?: string) => Promise<{files?: string[], error?: string}>;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: ElectronAPIExtended
  }
}
