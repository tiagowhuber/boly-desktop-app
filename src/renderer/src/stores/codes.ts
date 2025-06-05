import { defineStore } from 'pinia'
import axios from 'axios'
import type { 
  DiscountCode, 
  DiscountCodeValidation, 
  CreateDiscountCodeRequest
} from '@/types'

const useCodes = defineStore('codes', {
  state: () => ({
    discountCode: null as DiscountCodeValidation | null,
    isValidating: false,
    validationError: null as string | null,
    allCodes: [] as DiscountCode[],
    isLoading: false
  }),
  actions: {
    resetState() {
      this.discountCode = null
      this.isValidating = false
      this.validationError = null
    },

    async validateDiscountCode(code: string, userId: number) {
      try {
        this.isValidating = true
        this.validationError = null
        
        const response = await axios.post(`/v1/discount-codes/${code}/validate`, {
          user_id: userId
        })
        
        if (response.status === 200) {
          this.discountCode = response.data
          return { success: true, data: response.data }
        }
        
        return { success: false, message: response.data.message }
      } catch (error: any) {
        console.error('Error validating discount code:', error)
        this.validationError = error.response?.data?.message || 'Error validating discount code'
        return { 
          success: false, 
          message: this.validationError 
        }
      } finally {
        this.isValidating = false
      }
    },    // Admin 
    async createDiscountCode(discountCodeData: CreateDiscountCodeRequest) {
      try {
        console.log('Creating discount code with data:', discountCodeData)
        const response = await axios.post('/v1/discount-codes', discountCodeData)
        
        if (response.status === 201) {
          // If we have the list loaded, add the new code to it
          if (this.allCodes.length > 0) {
            this.allCodes.push(response.data)
          }
          return { success: true, data: response.data }
        }
        
        return { success: false, message: response.data.message }
      } catch (error: any) {
        console.error('Error creating discount code:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error creating discount code'
        }
      }
    },
    
    // Admin 
    async fetchAllDiscountCodes() {
      try {
        this.isLoading = true
        const response = await axios.get('/v1/discount-codes')
        
        if (response.status === 200) {
          this.allCodes = response.data
          return { success: true, data: response.data }
        }
        
        return { success: false, message: response.data.message }
      } catch (error: any) {
        console.error('Error fetching discount codes:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error fetching discount codes'
        }
      } finally {
        this.isLoading = false
      }
    },
    
    // Admin 
    async updateDiscountCode(id: number, discountCodeData: Partial<CreateDiscountCodeRequest>) {
      try {
        const response = await axios.patch(`/v1/discount-codes/${id}`, discountCodeData)
        
        if (response.status === 200) {
          // Update local cache if we have it
          if (this.allCodes.length > 0) {
            const index = this.allCodes.findIndex(code => code.discount_code_id === id)
            if (index !== -1) {
              this.allCodes[index] = { ...this.allCodes[index], ...response.data }
            }
          }
          return { success: true, data: response.data }
        }
        
        return { success: false, message: response.data.message }
      } catch (error: any) {
        console.error('Error updating discount code:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error updating discount code'
        }
      }
    },
    
    // Admin 
    async deleteDiscountCode(id: number) {
      try {
        const response = await axios.delete(`/v1/discount-codes/${id}`)
        
        if (response.status === 200) {
          // Update local cache if we have it
          if (this.allCodes.length > 0) {
            this.allCodes = this.allCodes.filter(code => code.discount_code_id !== id)
          }
          return { success: true, message: response.data.message }
        }
        
        return { success: false, message: response.data.message }
      } catch (error: any) {
        console.error('Error deleting discount code:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error deleting discount code'
        }
      }
    }
  }
})

export default useCodes
