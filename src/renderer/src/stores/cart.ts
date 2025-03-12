import { defineStore } from 'pinia'

export interface CartState {
  cart: number[]
}

const useCart = defineStore('cart', {
  state: (): CartState => ({
    cart: JSON.parse(localStorage.getItem('cart') || '[]')
  }),
  actions: {
    addGameToCart(game: { game_id: number }) {
      if (!this.cart.includes(game.game_id)) {
        this.cart.push(game.game_id)
        this.saveToLocalStorage()
      }
    },
    removeGameFromCart(game: { game_id: number }) {
      this.cart = this.cart.filter(id => id !== game.game_id)
      this.saveToLocalStorage()
    },
    clearCart() {
      this.cart = []
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.cart))
    }
  }
})

export default useCart
