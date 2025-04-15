import { defineStore } from 'pinia'
import type { PaymentState, PaymentMethod } from '@/types'
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
    error: null,
    paymentMethods: [],
    enrollmentToken: "",
    enrollmentUrl: "",
    enrollmentLoading: false,
    enrollmentError: null
  }),
  actions: {    async reqTransaction(_cart: number[], user_id: number, discount_code: string, url: string = "www.bolygames.com/postorder/", subtotal: number, currency: string = 'CLP'): Promise<boolean> {
      this.loading = true;
      this.error = null;
      const session_id = makeSessionId();
      
      try {
        console.log("Payment request payload:", { 
          cart: _cart, 
          user_id, 
          discount_code, 
          session_id, 
          url,
          subtotal,
          currency
        });
        
        this.order = _cart;
        const apiUrl = `${import.meta.env.VITE_APP_API_URL}/v1/payment/`;
        const response = await axios.post(apiUrl, {
          cart: _cart,
          user_id: user_id,
          discount_code: discount_code,
          session_id: session_id,
          url: url,
          subtotal: subtotal,
          currency: currency 
        });
        
        console.log("Payment response:", response);
        const { data } = response;

        this.token = data.token;
        this.transactionUrl = data.url;
        this.orderId = data.orderId;
        this.saveSessionData(data.orderId);

        return true;
      } catch (error) {
        console.error("Error in transaction request:", error);
        
        // Add detailed error logging
        if (axios.isAxiosError(error)) {
          console.error("Status:", error.response?.status);
          console.error("Response data:", error.response?.data);
          console.error("Request config:", error.config);
          this.error = error.response?.data?.message || 'Failed to create payment';
        } else {
          console.error("Non-Axios error:", error);
          this.error = 'Unknown error occurred';
        }
        
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
        const apiUrl = `${import.meta.env.VITE_APP_API_URL}/v1/discounts/${discountCode}`;
        const { data } = await axios.get(apiUrl);
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
        const apiUrl = `${import.meta.env.VITE_APP_API_URL}/v1/payment/order/${orderId}`;
        const { data } = await axios.get(apiUrl);
        return data.games;
      } catch (error) {
        console.error("Error in order request:", error);
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Failed to get order details';
        } else {
          this.error = 'Unknown error occurred';
        }
        return undefined;
      }
    },

    async checkOrder(token: string): Promise<boolean> {
      try {
        const apiUrl = `${import.meta.env.VITE_APP_API_URL}/v1/payment/state/${token}`;
        const { data } = await axios.get(apiUrl);
        this.orderResult = data;
        console.log("Order result:", data);
        
        // Handle all possible Transbank statuses
        switch(data.status) {
          case 'AUTHORIZED':
            // Payment was successful
            const cartStore = useCart();
            cartStore.clearCart();
            return true;
            
          case 'FAILED':
            this.error = 'The payment failed. Please try again.';
            return false;
            
          case 'REJECTED':
            this.error = 'The payment was rejected. Please check your payment details and try again.';
            return false;
            
          case 'CANCELED':
            this.error = 'The payment was canceled by the user.';
            return false;
            
          case 'REVERSED':
            this.error = 'The payment was reversed. Please contact customer support.';
            return false;
            
          default:
            this.error = `Unexpected payment status: ${data.status}`;
            return false;
        }
      } catch (error) {
        console.error("Error checking order:", error);
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Failed to check order status';
        } else {
          this.error = 'Unknown error occurred';
        }
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
      this.enrollmentToken = "";
      this.enrollmentUrl = "";
      this.enrollmentError = null;
    },

    async fetchPaymentMethods(userId: number, token: string): Promise<PaymentMethod[]> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/v1/webpay-oneclick/methods/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        this.paymentMethods = response.data.paymentMethods || [];
        return this.paymentMethods;
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Failed to fetch payment methods';
        } else {
          this.error = 'Unknown error occurred';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createEnrollment(username: string, email: string, responseUrl: string, token: string): Promise<{enrollmentToken: string, enrollmentUrl: string}> {
      this.enrollmentLoading = true;
      this.enrollmentError = null;
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/v1/webpay-oneclick/inscriptions`,
          {
            username,
            email,
            response_url: responseUrl
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        this.enrollmentToken = response.data.token;
        this.enrollmentUrl = response.data.url_webpay;
        
        // Store token in localStorage as well for verification after redirect
        localStorage.setItem('tbk_enrollment_token', this.enrollmentToken);
        
        return {
          enrollmentToken: this.enrollmentToken,
          enrollmentUrl: this.enrollmentUrl
        };
      } catch (error) {
        console.error('Error creating enrollment:', error);
        if (axios.isAxiosError(error)) {
          this.enrollmentError = error.response?.data?.message || 'Failed to create enrollment';
        } else {
          this.enrollmentError = 'Unknown error occurred';
        }
        throw error;
      } finally {
        this.enrollmentLoading = false;
      }
    },

    async confirmEnrollment(enrollmentToken: string, username: string, token: string): Promise<any> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.put(
          `${import.meta.env.VITE_APP_API_URL}/v1/webpay-oneclick/inscriptions/${enrollmentToken}`,
          { username },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        localStorage.removeItem('tbk_enrollment_token');
        
        if (response.data.success === false) {
          this.error = response.data.message || 'Failed to register card';
          throw new Error(this.error ?? undefined);
        }
        
        return response.data;
      } catch (error) {
        console.error('Error confirming enrollment:', error);
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Failed to confirm enrollment';
        } else {
          this.error = 'Unknown error occurred';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deletePaymentMethod(username: string, tbkUser: string, token: string): Promise<any> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_APP_API_URL}/v1/webpay-oneclick/inscriptions`,
          {
            data: {
              username,
              tbk_user: tbkUser
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('Error deleting payment method:', error);
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Failed to delete payment method';
        } else {
          this.error = 'Unknown error occurred';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async makeOneClickPayment(username: string, tbkUser: string, buyOrder: string, amount: number, token: string): Promise<any> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/v1/webpay-oneclick/transactions`,
          {
            username,
            tbk_user: tbkUser,
            buy_order: buyOrder,
            details: [
              {
                commerce_code: import.meta.env.VITE_COMMERCE_CODE || "597055555542",
                buy_order: `detail_${buyOrder}`,
                amount
              }
            ]
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('Error making OneClick payment:', error);
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Failed to process payment';
        } else {
          this.error = 'Unknown error occurred';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async checkOneClickTransaction(buyOrder: string, token: string): Promise<any> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/v1/webpay-oneclick/transactions/${buyOrder}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('Error checking OneClick transaction:', error);
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Failed to check transaction';
        } else {
          this.error = 'Unknown error occurred';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async refundOneClickTransaction(buyOrder: string, commerceCode: string, detailBuyOrder: string, amount: number, token: string): Promise<any> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/v1/webpay-oneclick/transactions/${buyOrder}/refunds`,
          {
            commerce_code: commerceCode,
            detail_buy_order: detailBuyOrder,
            amount
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        return response.data;
      } catch (error) {
        console.error('Error refunding OneClick transaction:', error);
        if (axios.isAxiosError(error)) {
          this.error = error.response?.data?.message || 'Failed to process refund';
        } else {
          this.error = 'Unknown error occurred';
        }
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
})

function makeSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default usePayment