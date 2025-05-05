import { defineStore } from 'pinia';
import axios from 'axios';
import { useUser} from '.';
import type { WishlistItem } from '@/types';


const useWishlist = defineStore('wishlist', {
  state: () => ({
    items: [] as WishlistItem[],
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    async fetchWishlist() {
      this.loading = true;
      this.error = null;
      try {
        const user = useUser();
        const userId = user.userId;
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        const response = await axios.get(`/v1/wishlist/${userId}`);
        this.items = response.data;
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
        this.error = 'Failed to load wishlist';
      } finally {
        this.loading = false;
      }
    },
    
    async addToWishlist(gameId: string) {
      this.loading = true;
      this.error = null;
      try {
        const user = useUser();
        const userId = user.userId;
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        const response = await axios.post('/v1/wishlist/add-game', {
          user_id: userId,
          game_game_id: Number(gameId)
        });
        this.items.push(response.data);
        return true;
      } catch (error) {
        console.error('Failed to add item to wishlist:', error);
        this.error = 'Failed to add item to wishlist';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async removeFromWishlist(gameId: string) {
      this.loading = true;
      this.error = null;
      try {
        const user = useUser();
        const userId = user.userId;
        
        if (!userId) {
          throw new Error('User not authenticated');
        }
        
        // Using axios.delete with data in the request body
        await axios.delete('/v1/wishlist/remove-game', {
          data: {
            user_id: userId,
            game_game_id: gameId
          }
        });
        
        this.items = this.items.filter(item => item.game_game_id !== Number(gameId));
        return true;
      } catch (error) {
        console.error('Failed to remove item from wishlist:', error);
        this.error = 'Failed to remove item from wishlist';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    isInWishlist(productId: string): boolean {
      return this.items.some(item => item.game_game_id === Number(productId));
    }
  }
});

export default useWishlist;