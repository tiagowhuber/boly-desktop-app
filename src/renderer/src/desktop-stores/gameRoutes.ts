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
    },
    testSave(){
        const game={
            "gameId": 2,
            "route": "\"D:Juegos\testBody Defense.exe\""
          }
          this.localGames.push(game)
        this.saveToLocalStorage()
    },
    async searchForExes() {
      try {
        const result = await window.electronAPI.searchExeFiles();
        
        if (result && result.files && Array.isArray(result.files)) {
          console.log('Found exe files:', result.files);
          result.files.forEach(filePath => {
            // For now it's an arbitrary gameId. In the future, we will have to make a local gameId map or modify how they are registered locally.
            const gameId = this.localGames.length + 1;
            
            const game = {
              gameId,
              route: filePath
            };
            
            this.addGameToRoute(game);
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
