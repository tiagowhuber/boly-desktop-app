// filepath: c:\Users\tiago\Documents\BolyDesk0\Boly\src\renderer\src\types\electron-api.d.ts
/**
 * Type definitions for Electron API
 */
interface ElectronAPIExtended {
  seleccionarArchivo: () => Promise<string>;
  seleccionarCarpeta: () => Promise<string>;
  instalarDesdeZip: (rutaExe: string, rutaDestino: string) => Promise<boolean>;
  playGame: (appData: { game_id: number; appPath: string; token: string }) => Promise<void>;
  downloadGame: (appData: { game_id: number; token: string; gameName: string }) => Promise<void>;
  searchExeFiles: (baseDir?: string) => Promise<{ files?: string[]; error?: string }>;
  
  // Download event listeners
  onDownloadStarted: (callback: (data: { gameId: number; gameName: string }) => void) => void;
  onDownloadProgress: (callback: (data: { gameId: number; progress: number; downloaded: number; total: number }) => void) => void;
  onDownloadComplete: (callback: (data: { gameId: number; installPath: string }) => void) => void;
  onDownloadError: (callback: (data: { gameId: number; error: string }) => void) => void;
  onInstallStarted: (callback: (data: { gameId: number; installPath: string }) => void) => void;
  onInstallError: (callback: (data: { gameId: number; error: string }) => void) => void;
  onInstallComplete: (callback: (data: { gameId: number; installPath: string }) => void) => void;
  
  // Cleanup listeners
  removeAllListeners: (channel: string) => void;
}

interface Window {
  electronAPI: ElectronAPIExtended;
}
