import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const { spawn } = require('child_process')
const fs = require('fs')
const { exec } = require('child_process')
import icon from '../../resources/icon.png?asset'
import axios from 'axios'
require('dotenv').config();
const { autoUpdater } = require('electron-updater');

// Configure auto updater
autoUpdater.autoDownload = false; 
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.logger = console;
autoUpdater.allowPrerelease = false;
//autoUpdater.forceDevUpdateConfig = true;
autoUpdater.requestHeaders = {
  'User-Agent': 'Boly-Desktop-App'
};
// token should use the environment variable but for some reason when building it doesnt work
// the token is read only so it should be safe to use it like this, fuck it
autoUpdater.setFeedURL({
     provider: 'github',
     repo: 'boly-desktop-app',
     owner: 'tiagowhuber',
     private: true,
     //token: process.env.GH_TOKEN
     token: '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'
   })


const config = {
  //@ts-ignore
  client_id: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID,
  // clientSecret: import.meta.env.VITE_APP_GOOGLE_CLIENT_SECRET,
  // authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  // tokenUrl: 'https://oauth2.googleapis.com/token',
  // useBasicAuthorizationHeader: false,
  redirect_uri: 'http://localhost:5173/post-google-login',
  response_type:"code",
  scope:"email profile",
  //@ts-ignore
  code_challenge:import.meta.env.VITE_APP_GOOGLE_CODE,
  state:""
}



let mainWindow

async function requestLoginGoogle(){
  const queryString = new URLSearchParams(config).toString();
  mainWindow.loadURL(`https://accounts.google.com/o/oauth2/v2/auth?${queryString}`);
}

// Register both protocols: boly-app for deep linking and boly for API requests
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('boly-app', process.execPath, [path.resolve(process.argv[1])])
    app.setAsDefaultProtocolClient('boly', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('boly-app')
  app.setAsDefaultProtocolClient('boly')
}

async function downloadTempFile(token: string, game_id: number, gameName: string) {
  const req = { token, game_id, is_web: false };
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-started', { 
        gameId: game_id,
        gameName: gameName
      });
    }

    //Solicitar url a api
    // @ts-ignore
    const apiBaseUrl = import.meta.env.VITE_APP_API_URL;
    const responseUrl = await axios.post(`${apiBaseUrl}/v1/games/url`, req, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (!responseUrl.data) {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('download-error', { 
          gameId: game_id,
          error: 'Failed to get download URL'
        });
      }
      return;
    }

    const tempPath = path.join(app.getPath('temp'), `descarga_${Date.now()}.exe`)
    const writer = fs.createWriteStream(tempPath)
    console.log('temp path: ' + tempPath)
    
    //Intentar descargar archivo
    const response = await axios({
      method: 'get',
      url: responseUrl.data.url,
      responseType: 'stream'
    })    
    const totalLength = parseInt(response.headers['content-length'] || '0', 10);

    let downloaded = 0;
    let lastProgressUpdate = Date.now();
    const UPDATE_INTERVAL = 100;

    response.data.on('data', (chunk: Buffer) => {
      downloaded += chunk.length;
      const percent = (downloaded / totalLength) * 100;
      process.stdout.write(`\r📥 Descargando... ${percent.toFixed(2)}%`);
      
      const now = Date.now();
      if (now - lastProgressUpdate > UPDATE_INTERVAL && mainWindow && !mainWindow.isDestroyed()) {
        lastProgressUpdate = now;
        mainWindow.webContents.send('download-progress', { 
          gameId: game_id,
          progress: percent,
          downloaded: downloaded,
          total: totalLength
        });
      }
    });
    
    const gameNameNoSymbols = gameName.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, '');
    return new Promise((resolve, reject) => {
      response.data.pipe(writer)
      writer.on('finish', () => {
        const gamePath = path.join(app.getPath('documents'), `My Games\\${gameNameNoSymbols}`)
        mainWindow.webContents.send('download-complete', { 
          gameId: game_id,
          installPath: gamePath
        });
        
        //Install game
        installGame(tempPath, gamePath, game_id)
        resolve(tempPath)
        //Remove installer
      })
      writer.on('error', (err) => {
        mainWindow.webContents.send('download-error', { 
          gameId: game_id,
          error: err.message
        });
        reject(err);
      })
    })  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-error', { 
        gameId: game_id,
        error: errorMessage
      });
    }
    console.error('Download error:', errorMessage);
    throw error;
  }
}

function deleteFile(filePath: string) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error al eliminar el archivo:', err)
    } else {
      console.log('Archivo eliminado:', filePath)
    }
  })
}

async function installGame(installerRoute: string, destinationRoute: string, game_id: number) {
  try {
    mainWindow.webContents.send('install-started', {
      gameId: game_id,
      installPath: destinationRoute
    });
    const command = `"${installerRoute}" /DIR="${destinationRoute}" /SILENT`
    console.log(command)
    exec(command, (err, stdout) => {
      if (err) {
        console.error('Error:', err.message)
        mainWindow.webContents.send('install-error', {
          gameId: game_id,
          error: err.message,
          installPath: destinationRoute
        });
      } else {
        console.log('Resultado:', stdout)
        //Remove temp files
        deleteFile(installerRoute)
        const exeFiles = searchForExecutablesRecursive(destinationRoute)
        console.log('Found executable files:', exeFiles)
        
        // Filter out uninstaller and system files to find the actual game executable
        const gameExeFiles = exeFiles.filter(filePath => {
          const fileName = path.basename(filePath).toLowerCase();
          return !fileName.startsWith('unins') && 
                 !fileName.includes('crash') && 
                 !fileName.includes('setup') &&
                 !fileName.includes('install') &&
                 !fileName.includes('update');
        });
        
        console.log('Filtered game executable files:', gameExeFiles);
        const exePath = gameExeFiles.length > 0 ? gameExeFiles[0] : (exeFiles.length > 0 ? exeFiles[0] : destinationRoute);
        
        mainWindow.webContents.send('install-complete', {
          gameId: game_id,
          installPath: exePath
        });
      }
    })
    // }
    return true
    // return lista;
  } catch (error) {
    const err = error as Error
    return [`Error: ${err.message}`]
  }
}

const searchForExecutablesRecursive = (dir: string, fileList: string[] = []): string[] => {
  try {
    const files = fs.readdirSync(dir)

    files.forEach((file: string) => {
      const filePath = path.join(dir, file)
      try {
        if (fs.statSync(filePath).isDirectory()) {
          searchForExecutablesRecursive(filePath, fileList)
        } else if (file.toLowerCase().endsWith('.exe')) {
          fileList.push(filePath)
        }
      } catch (err) {
        console.error(`Error accessing ${filePath}:`, err)
      }
    })

    return fileList
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err)
    return fileList
  }
}

// Protocol handler code moved to IPC handler for better integration
function showMessage(message: string) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('Sending message to main window:', message)
    mainWindow.webContents.send('update-message', message)
  } else {
    dialog.showErrorBox('Update Message', message)
  }
}

interface ActiveGameSession {
  pid: number;
  game_id: number;
  token: string;
  sessionStartTime: number;
  lastRecordedPlayTimeMinutes: number; 
  intervalId?: NodeJS.Timeout; 
}
let activeGameSession: ActiveGameSession | null = null;
const PLAYTIME_UPDATE_INTERVAL_MS = 60 * 1000; // every 1 minute

async function fetchInitialPlayTime(token: string, game_id: number): Promise<number> {
  try {
    // @ts-ignore
    const apiBaseUrl = import.meta.env.VITE_APP_API_URL;
    const response = await axios.get(`${apiBaseUrl}/v1/games/${game_id}/playtime`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data && typeof response.data.play_time === 'number') {
      return response.data.play_time; 
    }
    return 0;
  } catch (error) {
    console.error('Failed to fetch initial playtime:', error);
    return 0; // Default to 0 if fetch fails. This is not a really good solution for now because it might reset the time played to 0. fix later
  }
}

async function sendPlayTimeUpdate(token: string, game_id: number, totalPlayTimeMinutes: number) {
  try {
    // @ts-ignore
    const apiBaseUrl = import.meta.env.VITE_APP_API_URL;
    await axios.post(`${apiBaseUrl}/v1/games/updatePlayTime`, {
      game_id: game_id,
      play_time: Math.round(totalPlayTimeMinutes) 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Playtime updated for game ${game_id}: ${totalPlayTimeMinutes} minutes`);
  } catch (error) {
    console.error('Failed to send playtime update:', error);
  }
}

function stopPlaytimeTracking() {
  if (activeGameSession && activeGameSession.intervalId) {
    clearInterval(activeGameSession.intervalId);
  }
  activeGameSession = null;
  console.log('Playtime tracking stopped.');
}

async function createWindow(): Promise<void> {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: true,
      devTools: true
    }
  })
  //---
  
  ipcMain.handle('login-with-google', () => {
    // router=_router
    requestLoginGoogle()
  })

  ipcMain.handle('get-version', () => {
    return autoUpdater.currentVersion.version;
  })

  // handlers for custom protocol API requests
  ipcMain.handle('api-request', async (_event, options) => {
    try {
      const { method, path, data, headers } = options;
      
      // Get the API URL from environment variables
      // @ts-ignore
      const apiBaseUrl = import.meta.env.VITE_APP_API_URL;
      
      // final URL
      const url = `${apiBaseUrl}${path}`;
      
      // Make the actual API request
      const response = await axios({
        url,
        method,
        data,
        headers
      });
      
      return response.data;
    } catch (error: any) {
      console.error('API request error:', error);
      return {
        error: true,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      };
    }
  });

  ipcMain.handle('resolve-with-google', () => {
    //resolveGoogleLogin()
  })


  ipcMain.handle('search-exe-files', async (_event, baseDir) => {
    try {
      const searchDir = baseDir || path.join(app.getPath('documents'), 'My Games')

      if (!fs.existsSync(searchDir)) {
        return { error: `Directory does not exist: ${searchDir}` }
      }

      const exeFiles = searchForExecutablesRecursive(searchDir)
      return { files: exeFiles }
    } catch (error) {
      console.error('Error searching for executable files:', error)
      return { error: (error as Error).message }
    }
  })
  
  ipcMain.handle('seleccionar-archivo', async () => {
    try {
      //     const { Low } = await import('lowdb');
      // const { JSONFilePreset } = await import('lowdb/node');
      //     const db = await JSONFilePreset('db.json',{games:[{}]})
      //     await db.read();
      //   db.data.games.push({ gameId:"2", installPath: '"D:\Juegos\test\Body Defense.exe"'});
      //   await db.write();
      // addGame(2,'"D:\Juegos\test\Body Defense.exe"')
      const result = await dialog.showOpenDialog({ properties: ['openFile'] })
      return result.filePaths[0]
    } catch (error) {
      console.error('Error selecting file:', error);
      return null;
    }
  })

  ipcMain.handle('seleccionar-carpeta', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.filePaths[0]
  })

  ipcMain.handle('instalar-desde-zip', async ( rutaExe, rutaDestino) => {
    try {
      // const zip = new AdmZip(rutaZip);
      // zip.extractAllTo(rutaDestino, true);

      // const lista = zip.getEntries().map(entry => entry.entryName);

      // const posibleInstalador = path.join(rutaDestino, 'setup.exe');
      // if (fs.existsSync(posibleInstalador)) {
      exec(`"${rutaExe}" /DIR="${rutaDestino}" /SILENT`, (err, stdout) => {
        if (err) console.error('Error:', err.message)
        else console.log('Resultado:', stdout)
      })
      // }
      return true
      // return lista;
    } catch (error) {
      const err = error as Error
      return [`Error: ${err.message}`]
    }
  })
  // async function addGame(gameId, installPath) {
  //   await db.read();
  //   db.data.games.push({ gameId, installPath });
  //   await db.write();
  // }
  ipcMain.handle('download-game', async (_event, appData) => {
    const { game_id, token, gameName } = appData
    downloadTempFile(token, game_id, gameName)
  })

  ipcMain.handle('play-game', async (_event, appData) => {
    console.log('Play game event triggered');
    console.log('token: ' + appData.token)
    const { appPath, game_id, token } = appData;

    if (activeGameSession) {
      console.warn('Another game session is already active. Please stop it first.');
      return { error: 'Another game session is active.' };
    }

    try {
      console.log('Game path: ' + appPath);
      console.log('Game ID: ' + game_id);

      const reqValidate = {
        game_id: game_id,
        token: token
      };

      // @ts-ignore
      const apiBaseUrl = import.meta.env.VITE_APP_API_URL;
      const validationResponse = await axios.post(`${apiBaseUrl}/v1/validate/`, reqValidate, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (validationResponse.data && validationResponse.data.tempKey) {
        console.log('Validation successful:', validationResponse.data);

        const lastRecordedPlayTimeMinutes = await fetchInitialPlayTime(token, game_id);
        console.log(`Initial playtime for game ${game_id}: ${lastRecordedPlayTimeMinutes} minutes`);

        const args = `-game_id ${reqValidate.game_id} -key ${validationResponse.data.tempKey} -token ${token}`;
        console.log('Launching game with args:', args);
        const appProcess = spawn('"' + appPath + '"', args.split(' '), { shell: true, detached: false });

        if (!appProcess.pid) {
          console.error('Failed to launch application or get PID.');
          return { error: 'Failed to launch game process.' };
        }

        console.log(`Game started with PID: ${appProcess.pid}`);
        activeGameSession = {
          pid: appProcess.pid,
          game_id: game_id,
          token: token,
          sessionStartTime: Date.now(),
          lastRecordedPlayTimeMinutes: lastRecordedPlayTimeMinutes,
        };

        activeGameSession.intervalId = setInterval(async () => {
          if (activeGameSession) {
            try {
              process.kill(activeGameSession.pid, 0);
              const currentTime = Date.now();
              const sessionDurationMinutes = (currentTime - activeGameSession.sessionStartTime) / (1000 * 60);
              const newTotalPlayTimeMinutes = activeGameSession.lastRecordedPlayTimeMinutes + sessionDurationMinutes;
              await sendPlayTimeUpdate(activeGameSession.token, activeGameSession.game_id, newTotalPlayTimeMinutes);
            } catch (e) {
              console.log(`Game process ${activeGameSession.pid} no longer running. Stopping periodic updates.`);
              const endTime = Date.now();
              const sessionDurationMinutes = (endTime - activeGameSession.sessionStartTime) / (1000 * 60);
              const finalTotalPlayTimeMinutes = activeGameSession.lastRecordedPlayTimeMinutes + sessionDurationMinutes;
              await sendPlayTimeUpdate(activeGameSession.token, activeGameSession.game_id, finalTotalPlayTimeMinutes);
              stopPlaytimeTracking();
            }
          }
        }, PLAYTIME_UPDATE_INTERVAL_MS);

        appProcess.stdout.on('data', (data: Buffer) => {
          console.log(`Game Output (PID: ${appProcess.pid}): ${data.toString()}`);
        });

        appProcess.stderr.on('data', (data: Buffer) => {
          console.error(`Game Error (PID: ${appProcess.pid}): ${data.toString()}`);
        });

        appProcess.on('exit', async (code: number | null, signal: string | null) => {
          console.log(`Game process ${appProcess.pid} exited with code ${code}, signal ${signal}`);
          if (activeGameSession && activeGameSession.pid === appProcess.pid) {
            const endTime = Date.now();
            const sessionDurationMinutes = (endTime - activeGameSession.sessionStartTime) / (1000 * 60);
            const finalTotalPlayTimeMinutes = activeGameSession.lastRecordedPlayTimeMinutes + sessionDurationMinutes;
            await sendPlayTimeUpdate(activeGameSession.token, activeGameSession.game_id, finalTotalPlayTimeMinutes);
            stopPlaytimeTracking();
          }
        });

        appProcess.on('error', async (err: Error) => {
          console.error(`Failed to start game process ${appProcess.pid}:`, err);
          if (activeGameSession && activeGameSession.pid === appProcess.pid) {
            const endTime = Date.now();
            const sessionDurationMinutes = (endTime - activeGameSession.sessionStartTime) / (1000 * 60);
            const finalTotalPlayTimeMinutes = activeGameSession.lastRecordedPlayTimeMinutes + sessionDurationMinutes;
            await sendPlayTimeUpdate(activeGameSession.token, activeGameSession.game_id, finalTotalPlayTimeMinutes);
            stopPlaytimeTracking();
          }
        });

        return { success: true, pid: appProcess.pid };

      } else {
        console.error('Game validation failed:', validationResponse.data);
        return { error: 'Game validation failed.' };
      }
    } catch (error: any) {
      console.error('Error in play-game handler:', error.message);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      if (activeGameSession) {
          const endTime = Date.now();
          const sessionDurationMinutes = (endTime - activeGameSession.sessionStartTime) / (1000 * 60);
          const finalTotalPlayTimeMinutes = activeGameSession.lastRecordedPlayTimeMinutes + sessionDurationMinutes;
          await sendPlayTimeUpdate(activeGameSession.token, activeGameSession.game_id, finalTotalPlayTimeMinutes);
          stopPlaytimeTracking();
      }
      return { error: 'Failed to play game: ' + error.message };
    }
  })

  ipcMain.handle('uninstall-game', async (_event, appData) => {
    const { game_id, uninstallerPath } = appData;
    
    try {
      console.log('Uninstalling game:', game_id, 'using uninstaller:', uninstallerPath);
      
      if (!fs.existsSync(uninstallerPath)) {
        console.error('Uninstaller not found:', uninstallerPath);
        return { 
          success: false, 
          error: 'Uninstaller not found at: ' + uninstallerPath 
        };
      }
      
      const command = `"${uninstallerPath}" /SILENT`;
      console.log('Executing uninstall command:', command);
      
      return new Promise((resolve) => {
        exec(command, (err, stdout, stderr) => {
          if (err) {
            console.error('Uninstall error:', err.message);
            console.error('Stderr:', stderr);
            resolve({ 
              success: false, 
              error: err.message 
            });
          } else {
            console.log('Uninstall completed successfully');
            console.log('Stdout:', stdout);
            resolve({ 
              success: true, 
              message: 'Game uninstalled successfully' 
            });
          }
        });
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in uninstall-game handler:', errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  })
  //---

  mainWindow.on('ready-to-show', () => {
      mainWindow.webContents.openDevTools()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
    // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
      // Handle navigation events to ensure proper routing in production
    mainWindow.webContents.on('did-finish-load', () => {
      // Check for and handle any pending deep link URLs
      if (process.env.PENDING_DEEP_LINK_URL) {
        const url = process.env.PENDING_DEEP_LINK_URL;
        mainWindow.webContents.send('deep-link-url', url);
        delete process.env.PENDING_DEEP_LINK_URL;
      }
      mainWindow.show()
    })
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {  app.on('second-instance', (_event, argv) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    
    // Process deep link URL if present
    const deepLinkUrl = argv.find(arg => arg.startsWith('boly-app://') || arg.startsWith('boly://'));
    if (deepLinkUrl) {
      // Send the URL to the renderer process
      mainWindow.webContents.send('deep-link-url', deepLinkUrl);
    } else {
      // Legacy message for non-protocol launches
      dialog.showErrorBox('Welcome Back', `You arrived from: ${argv[argv.length - 1]}`);
    }
  })
}

// Handle macOS open-url events for protocol handlers
app.on('open-url', (event, url) => {
  event.preventDefault();
  
  if (url.startsWith('boly-app://') || url.startsWith('boly://')) {
    // If app is already running with a window, send the URL
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('deep-link-url', url);
    } else {
      // Store the URL to process after window creation
      // This can happen if the app isn't running yet
      process.env.PENDING_DEEP_LINK_URL = url;
    }
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  
  ipcMain.handle('check-updates', () => {
    console.log('Manually checking for updates...')
    autoUpdater.checkForUpdates()
    return 'Checking for updates...'
  })
  createWindow()

  // Set up auto-updater event handlers
  autoUpdater.on('checking-for-update', () => {
    showMessage('Checking for updates...')
    console.log('Checking for updates...')
  })

  autoUpdater.on('update-available', () => {
    showMessage('Update available')
    console.log('Update available')
    autoUpdater.downloadUpdate()
      .catch((err) => {
        console.error('Download error:', err)
        showMessage('Download error: ' + err.message)
      })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('Update not available')
    showMessage('No updates available')
  })

  autoUpdater.on('error', (error) => {
    console.error('Error checking for updates:', error)
    showMessage('Error checking for updates: ' + error.message)
    
    if (error.message.includes('404') && error.message.includes('github.com')) {
      showMessage('Update error: Could not access GitHub repository. Please ensure you have the correct repository configuration and GH_TOKEN environment variable set.')
    } else {
      showMessage('Error checking for updates: ' + error.message)
    }
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    console.log(message)
    showMessage(message)
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded. Ready to quit and install.');
    showMessage('Update downloaded - The application is ready to quit and install.'); // Inform user

    // Give a very short delay for the message to potentially be seen,
    // though the app will quit quickly.
    // setTimeout(() => {
    //   try {
    //     console.log('Calling autoUpdater.quitAndInstall().');
    //     autoUpdater.quitAndInstall();
    //   } catch (error) {
    //     console.error('Failed to quit and install:', error);
    //     showMessage('Error during update installation. Please restart the app manually. ');
    //   }
    // }, 1000); // 1 second delay
  })

  // Start checking for updates
  try {
    console.log('Current version:', autoUpdater.currentVersion.version)
    mainWindow.webContents.send('get-version', autoUpdater.currentVersion.version)
    
    // // Check for updates after a delay
    // setTimeout(() => {
    //   autoUpdater.checkForUpdates()
    //     .catch(err => {
    //       console.error('Error initiating update check:', err)
    //       showMessage('Error initiating update check: ' + err.message)
    //     })
    // }, 3000)
  } catch (error) {
    console.error('Error in update setup:', error)
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

