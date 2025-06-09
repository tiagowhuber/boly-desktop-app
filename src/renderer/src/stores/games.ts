import { defineStore } from 'pinia'
import UnityWebgl from 'unity-webgl'
import axios from 'axios'
import type { Game } from '@/types'
import { usePayment } from '.'

const useGames = defineStore('games', {  
  state: () => ({
    games: [] as Game[],
    loading: false,
    error: undefined as any,
    webGameData: null as { loader: string; data: string; framework: string; wasm: string } | null,
    unityPlayer: null as UnityWebgl | null,
    loadingUnity: true,
    ownershipCache: new Map() as Map<string, { owned: boolean, subscriptionAccess: boolean }>,
    gameMediaCache: new Map() as Map<number, any[]>
  }),
  actions: {
    async fetchData() {
      await this.getAll()
    },

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

    async ownsGame(gameId: number, userId: number): Promise<{ owned: boolean, subscriptionAccess: boolean }> {
      // Validate inputs
      if (!gameId || !userId) {
        console.warn('GamesStore: Invalid game or user ID:', { gameId, userId });
        return { owned: false, subscriptionAccess: false };
      }

      const cacheKey = `${gameId}-${userId}`;
      if (this.ownershipCache.has(cacheKey)) {
        return this.ownershipCache.get(cacheKey) ?? { owned: false, subscriptionAccess: false };
      }

      console.log(`GamesStore: Checking if user ${userId} owns game ${gameId}`);
      try {
        const response = await axios.get(`/v1/games/check-ownership/${gameId}/${userId}`);
        console.log('GamesStore: Ownership check response:', response.data);
        
        // Check for direct ownership vs subscription access
        const result = {
          owned: !!response.data?.game_id && !response.data?.subscription_access,
          subscriptionAccess: !!response.data?.subscription_access
        };
        
        this.ownershipCache.set(cacheKey, result);
        return result;
      } catch (error: any) {
        console.error('GamesStore: Error checking ownership:', error);
        this.ownershipCache.set(cacheKey, { owned: false, subscriptionAccess: false });
        return { owned: false, subscriptionAccess: false };
      }
    },

    async getUserGames(userId: number) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.get(`/v1/games/user/${userId}`)
        return response.data.map((game: any) => ({
          ...game,
          game_type: game.game_type || { name: 'Unknown' },
          play_time: game.play_time 
        }))
      } catch (error: any) {
        this.error = error
        return []
      } finally {
        this.loading = false
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

    async getGameMedia(gameId: number, type = 'all') {
      this.loading = true
      this.error = undefined
      
      if (this.gameMediaCache.has(gameId)) {
        const cachedMedia = this.gameMediaCache.get(gameId)
        if (type === 'all') {
          return cachedMedia
        } else {
          return cachedMedia?.filter(item => item.media_type === type)
        }
      }
      
      try {
        const response = await axios.get(`/v1/media/game/${gameId}${type !== 'all' ? `?type=${type}` : ''}`)
        
        // Cache the media data
        this.gameMediaCache.set(gameId, response.data)
        
        return response.data
      } catch (error: any) {
        console.error('GamesStore: Error fetching game media:', error)
        this.error = error
        return []
      } finally {
        this.loading = false
      }
    },
    
    async addGameMedia(gameId: number, mediaItems: Array<{media_url: string, media_type: 'image' | 'video', display_order?: number}>, auth: { token: string }) {
      this.loading = true
      this.error = undefined
      
      try {
        const response = await axios.post('/v1/media/bulk-create', {
          game_id: gameId,
          media: mediaItems
        }, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        
        // Update cache
        this.gameMediaCache.delete(gameId)
        
        return response.data
      } catch (error: any) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteGameMedia(mediaId: number, auth: { token: string }) {
      this.loading = true
      this.error = undefined
      
      try {
        const response = await axios.delete(`/v1/media/${mediaId}/delete`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        
        // Clear relevant cache entries that might contain this media
        this.gameMediaCache.clear()
        
        return response.data
      } catch (error: any) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteAllGameMedia(gameId: number, auth: { token: string }, mediaType?: 'image' | 'video') {
      this.loading = true
      this.error = undefined
      
      try {
        const url = `/v1/media/game/${gameId}/delete-all${mediaType ? `?type=${mediaType}` : ''}`
        const response = await axios.delete(url, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        
        // Update cache
        this.gameMediaCache.delete(gameId)
        
        return response.data
      } catch (error: any) {
        this.error = error
        throw error
      } finally {
        this.loading = false
      }
    },

    async getTotalCost(cartItems: number[]) {
      const filteredGames = this.games.filter(game => cartItems.includes(game.game_id))
      const total = filteredGames.reduce((sum, game) => {
        const price = typeof game.price === 'object' && game.price !== null ? (game.price as any).USD : 0
        return sum + (price || 0)
      }, 0)
      return Math.round(total)
    },

    async addToLibrary(gameId: number, userId: number, auth: { token: string }) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.post(`/v1/order/user-has-game`, {
          user_id: userId,
          game_id: gameId,
          temporary: 0
        }, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        return response.data
      } catch (error: any) {
        this.error = error
        return false
      } finally {
        this.loading = false
      }
    },

    async checkOrderStatus(token: string): Promise<boolean> {
      const paymentStore = usePayment();
      return await paymentStore.checkOrder(token);
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

    async getPlayTime(gameId: number, auth: { token: string }) {
      this.loading = true
      this.error = undefined
      try {
        const response = await axios.get(`/v1/games/${gameId}/playtime`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        return response.data.play_time || 0
      } catch (error: any) {
        this.error = error
        return 0
      } finally {
        this.loading = false
      }
    },

    async getGameIdByFileName(fileName: string): Promise<number | null> {
      console.log('File name input:', fileName, "File from games:", this.games.map(game => game.file_name && game.file_name["desktop"]));
      const game = this.games.find(game => game.file_name && game.file_name["desktop"] === fileName)
      return game ? game.game_id : null
    }
  }
})

export default useGames