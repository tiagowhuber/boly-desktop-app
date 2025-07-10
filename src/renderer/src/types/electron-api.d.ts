// filepath: c:\Users\tiago\Documents\BolyDesk0\Boly\src\renderer\src\types\electron-api.d.ts
/**
 * Type definitions for Electron API
 */
interface ElectronAPIExtended {
  seleccionarArchivo: () => Promise<string>;
  seleccionarCarpeta: () => Promise<string>;
  instalarDesdeZip: (rutaExe: string, rutaDestino: string) => Promise<boolean>;
  playGame: (appData: { game_id: number; appPath: string; token: string }) => Promise<{success?: boolean, pid?: number, error?: string}>;
  uninstallGame: (appData: {game_id: number, uninstallerPath: string}) => Promise<{success: boolean, message?: string, error?: string}>;
  isGameRunning: (gameId: number) => Promise<boolean>;
  downloadGame: (appData: { game_id: number; token: string; gameName: string }) => Promise<void>;
  searchExeFiles: (baseDir?: string) => Promise<{ files?: string[]; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  resolveGoogleLogin: () => Promise<void>;
  updateMessage: (callback: (message: string) => void) => void;
  checkUpdates: () => Promise<string>;
  getVersion: () => Promise<string>;
  
  // Download event listeners
  onDownloadStarted: (callback: (data: { gameId: number; gameName: string }) => void) => void;
  onDownloadProgress: (callback: (data: { gameId: number; progress: number; downloaded: number; total: number }) => void) => void;
  onDownloadComplete: (callback: (data: { gameId: number; installPath: string }) => void) => void;
  onDownloadError: (callback: (data: { gameId: number; error: string }) => void) => void;
  onInstallStarted: (callback: (data: { gameId: number; installPath: string }) => void) => void;
  onInstallError: (callback: (data: { gameId: number; error: string }) => void) => void;
  onInstallComplete: (callback: (data: { gameId: number; installPath: string }) => void) => void;
  onGameStarted: (callback: (data: { gameId: number; pid: number }) => void) => void;
  onGameStopped: (callback: (data: { gameId: number }) => void) => void;
  
  // Cleanup listeners
  removeAllListeners: (channel: string) => void;
}

interface Window {
  electronAPI: ElectronAPIExtended;
}
