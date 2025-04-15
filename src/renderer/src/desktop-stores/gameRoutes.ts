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
      if (!this.localGames.includes(game)) { //Check if game has already installed //Doble check this
        this.localGames.push(game)
        this.saveToLocalStorage()
      }
    },
    removeGameFromRoute(game: { gameId: number,route:string }) {
      this.localGames = this.localGames.filter(id => id !== game)//Doble check this
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
    }
  }
})

export default useGameRoutes
