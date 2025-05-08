import { ElectronAPI } from '@electron-toolkit/preload'

interface ElectronAPIExtended {
  seleccionarArchivo: () => Promise<string>;
  seleccionarCarpeta: () => Promise<string>;
  instalarDesdeZip: (rutaExe: string, rutaDestion: string) => Promise<any>;
  playGame: (appData: any) => Promise<any>;
  downloadGame: (appData: {game_id: number, token: string, gameName: string}) => Promise<any>;
  searchExeFiles: (baseDir?: string) => Promise<{files?: string[], error?: string}>;
  loginWithGoogle: () => Promise<void>;
  resolveGoogleLogin: () => Promise<void>;  // API request handler for custom protocol
  apiRequest: (options: {
    method: string;
    path: string;
    data?: any;
    headers?: Record<string, string>;
  }) => Promise<any>;  onDeepLinkUrl: (callback: (url: string) => void) => void;
  updateMessage: (callback: (message: string) => void) => void;
  checkUpdates: (callback: (message: string) => void) => void;
  getVersion: (callback: (version: string) => void) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: ElectronAPIExtended
  }
}
