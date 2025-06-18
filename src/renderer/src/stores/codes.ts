import { defineStore } from 'pinia'
import axios from 'axios'
import type { 
  DiscountCode, 
  DiscountCodeValidation, 
  CreateDiscountCodeRequest,
  UserHasDiscountCode
} from '@/types'
import { useAuth } from '.'; 

const useCodes = defineStore('codes', {
  state: () => ({
    discountCode: null as DiscountCodeValidation | null,
    isValidating: false,
    validationError: null as string | null,
    allCodes: [] as DiscountCode[],
    isLoading: false,
    userDiscountCodes: [] as UserHasDiscountCode[] 
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
        
        const response = await axios.post(`/v1/discount-codes/validate/${code}`, {
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
      const auth = useAuth();
      if (!auth.token) {
        return { success: false, message: 'Authentication token not found.' };
      }
      try {
        console.log('Creating discount code with data:', discountCodeData)
        const response = await axios.post('/v1/discount-codes', discountCodeData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        
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
      const auth = useAuth();
      if (!auth.token) {
        this.validationError = 'Authentication token not found.';
        return { success: false, message: 'Authentication token not found.' };
      }
      try {
        this.isLoading = true
        const response = await axios.get('/v1/discount-codes', {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        
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
      const auth = useAuth();
      if (!auth.token) {
        return { success: false, message: 'Authentication token not found.' };
      }
      try {
        const response = await axios.patch(`/v1/discount-codes/${id}`, discountCodeData, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        
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
      const auth = useAuth();
      if (!auth.token) {
        return { success: false, message: 'Authentication token not found.' };
      }
      try {
        const response = await axios.delete(`/v1/discount-codes/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        
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
    },

    // Admin
    async assignDiscountCodeToUser(userId: number, discountCodeId: number) {
      const auth = useAuth();
      if (!auth.token) {
        return { success: false, message: 'Authentication token not found.' };
      }
      try {
        const response = await axios.post('/v1/discount-codes/user/assign/', {
          user_id: userId,
          discount_code_id: discountCodeId
        }, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        
        if (response.status === 201) {
          return { success: true, data: response.data };
        }
        
        return { success: false, message: response.data.message };
      } catch (error: any) {
        console.error('Error assigning discount code to user:', error);
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error assigning discount code to user'
        };
      }
    },

    // Public
    async getUserDiscountCodes(userId: number) {
      const auth = useAuth();
      if (!auth.token) {
        this.validationError = 'Authentication token not found.';
        return { success: false, message: 'Authentication token not found.' };
      }
      try {
        this.isLoading = true;
        const response = await axios.get(`/v1/discount-codes/user/available/${userId}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        
        if (response.status === 200) {
          this.userDiscountCodes = response.data;
          return { success: true, data: response.data };
        }
        
        return { success: false, message: response.data.message };
      } catch (error: any) {
        console.error('Error fetching user discount codes:', error);
        this.validationError = error.response?.data?.message || 'Error fetching user discount codes';
        return { 
          success: false, 
          message: this.validationError
        };
      } finally {
        this.isLoading = false;
      }
    },

    // Admin
    async removeUserDiscountCode(userId: number, discountCodeId: number) {
      const auth = useAuth();
      if (!auth.token) {
        return { success: false, message: 'Authentication token not found.' };
      }
      try {
        const response = await axios.delete('/v1/discount-codes/user/remove/', {
          data: {
            user_id: userId,
            discount_code_id: discountCodeId
          },
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        
        if (response.status === 200) {
          // Optionally, refresh userDiscountCodes or remove from it
          this.userDiscountCodes = this.userDiscountCodes.filter(
            (assignment: UserHasDiscountCode) => !(assignment.user_id === userId && assignment.discount_code_id === discountCodeId)
          );
          return { success: true, message: response.data.message };
        }
        
        return { success: false, message: response.data.message };
      } catch (error: any) {
        console.error('Error removing discount code from user:', error);
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error removing discount code from user'
        };
      }
    },

    async assignDiscountCodeToUserByLink(code: string, userId: number) {
      const auth = useAuth();
      if (!auth.token) {
        return { success: false, message: 'Authentication token not found. Please log in.' };
      }
      
      if (!code || !userId) {
        return { success: false, message: 'Invalid code or user information.' };
      }
      
      try {
        const response = await axios.post('/v1/discount-codes/user/validate/', {
          user_id: userId,
          discount_code_string: code
        }, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });

        if (response.status === 201) {
          // Refresh user discount codes after successful assignment
          this.getUserDiscountCodes(userId);
          return { success: true, data: response.data, message: 'Discount code successfully claimed!' };
        }

        return { success: false, message: response.data.message || 'Failed to claim discount code.' };
      } catch (error: any) {
        console.error('Error assigning discount code to user:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Error assigning discount code to user';
        if (error.response?.status === 409) {
          errorMessage = 'You already have this discount code.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Discount code not found or is invalid.';
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'This discount code cannot be redeemed.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        return {
          success: false,
          message: errorMessage
        };
      }
    },
  }
})

export default useCodes
