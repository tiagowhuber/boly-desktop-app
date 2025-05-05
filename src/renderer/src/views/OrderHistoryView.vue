<script setup lang="ts">
import Loading from '@/components/LoadingIcon.vue'
import { useAuth, useUser, useOrder } from '@/stores'
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { Order } from '@/types'

const router = useRouter();
const auth = useAuth();
const user = useUser();
const orderStore = useOrder();
const { t } = useI18n();

const loading = computed(() => orderStore.loading);
const orders = computed(() => orderStore.userOrders.slice().reverse());
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const isMobile = ref(window.innerWidth < 768);
const showOrderDetailsModal = ref(false);
const selectedOrder = ref<Order | null>(null);

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
    fetchOrders();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

const fetchOrders = async () => {
  if (!auth.isLoggedIn || !user.userId) return;
  
  try {
    const result = await orderStore.getOrdersByUserId(user.userId);
    if (!result.success) {
      error.value = result.message || t('error_fetching_orders');
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
    error.value = t('error_fetching_orders');
  }
};


const closeOrderDetailsModal = () => {
  showOrderDetailsModal.value = false;
  selectedOrder.value = null;
};

const formatDate = (date: Date | string): string => {
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  return new Date(date).toLocaleDateString();
};

const getOrderStatusClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
      return 'status-completed';
    case 'pending':
    case 'processing':
      return 'status-pending';
    case 'failed':
    case 'cancelled':
    case 'canceled':
      return 'status-failed';
    default:
      return '';
  }
};

const getOrderStatusText = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'paid':
      return t('order_status_completed');
    case 'pending':
      return t('order_status_pending');
    case 'processing':
      return t('order_status_processing');
    case 'failed':
      return t('order_status_failed');
    case 'cancelled':
    case 'canceled':
      return t('order_status_cancelled');
    default:
      return status || t('order_status_unknown');
  }
};

const formatCurrency = (amount: number | { amount: number; currency: string }): string => {
  if (typeof amount === 'object' && amount !== null) {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: amount.currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount.amount);
  }
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};
</script>

<template>
  <div class="loading_container" v-if="loading">
    <Loading />
  </div>
  
  <div :class="{ 'section': !isMobile, 'mobile-section': isMobile }">
    <div class="header">
      <h1>{{ t('order_history') }}</h1>
    </div>
    
    <!-- Orders List -->
    <div class="orders-container" v-if="!loading">
      <!-- Success or Error messages -->
      <div v-if="success" class="success-message">{{ success }}</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <!-- Orders List -->
      <div class="order-list" v-if="orders.length > 0">
        <h2>{{ t('your_orders') }}</h2>        <div class="order-item" v-for="order in orders" :key="order.order_id">
          <div class="order-info">
            <div class="order-header">
              <span class="order-id">{{ t('order') }} #{{ order.order_id }}</span>
              <span :class="['order-status', getOrderStatusClass(order.state)]">
                {{ getOrderStatusText(order.state) }}
              </span>
            </div>
            <div class="order-details">
              <span class="order-date">{{ t('ordered_on') }}: {{ formatDate(order.created_at) }}</span>
              <span class="order-amount">{{ t('total') }}: {{ formatCurrency(order.final_amount) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-orders">
        <p>{{ t('no_orders') }}</p>
        <button @click="router.push('/games')" class="btn-purple">
          {{ t('browse_games') }}
        </button>
      </div>
    </div>
    
    <button @click="router.go(-1)" class="back-button">{{ t('back') }}</button>
    
    <!-- Order Details Modal -->
    <div v-if="showOrderDetailsModal && selectedOrder" class="modal">
      <div class="modal-content" :class="{ 'mobile-modal-content': isMobile }">
        <h2>{{ t('order_details') }}</h2>
        <div class="order-details-modal">
          <div class="detail-row">
            <span class="detail-label">{{ t('order_id') }}:</span>
            <span class="detail-value">#{{ selectedOrder.order_id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('date') }}:</span>
            <span class="detail-value">{{ formatDate(selectedOrder.created_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('status') }}:</span>
            <span :class="['detail-value', getOrderStatusClass(selectedOrder.state)]">
              {{ getOrderStatusText(selectedOrder.state) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">{{ t('total_amount') }}:</span>
            <span class="detail-value">{{ formatCurrency(selectedOrder.final_amount) }}</span>
          </div>
          
          <div v-if="selectedOrder.discount_code" class="detail-row">
            <span class="detail-label">{{ t('discount_code') }}:</span>
            <span class="detail-value">{{ selectedOrder.discount_code }}</span>
          </div>
          
          <!-- Game or Subscription details could be added here if included in the API response -->
        </div>
        <div class="modal-buttons">
          <button @click="closeOrderDetailsModal" class="btn-blue">{{ t('close') }}</button>
        </div>
      </div>
    </div>
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

.orders-container {
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  max-width: 1200px;
  width: 50%;
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

.order-list {
  margin-top: 20px;
}

.order-list h2 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--white);
  text-align: left;
}

.order-item {
  background-color: var(--boly-bg-blue-transparent);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
}

.order-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}

.order-id {
  font-weight: bold;
  color: var(--white);
}

.order-status {
  font-size: 0.9rem;
  padding: 3px 8px;
  border-radius: 12px;
}

.status-completed {
  background-color: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.status-pending {
  background-color: rgba(237, 137, 54, 0.2);
  color: #ed8936;
}

.status-failed {
  background-color: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

.order-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.order-date {
  color: var(--light);
  font-size: 0.9rem;
}

.order-amount {
  color: var(--light);
  font-weight: bold;
  margin-top: 5px;
}

.details-btn {
  background-color: transparent;
  color: var(--boly-button-blue);
  border: 1px solid var(--boly-button-blue);
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: 0.2s;
}

.details-btn:hover {
  background-color: rgba(66, 153, 225, 0.1);
}

.no-orders {
  text-align: center;
  padding: 20px 0;
  color: var(--gray);
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
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
  margin-bottom: 20px;
}

.order-details-modal {
  background-color: var(--boly-bg-blue-transparent);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-label {
  color: var(--gray);
}

.detail-value {
  color: var(--white);
  font-weight: bold;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
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
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-info {
    margin-bottom: 15px;
    width: 100%;
  }
  
  .details-btn {
    align-self: flex-end;
  }
  
  .modal-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-buttons button {
    width: 100%;
  }
  
  .order-header {
    flex-direction: column;
    gap: 5px;
  }
  
  .order-status {
    align-self: flex-start;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .orders-container {
    padding: 15px;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 5px;
  }
}
</style>