<script setup lang="ts">
import { useAuth, useUser } from '@renderer/stores'
import TheLogo from '../logo/TheLogo.vue'
import CartIcon from '../icons/CartIcon.vue'
import UserIcon from '../icons/UserIcon.vue'
import { inject, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import KingIcon from '../icons/KingIcon.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useCart } from '@renderer/stores'

const router = useRouter()
const auth = useAuth()
const user = useUser()
const cartStore = useCart()

const cartLength = computed(() => cartStore.cart.length)

router.beforeEach((to, from, next) => {
  auth.checkToken()
  next()
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
})

function GoToCart() {
  if (cartStore.cart.length > 0) {
    router.push("/cart")
  }
}

function GoToHome(){
  router.push("/")
}
</script>

<template>
  <header>
    <nav>
      <TheLogo class="logo" @click="GoToHome()"/>
      <div class="navigation">
        <RouterLink to="/"><p>{{ $t('home') }}</p></RouterLink>
        <RouterLink to="/games"><p>{{ $t('games') }}</p></RouterLink>
        <!--<RouterLink to="/about"><p>About</p></RouterLink>-->
        <RouterLink to="/contact"><p>{{ $t('contact') }}</p></RouterLink>
        <RouterLink to="/subscription"><p>{{ $t('subscription') }}</p></RouterLink>
        <RouterLink class="" to="/developer" v-if="auth.isLoggedIn && user.roleId === 1"
          ><p>{{ $t('developer') }}</p></RouterLink
        >
        <RouterLink to="/library" v-if="auth.isLoggedIn"><p>{{ $t('my_library') }}</p></RouterLink>
        <RouterLink to="/wishlist" v-if="auth.isLoggedIn"><p>{{ $t('wishlist') }}</p></RouterLink>
      </div>
      <div class="user-navigation">
        <RouterLink class="login" to="/login" v-if="!auth.isLoggedIn"><p>{{ $t('log_in') }}</p></RouterLink>
        <RouterLink class="signup" to="/register" v-if="!auth.isLoggedIn"><p>{{ $t('sign_up') }}</p></RouterLink>
        <RouterLink to="/account" v-if="auth.isLoggedIn">
        <!-- <KingIcon class="icon user_icon" v-if="auth.user.role === 'admin'"></KingIcon>
        <UserIcon class="icon user_icon" v-else></UserIcon> -->
          <img 
            :src="user.profilePictureUrl || 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'"
            class="icon user_icon"
            alt="Profile picture"
          />
          <p>{{ user.username }}</p>
        </RouterLink>
        <a
          class="cart-button"
          :class="{ 'cart-disabled': cartLength === 0 }"
          @click="GoToCart()"
        >
          <p>{{ cartLength }}</p>
          <CartIcon class="icon cart_icon"></CartIcon>
        </a>
        
      </div>
    </nav>
  </header>
</template>

<style scoped>
header {
  padding: 0.5rem 2rem; /* Reduced from 1rem */
  font-family: "Anton", serif;
  /*background-color: var(--boly-bg-dark); */
  
  background-color: rgba(34, 23, 66, 0.8)
}

nav {
  margin: 0 auto;
  max-width: 1500px;
  height: 80px; /* Reduced from 120px */

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

a.router-link-exact-active {
  border-bottom: 3px solid var(--light);
}

a {
  padding: 0 1rem;
  vertical-align: middle;
  height: 100%;
  display: flex;
  align-items: center;
  float: left;
}

.logo {
  padding: 0;
  min-width: 150px;
  cursor: pointer;
}

.navigation {
  flex-grow: .5;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: flex-start;  
  margin-left: -100px;  
}

.navigation a {
  margin-right: 15px;  
}

.user-navigation {
  width: 350px;
  justify-content: end;
  height: 46px;
  display: flex;
}

.menu {
  display: none;
}
/*
@media only screen and (max-width: 768px) {
  .navigation {
    display: none;
  }

  .menu {
    display: block;
  }
}*/

.icon {
  height: 25px; /* Reduce icon sizes */
  width: 25px;
  fill: var(--light);
  transition-duration: 0.2s;
}

.cart_icon {
  margin-left: 5px;
  height: 20px;
  width: 20px;
}

.user_icon {
  margin-left: 0px;
  margin-bottom: 2px;
  margin-right: 8px;
  height: 30px;
  width: 30px;
  border-radius: 50%;
}

a:hover > .icon {
  fill: var(--lightCyan);
  transition-duration: 0.2s;
}

.login {
  width: 195px;
  background-color: var(--boly-button-blue);
  justify-content: center;
  border-radius: 5px 0px 0px 5px;
  height: 35px; /* Set consistent button height */
  font-size: 18px
}

.login:hover{
  background-color: var(--boly-button-blue-hover);
  width: 200px;
}

.signup {
  width: 175px;
  background-color: var(--boly-button-purple);
  justify-content: center;
  border-radius: 0px 5px 5px 0px;
  height: 35px; /* Set consistent button height */
  font-size: 18px
}

.signup:hover{
  background-color: var(--boly-button-purple-hover);
  width: 200px;
}

.cart-button {
  margin-left: 10px;
  cursor: pointer;
  font-style: bold;
  font-size: 16px;
  background-color: var(--lightGreen);
  border-radius: 100px;
  border: none;
  color: var(--light) !important;
  height: 35px;
  padding: 5px 10px;
}

.cart-button > p {
  min-width: 10px;
  text-align: right;
}

.cart-button:hover {
  background-color: var(--lightCyan);
}

.cart-button > svg {
  fill: var(--light) !important;
}

.cart-disabled {
  background-color: var(--darker);
  cursor: default;
}

.cart-disabled:hover {
  background-color: var(--darker);
  cursor: default;
}

.navigation, .user-navigation {
  display: flex;
  align-items: center;
  height: 100%;
}

.navigation a, .user-navigation a {
  display: flex;
  align-items: center;
  height: 35px;
}

.cart-button {
  display: flex;
  align-items: center;
  height: 35px;
}

.login, .signup {
  display: flex;
  align-items: center;
  height: 35px;
}

p {
  margin: 0;
  padding: 0;
}
</style>
