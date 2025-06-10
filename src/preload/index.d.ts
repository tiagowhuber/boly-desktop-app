import { ElectronAPI } from '@electron-toolkit/preload'

interface ElectronAPIExtended {
  seleccionarArchivo: () => Promise<string>;
  seleccionarCarpeta: () => Promise<string>;
  instalarDesdeZip: (rutaExe: string, rutaDestion: string) => Promise<any>;
  playGame: (appData: any) => Promise<any>;
  downloadGame: (appData: {game_id: number, token: string, gameName: string}) => Promise<any>;
  uninstallGame: (appData: {game_id: number, uninstallerPath: string}) => Promise<{success: boolean, message?: string, error?: string}>;
  searchExeFiles: (baseDir?: string) => Promise<{files?: string[], error?: string}>;
  loginWithGoogle: () => Promise<void>;
  resolveGoogleLogin: () => Promise<void>;
  apiRequest: (options: {
    method: string;
    path: string;
    data?: any;
    headers?: Record<string, string>;
  }) => Promise<any>;
  onDeepLinkUrl: (callback: (url: string) => void) => void;
  updateMessage: (callback: (message: string) => void) => void;
  // this was added recently...
  checkUpdates: () => Promise<string>;
  getVersion: () => Promise<string>;
  onDownloadStarted: (callback: (data: any) => void) => void;
  onDownloadProgress: (callback: (data: any) => void) => void;
  onDownloadComplete: (callback: (data: any) => void) => void;
  onDownloadError: (callback: (data: any) => void) => void;
  onInstallStarted: (callback: (data: any) => void) => void;
  onInstallError: (callback: (data: any) => void) => void;
  onInstallComplete: (callback: (data: any) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: ElectronAPIExtended
  }
}
