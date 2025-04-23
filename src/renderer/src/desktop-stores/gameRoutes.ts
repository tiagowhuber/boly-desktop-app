import { defineStore } from 'pinia'

export interface LocalGameList {
  localGames: LocalGame[]
  localUninstallers: LocalUninstaller[] 
}

export interface LocalGame{
    gameId: number;
    route: string;
}

export interface LocalUninstaller {
    gameId: number;
    route: string;
}

const useGameRoutes = defineStore('gameRoutes', {
  state: (): LocalGameList => ({
    localGames: JSON.parse(localStorage.getItem('localGames') || '[]'),
    localUninstallers: JSON.parse(localStorage.getItem('localUninstallers') || '[]') 
  }),
  getters: {
    getRouteItems: (state) => state.localGames,
    getUninstallerItems: (state) => state.localUninstallers 
  },
  actions: {
    addGameToRoute(game: { gameId: number,route:string }) {
      const existingGame = this.localGames.find(g => g.gameId === game.gameId || g.route === game.route);
      if (!existingGame) {
        console.log("adding game: "+game.route)
        this.localGames.push(game)
        this.saveToLocalStorage()
      }
    },
    addUninstallerToRoute(uninstaller: { gameId: number, route: string }) {
      const existingUninstaller = this.localUninstallers.find(u => u.gameId === uninstaller.gameId || u.route === uninstaller.route);
      if (!existingUninstaller) {
        console.log("adding uninstaller: " + uninstaller.route);
        this.localUninstallers.push(uninstaller);
        this.saveToLocalStorage();
      }
    },
    removeGameFromRoute(game: { gameId: number,route:string }) {
      this.localGames = this.localGames.filter(g => 
        g.gameId !== game.gameId && g.route !== game.route
      )
      this.saveToLocalStorage()
    },
    removeUninstallerFromRoute(uninstaller: { gameId: number, route: string }) {
      this.localUninstallers = this.localUninstallers.filter(u =>
        u.gameId !== uninstaller.gameId && u.route !== uninstaller.route
      );
      this.saveToLocalStorage();
    },
    clearRoute() {
      this.localGames = []
      this.localUninstallers = [] 
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      console.log("saving games and uninstallers")
      localStorage.setItem('localGames', JSON.stringify(this.localGames))
      localStorage.setItem('localUninstallers', JSON.stringify(this.localUninstallers))
    },
    async searchForExes() {
      try {
        const result = await window.electronAPI.searchExeFiles();

        if (result && result.files && Array.isArray(result.files)) {
          console.log('Found exe files:', result.files);
          result.files.forEach(filePath => {
            const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || '';
            const directoryPath = filePath.substring(0, filePath.lastIndexOf('\\') + 1) || filePath.substring(0, filePath.lastIndexOf('/') + 1);


            if (fileName === "Body Defense.exe") {
              const game = { gameId: 2, route: filePath };
              this.addGameToRoute(game);
              const uninstallerPath = directoryPath + 'unins000.exe'; 
              const uninstaller = { gameId: 2, route: uninstallerPath };
              this.addUninstallerToRoute(uninstaller);


            } else if (fileName === "AtacamaScope.exe") {
              const game = { gameId: 3, route: filePath };
              this.addGameToRoute(game);
              const uninstallerPath = directoryPath + 'unins000.exe';
              const uninstaller = { gameId: 3, route: uninstallerPath };
              this.addUninstallerToRoute(uninstaller);
            }
            
          });
          return this.localGames;
        } else if (result && result.error) {
          console.error('Error searching for exe files:', result.error);
          return [];
        }

        return this.localGames;
      } catch (error) {
        console.error('Error in searchForExes:', error);
        return this.localGames;
      }
    }
  }
})

export default useGameRoutes
