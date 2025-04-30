<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuth, useUser, useGames, useCart, usePayment, useOrder } from '@/stores';
import Loading from '@/components/LoadingIcon.vue';
import LibraryItem from '@/components/games/LibraryItem.vue';
import type { Game } from '@/types';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const user = useUser();
const games = useGames();
const cart = useCart();
const payment = usePayment();
const order = useOrder();

const isLoading = ref(true);
const purchasedGames = ref<Game[]>([]);
const isRejected = ref(false);
const errorMessage = ref('');
const processedOrderToken = localStorage.getItem('processed_order_token');
const isProcessed = ref(processedOrderToken === route.query.token_ws?.toString());

onMounted(async () => {
  if (!auth.isLoggedIn) {
    console.log('PostOrderView: Not logged in, redirecting to login');
    router.push('/login');
    return;
  }

  if (isProcessed.value) {
    isLoading.value = false;
    return;
  }

  try {
    const token = route.query.token_ws;
    
    if (token) {
      const gameIds = cart.getCartItems;
      console.log('PostOrderView: Received game IDs:', gameIds);
      
      if (gameIds.length === 0 || !user.userId) {
        console.log('PostOrderView: No valid game IDs found or no user ID');
        router.push('/');
        return;
      }
      try {
        const orderSuccess = await payment.checkOrder(token as string);
        if (!orderSuccess) {
          isRejected.value = true;
          errorMessage.value = payment.error || 'Your order was rejected or failed. Please try again.';
          isLoading.value = false;
          return;
        }
        
        // Only proceed with library addition if payment was successful
        try {
          // Get the orderId from the payment result
          const orderId = payment.orderId ? parseInt(payment.orderId, 10) : 
                         payment.orderResult.buy_order ? parseInt(payment.orderResult.buy_order, 10) : null;
          
          if (!orderId) {
            console.error('PostOrderView: No valid order ID found in payment result');
            isRejected.value = true;
            errorMessage.value = 'Failed to find order information. Your games may have been added but order tracking failed.';
            isLoading.value = false;
            return;
          }
          
          console.log('PostOrderView: Processing order ID:', orderId);
          
          await Promise.all(
            gameIds.map(gameId => 
              games.addToLibrary(gameId, user.userId as number, { token: auth.token })
            )
          );

          const orderGamePromises = gameIds.map(gameId => 
            order.updateOrderHasGame({
              order_id: orderId, 
              game_id: gameId
            })
          );
          
          const orderGameResults = await Promise.all(orderGamePromises);
          
          
          orderGameResults.forEach((result, index) => {
            if (!result.success) {
              console.error(`Failed to create order-game relationship for game ID ${gameIds[index]}: ${result.message}`);
            }
          });          const gamesData = await Promise.all(
            gameIds.map(id => games.getById(id))
          );          purchasedGames.value = gamesData.filter((game): game is Game => game !== null);
          cart.clearCart();
          // Save the processed token to localStorage to prevent reprocessing
          if (token) {
            localStorage.setItem('processed_order_token', token.toString());
          }
          isProcessed.value = true;
        } catch (error) {
          console.error('Error adding games to library:', error);
          isRejected.value = true;
          errorMessage.value = 'Failed to add games to your library.';
        }
      } catch (error) {
        console.error('Error checking order status:', error);
        isRejected.value = true;
        errorMessage.value = 'Failed to verify order status.';
      }
    } else {
      isRejected.value = true;
      errorMessage.value = 'No payment information found. Please try your purchase again.';
    }
  } catch (error) {
    console.error('Error in PostOrderView:', error);
    isRejected.value = true;
    errorMessage.value = 'An unexpected error occurred.';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="loading_container" v-if="isLoading">
    <Loading />
  </div>
  <div class="section" v-else-if="isRejected">
    <div class="main-container">
      <div class="title-container">
        <h1>{{ $t('postorder_error') }}</h1>
      </div>
      <div class="error-message">
        <p>{{ errorMessage }}</p>
      </div>      <div class="actions">
        <RouterLink to="/cart" class="action-button">
          {{ $t('return_to_cart') }}
        </RouterLink>
      </div>
    </div>
  </div>
  <div class="section" v-else>
    <div class="main-container">
      <div class="title-container">
        <h1>{{ $t('postorder_congrats') }}</h1>
      </div>
      <div class="success-message">
        <p>{{ $t('postorder_article_list') }}</p>
      </div>
      <div class="title-container">
        <div class="game-count">{{ $t('purchased_games') }} ({{ purchasedGames.length }})</div>
      </div>
      <div class="list">
        <LibraryItem v-for="game in purchasedGames" :key="game.game_id" :item="game" />
      </div>      <div class="actions">
        <RouterLink to="/library" class="action-button">
          {{ $t('go_to_library') }}
        </RouterLink>
        <RouterLink to="/games" class="action-button">
          {{ $t('browse_more_games') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.title-container h1 {
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
}

.success-message {
  text-align: center;
  margin: 2rem 0;
}

.game-count {
  text-align: center;
  width: 300px;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  padding: 2px 40px;
  border-radius: 5px;
  background-color: var(--boly-button-blue);
}

.list {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 55px;
  flex-wrap: wrap;
  padding: 40px;
}

.loading_container {
  height: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.action-button {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 5px;
  background-color: var(--boly-button-blue);
  color: white;
  font-family: 'Anton', Impact, sans-serif;
  font-style: italic;
  font-size: 1.1rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-button:hover {
  opacity: 0.9;
}

.error-message {
  text-align: center;
  margin: 2rem 0;
  color: var(--color-error);
}
</style>