<script setup lang="ts">
// Imports
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser } from '@/stores'
import DesktopNavbar from './DesktopNavbar.vue'
import MobileNavbar from './MobileNavbar.vue'
import axios from 'axios'

const router = useRouter()
const auth = useAuth()
const user = useUser()

const isMobile = ref(window.innerWidth <= 768)

router.beforeEach((to, from, next) => {
  auth.checkToken()
  next()
})

const props = defineProps({
  color: {
    type: String,
    default: 'pink'
  }
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
  <MobileNavbar v-if="isMobile" :color="props.color" />
  <DesktopNavbar v-else :color="props.color" />
</template>
