import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const { spawn } = require('child_process')
const fs = require('fs')
const { exec } = require('child_process')
const AdmZip = require('adm-zip')
import icon from '../../resources/icon.png?asset'
import axios from 'axios'


const searchForExecutablesRecursive = (dir: string, fileList: string[] = []): string[] => {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach((file: string) => {
      const filePath = path.join(dir, file);
      try {
        if (fs.statSync(filePath).isDirectory()) {
          searchForExecutablesRecursive(filePath, fileList);
        } else if (file.toLowerCase().endsWith('.exe')) {
          fileList.push(filePath);
        }
      } catch (err) {
        console.error(`Error accessing ${filePath}:`, err);
      }
    });
    
    return fileList;
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
    return fileList;
  }
};

async function createWindow(): Promise<void> {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
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

  ipcMain.handle('search-exe-files', async (_event, baseDir) => {
    try {
      const searchDir = baseDir || path.join(app.getPath('documents'), 'My Games');
      
      if (!fs.existsSync(searchDir)) {
        return { error: `Directory does not exist: ${searchDir}` };
      }
      
      const exeFiles = searchForExecutablesRecursive(searchDir);
      return { files: exeFiles };
    } catch (error) {
      console.error('Error searching for executable files:', error);
      return { error: (error as Error).message };
    }
  });

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
    } catch (error) {}
  })

  ipcMain.handle('seleccionar-carpeta', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.filePaths[0]
  })

  ipcMain.handle('instalar-desde-zip', async (test, rutaExe, rutaDestino) => {
    try {
      // const zip = new AdmZip(rutaZip);
      // zip.extractAllTo(rutaDestino, true);

      // const lista = zip.getEntries().map(entry => entry.entryName);

      // const posibleInstalador = path.join(rutaDestino, 'setup.exe');
      // if (fs.existsSync(posibleInstalador)) {
      exec(`"${rutaExe}" /DIR="${rutaDestino}" /SILENT`, (err, stdout, stderr) => {
        if (err) console.error('Error:', err.message)
        else console.log('Resultado:', stdout)
      })
      // }
      return true
      // return lista;
    } catch (error) {
      const err = error as Error;
      return [`Error: ${err.message}`];
    }
  })
  // async function addGame(gameId, installPath) {
  //   await db.read();
  //   db.data.games.push({ gameId, installPath });
  //   await db.write();
  // }

  ipcMain.handle('play-game', async (event, appData) => {
    //Params needed:
    //-auth token
    //-user_id
    //-game_id
    //-game_route
    //This has to be called from each DesktopLibraryItem component
    //"D:\Juegos\test\Body Defense.exe"
    //------------------------------------- Ejecutar juego
    console.log('clicked and event triggered')
    try {
      //-

      const { appPath, game_id, token } = appData
      console.log("path "+appPath)
      console.log("gameid "+game_id)
      console.log("token "+token)
      const req = {
        game_id: game_id,
        token:token
      }
      try {
        //--
        await axios
          .post(`http://localhost:3000/v1/validate/`, req, {
            headers: { Authorization: `Bearer ${token}` }
          })
          .then((validation) => {
            if (validation.data) {
              console.log(validation.data)
              //---
              try {
                const args = `-game_id ${req.game_id} -key ${validation.data.tempKey} -token ${token}`
                // const args = `-game_id ${req.game_id} -user_id ${req.user_id} -key ${validation.data.tempKey} -token ${response.data.token}`
                console.log(args)
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
    return
    try {
      console.log(event)
      console.log(appData)
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
  ipcMain.on('launch-app', (event, appData) => {
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
