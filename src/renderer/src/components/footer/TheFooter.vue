<script setup>
import { useAuth } from '@/stores'
import BoliLogo from '../icons/BoliLogoFooter.vue';
import { RouterLink, useRoute } from 'vue-router';
import { computed } from 'vue';

// const props = defineProps(['small']);
const route = useRoute();
const auth = useAuth()

const props = defineProps({
  color: String,
  small: Boolean
})

// Check if current route is login page or Register page
const isRegisterPage = computed(() => route.path === '/register');
const isLoginPage = computed(() => route.path === '/login');
const isForgotPasswordPage = computed(() => route.path === '/forgot-password');
const isConfirmPasswordResetPage = computed(() => route.path === '/confirm-password-reset');
const isSessionInvalidatedPage = computed(() => route.path === '/session-invalidated');

</script>

<template>
  <footer :style="'height: ' + (props.small ? 200 : 450) + 'px;'" :class="[props.color,{ 'login-register-footer': isLoginPage || isRegisterPage || isForgotPasswordPage || isConfirmPasswordResetPage || isSessionInvalidatedPage }]" >
    <div class="footer-container">
      <RouterLink to="/">
        <BoliLogo class="icon-logo" :style="'height: ' + (props.small ? 75 : 110) + 'px;'" />
      </RouterLink>
      <div class="disclaimer" v-if="!props.small">
        <br>
        <p>{{ $t('copyright_disclaimer') }}
          <br>{{ $t('vat_disclaimer') }}
        </p>
      </div>
      <br><br><br>
      <div class="navigation">
        <span v-if="props.small">
          <RouterLink to="/"> {{ $t('home') }}</RouterLink>|
        </span>
        <RouterLink to="/privacy">{{ $t('privacy_policy') }}</RouterLink>|
        <RouterLink to="/legal">{{ $t('legal_info') }}</RouterLink>|
        <RouterLink to="/subscriber-agreement">{{ $t('subscriber_agreement') }}</RouterLink>|
        <RouterLink to="/refund">{{ $t('refunds') }}</RouterLink>|
        <RouterLink to="/cookies">{{ $t('cookies') }}</RouterLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-container {
  display: flex;
  width: 80%;
  margin: auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
}

.disclaimer p {
  text-align: center;
  font-size: 0.9rem;
  color: #fff;
  font-weight: bold;
  margin: 0px;
}

.icon-logo {
  margin-right: 50px;
}

@media (max-width: 768px) {
  .icon-logo {
    margin-right: 0px;
    margin-top: 60px;
    height: 60px !important;
  }

  .footer-container {
    margin-top: 50px;
  }
}

footer {
  display: flex;
  font-size: 1rem;
  width: 100%;
  background-color: #48ace4;
  position: relative;
  z-index: 1;
  margin-top: 150px;
  clip-path: polygon(0 30%, 100% 0, 100% 100%, 0 100%);
}

/* Special styling for login page footer */
.login-register-footer {
  background-color: #3b337b;
}

.blue{
    background-color: #48ace4;
}

.pink{
  background-color: var(--boly-button-pink);
}

.dark-purple{
  background: rgb(59,51,123);
}

a {
  padding: 0 1rem;
  height: 80%;
  align-content: center;
}

a:hover {
  color: var(--lightCyan);
}
</style>
