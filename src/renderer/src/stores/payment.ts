import { defineStore } from 'pinia'
import type { PaymentState } from '@renderer/types'
import { useCart } from '.'
import axios from 'axios'

const usePayment = defineStore('payment', {
  state: (): PaymentState => ({
    token: "",
    hostUrl: "https://webpay3gint.transbank.cl",
    transactionUrl: null,
    orderId: "",
    sessionId: "",
    discount: 0,
    totalPrice: 0,
    order: [],
    orderResult: {},
    discount_code: "",
    isCodeValid: false,
    isCodeInvalid: false,
    loading: false,
    error: null
  }),
  actions: {
    async reqTransaction(_cart: number[], user_id: number, discount_code: string, url: string = "www.bolygames.com/postorder/"): Promise<boolean> {
      this.loading = true;
      this.error = null;
      const session_id = makeSessionId();
      
      try {
        this.order = _cart;
        const { data } = await axios.post(`v1/payment/`, {
          cart: _cart,
          user_id: user_id,
          discount_code: discount_code,
          session_id: session_id,
          url: url
        });

        this.token = data.token;
        this.transactionUrl = data.url;
        this.orderId = data.orderId;
        this.saveSessionData(data.orderId);

        return true;
      } catch (error) {
        console.error("Error in transaction request:", error);
        this.error = axios.isAxiosError(error) 
          ? error.response?.data?.message || 'Failed to create payment'
          : 'Unknown error occurred';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async checkDiscountCode(actualPrice: number, discountCode: string): Promise<void> {
      if (!discountCode) {
        this.isCodeValid = false;
        this.isCodeInvalid = true;
        this.updateDiscount(0);
        return;
      }

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/v1/discounts/${discountCode}`);
        this.isCodeValid = true;
        this.isCodeInvalid = false;
        this.discount_code = discountCode;
        this.updateDiscount(data.discount);
        this.getTotalCostWithDiscount(actualPrice, data.discount);
      } catch (error) {
        console.error("Error checking discount:", error);
        this.isCodeValid = false;
        this.isCodeInvalid = true;
        this.updateDiscount(0);
        this.getTotalCostWithDiscount(actualPrice);
      }
    },

    getTotalCostWithDiscount(cost: number, discount: number = 0): number {
      this.totalPrice = Math.round(cost * (1 - discount * 0.01));
      return this.totalPrice;
    },

    updateDiscount(discount: number): void {
      this.discount = discount;
    },

    async getOrderCart(orderId: string): Promise<any[] | undefined> {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/v1/payment/order/${orderId}`);
        return data.games;
      } catch (error) {
        console.error("Error in order request:", error);
        this.error = axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to get order details'
          : 'Unknown error occurred';
        return undefined;
      }
    },

    async checkOrder(token: string): Promise<boolean> {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_APP_API_URL}/api/v1/payment/state/${token}`);
        this.orderResult = data;

        if (data.status === 'AUTHORIZED') {
          const cartStore = useCart();
          cartStore.clearCart();
        }

        return true;
      } catch (error) {
        console.error("Error checking order:", error);
        this.error = axios.isAxiosError(error)
          ? error.response?.data?.message || 'Failed to check order status'
          : 'Unknown error occurred';
        return false;
      }
    },

    saveSessionData(orderId: string): void {
      localStorage.setItem('order', orderId);
    },

    loadSessionData(): string | null {
      return localStorage.getItem('order');
    },

    clearPaymentData(): void {
      this.token = "";
      this.transactionUrl = null;
      this.orderId = "";
      this.sessionId = "";
      this.discount = 0;
      this.totalPrice = 0;
      this.order = [];
      this.orderResult = {};
      this.discount_code = "";
      this.isCodeValid = false;
      this.isCodeInvalid = false;
      this.error = null;
      localStorage.removeItem('order');
    }
  }
})

function makeSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default usePayment