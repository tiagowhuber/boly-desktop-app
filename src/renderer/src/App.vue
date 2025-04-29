<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useCart } from '@/stores'
import TheNavbar from './components/navbar/TheNavbar.vue'
import TheFooter from './components/footer/TheFooter.vue'
import Loading from '@/components/LoadingIcon.vue'
import DownloadProgressBar from '@/components/DownloadProgressBar.vue'
import { provide } from 'vue'
import { useAuth } from '@/stores'
import useDownloadStore from '@/desktop-stores/download'
import { useI18n } from 'vue-i18n'
import ModalComponent from '@/components/ModalComponent.vue'

const i18n = useI18n()
const auth = useAuth()
const downloadStore = useDownloadStore()

auth.checkToken()

const shoppingCart = useCart()

provide('cart', shoppingCart)
</script>

<template>
  <div class="view-container" v-if="auth.verifying && $route.path !== '/login' && $route.path !== '/register'">
    <div class="app-loading">
      <Loading />
    </div>
  </div>
  <template v-else>
    <template v-if="$route.path == '/login' || $route.path == '/register'">
      <span class="view-container-login">
        <RouterView class="view-container"/>
        <TheFooter :small="true"/>
      </span>
    </template>
    <template v-else>
      <TheNavbar :color="'blue'" v-if="$route.path == '/'" style="z-index: 100!important;"/>
      <TheNavbar :color="'pink'" v-else style="z-index: 100!important;"/>
      <RouterView class="view-container" />
      <TheFooter :small="false" :color="'dark-purple'" v-if="$route.path == '/'"/>
      <TheFooter :small="false" :color="'blue'" v-else/>
  </template>
    <button class="lang-button" @click="$i18n.locale = $i18n.locale == 'es'? 'en' : 'es'">{{ $i18n.locale.toUpperCase() }}</button>
    <ModalComponent />
    
    <DownloadProgressBar
      :progress="downloadStore.downloadProgress"
      :gameName="downloadStore.downloadingGameName"
      :isVisible="downloadStore.isDownloading"
    />
  </template>
</template>

<style>

.lang-button{
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000; 

  margin: 20px;
  width: 100px;
  height: 50px;
  border: none;
  border-radius: 25px;
  background-color: var(--lightGreen);
  color: var(--bgGreen);
  font-size: large;
  font-weight: bold;
  transition: .1s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); 
}

.lang-button:hover{
  background-color: var(--lightCyan);
  transition: .1s;
}

.app-loading{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.view-container {
  flex-grow: 1;
}

.view-container-login {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-image: url('@/assets/images/light-blue-background.png');
  justify-content: center;
  align-items: center;
}

.view-container-login RouterView{

}
</style>
