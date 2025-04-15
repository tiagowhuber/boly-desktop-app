import { defineStore } from 'pinia'
import axios from 'axios'
import type { Developer, Auth } from '@/types'

export const useDeveloper = defineStore('developer', {
  state: () => ({
    currentDeveloper: null as Developer | null,
    developers: [] as Developer[],
    error: null as string | null
  }),

  actions: {
    async fetchAllDevelopers() {
      try {
        const response = await axios.get('/v1/developers')
        if (response.status === 200) {
          this.developers = response.data
        }
      } catch (error: any) {
        console.error('Error fetching developers:', error)
        this.error = error.response?.data?.message || 'Could not fetch developers'
      }
    },

    async fetchDeveloperById(developerId: number) {
      try {
        const response = await axios.get(`/v1/developers/${developerId}`)
        if (response.status === 200) {
          this.currentDeveloper = response.data
          return response.data
        }
      } catch (error: any) {
        console.error(`Error fetching developer ${developerId}:`, error)
        this.error = error.response?.data?.message || 'Could not fetch developer'
        return null
      }
    },

    async createDeveloper(developerData: Omit<Developer, 'developer_id'>, auth: Auth) {
      try {
        if (!auth.isLoggedIn) {
          throw new Error('Authentication required')
        }

        const response = await axios.post('/v1/developers', developerData, {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        })

        if (response.status === 201) {
          await this.fetchAllDevelopers()
          return response.data
        }
      } catch (error: any) {
        console.error('Error creating developer:', error)
        this.error = error.response?.data?.message || 'Could not create developer'
        throw error
      }
    },

    async updateDeveloper(developerId: number, developerData: Partial<Developer>, auth: Auth) {
      try {
        if (!auth.isLoggedIn) {
          throw new Error('Authentication required')
        }

        const response = await axios.patch(`/v1/developers/pass`, {
          id: developerId,
          ...developerData
        }, {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        })

        if (response.status === 200) {
          await this.fetchDeveloperById(developerId)
          return response.data
        }
      } catch (error: any) {
        console.error(`Error updating developer ${developerId}:`, error)
        this.error = error.response?.data?.message || 'Could not update developer'
        throw error
      }
    },

    async deleteDeveloper(developerId: number, auth: Auth) {
      try {
        if (!auth.isLoggedIn) {
          throw new Error('Authentication required')
        }

        const response = await axios.delete(`/v1/developers/${developerId}`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        })

        if (response.status === 200) {
          await this.fetchAllDevelopers()
          return true
        }
      } catch (error: any) {
        console.error(`Error deleting developer ${developerId}:`, error)
        this.error = error.response?.data?.message || 'Could not delete developer'
        throw error
      }
    }
  }
})

export default useDeveloper