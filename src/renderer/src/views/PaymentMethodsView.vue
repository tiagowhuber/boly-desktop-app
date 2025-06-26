<script setup lang="ts">
import Loading from '@/components/LoadingIcon.vue'
import AlertModal from '@/components/AlertModal.vue'
import { useAuth, useUser, usePayment } from '@/stores'
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { PaymentMethod } from '@/types'

const router = useRouter();
const auth = useAuth();
const user = useUser();
const paymentStore = usePayment();
const { t } = useI18n();

const loading = computed(() => paymentStore.loading || paymentStore.enrollmentLoading);
const paymentMethods = computed(() => paymentStore.paymentMethods);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const isMobile = ref(window.innerWidth < 768);
const showDeleteModal = ref(false);
const deletingMethod = ref<PaymentMethod | null>(null);

const webpayForm = ref<HTMLFormElement | null>(null);
const webpayUrl = computed(() => paymentStore.enrollmentUrl);
const webpayToken = computed(() => paymentStore.enrollmentToken);
const showEnrollmentRedirectModal = ref(false);

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  
  if (!auth.isLoggedIn && !auth.token) {
    router.push('/login');
    return;
  }
  
  if (auth.isLoggedIn && user.userId) {
    fetchPaymentMethods();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const fetchPaymentMethods = async () => {
  if (!auth.isLoggedIn || !user.userId) return;
  
  try {
    await paymentStore.fetchPaymentMethods(user.userId, auth.token);
  } catch (err) {
    console.error('Error fetching payment methods:', err);
  }
};

const addPaymentMethod = async () => {
  try {
    error.value = null;
    success.value = null;
    showEnrollmentRedirectModal.value = true;

    await paymentStore.createEnrollment(
      user.username,
      user.email,
      `${import.meta.env.VITE_APP_BASE_URL}/payment-methods/callback`,
      auth.token
    );
    
    setTimeout(() => {
      if (webpayForm.value) {
        webpayForm.value.submit();
      } else {
        showEnrollmentRedirectModal.value = false;
      }
    }, 100);
  } catch (err) {
    console.error('Error creating enrollment:', err);
    showEnrollmentRedirectModal.value = false;
  }
};

const confirmDeleteMethod = (method: PaymentMethod) => {
  deletingMethod.value = method;
  showDeleteModal.value = true;
};

const deletePaymentMethod = async () => {
  if (!deletingMethod.value) return;
  
  try {
    await paymentStore.deletePaymentMethod(
      user.username,
      deletingMethod.value.tbk_user,
      auth.token
    );
    
    success.value = t('payment_method_deleted');
    await fetchPaymentMethods();
    closeDeleteModal();
  } catch (err) {
    console.error('Error deleting payment method:', err);
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingMethod.value = null;
};

const formatProvider = (provider: string): string => {
  if (provider === 'webpay') return 'Webpay Plus';
  return provider;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const getCardIcon = (cardType: string): string => {
  const type = cardType.toLowerCase();
  if (type.includes('visa')) return '💳 Visa';
  if (type.includes('mastercard')) return '💳 MasterCard';
  if (type.includes('amex') || type.includes('american')) return '💳 American Express';
  if (type.includes('diners')) return '💳 Diners';
  if (type.includes('magna')) return '💳 Magna';
  return '💳 ' + cardType;
};
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  
  <div :class="{ 'section': !isMobile, 'mobile-section': isMobile }">
    <div class="header">
      <h1>{{ t('payment_methods') }}</h1>
    </div>
    
    <!-- Payment Methods List -->
    <div class="payment-methods-container" v-if="!loading">
      <!-- Success or Error messages -->
      <div v-if="success" class="success-message">{{ success }}</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <!-- Add Payment Method Button -->
      <div class="add-card-section">
        <h2>{{ t('add_payment_method') }}</h2>
        <p>{{ t('add_card_description') }}</p>
        <button @click="addPaymentMethod" class="btn-purple">
          {{ t('add_card') }}
        </button>
      </div>
      
      <!-- Payment Methods List -->
      <div class="card-list" v-if="paymentMethods.length > 0">
        <h2>{{ t('your_payment_methods') }}</h2>
        <div class="card-item" v-for="method in paymentMethods" :key="method.payment_method_id">          <div class="card-info">
            <div class="card-type">{{ getCardIcon(method.card_type) }}</div>
            <div class="card-details">
              <span class="card-number">{{ t('card_ending_in') }} {{ method.last_four_digits.slice(-4) }}</span>
              <span class="card-provider">{{ formatProvider(method.provider) }}</span>
              <span class="card-added">{{ t('added_on') }} {{ formatDate(method.created_at) }}</span>
            </div>
          </div>
          <button @click="confirmDeleteMethod(method)" class="delete-btn">
            {{ t('delete') }}
          </button>
        </div>
      </div>
      
      <div v-else class="no-cards">
        <p>{{ t('no_payment_methods') }}</p>
      </div>
    </div>
    <button @click="router.go(-1)" class="back-button">{{ t('back') }}</button>
      <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <AlertModal :show="showDeleteModal" @close="closeDeleteModal">
        <template #header>
          <h3>{{ t('confirm_delete') }}</h3>
        </template>
        <template #body>
          <p>{{ t('confirm_delete_card', { card: deletingMethod?.last_four_digits }) }}</p>
          <div class="modal-buttons">
            <button @click="closeDeleteModal" class="btn-blue">{{ t('cancel') }}</button>
            <button @click="deletePaymentMethod" class="btn-red">{{ t('delete') }}</button>
          </div>
        </template>
      </AlertModal>
    </Teleport>
      <!-- Enrollment Redirect Modal -->
    <Teleport to="body">
      <AlertModal :show="showEnrollmentRedirectModal" @close="showEnrollmentRedirectModal = false">
        <template #header>
          <h3>{{ t('redirecting') }}</h3>
        </template>
        <template #body>
          <p>{{ t('redirecting_to_webpay') }}</p>
          <Loading />
        </template>
      </AlertModal>
    </Teleport>
    
    <!-- WebPay OneClick Form (hidden) -->
    <form 
      ref="webpayForm" 
      method="post" 
      :action="webpayUrl" 
      style="display: none;"
    >
      <input type="hidden" name="TBK_TOKEN" :value="webpayToken" />
    </form>
  </div>
</template>

<style scoped>
.section {
  min-height: 50vh;
  padding: 20px;
}

.mobile-section {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 2.5rem;
  margin: 0;
  text-align: left;
}

.back-button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  background-color: var(--boly-button-blue);
  color: white;
  font-family: 'Anton', sans-serif;
  cursor: pointer;
  transition: 0.2s;
}

.back-button:hover {
  background-color: var(--boly-button-blue-hover);
}

.payment-methods-container {
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
}

.success-message, .error-message {
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-weight: bold;
}

.success-message {
  background-color: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.error-message {
  background-color: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

.add-card-section {
  background-color: var(--boly-bg-blue-transparent);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: 'Poppins', sans-serif;
}

.add-card-section h2 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--white);
}

.add-card-section p {
  color: var(--light);
  margin-bottom: 20px;
}

.card-list {
  margin-top: 20px;
}

.card-list h2 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--white);
  text-align: left;
}

.card-item {
  background-color: var(--boly-bg-blue-transparent);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  display: flex;
  align-items: center;
}

.card-type {
  font-size: 1.2rem;
  margin-right: 15px;
}

.card-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.card-number {
  font-weight: bold;
  color: var(--white);
  margin-bottom: 5px;
}

.card-provider {
  color: var(--light);
  font-size: 0.9rem;
}

.card-added {
  color: var(--gray);
  font-size: 0.8rem;
  margin-top: 5px;
}

.delete-btn {
  background-color: transparent;
  color: var(--boly-button-red);
  border: 1px solid var(--boly-button-red);
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: 0.2s;
}

.delete-btn:hover {
  background-color: rgba(229, 62, 62, 0.1);
}

.no-cards {
  text-align: center;
  padding: 20px 0;
  color: var(--gray);
  font-family: 'Poppins', sans-serif;
}

button, .btn-purple, .btn-blue, .btn-red {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-family: 'Anton', sans-serif;
  font-size: 1rem;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.btn-purple {
  background-color: var(--boly-button-purple);
}

.btn-purple:hover {
  background-color: var(--boly-button-purple-hover);
}

.btn-blue {
  background-color: var(--boly-button-blue);
}

.btn-blue:hover {
  background-color: var(--boly-button-blue-hover);
}

.btn-red {
  background-color: var(--boly-button-red);
}

.btn-red:hover {
  background-color: var(--boly-button-red-hover);
}

/* Modal styling */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--boly-bg-dark);
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}

.modal-content h2 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  margin-top: 0;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.mobile-modal-content {
  padding: 20px;
  max-width: 90%;
  width: 100%;
}

/* Mobile specific styles */
@media (max-width: 768px) {
  h1 {
    font-size: 1.8rem;
  }
  
  .card-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-info {
    margin-bottom: 15px;
    width: 100%;
  }
  
  .delete-btn {
    align-self: flex-end;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-buttons button {
    width: 100%;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .payment-methods-container {
    padding: 15px;
  }
  
  .add-card-section {
    padding: 15px;
  }
  
  .card-type {
    font-size: 1rem;
  }
}
</style>