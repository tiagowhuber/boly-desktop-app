import { defineStore } from 'pinia'
import axios from 'axios'
import { useGames } from '.'

export const useAchievements = defineStore('achievements', {
  state: (): AchievementStore => ({
    inspectedGame: {},
    achievements: [],
    loading: true,
  }),
  actions: {
    async fetchAchievements(gameId: number, auth: { token: string }) {
      this.loading = true
      try {
        const { data } = await axios.get(`/api/v1/achievements/game/${gameId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })
        
        this.achievements = data.achievements
        this.inspectedGame = data.game
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async updateAchievements(auth: { token: string }) {
      if (!this.inspectedGame?.game_id) return

      try {
        const { data, status } = await axios.patch(
          `/api/v1/achievements/${this.inspectedGame.game_id}/update-data`,
          {
            gameId: this.inspectedGame.game_id,
            achievements: this.achievements,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        )

        if (status !== 200) {
          return { message: 'modal_achievements_error', error: data.message }
        }
        
        return { message: 'modal_achievements_updated', error: '' }
      } catch (error) {
        console.error(error)
        return { message: 'modal_achievements_error', error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },

    async fetchUserProgress(gameId: number, auth: { token: string }) {
      this.loading = true
      try {
        const { data } = await axios.get(`/api/v1/achievements/user/${gameId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })
        
        return data
      } catch (error) {
        console.error(error)
        return undefined
      } finally {
        this.loading = false
      }
    },
  }
})