import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { exec } from 'child_process'
import { WindowManager } from './WindowManager'

export class InstallerService {
  private static instance: InstallerService

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): InstallerService {
    if (!InstallerService.instance) {
      InstallerService.instance = new InstallerService()
    }
    return InstallerService.instance
  }

  public getLibraryPath(): string {
    const appName = 'Boly'
    let libraryRoot = ''

    if (process.platform === 'win32') {
      libraryRoot = process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local')
    } else {
      libraryRoot = app.getPath('appData')
    }

    const libPath = path.join(libraryRoot, appName, 'Games')

    if (!fs.existsSync(libPath)) {
      try {
        fs.mkdirSync(libPath, { recursive: true })
      } catch (e) {
        console.error('Failed to create library path:', e)
      }
    }
    return libPath
  }

  public async downloadTempFile(token: string, game_id: number, gameName: string): Promise<any> {
    const req = { token, game_id, is_web: false }
    const file_game_id = game_id
    try {
      WindowManager.getInstance().send('download-started', {
        gameId: file_game_id,
        gameName: gameName
      })

      // @ts-ignore
      const apiBaseUrl = import.meta.env.VITE_APP_API_URL
      const responseUrl = await axios.post(`${apiBaseUrl}/v1/games/url`, req, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!responseUrl.data) {
        WindowManager.getInstance().send('download-error', {
          gameId: file_game_id,
          error: 'Failed to get download URL'
        })
        return
      }

      const tempPath = path.join(app.getPath('temp'), `descarga_${Date.now()}.exe`)
      const writer = fs.createWriteStream(tempPath)
      console.log('temp path: ' + tempPath)

      const response = await axios({
        method: 'get',
        url: responseUrl.data.url,
        responseType: 'stream'
      })
      const totalLength = parseInt(response.headers['content-length'] || '0', 10)

      let downloaded = 0
      let lastProgressUpdate = Date.now()
      const UPDATE_INTERVAL = 100

      response.data.on('data', (chunk: Buffer) => {
        downloaded += chunk.length
        const percent = (downloaded / totalLength) * 100
        process.stdout.write(`\r📥 Descargando... ${percent.toFixed(2)}%`)

        const now = Date.now()
        if (now - lastProgressUpdate > UPDATE_INTERVAL) {
          lastProgressUpdate = now
          WindowManager.getInstance().send('download-progress', {
            gameId: file_game_id,
            progress: percent,
            downloaded: downloaded,
            total: totalLength
          })
        }
      })

      const gameNameNoSymbols = gameName.replace(/[^\w\sáéíóúÁÉÍÓÚñÑ]/g, '')
      return new Promise((resolve, reject) => {
        response.data.pipe(writer)
        writer.on('finish', () => {
          const gamePath = path.join(this.getLibraryPath(), `${gameNameNoSymbols}`)
          WindowManager.getInstance().send('download-complete', {
            gameId: file_game_id,
            installPath: gamePath
          })

          this.installGame(tempPath, gamePath, file_game_id)
          resolve(tempPath)
        })
        writer.on('error', (err) => {
          WindowManager.getInstance().send('download-error', {
            gameId: file_game_id,
            error: err.message
          })
          reject(err)
        })
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      WindowManager.getInstance().send('download-error', {
        gameId: file_game_id,
        error: errorMessage
      })
      console.error('Download error:', errorMessage)
      throw error
    }
  }

  public deleteFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error al eliminar el archivo:', err)
      } else {
        console.log('Archivo eliminado:', filePath)
      }
    })
  }

  public async installGame(
    installerRoute: string,
    destinationRoute: string,
    game_id: number
  ): Promise<any> {
    try {
      WindowManager.getInstance().send('install-started', {
        gameId: game_id,
        installPath: destinationRoute
      })
      const command = `"${installerRoute}" /DIR="${destinationRoute}" /SILENT`
      console.log(command)
      exec(command, (err, stdout) => {
        if (err) {
          console.error('Error:', err.message)
          WindowManager.getInstance().send('install-error', {
            gameId: game_id,
            error: err.message,
            installPath: destinationRoute
          })
        } else {
          console.log('Resultado:', stdout)
          const exeFiles = this.searchForExecutablesRecursive(destinationRoute)
          console.log('Found executable files:', exeFiles)

          if (exeFiles.length === 0) {
            // Downloaded file is a standalone exe, not an Inno Setup installer — copy it directly
            console.log('No files installed — treating download as standalone exe, copying to destination')
            if (!fs.existsSync(destinationRoute)) {
              fs.mkdirSync(destinationRoute, { recursive: true })
            }
            const gameFolderName = path.basename(destinationRoute)
            const destExePath = path.join(destinationRoute, `${gameFolderName}.exe`)
            try {
              fs.copyFileSync(installerRoute, destExePath)
              this.deleteFile(installerRoute)
              WindowManager.getInstance().send('install-complete', {
                gameId: game_id,
                installPath: destExePath
              })
            } catch (copyErr) {
              console.error('Failed to copy standalone exe:', copyErr)
              WindowManager.getInstance().send('install-error', {
                gameId: game_id,
                error: String(copyErr),
                installPath: destinationRoute
              })
            }
            return
          }

          this.deleteFile(installerRoute)

          const gameExeFiles = exeFiles.filter((filePath) => {
            const fileName = path.basename(filePath).toLowerCase()
            return (
              !fileName.startsWith('unins') &&
              !fileName.includes('crash') &&
              !fileName.includes('setup') &&
              !fileName.includes('install') &&
              !fileName.includes('update')
            )
          })

          console.log('Filtered game executable files:', gameExeFiles)
          const exePath =
            gameExeFiles.length > 0
              ? gameExeFiles[0]
              : exeFiles[0]

          WindowManager.getInstance().send('install-complete', {
            gameId: game_id,
            installPath: exePath
          })
        }
      })
      return true
    } catch (error) {
      const err = error as Error
      return [`Error: ${err.message}`]
    }
  }

  public searchForExecutablesRecursive(dir: string, fileList: string[] = []): string[] {
    try {
      const files = fs.readdirSync(dir)

      files.forEach((file: string) => {
        const filePath = path.join(dir, file)
        try {
          if (fs.statSync(filePath).isDirectory()) {
            this.searchForExecutablesRecursive(filePath, fileList)
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

  public async uninstallGame(game_id: number, uninstallerPath: string): Promise<any> {
    try {
      console.log('Uninstalling game:', game_id, 'using uninstaller:', uninstallerPath)

      if (!fs.existsSync(uninstallerPath)) {
        // No Inno Setup uninstaller — standalone exe, delete the game folder directly
        const gameDir = path.dirname(uninstallerPath)
        console.log('No uninstaller found, deleting game folder:', gameDir)
        if (!fs.existsSync(gameDir)) {
          return { success: false, error: 'Game folder not found at: ' + gameDir }
        }
        fs.rmSync(gameDir, { recursive: true, force: true })
        return { success: true, message: 'Game uninstalled successfully' }
      }

      const command = `"${uninstallerPath}" /SILENT`
      console.log('Executing uninstall command:', command)

      return new Promise((resolve) => {
        exec(command, (err, stdout, stderr) => {
          if (err) {
            console.error('Uninstall error:', err.message)
            console.error('Stderr:', stderr)
            resolve({
              success: false,
              error: err.message
            })
          } else {
            console.log('Uninstall completed successfully')
            console.log('Stdout:', stdout)
            resolve({
              success: true,
              message: 'Game uninstalled successfully'
            })
          }
        })
      })
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }
}
