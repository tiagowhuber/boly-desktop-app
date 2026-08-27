import { defineStore } from 'pinia'
import { useGames } from '../stores'

export interface LocalGameList {
  localGames: LocalGame[]
  localUninstallers: LocalUninstaller[]
  /**
   * gameId -> buildKey, carried across a disk rescan. searchForExes() can
   * rediscover an .exe on disk but has no way to know which build produced
   * it, so without this the build key would be lost on every library refresh
   * and no game would ever report an available update.
   */
  rediscoverableBuildKeys: Record<number, string>
}

// How the app runs an installed build: spawn the executable, or open the
// extracted index.html in the player.
export type LocalGameKind = 'exe' | 'html'

export interface LocalGame {
  gameId: number
  /** What launching needs: the .exe, or the build's index.html. */
  route: string
  /** Absent on entries written before html builds existed — those are all exes. */
  kind?: LocalGameKind
  /** Folder the build was extracted into; what uninstalling deletes. */
  root?: string
  /**
   * The game's file_name.desktop at install time — the S3 key of the build
   * that was installed. Approving a new build changes that key, so comparing
   * it against the current one is how the library knows an update exists.
   * Absent on entries written before update detection, and on installs the
   * disk rescan rediscovers (it only sees files, not which build they came
   * from) — those simply don't claim an update either way.
   */
  buildKey?: string
}

export interface LocalUninstaller {
  gameId: number
  route: string
}

const useGameRoutes = defineStore('gameRoutes', {
  state: (): LocalGameList => ({
    localGames: JSON.parse(localStorage.getItem('localGames') || '[]'),
    localUninstallers: JSON.parse(localStorage.getItem('localUninstallers') || '[]'),
    rediscoverableBuildKeys: {}
  }),
  getters: {
    getRouteItems: (state) => state.localGames,
    getUninstallerItems: (state) => state.localUninstallers
  },
  actions: {
    addGameToRoute(game: LocalGame) {
      const existingGame = this.localGames.find(
        (g) => g.gameId === game.gameId || g.route === game.route
      )
      if (!existingGame) {
        console.log('adding game: ' + game.route)
        this.localGames.push(game)
        this.saveToLocalStorage()
      }
    },
    addUninstallerToRoute(uninstaller: { gameId: number; route: string }) {
      const existingUninstaller = this.localUninstallers.find(
        (u) => u.gameId === uninstaller.gameId || u.route === uninstaller.route
      )
      if (!existingUninstaller) {
        console.log('adding uninstaller: ' + uninstaller.route)
        this.localUninstallers.push(uninstaller)
        this.saveToLocalStorage()
      }
    },
    removeGameFromRoute(game: { gameId: number; route: string }) {
      this.localGames = this.localGames.filter(
        (g) => g.gameId !== game.gameId && g.route !== game.route
      )
      this.saveToLocalStorage()
    },
    removeUninstallerFromRoute(uninstaller: { gameId: number; route: string }) {
      this.localUninstallers = this.localUninstallers.filter(
        (u) => u.gameId !== uninstaller.gameId && u.route !== uninstaller.route
      )
      this.saveToLocalStorage()
    },
    // Record an install the moment it finishes, with the game id already known.
    // searchForExes() cannot recover html builds — it scans for .exe files and
    // maps them back to a game by file name — so for those this is the only
    // thing that puts them in the list. Upserts, so reinstalling to a new path
    // replaces the old entry instead of leaving a stale duplicate.
    recordInstalledGame(game: {
      gameId: number
      route: string
      kind: LocalGameKind
      root?: string
      buildKey?: string
    }) {
      this.localGames = [...this.localGames.filter((g) => g.gameId !== game.gameId), game]
      this.saveToLocalStorage()
    },

    // Drop what a disk rescan can rediscover, and keep what it cannot.
    // searchForExes() rebuilds the exe entries right after this runs; html
    // builds have no equivalent scan, so wiping them here would make an
    // installed game look uninstalled on the next library refresh.
    clearRoute() {
      // Stash the build each exe install came from before dropping it, so the
      // rescan can put it back — see rediscoverableBuildKeys.
      for (const game of this.localGames) {
        if (game.kind !== 'html' && game.buildKey) {
          this.rediscoverableBuildKeys[game.gameId] = game.buildKey
        }
      }
      this.localGames = this.localGames.filter((g) => g.kind === 'html')
      this.localUninstallers = []
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      console.log('saving games and uninstallers')
      localStorage.setItem('localGames', JSON.stringify(this.localGames))
      localStorage.setItem('localUninstallers', JSON.stringify(this.localUninstallers))
    },
    async searchForExes() {
      const gamesStore = useGames()
      try {
        const result = await window.electronAPI.searchExeFiles()

        if (result && result.files && Array.isArray(result.files)) {
          console.log('Found exe files:', result.files)
          for (const filePath of result.files) {
            const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || ''
            const directoryPath =
              filePath.substring(0, filePath.lastIndexOf('\\') + 1) ||
              filePath.substring(0, filePath.lastIndexOf('/') + 1)

            const gameId = await gamesStore.getGameIdByFileName(fileName)
            console.log('Game ID for file:', fileName, 'is', gameId)

            if (gameId) {
              const game: LocalGame = {
                gameId,
                route: filePath,
                kind: 'exe',
                buildKey: this.rediscoverableBuildKeys[gameId]
              }
              this.addGameToRoute(game)
              const uninstallerPath = directoryPath + 'unins000.exe'
              const uninstaller = { gameId, route: uninstallerPath }
              this.addUninstallerToRoute(uninstaller)
            }
          }
          return this.localGames
        } else if (result && result.error) {
          console.error('Error searching for exe files:', result.error)
          return []
        }

        return this.localGames
      } catch (error) {
        console.error('Error in searchForExes:', error)
        return this.localGames
      }
    }
  }
})

export default useGameRoutes
