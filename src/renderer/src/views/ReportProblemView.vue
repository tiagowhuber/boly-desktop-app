<script setup lang="ts">
// Imports
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser } from '@/stores'
import DesktopReportProblem from './ReportProblemDesktopView.vue'
import MobileReportProblem from './ReportProblemMobileView.vue'
import axios from 'axios'

const router = useRouter()
const auth = useAuth()
const user = useUser()

const isMobile = ref(window.innerWidth <= 768)

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

  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })
})
</script>

<template>
  <MobileReportProblem v-if="isMobile"/>
  <DesktopReportProblem v-else/>
</template>
