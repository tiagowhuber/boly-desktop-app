import { defineStore } from 'pinia'
import type { SubscriptionState, SubscriptionResponse, AuthToken } from '@/types'
import axios from 'axios'

export const useSubscription = defineStore('subscription', {  state: (): SubscriptionState => ({
    subscriptions: [],
    loading: false,
    error: null,
    paymentResult: null,
    transactionStatus: null,
    cancelSuccess: false
  }),
  actions: {
    async createSubscription(userId: number, planId: number, auth: AuthToken): Promise<boolean> {
      this.loading = true
      this.error = null
      try {
        const response = await axios.post('/v1/subscription', {
          userId,
          planId
        }, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
        
        if (response.status === 201) {
          // Refresh subscriptions list after creation
          await this.getUserSubscriptions(userId, auth)
          return true
        }
        
        this.error = response.data.message || 'Failed to create subscription'
        return false
      } catch (error: any) {
        console.error("Error creating subscription:", error)
        this.error = error.response?.data?.message || error.message || 'Unknown error occurred'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async getUserSubscriptions(userId: number, auth: AuthToken): Promise<boolean> {
      this.loading = true
      this.error = null
      try {
        const response = await axios.get(`/v1/subscription/${userId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
        
        if (response.status === 200) {
          const data = response.data as SubscriptionResponse
          this.subscriptions = Array.isArray(data.subscription) 
            ? data.subscription 
            : [data.subscription]
          return true
        }
        
        this.error = response.data.message || 'Failed to fetch subscriptions'
        return false
      } catch (error: any) {
        console.error("Error fetching subscriptions:", error)
        this.error = error.response?.data?.message || error.message || 'Unknown error occurred'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async deleteSubscription(subscriptionId: number, auth: AuthToken): Promise<boolean> {
      this.loading = true
      this.error = null
      try {
        const response = await axios.delete(`/v1/subscription/${subscriptionId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
        
        if (response.status === 200) {
          // Remove the deleted subscription from the local state
          this.subscriptions = this.subscriptions.filter(sub => sub.subscription_id !== subscriptionId)
          return true
        }
        
        this.error = response.data.message || 'Failed to delete subscription'
        return false
      } catch (error: any) {
        console.error("Error deleting subscription:", error)
        this.error = error.response?.data?.message || error.message || 'Unknown error occurred'
        return false
      } finally {
        this.loading = false
      }
    },
    
    async updateSubscriptionState(subscriptionId: number, isActive: number, auth: AuthToken): Promise<boolean> {
      this.loading = true
      this.error = null
      try {
        const response = await axios.patch(`/v1/subscription/${subscriptionId}`, 
          { isActive },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          }
        )
        
        if (response.status === 200) {
          // Update the subscription state in the local state
          this.subscriptions = this.subscriptions.map(sub => 
            sub.subscription_id === subscriptionId ? { ...sub, is_active: isActive } : sub
          )
          return true
        }
        
        this.error = response.data.message || 'Failed to update subscription state'
        return false
      } catch (error: any) {
        console.error("Error updating subscription state:", error)
        this.error = error.response?.data?.message || error.message || 'Unknown error occurred'
        return false
      } finally {
        this.loading = false
      }
    },
      async subscribeWithOneClick(
      userId: number, 
      planId: number, 
      username: string, 
      tbkUser: string, 
      amount: number, 
      auth: AuthToken,
      currency: string
    ): Promise<boolean> {
      this.loading = true
      this.error = null
      this.paymentResult = null
      
      try {
        console.log('Making subscription payment with params:', {
          userId,
          planId,
          username,
          tbk_user: tbkUser,
          amount,
          currency
        })
        
        const response = await axios.post(
          '/v1/subscription/oneclick',
          {
            userId,
            planId,
            username,
            tbk_user: tbkUser,
            amount,
            currency
          },
          { 
            headers: { Authorization: `Bearer ${auth.token}` } 
          }
        )
          console.log('Subscription API response:', response)
        
        this.paymentResult = response.data?.payment || null
        
        console.log('Payment result stored:', this.paymentResult)
        
        if (response.status === 201 && response.data && response.data.subscription) {
          await this.getUserSubscriptions(userId, auth)
          
          // Ensure we have a token for redirection
          if (!this.paymentResult || !this.paymentResult.token) {
            console.warn('No token in payment result, extracting from response data')
            // Try to extract token from other places in the response
            this.paymentResult = {
              ...this.paymentResult,
              token: response.data.token || response.data.subscription.token || null
            }
          }
          
          return true
        } else if (response.data && response.data.payment) {
          if (response.data.payment.details && 
              Array.isArray(response.data.payment.details) && 
              response.data.payment.details[0].response_code !== 0) {
            this.error = `Payment declined (code: ${response.data.payment.details[0].response_code}). Please try again or use a different payment method.`
          } else {
            this.error = response.data.message || 'Subscription creation failed. Please contact support.'
          }
          return false
        } else {
          this.error = 'Subscription payment failed. Please try again.'
          return false
        }
      } catch (error: any) {
        console.error('Error in subscription payment:', error)
        
        if (error.response) {
          console.error('Error response data:', error.response.data)
          
          const errorData = error.response.data
          if (errorData && errorData.payment) {
            this.error = `Payment declined: ${errorData.message || 'Unknown error'}`
          } else if (errorData && errorData.message) {
            this.error = errorData.message
          } else {
            this.error = 'Failed to process payment. Please try again later.'
          }
          
          if (errorData && errorData.errors) {
            const errorDetails = errorData.errors.map((e: any) => e.msg).join(', ')
            this.error += `: ${errorDetails}`
          }
        } else {
          this.error = 'An unexpected error occurred. Please try again later.'
        }
        
        return false
      } finally {
        this.loading = false
      }
    },
      async getTransactionStatus(buyOrder: string, auth: AuthToken): Promise<boolean> {
      this.loading = true;
      this.error = null;
      this.transactionStatus = null;
      
      try {
        const response = await axios.get(
          `/v1/subscription/transaction-status/${buyOrder}`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        
        if (response.status === 200 && response.data) {
          this.transactionStatus = response.data.status;
          return true;
        }
        
        this.error = response.data?.message || 'Failed to retrieve transaction status';
        return false;
      } catch (error: any) {
        console.error('Error getting transaction status:', error);
        this.error = error.response?.data?.message || error.message || 'Unknown error occurred while checking transaction status';
        return false;
      } finally {
        this.loading = false;
      }
    },    async cancelAutoRenewal(subscriptionId: number, auth: AuthToken): Promise<boolean> {
      this.loading = true;
      this.error = null;
      this.cancelSuccess = false;
      
      try {
        const response = await axios.patch(
          `/v1/subscription/${subscriptionId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        
        if (response.status === 200) {
          this.subscriptions = this.subscriptions.map(sub => 
            sub.subscription_id === subscriptionId ? { ...sub, auto_renew: 0 } : sub
          );
          this.cancelSuccess = true;
          return true;
        }
        
        this.error = response.data?.message || 'Failed to cancel subscription auto-renewal';
        return false;
      } catch (error: any) {
        console.error('Error canceling subscription auto-renewal:', error);
        this.error = error.response?.data?.message || error.message || 'Unknown error occurred while canceling subscription auto-renewal';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async renewSubscription(subscriptionId: number, auth: AuthToken): Promise<boolean> {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.patch(
          `/v1/subscription/${subscriptionId}/renew`,
          {},
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        
        if (response.status === 200) {
          // Update the subscription in the local state with the new active_until date
          // and ensure is_active and auto_renew are set to 1
          if (response.data && response.data.active_until) {
            this.subscriptions = this.subscriptions.map(sub => 
              sub.subscription_id === subscriptionId ? 
              { 
                ...sub, 
                is_active: 1,
                auto_renew: 1,
                active_until: response.data.active_until 
              } : sub
            );
          }
          return true;
        }
        
        this.error = response.data?.message || 'Failed to renew subscription';
        return false;
      } catch (error: any) {
        console.error('Error renewing subscription:', error);
        this.error = error.response?.data?.message || error.message || 'Unknown error occurred while renewing subscription';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async subscribeWithCode(userId: number, discountCode: string, auth: AuthToken): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post(
          `/v1/subscription/subscribe-with-discount-code`,
          { discountCode, userId },
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );

        if (response.status === 200) {
          this.subscriptions = this.subscriptions.map(sub =>
            sub.subscription_id === userId ? { ...sub, is_active: 1 } : sub
          );
          return true;
        }

        this.error = response.data?.message || 'Failed to subscribe with code';
        return false;
      } catch (error: any) {
        console.error('Error subscribing with code:', error);
        this.error = error.response?.data?.message || error.message || 'Unknown error occurred while subscribing with code';
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
})

export default useSubscription