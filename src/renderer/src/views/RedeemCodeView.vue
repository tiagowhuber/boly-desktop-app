<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useCodesStore from '@/stores/codes';
import useUserStore from '@/stores/user';
import LoadingIcon from '@/components/LoadingIcon.vue';
import FloppyIcon from '@/components/icons/FloppyIcon.vue';
import BackspaceXIcon from '@/components/icons/BackspaceXIcon.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const codesStore = useCodesStore();
const userStore = useUserStore();

const isRedeeming = ref(false);
const redeemMessage = ref('');
const redeemStatus = ref<'success' | 'error' | 'loading'>('loading');
const discountCode = ref('');

onMounted(async () => {
  // Get the discount code from the URL parameter
  const code = route.params.code as string;
  
  if (!code) {
    redeemMessage.value = t('invalid_redemption_link');
    redeemStatus.value = 'error';
    return;
  }

  discountCode.value = code;

  const currentUserId = userStore.userId;
  if (!currentUserId || currentUserId <= 0) {
    redeemMessage.value = t('login_to_redeem');
    redeemStatus.value = 'error';
    return;
  }

  await redeemCode(code, currentUserId);
});

const redeemCode = async (code: string, userId: number) => {
  isRedeeming.value = true;
  redeemStatus.value = 'loading';

  try {
    const response = await codesStore.assignDiscountCodeToUserByLink(code, userId);

    if (response.success) {
      redeemMessage.value = t('code_redeemed_success', { code });
      redeemStatus.value = 'success';
      
      // Refresh user's discount codes
      await codesStore.getUserDiscountCodes(userId);
    } else {
      redeemMessage.value = response.message || t('failed_redeem_code');
      redeemStatus.value = 'error';
    }
  } catch (error) {
    console.error('Error redeeming code:', error);
    redeemMessage.value = t('unexpected_error_redeem');
    redeemStatus.value = 'error';
  } finally {
    isRedeeming.value = false;
  }
};

const goToDiscountCodes = () => {
  router.push('/my-discount-codes');
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="redeem-code-container">
    <div class="redeem-code-card">      
      <div class="card-header">
        <h1 class="title">{{ $t('redeem_code_title') }}</h1>
        <p v-if="discountCode" class="code-display">{{ discountCode }}</p>
      </div>

      <div class="card-content">        <!-- Loading State -->
        <div v-if="redeemStatus === 'loading'" class="status-section loading">
          <LoadingIcon class="loading-icon" />
          <p class="status-message">{{ $t('redeeming_discount_code') }}</p>
        </div>

        <!-- Success State -->
        <div v-else-if="redeemStatus === 'success'" class="status-section success">
          <div class="success-icon">
            <FloppyIcon />
          </div>          <p class="status-message">{{ redeemMessage }}</p>
          <div class="action-buttons">
            <button @click="goToDiscountCodes" class="primary-button">
              {{ $t('view_my_codes') }}
            </button>
            <button @click="goToHome" class="secondary-button">
              {{ $t('continue_shopping') }}
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="redeemStatus === 'error'" class="status-section error">
          <div class="error-icon">
            <BackspaceXIcon />
          </div>          <p class="status-message">{{ redeemMessage }}</p>
          <div class="action-buttons">
            <button @click="goToDiscountCodes" class="primary-button">
              {{ $t('view_my_codes') }}
            </button>
            <button @click="goToHome" class="secondary-button">
              {{ $t('go_home') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.redeem-code-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: var(--light);
}

.redeem-code-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.card-header {
  margin-bottom: 2rem;
}

.title {
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 2.5rem;
  color: white;
  margin: 0 0 1rem 0;
}

.code-display {
  font-family: "Poppins", serif;
  font-size: 1.2rem;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin: 0;
  word-break: break-all;
}

.status-section {
  font-family: "Poppins", serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-icon {
  width: 3rem;
  height: 3rem;
}

.success-icon,
.error-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.success-icon {
  background-color: var(--boly-green);
  color: var(--dark);
}

.error-icon {
  background-color: #ff6b6b;
  color: var(--white);
}

.status-message {
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
  color: var(--light);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-direction: column;
  width: 100%;
}

.primary-button,
.secondary-button {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
}

.primary-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--light);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.primary-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.secondary-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--light);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

@media (min-width: 768px) {
  .action-buttons {
    flex-direction: row;
  }
}

@media (max-width: 480px) {
  .redeem-code-card {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .code-display {
    font-size: 1rem;
  }
}
</style>
