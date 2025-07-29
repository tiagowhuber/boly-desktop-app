<script setup lang="ts">
// Imports
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser } from '@/stores'
import DesktopReportProblem from './ReportProblemDesktopView.vue'
// Mobile component removed for desktop-only app
import axios from 'axios'

const router = useRouter()
const auth = useAuth()
const user = useUser()

// Mobile detection removed for desktop-only app

router.beforeEach((to, from, next) => {
  auth.checkToken()
  next()
})

onMounted(async () => {
  if (auth.isLoggedIn && user.userId) {
    try {
      const response = await axios.get(`/v1/users/${user.userId}`)
      if (response.status === 200) {
        user.setUser(response.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  // Mobile resize listener removed for desktop-only app
})
</script>

<template>
  <!-- Mobile component removed for desktop-only app -->
  <DesktopReportProblem />
</template>
