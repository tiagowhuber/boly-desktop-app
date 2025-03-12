<script setup>
import { useAuth } from '@renderer/stores'
import BoliLogo from '../icons/BoliLogo.vue';
import { RouterLink } from 'vue-router';

const props = defineProps(['small']);

const auth = useAuth()
</script>

<template>
  <footer :style="'height: ' + (props.small ? 200 : 450) + 'px;'">
    <div class="footer-container">
      <BoliLogo class="icon-logo" :style="'height: ' + (props.small ? 75 : 110) + 'px;'" />
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

footer {
  display: flex;
  font-size: 1rem;

  width: 100%;

  border-top: 5px solid var(--boly-button-blue);
  background-color: var(--boly-bg-dark);
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
