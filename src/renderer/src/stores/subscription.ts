import { defineStore } from 'pinia'
import type { SubscriptionState, Subscription, SubscriptionResponse, AuthToken } from '@renderer/types'
import axios from 'axios'

const useSubscription = defineStore('subscription', {
  state: (): SubscriptionState => ({
    subscriptions: [],
    loading: false,
    error: null
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
    }
  }
})

export default useSubscription