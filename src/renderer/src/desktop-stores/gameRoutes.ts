import { defineStore } from 'pinia'

export interface LocalGameList {
  localGames: LocalGame[]
}

export interface LocalGame{
    gameId: number;
    route: string;
}

const useGameRoutes = defineStore('gameRoutes', {
  state: (): LocalGameList => ({
    localGames: JSON.parse(localStorage.getItem('localGames') || '[]')
  }),
  getters: {
    getRouteItems: (state) => state.localGames
  },
  actions: {
    addGameToRoute(game: { gameId: number,route:string }) {
      // Check if game is already installed
      const existingGame = this.localGames.find(g => g.gameId === game.gameId || g.route === game.route);
      if (!existingGame) {
        this.localGames.push(game)
        this.saveToLocalStorage()
      }
    },
    removeGameFromRoute(game: { gameId: number,route:string }) {
      this.localGames = this.localGames.filter(g => 
        g.gameId !== game.gameId && g.route !== game.route
      )
      this.saveToLocalStorage()
    },
    clearRoute() {
      this.localGames = []
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      localStorage.setItem('localGames', JSON.stringify(this.localGames))
    },    async searchForExes() {
      try {
        const result = await window.electronAPI.searchExeFiles();
        
        if (result && result.files && Array.isArray(result.files)) {
          console.log('Found exe files:', result.files);
          result.files.forEach(filePath => {
            const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || '';
            
            if (fileName === "Body Defense.exe") {
              const game = {
                gameId: 2,
                route: filePath
              };
              this.addGameToRoute(game);
            } else if (fileName === "AtacamaScope.exe") {
              const game = {
                gameId: 3,
                route: filePath
              };
              this.addGameToRoute(game);
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
