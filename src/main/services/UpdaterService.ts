import { autoUpdater } from 'electron-updater'
import { WindowManager } from './WindowManager'

export class UpdaterService {
  private static instance: UpdaterService

  private constructor() {
    this.configureAutoUpdater()
    this.setupListeners()
  }

  public static getInstance(): UpdaterService {
    if (!UpdaterService.instance) {
      UpdaterService.instance = new UpdaterService()
    }
    return UpdaterService.instance
  }

  private configureAutoUpdater(): void {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.logger = console
    autoUpdater.allowPrerelease = false
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.requestHeaders = {
      'User-Agent': 'Boly-Desktop-App'
    }
    // token removed as per original file comments
    autoUpdater.setFeedURL({
      provider: 'github',
      repo: 'boly-desktop-app',
      owner: 'tiagowhuber',
      private: false
    })
  }

  private showMessage(message: string): void {
    const win = WindowManager.getInstance().getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('update-message', message)
    }
  }

  private sendProgress(data: {
    bytesPerSecond: number
    percent: number
    transferred: number
    total: number
  }): void {
    const win = WindowManager.getInstance().getMainWindow()
    if (win && !win.isDestroyed()) {
      win.webContents.send('update-progress', data)
    }
  }

  private setupListeners(): void {
    autoUpdater.on('checking-for-update', () => {
      this.showMessage('Checking for updates...')
      console.log('Checking for updates...')
    })

    autoUpdater.on('update-available', () => {
      this.showMessage('Update available')
      console.log('Update available')
      autoUpdater.downloadUpdate().catch((err) => {
        console.error('Download error:', err)
        this.showMessage('Download error: ' + err.message)
      })
    })

    autoUpdater.on('update-not-available', () => {
      console.log('Update not available')
      this.showMessage('No updates available')
    })

    autoUpdater.on('error', (error) => {
      console.error('Error checking for updates:', error)
      if (error.message.includes('403') || error.message.includes('AuthenticationFailed')) {
        console.error('Authentication failed - GitHub token may be invalid or expired')
        this.showMessage('Update check failed: Authentication error.')
      } else if (error.message.includes('404') && error.message.includes('github.com')) {
        this.showMessage('Update error: Could not access GitHub repository.')
      } else {
        this.showMessage('Error checking for updates: ' + error.message)
      }
    })

    autoUpdater.on('download-progress', (progressObj) => {
      console.log(
        `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
      )
      this.sendProgress({
        bytesPerSecond: progressObj.bytesPerSecond,
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total
      })
    })

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded. Ready to quit and install.')
      this.showMessage('update-ready')
    })
  }

  public checkForUpdates(): void {
    console.log('Manually checking for updates...')
    autoUpdater.checkForUpdates()
  }

  public applyUpdate(): void {
    autoUpdater.quitAndInstall()
  }

  public getVersion(): string {
    return autoUpdater.currentVersion.version
  }
}
