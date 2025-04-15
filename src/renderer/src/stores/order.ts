import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuth } from '.'
import type { Order } from '@/types'

const useOrder = defineStore('order', {
  state: () => ({
    orders: [] as Order[],
    currentOrder: null as Order | null,
    userOrders: [] as Order[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    async getAllOrders() {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.get('/v1/order/', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        this.orders = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        this.error = error.response?.data?.message || 'Error fetching orders';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    async getOrdersByUserId(userId: number) {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.get(`/v1/order/user/${userId}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        this.userOrders = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error('Error fetching user orders:', error);
        this.error = error.response?.data?.message || 'Error fetching user orders';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    async getOrderById(orderId: number) {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.get(`/v1/order/${orderId}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        this.currentOrder = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error('Error fetching order:', error);
        this.error = error.response?.data?.message || 'Error fetching order';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    async createSubscriptionOrder(orderData: any) {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.post('/v1/order/subscription', orderData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error('Error creating subscription order:', error);
        this.error = error.response?.data?.message || 'Error creating subscription order';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    async createGameOrder(orderData: any) {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.post('/v1/order/game', orderData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error('Error creating game order:', error);
        this.error = error.response?.data?.message || 'Error creating game order';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    async updateOrder(orderId: number, orderData: any) {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.patch(`/v1/order/${orderId}`, orderData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error('Error updating order:', error);
        this.error = error.response?.data?.message || 'Error updating order';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    async deleteOrder(orderId: number) {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.delete(`/v1/order/${orderId}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        return { success: true, message: response.data.message };
      } catch (error: any) {
        console.error('Error deleting order:', error);
        this.error = error.response?.data?.message || 'Error deleting order';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    async updateOrderHasGame(orderData: { order_id: number; game_id: number }) {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.post('/v1/order/order-has-game', orderData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error('Error updating order game:', error);
        this.error = error.response?.data?.message || 'Error updating order game';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    async updateUserHasGame(userData: { user_id: number; game_id: number }) {
      try {
        this.loading = true;
        const auth = useAuth();
        const response = await axios.post('/v1/order/user-has-game', userData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        console.error('Error updating user game:', error);
        this.error = error.response?.data?.message || 'Error updating user game';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    }
  }
})

export default useOrder
