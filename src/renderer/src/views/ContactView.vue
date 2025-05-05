<script setup lang="ts">
import ContactForm from '@/components/ContactForm.vue';
import MobileTemplate from '@/components/MobileTemplate.vue';
import { useAuth, useUser } from '@/stores';
import { onMounted, ref } from 'vue';
import axios, { AxiosError } from 'axios';

const auth = useAuth();
const user = useUser();
const isMobile = ref(window.innerWidth < 768);

// Watch for window resize to toggle mobile view
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768;
});

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

// Function to handle back action from mobile template
// const handleBack = () => {
//   window.history.back();
// };
</script>

<template>
  <div>
    <!-- Desktop version -->
    <div v-if="!isMobile" class="section">
      <ContactForm />
    </div>

    <!-- Mobile version -->
    <MobileTemplate v-else>
      <div class="mobile-contact-container">
        <ContactForm />
      </div>
    </MobileTemplate>
  </div>
</template>

<style scoped>
.cform {
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 15px;
}

.mobile-contact-container {
  padding: 0.5rem;
  width: 100%;
}

/* Mobile-specific styles for the contact form */
@media (max-width: 768px) {
  :deep(.contact-form) {
    width: 100%;
    height: auto;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem 0;
  }

  :deep(.contact-form-title) {
    width: 100%;
    padding: 0 1rem;
  }

  :deep(.contact-form-title h2) {
    font-size: 200%;
  }

  :deep(.contact-form-title h3) {
    font-size: 150%;
  }

  :deep(.form-container) {
    width: 100%;
    margin: 0 auto;
  }

  :deep(textarea) {
    height: 150px;
  }
}
</style>
