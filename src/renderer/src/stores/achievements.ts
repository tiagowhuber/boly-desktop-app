import { defineStore } from 'pinia'
import axios from 'axios'
import { useGames } from '.'
import type { Achievement } from '@/types';

const useAchievements = defineStore('achievements', {
  state: () => ({
    inspectedGame: {} as any, 
    achievements: [] as Achievement[],
    userProgress: [] as any[],
    loading: true,
  }),
  actions: {
    async fetchAchievements(gameId: number, auth: { token: string }) {
      this.loading = true
      console.log(`Fetching achievements for game ID: ${gameId}`)
      try {
        const { data } = await axios.get(`/v1/achievements/game/${gameId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })
        console.log('Fetched achievements data:', data)
        
        this.achievements = data
        const gamesStore = useGames()
        this.inspectedGame = gamesStore.games.find(g => g.game_id === gameId) || {}
        console.log('Inspected game:', this.inspectedGame)
      } catch (error) {
        console.error('Error fetching achievements:', error)
      } finally {
        this.loading = false
        console.log('Finished fetching achievements')
      }
    },

    async updateAchievements(auth: { token: string }) {

      try {
        const updatePromises = this.achievements.map(achievement => 
          axios.patch(
            `/v1/achievements/${achievement.id}/update-data`,
            {
              name: achievement.name,
              description: achievement.description,
              game_id: achievement.gameId,
              icon_url: achievement.icon_url,
              progress: achievement.progress
            },
            {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            }
          )
        )
        
        await Promise.all(updatePromises)
        return { message: 'modal_achievements_updated', error: '' }
      } catch (error) {
        console.error(error)
        return { message: 'modal_achievements_error', error: error instanceof Error ? error.message : 'Unknown error' }
      }
    },

    async fetchUserProgress(userId: number, auth: { token: string }) {
      this.loading = true
      try {
        const { data } = await axios.get(`/v1/user_has_achievements/${userId}/progress`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        })
        console.log('Fetched user progress data:', data)
        this.userProgress = Array.isArray(data) ? data : []
        if (this.achievements.length > 0) {
          this.achievements = this.achievements.map(achievement => ({
            ...achievement,
            current_progress: this.userProgress.find((p: { achievement_id: number, current_progress: number }) => 
              p.achievement_id === achievement.id
            )?.current_progress || 0
          }))
        }
        return this.userProgress
      } catch (error) {
        console.error('Error fetching user progress:', error)
        return []
      } finally {
        this.loading = false
      }
    },
  }
})

export default useAchievements