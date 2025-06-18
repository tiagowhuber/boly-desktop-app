<script setup lang="ts">
import { ref, onMounted} from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import useCodesStore from '@/stores/codes';
import useUserStore from '@/stores/user';
import useGamesStore from '@/stores/games';
import type { Game } from '@/types/index.d.ts';
import LoadingIcon from '@/components/LoadingIcon.vue';

const { t } = useI18n();
const codesStore = useCodesStore();
const userStore = useUserStore();
const gamesStore = useGamesStore();

const { userDiscountCodes, isLoading: isLoadingCodes, validationError: codesError } = storeToRefs(codesStore);

const newCodeInput = ref('');
const claimMessage = ref('');
const claimStatus = ref<'success' | 'error' | ''>('');
const isClaiming = ref(false);
const gamesMap = ref<Map<number, Game>>(new Map());

onMounted(async () => {
  const currentUserId = userStore.userId;
  if (currentUserId && currentUserId > 0) {
    await codesStore.getUserDiscountCodes(currentUserId);
    await loadGamesData();
  } else {
    codesStore.validationError = t('user_not_authenticated_codes');
  }
});

const loadGamesData = async () => {
  try {
    await gamesStore.getAll();
    // Create a map for quick game lookup
    gamesStore.games.forEach(game => {
      gamesMap.value.set(game.game_id, game);
    });
  } catch (error) {
    console.error('Failed to load games data:', error);
  }
};

const handleClaimCode = async () => {
  if (!newCodeInput.value.trim()) {
    claimMessage.value = t('please_enter_discount_code');
    claimStatus.value = 'error';
    return;
  }
  
  const currentUserId = userStore.userId;
  if (!currentUserId || currentUserId <= 0) {
    claimMessage.value = t('user_not_authenticated_claim');
    claimStatus.value = 'error';
    return;
  }

  isClaiming.value = true;
  claimMessage.value = '';
  claimStatus.value = '';

  const response = await codesStore.assignDiscountCodeToUserByLink(newCodeInput.value.trim(), currentUserId);

  isClaiming.value = false;

  if (response.success) {
    claimMessage.value = t('discount_code_claimed_success');
    claimStatus.value = 'success';
    newCodeInput.value = ''; 
    const refreshUserId = userStore.userId;
    if (refreshUserId && refreshUserId > 0) {
      await codesStore.getUserDiscountCodes(refreshUserId);
      await loadGamesData(); 
    }
  } else {
    claimMessage.value = response.message || t('failed_claim_discount_code');
    claimStatus.value = 'error';
  }
};

const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const getGameName = (gameId: number) => {
  const game = gamesMap.value.get(gameId);
  if (!game) return `Game ID: ${gameId}`;
  
  const { locale } = useI18n();
  if (game.name && typeof game.name === 'object') {
    return game.name[locale.value] || game.name['en'] || `Game ID: ${gameId}`;
  }
  // Fallback to string name
  return game.name || `Game ID: ${gameId}`;
};
</script>

<template>
  <div class="discount-codes-container">
    <div class="discount-codes-dashboard p-6">      <div class="dashboard-header mb-6">
        <h1 class="dashboard-title">{{ $t('discount_codes_title') }}</h1>
      </div>      <!-- Claim New Code Section -->
      <div class="claim-code-section mb-6">
        <h2 class="section-title claim-section-title mb-3">{{ $t('claim_new_code') }}</h2>
        <form @submit.prevent="handleClaimCode" class="claim-form">
          <div class="claim-input-group">            <input
              v-model="newCodeInput"
              type="text"
              :placeholder="$t('enter_your_code')"
              class="form-input"
              :disabled="isClaiming"
            />
          </div>
          <div class="claim-button-group">            <button type="submit" class="claim-button" :disabled="isClaiming">
              <LoadingIcon v-if="isClaiming" class="loading-icon-inline" />
              {{ isClaiming ? $t('claiming') : $t('claim_code') }}
            </button>
          </div>
        </form>
        <p v-if="claimMessage" 
           class="claim-feedback-message"
           :class="[claimStatus === 'success' ? 'claim-message-success' : 'claim-message-error']">
          {{ claimMessage }}
        </p>
      </div>      <!-- Loading State for User Codes -->
      <div v-if="isLoadingCodes" class="loading-container">
        <LoadingIcon />
        <p class="mt-2 text-lg">{{ $t('loading_discount_codes') }}</p>
      </div>

      <!-- Error State for User Codes -->
      <div v-else-if="codesError" class="error-message">
        <p class="text-xl">{{ codesError }}</p>
      </div>      <!-- User's Discount Codes List -->
      <div v-else>
        <h2 class="section-title mb-4">{{ $t('your_available_codes') }}</h2>
        <div v-if="userDiscountCodes && userDiscountCodes.length > 0" class="codes-grid">
          <div v-for="assignedCode in userDiscountCodes" :key="`${assignedCode.user_id}-${assignedCode.discount_code_id}`" class="code-card">
            <template v-if="assignedCode.discountCode">
              <div class="code-card-content">
                <h3 class="code-name">{{ assignedCode.discountCode.code }}</h3>
                <div class="code-status">
                  <span v-if="assignedCode.used_at" class="status-badge used">
                    {{ $t('code_status_used') }}
                  </span>
                  <span v-else :class="['status-badge', assignedCode.discountCode.is_active ? 'active' : 'inactive']">
                    {{ assignedCode.discountCode.is_active ? $t('code_status_available') : $t('code_status_inactive') }}
                  </span>
                </div>
              </div>
              <div class="code-details mt-3">
                <p class="detail-item">
                  <span>{{ $t('code_detail_type') }}</span>
                  <span class="detail-value">{{ assignedCode.discountCode.discount_type }}</span>
                </p>
                <p v-if="assignedCode.discountCode.discount_percentage" class="detail-item">
                  <span>{{ $t('code_detail_discount') }}</span>
                  <span class="detail-value">{{ assignedCode.discountCode.discount_percentage }}%</span>
                </p>                
                <p v-if="assignedCode.discountCode.applies_to_game_id" class="detail-item">
                  <span>{{ $t('code_detail_applies_game') }}</span>
                  <span class="detail-value">{{ getGameName(assignedCode.discountCode.applies_to_game_id) }}</span>
                </p>
                 <p v-if="assignedCode.discountCode.applies_to_plan_id" class="detail-item">
                  <span>{{ $t('code_detail_applies_plan') }}</span>
                  <span class="detail-value">{{ assignedCode.discountCode.applies_to_plan_id }}</span>
                </p>
                <p v-if="assignedCode.discountCode.subscription_duration_value && assignedCode.discountCode.subscription_duration_unit" class="detail-item">
                  <span>{{ $t('code_detail_subscription_benefit') }}</span>
                  <span class="detail-value">
                    {{ assignedCode.discountCode.subscription_duration_value }} {{ assignedCode.discountCode.subscription_duration_unit }}(s)
                  </span>
                </p>
                <p v-if="assignedCode.discountCode.valid_until" class="detail-item">
                  <span>{{ $t('code_detail_expires') }}</span>
                  <span class="detail-value">{{ formatDate(assignedCode.discountCode.valid_until) }}</span>
                </p>
                <p v-if="assignedCode.used_at" class="detail-item">
                  <span>{{ $t('code_detail_used_on') }}</span>
                  <span class="detail-value">{{ formatDate(assignedCode.used_at) }}</span>
                </p>
                 <p v-if="assignedCode.discountCode.max_total_uses" class="detail-item">
                  <span>{{ $t('code_detail_uses') }}</span>
                  <span class="detail-value">{{ assignedCode.discountCode.current_total_uses || 0 }} / {{ assignedCode.discountCode.max_total_uses }}</span>
                </p>
              </div>
            </template>            
            <template v-else>
              <p>{{ $t('code_details_not_available') }} {{ assignedCode.discount_code_id }}.</p>
            </template>
          </div>
        </div>        
        <div v-else class="no-codes-message text-center">
          <p class="text-xl">{{ $t('no_discount_codes') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.discount-codes-container {
  min-height: 100vh;
  padding: 20px;
  color: var(--light); 
}

.discount-codes-dashboard {
  max-width: 1200px;
  margin: auto;
  border-radius: 15px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: center; 
}

.dashboard-title {
  font-family: "Anton", serif; 
  font-style: italic;
  font-size: 2.5rem;
  text-align: center;
  color: var(--boly-green);
  margin-bottom: 2rem;
}

.section-title {
  font-family: "Anton", serif;
  font-size: 1.8rem;
  border-bottom: 2px solid white;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.loading-container,
.error-message,
.no-codes-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 200px; /* Reduced height for user view */
}

.error-message p,
.no-codes-message p {
  text-align: center;
  color: var(--light-gray); 
}
.no-codes-message .text-md {
  font-size: 1rem;
  margin-top: 0.5rem;
}


.codes-grid {
  display: grid;
  grid-template-columns: 1fr; 
  gap: 1.5rem;
  list-style: none;
  padding: 0;
}

.code-card {
  background-color: rgba(255, 255, 255, 0.05); 
  border-radius: 10px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.code-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.code-card-content {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--light);
  margin: 0;
}

.code-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.active {
  background-color: var(--boly-button-blue);
  color: var(--white);
}

.status-badge.inactive {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
}

.status-badge.used {
  background-color: var(--light-gray);
  color: var(--dark);
}

.code-details {
  font-size: 0.95rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin: 0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item span:first-child {
  color: var(--light-gray);  
}

.detail-value {
  font-weight: 500;
  color: var(--light);
}

/* Claim Code Section Styles */
.claim-code-section {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.claim-section-title {
  font-size: 1.5rem; /* Smaller title for this section */
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 0.3rem;
  margin-bottom: 1rem;
}

.claim-form {
  display: flex;
  align-items: stretch; /* Make input and button same height */
  gap: 0.75rem; /* 12px */
}

.claim-input-group {
  flex-grow: 1;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--light);
  font-size: 1rem;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  height: 100%; /* Fill height of flex container */
}

.form-input:focus {
  outline: none;
  border-color: var(--boly-green);
  background-color: var(--gray); /* Or a slightly different bg on focus */
}

.form-input::placeholder {
  color: var(--light-gray);
}

.claim-button {
  background-color: var(--boly-button-blue);
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  white-space: nowrap;
}

.claim-button:hover:not(:disabled) {
  background-color: var(--boly-button-blue-hover);
}

.claim-button:disabled {
  background-color: var(--gray);
  color: var(--light-gray);
  cursor: not-allowed;
}

.loading-icon-inline {
  height: 1.25em; 
  width: 1.25em;
  margin-right: 0.5em; 
  display: inline-block; 
  vertical-align: middle;
}

.claim-feedback-message {
  margin-top: 0.75rem; /* 12px */
  font-size: 0.9rem; /* 14px */
  padding: 0.5rem 0;
}

.claim-message-success {
  color: var(--boly-green); 
}
.claim-message-error {
  color: #ff6b6b; 
}


/* Responsive adjustments */
@media (max-width: 768px) {
  .discount-codes-dashboard {
    padding: 1rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .codes-grid {
    grid-template-columns: 1fr;
  }
  
  .code-name {
    font-size: 1.2rem;
  }
  
  .code-card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .claim-form {
    flex-direction: column;
  }
  .claim-input-group, .claim-button-group {
    width: 100%;
  }
  .claim-button {
    width: 100%;
    padding: 12px; /* Adjust padding for full width */
  }
}

@media (min-width: 1024px) {
  .codes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
