<script setup lang="ts">
import ContactForm from '@renderer/components/ContactForm.vue';
import { useAuth, useUser } from '@renderer/stores';
import { onMounted } from 'vue';
import axios, { AxiosError } from 'axios';

const auth = useAuth();
const user = useUser();

onMounted(async () => {
  if (auth.isLoggedIn && user.userId) {
    try {
      const response = await axios.get(`/v1/users/${user.userId}`);
      if (response.status === 200) {
        user.setUser(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching user data:', axiosError.message);
    }
  }
});
</script>

<template>
  <div class="section">
    <ContactForm />
  </div>
</template>

<style scoped>

.cform {
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 15px;
}

</style>
