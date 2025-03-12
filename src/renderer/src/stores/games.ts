import { defineStore } from 'pinia'
import UnityWebgl from 'unity-webgl'
import axios from 'axios'
import type { Game } from '@renderer/types'

export const useGames = defineStore('games', {
  state: () => ({
    games: [] as Game[],
    loading: false,
    error: undefined as any,
    webGameData: null as { loader: string; data: string; framework: string; wasm: string } | null,
    unityPlayer: null as UnityWebgl | null,
    loadingUnity: true,
    ownershipCache: new Map() as Map<string, boolean>
  }),
  actions: {
    async getAll() {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.get('/v1/games/')
        this.games = response.data.map((game: any) => ({
          ...game,
          game_type: game.game_type || { name: 'Unknown' }
        }))
      } catch (error: any) {
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async getById(id: number) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.get(`/v1/games/${id}`)
        return response.data
      } catch (error: any) {
        this.error = error
        return null
      } finally {
        this.loading = false
      }
    },

    async ownsGame(gameId: number, userId: number): Promise<boolean> {
      // Validate inputs
      if (!gameId || !userId) {
        console.warn('GamesStore: Invalid game or user ID:', { gameId, userId });
        return false;
      }

      const cacheKey = `${gameId}-${userId}`;
      if (this.ownershipCache.has(cacheKey)) {
        return this.ownershipCache.get(cacheKey) ?? false;
      }

      console.log(`GamesStore: Checking if user ${userId} owns game ${gameId}`);
      try {
        const response = await axios.get(`/v1/games/check-ownership/${gameId}/${userId}`);
        console.log('GamesStore: Ownership check response:', response.data);
        // Check if the response contains a game_id, which indicates ownership
        const result = !!response.data?.game_id;
        this.ownershipCache.set(cacheKey, result);
        return result;
      } catch (error: any) {
        console.error('GamesStore: Error checking ownership:', error);
        this.ownershipCache.set(cacheKey, false);
        return false;
      }
    },

    async getGameType(gameId: number) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.get(`/v1/game_types/${gameId}`)
        return response.data
      } catch (error: any) {
        this.error = error
        return undefined
      } finally {
        this.loading = false
      }
    },

    async getGamesByDeveloper(developerId: number) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.get(`/v1/games/user-developed/${developerId}`)
        return response.data
      } catch (error: any) {
        this.error = error
        return []
      } finally {
        this.loading = false
      }
    },

    async updateGame(gameId: number, gameData: Partial<Game>, auth: { token: string }) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.patch(`/v1/games/${gameId}/update-data`, gameData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        return response.data
      } catch (error: any) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateGameImages(gameId: number, formData: FormData, auth: { token: string }) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.post(`/v1/games/${gameId}/updateImages`, formData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        return response.data
      } catch (error: any) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteGameMedia(gameId: number, mediaUrls: string[], auth: { token: string }) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.post(`/v1/games/${gameId}/deleteMedia`, 
          { mediaUrls },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        )
        return response.data
      } catch (error: any) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async getGameUrl(gameId: number, auth: { token: string }) {
      console.log('GamesStore: Starting getGameUrl for game:', gameId);
      this.loading = true
      this.error = undefined
      try {
        console.log('GamesStore: Making URL request');
        const response = await axios.post('/v1/games/url', 
          {
            game_id: gameId,
            is_web: true
          },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        )
        console.log('GamesStore: Received URL response');
        
        this.webGameData = response.data
        if (this.webGameData) {
          console.log('GamesStore: Creating Unity player instance');
          this.unityPlayer = new UnityWebgl({
            loaderUrl: this.webGameData.loader,
            dataUrl: this.webGameData.data,
            frameworkUrl: this.webGameData.framework,
            codeUrl: this.webGameData.wasm
          })
          console.log('GamesStore: Unity player instance created');
        }
        this.loadingUnity = false
        return response.data
      } catch (error: any) {
        console.error('GamesStore: Error in getGameUrl:', error);
        this.error = error
        this.loadingUnity = false
        throw error
      } finally {
        this.loading = false
      }
    },

    async downloadGame(gameId: number, auth: { token: string }) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.post(`/v1/games/${gameId}`, 
          { game_id: gameId },
          { 
            headers: { Authorization: `Bearer ${auth.token}` },
            responseType: 'blob'
          }
        )
        
        const fileName = "files_game.rar"
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        return true
      } catch (error: any) {
        this.error = error
        return false
      } finally {
        this.loading = false
      }
    },

    async claimFreeGame(gameId: number, auth: { token: string }) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.post('/v1/payment/claim-free',
          { game_id: gameId },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        )
        return response.data
      } catch (error: any) {
        this.error = error
        return false
      } finally {
        this.loading = false
      }
    },

    getTotalCost(cartItems: number[]) {
      const filteredGames = this.games.filter(game => cartItems.includes(game.game_id))
      const total = filteredGames.reduce((sum, game) => {
        const price = typeof game.price === 'object' && game.price !== null ? (game.price as any).USD : 0
        return sum + (price || 0)
      }, 0)
      return Math.round(total)
    }
  }
})

export default useGames
