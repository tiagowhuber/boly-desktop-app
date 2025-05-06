import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const { spawn } = require('child_process')
const fs = require('fs')
const { exec } = require('child_process')
import icon from '../../resources/icon.png?asset'
import axios from 'axios'

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

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('boly-app', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('boly-app')
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
    const responseUrl = await axios.post(`${import.meta.env.VITE_APP_API_URL}/v1/games/url`, req, {
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
        // This might be bugged
        const exePath = exeFiles.length > 0 ? exeFiles[0] : destinationRoute;
        
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
      contextIsolation: true
    }
  })
  //---
  
  ipcMain.handle('login-with-google', () => {
    // router=_router
    requestLoginGoogle()
  })

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
    const { game_id, token,gameName } = appData
    downloadTempFile(token, game_id,gameName)
  })

  ipcMain.handle('play-game', async (_event, appData) => {
    //Params needed:
    //-auth token
    //-user_id
    //-game_id
    //-game_route
    //This has to be called from each DesktopLibraryItem component
    //"D:\Juegos\test\Body Defense.exe"
    //------------------------------------- Ejecutar juego
    console.log('clicked and event triggered')
    const { appPath, game_id, token } = appData
    // downloadTempFile(token,game_id)
    // return;
    try {
      //-

      console.log('path ' + appPath)
      console.log('gameid ' + game_id)
      console.log('token ' + token)
      const req = {
        game_id: game_id,
        token: token
      }
      try {
        //--
        await axios// @ts-ignore
          .post(`${import.meta.env.VITE_APP_API_URL}/v1/validate/`, req, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((validation) => {
            if (validation.data) {
              console.log(validation.data)
              //---
              try {
                const args = `-game_id ${req.game_id} -key ${validation.data.tempKey} -token ${token}`
                console.log(args)
                const appProcess = spawn('"' + appPath + '"', args.split(' '), { shell: true })

                appProcess.stdout.on('data', (data) => {
                  console.log(`Output: ${data}`)
                })

                appProcess.stderr.on('data', (data) => {
                  console.error(`Error: ${data}`)
                })
              } catch (error) {
                console.error('Failed to launch application:', error)
              }
              //---
            }
          })
        //--
      } catch (error) {
        console.log('error validation')
      }

      //-
    } catch (error: any) {
      console.log('error auth')
      throw error
    } finally {
    }
    //refresh token en caso de
    //consultar clave a api
  })
  ipcMain.on('launch-app', (_event, appData) => {
    try {
      const { appPath, args } = appData
      const appProcess = spawn(appPath, args.split(' '), { shell: true })

      appProcess.stdout.on('data', (data) => {
        console.log(`Output: ${data}`)
      })

      appProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`)
      })
    } catch (error) {
      console.error('Failed to launch application:', error)
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
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
    // argv contains the command line arguments
    dialog.showErrorBox('Welcome Back', `You arrived from: ${argv[argv.length - 1]}`)
  })
}

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

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// ipcMain.handle('add-game', async (event, game) => {
//   await addGame(game.gameId, game.installPath);
// });

// ipcMain.handle('get-games', async () => {
//   return await getGames();
// });

// export async function addGame(gameId, installPath) {
//   await db.read();
//   db.data.games.push({ gameId, installPath });
//   await db.write();
// }

// export async function getGames() {
//   await db.read();
//   return db.data.games;
// }

//-------------
/*
const body = {
        email:"jorge.puentes225@gmail.com",
        password:"@M123123"
      }

      await axios.post(`http://localhost:3001/v1/auth/`, body).then(
        async (response)=>{
          console.log(response.data)
          if(response && response.data.token){
            const { appPath,game_id } = appData;
            const req={
              // user_id:3,
              game_id:game_id
            }
            try {
              //--
              await axios.post(`http://localhost:3001/v1/validate/`, req, {
                headers: { Authorization: `Bearer ${auth.token}` }
              }).then((validation)=>{
                if(validation.data){
                  console.log(validation.data)
                  //---
                  try {
                    const args = `-game_id ${req.game_id} -key ${validation.data.tempKey} -token ${response.data.token}`
                    // const args = `-game_id ${req.game_id} -user_id ${req.user_id} -key ${validation.data.tempKey} -token ${response.data.token}`
                    console.log(args)
                    const appProcess = spawn(appPath, args.split(' '), { shell: true });
              
                    appProcess.stdout.on('data', (data) => {
                        console.log(`Output: ${data}`);
                    });
              
                    appProcess.stderr.on('data', (data) => {
                        console.error(`Error: ${data}`);
                    });
                } catch (error) {
                    console.error('Failed to launch application:', error);
                }
                //---
                }
              })
              //--
            } catch (error) {
              console.log("error validation")
            }
          }
        }
      )
*/
