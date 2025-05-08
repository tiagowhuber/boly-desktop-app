<script setup lang="ts">

import { ref, onMounted, onUnmounted } from 'vue';

import emailjs from '@emailjs/browser';
import { useI18n } from 'vue-i18n';
const i18n = useI18n();


const isMobile = ref(window.innerWidth <= 768);
const updateStatus = ref('');
const currentVersion = ref('');
const showUpdateStatus = ref(false);

onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
  
  console.log("Checking electronAPI availability:", window.electronAPI);
  console.log("Checking updateMessage availability:", window.electronAPI?.updateMessage);
  
  // Add the update message listener
  if (window.electronAPI && window.electronAPI.updateMessage) {
    console.log("Setting up updateMessage listener");
    window.electronAPI.updateMessage((message: string) => {
      console.log("Update message received:", message);
      updateStatus.value = message;
    });
    
    // Get current version using the proper method
    if (window.electronAPI.getVersion) {
      window.electronAPI.getVersion().then((version: string) => {
        console.log("Current version received:", version);
        currentVersion.value = version;
      }).catch((error: any) => {
        console.error("Error getting version:", error);
      });
    } else {
      console.error("getVersion function not available");
    }
    
    checkForUpdates();
  } else {
    console.error("electronAPI or updateMessage function not available");
    updateStatus.value = "Update system not available";
  }
});

// Remove event listeners when component is unmounted
onUnmounted(() => {
  window.removeEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
  
  // removeAllListeners method:
});

async function checkForUpdates() {
  try {
    if (window.electronAPI && window.electronAPI.checkUpdates) {
      const result = await window.electronAPI.checkUpdates();
      console.log("Check for updates result:", result);
      updateStatus.value = result;
    } else {
      console.error("checkUpdates function not available");
      updateStatus.value = "Update check not available";
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
    updateStatus.value = "Error checking for updates";
  }
}

//contact form
const form = ref(null)
const showModal = ref(false)
const modalText = ref('')
const canSend = ref(true)

const name = ref('')
const company = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')

async function SendEmail() {
  if (email.value.length == 0
    || name.value.length == 0
    || company.value.length == 0
    || phone.value.length == 0
    || message.value.length == 0) {
    modalText.value = i18n.t('modal_all_fields');
    showModal.value = true
    return
  }

  canSend.value = false;

  emailjs
    .sendForm('service_lbut1ys', 'template_aznai5p', form.value != null ? form.value : "none", {
      publicKey: 'e3bm7Vy4Y4uUrLkmf',
    })
    .then(
      () => {
        console.log('SUCCESS!');
        modalText.value = i18n.t('send_query_success')
        showModal.value = true;
        canSend.value = true;
      },
      (error) => {
        console.log('FAILED...', error.text);
        modalText.value = i18n.t('send_query_error')
        showModal.value = true;
        canSend.value = true;
      },
    );
}
</script>

<template>
  <div class="section color-blue header">
    <!-- <TheLogo class="logo" @click=""/> -->

  </div>  
  <div class="logo">
    <img src="@/assets/images/elements/1.png" />
    <div class="romboid">
      <h2>{{ $t('home_body1').toUpperCase() }}</h2>
    </div>
  </div>
  
  <transition name="fade">
    <div v-if="showUpdateStatus" class="update-status-container">
      <div class="update-status-header">
        <h3>{{ $t('update_info') || 'Update Info' }}</h3>
        <button class="close-button" @click="showUpdateStatus = false">×</button>
      </div>
      <p class="update-status">{{ updateStatus }}</p>
      <button class="update-button" @click="checkForUpdates">{{ $t('check_for_updates') || 'Check for updates' }}</button>
      <p class="version">{{ currentVersion }}</p>
    </div>
  </transition>
  
  <button class="info-button" @click="showUpdateStatus = !showUpdateStatus">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-info-square-fill" viewBox="0 0 16 16">
      <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.93 4.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
    </svg>
  </button>

  <div class="section color-green main">

  </div>
  <div class="section color-green home-section">
    <h1 class="title-section">{{ $t('home_title2').toUpperCase() }}</h1>
    <div class="animated-section" :class="{ 'mobile-hidden': isMobile }">
      <!-- <video autoplay loop muted playsinline class="animated-item">
        <source :src="finalWebVideo" type="video/webm">
      </video>
      <video autoplay loop muted playsinline class="animated-item">
        <source :src="finalWebVideo" type="video/webm">
      </video>
      <video autoplay loop muted playsinline class="animated-item">
        <source :src="finalWebVideo" type="video/webm">
      </video>
      <video autoplay loop muted playsinline class="animated-item">
        <source :src="finalWebVideo" type="video/webm">
      </video>
      <video autoplay loop muted playsinline class="animated-item">
        <source :src="finalWebVideo" type="video/webm">
      </video>
      <video autoplay loop muted playsinline class="animated-item">
        <source :src="finalWebVideo" type="video/webm">
      </video>
      <video autoplay loop muted playsinline class="animated-item">
        <source :src="finalWebVideo" type="video/webm">
      </video> -->

    </div>
    <img src="@/assets/images/dev-icons.png" />
    <h2 id="main-title2">{{ $t('home_body2') }}</h2>
    <p style="font-family: 'Poppins', sans-serif;">{{ $t('home_text3') }}</p>
  </div>
  <div class="divider color-orange"></div>
  <div id="tecnology-section" class="section color-orange view-container" style="--h:70rem">

    <h1 id="main-title3" class="title-section">{{ $t('home_title3').toUpperCase() }}</h1>
    <!-- <h2>{{ $t('home_body3').toUpperCase() }}</h2> -->
    <div :class="{ 'graph-section': !isMobile }">
      <p class="item-graph" style="--x:1;--y:1">{{ $t('home_graph1_data_text1') }} <b>{{ $t('home_graph1_data_text2')
      }}</b>{{ $t('home_graph1_data_text3') }}</p>
      <img v-if="isMobile" class="item-graph-img" style="--x:2;--y:1" src="@/assets/images/graph-92-m.png" />
      <img v-else class="item-graph-img" style="--x:2;--y:1" src="@/assets/images/graph-92.png" />
      <p class="item-graph" style="--x:2;--y:2">{{ $t('home_graph2_data_text1') }}<b>{{ $t('home_graph2_data_text2')
      }}</b>{{ $t('home_graph2_data_text3') }}</p>
      <img v-if="isMobile" class="item-graph-img" style="--x:1;--y:2" src="@/assets/images/graph-88-m.png" />
      <img v-else class="item-graph-img" style="--x:1;--y:2" src="@/assets/images/graph-88.png" />
    </div>

  </div>

  <div class="divider color-pink"></div>
  <div id="carousel" class="color-pink section view-container">
    <h1 class="title-section">{{ $t('home_title4').toUpperCase() }}</h1>
    <div class="carousel-section">
      <div class="image-container">
        <img class="carousel-img" src="@/assets/images/boly/1.png" />
      </div>
      <div class="image-container">
        <img class="carousel-img" src="@/assets/images/boly/2.png" />
      </div>
    </div>
  </div>
  <div v-if="!isMobile" class="divider color-blue"></div>
  <div v-if="!isMobile" class="color-blue">
    <h1>{{ $t('home_title5').toUpperCase() }}</h1>
  </div>
  <div v-if="!isMobile" class="view-container-grid form-grid color-blue">
    <div class="item-form-grid" style="--column-s:1;">
      <h2>{{ $t('home_form_title').toUpperCase() }}</h2>
    </div>
    <div class="item-form-grid" style="--column-s:1;--row-s:2;">
      <p style="font-family: 'Poppins', sans-serif;">{{ $t('home_form_text') }}</p>
    </div>
    <form ref="form" @submit.prevent="SendEmail">
      <div class="item-form-grid" style="--column-s:2;--row-s:1;--row-e:2">
        <input class="form-element" type="text" name="name" v-model="name" :placeholder="$t('name')"></input>
        <input class="form-element" type="text" name="company" v-model="company" :placeholder="$t('company')"></input>
        <input class="form-element" type="email" name="email" v-model="email" :placeholder="$t('email')"></input>
        <input class="form-element" type="tel"
          pattern="((\+\d{1,3}(-|.| )?\(?\d\)?(-| |.)?\d{1,5})|(\(?\d{2,6}\)?))(-|.| )?(\d{3,4})(-|.| )?(\d{4})(( x| ext)\d{1,5}){0,1}$"
          name="phone" v-model="phone" placeholder="---------"
          @input="phone = phone.replace(/\D/g, '').slice(0, 9)"></input>
        <textarea class="form-element" style="--h:10rem;" type="text" name="message" v-model="message"
          :placeholder="$t('query')"></textarea>
        <button class="form-button" type="submit" :value="i18n.t('send_query')" :disabled="!canSend">Enviar</button>
      </div>
    </form>
  </div>
  <div class="divider color-purple "></div>
  <div class=" color-purple RRSS-container-section">
    <div class="RRSS-container-grid">
      <a href="https://www.instagram.com/boly_games/">
        <div class="RRSS-item">

          <img src="@/assets/images/RRSS/instagram.png" />

          <p>Instagram</p>
        </div>
      </a>
      <a href="https://www.linkedin.com/company/bolygames/">
        <div class="RRSS-item">
          <img src="@/assets/images/RRSS/linkedin.png" />
          <p>Linkedin</p>
        </div>
      </a>
      <!-- <div class="RRSS-item">
        <img src="@/assets/images/RRSS/youtube.png" />
        <p>Youtube</p>
      </div>
      <div class="RRSS-item">
        <img src="@/assets/images/RRSS/tiktok.png" />
        <p>Tiktok</p>
      </div> -->
      <a href="https://wa.me/+56979966798">
        <div class="RRSS-item">
          <img src="@/assets/images/RRSS/whatsapp.png" />
          <p>Whatsapp</p>
        </div>
      </a>
    </div>

  </div>
  <div class="pre-footer color-purple"></div>
</template>

<style scoped>
body {
  overflow-x: hidden;
}

.update-status-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 250px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.update-status-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
}

.update-status-header h3 {
  margin: 0;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0 5px;
}

.update-status {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-family: 'Poppins', sans-serif;
  width: 100%;
}

.version {
  margin: 8px 0 0 0;
  font-size: 12px;
  font-family: 'Poppins', sans-serif;
  opacity: 0.8;
  width: 100%;
  text-align: right;
}

.update-button {
  margin-top: 8px;
  background-color: #b533c7;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  align-self: stretch;
}

.update-button:hover {
  background-color: #9d2fad;
}

.info-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #b533c7;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.info-button:hover {
  background-color: #9d2fad;
  transform: scale(1.05);
}

.info-button svg {
  width: 24px;
  height: 24px;
}

@media only screen and (max-width: 768px) {
  .info-button {
    width: 40px;
    height: 40px;
    bottom: 15px;
    right: 15px;
  }
  
  .info-button svg {
    width: 20px;
    height: 20px;
  }
  
  .update-status-container {
    bottom: 65px;
    right: 15px;
    min-width: 200px;
    max-width: 80%;
    padding: 12px;
  }
}

.section {
  padding-bottom: 10px;
}

.darkened {
  background: rgb(57, 23, 117);
  background: linear-gradient(135deg, rgba(57, 23, 117, 1) 15%, rgba(0, 83, 205, 1) 98%);
}

.color-green {
  background: rgb(187, 217, 37)
    /* background: linear-gradient(135deg, rgba(57, 23, 117, 1) 15%, rgba(0, 83, 205, 1) 98%); */
    /* */
}

.color-blue {
  background: rgb(64, 168, 226);
}

.color-orange {
  background: rgb(254, 142, 75);
}

.color-pink {
  background: rgb(247, 70, 171);
}

.color-purple {
  background: rgb(78, 69, 153);
}

.header {
  padding-top: 25vw;
  padding-bottom: 10rem;
  margin-top: -10rem;
  font-family: "Anton", serif;
  /* transform: skewY(-3.5deg); */
  clip-path: polygon(0% 10%, 100% 0%, 100% 100%, 0% 100%);
  transform-origin: top left;
  position: relative;
  z-index: 1;
  width: 100%;
}



.logo {
  padding-top: 0rem;
  /* margin-top: -20rem !important; */
  /* position: relative; */
  position: relative;
  z-index: 6 !important;
  margin: auto;
  /* width: 75vw; */
  top: -28vw;
  display: flex;
  flex-direction: column;
  height: 0px;
}

.logo img {
  width: 27.5vw;
  height: auto;
  margin: auto;

}


.romboid {
  /* background-color: #A833B9; Color de fondo del banner */
  background-image: url('@/assets/images/elements/7.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  margin-top: -3rem;
  padding: 8rem;
  /* clip-path: polygon(5% 0%, 100% 20%, 95% 100%, 10% 90%); */
}

.romboid * {

  color: white;
  font-weight: bold;
  font-size: 50px;
  transform: rotate(-3deg);
  text-align: justify;
}

.title-section {
  transform: rotate(-3deg);
}

.main {
  padding-top: 30rem;
  margin-bottom: 0rem;
  margin-top: -20rem;
  font-family: "Anton", serif;
  /* transform: skewY(-3.5deg); */
  clip-path: polygon(0% 20%, 100% 0%, 100% 100%, 0% 100%);
  transform-origin: top left;
  z-index: 2;
  position: relative;
  width: 100%;
}

.home-section {
  padding: 8rem 4rem;
  margin-top: -1rem;
  font-family: "Anton", serif;
  /* transform: skewY(-3.5deg); */
  transform-origin: top left;
  z-index: 2;
  position: relative;
}

.main p {
  padding-inline: 5rem;
  z-index: 2;
  position: relative;
  width: 80vw;
}

/* .main p{
  font-size: 2rem;
} */

.divider {
  /* transform: skewY(-3.5deg); */
  margin-top: -4rem;
  padding-top: 5rem;
  margin-bottom: -1rem;
  padding-bottom: 2rem;
  clip-path: polygon(0% 50%, 100% 0%, 100% 100%, 0% 100%);
  transform-origin: top left;
  position: relative;
  z-index: 4;
}

.pre-footer {
  /* transform: skewY(-3.5deg); */
  margin-bottom: -15rem;
  padding-bottom: 5rem;
  padding-top: 2rem;
  clip-path: polygon(0% 0%, 100% 0%, 0% 100%, 0% 100%);
  transform-origin: top left;
  position: relative;
  z-index: 1;
}

.animated-section {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr 2fr 1fr 2fr;
  justify-items: center;
  width: 80%;
  grid-template-rows: auto auto;
}

.animated-item {
  flex-direction: column;
  align-items: center;
  text-align: center;
  align-self: center;
  color: white;
  font-size: 28px;
  font-family: Arial, sans-serif;
}

.graph-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: center;
  width: 70%;
  grid-template-rows: auto auto;
}

.graph-section * {
  grid-column-start: var(--x);
  grid-row-start: var(--y);
}


.carousel-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-items: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

.carousel-section img {
  width: 20rem;
  height: auto;
}

/* .carousel-img {
  width: 32rem;
  height: 35rem;
  margin-top: 2.0rem;
  margin-inline: 2rem;
  padding-bottom: 1rem;
}

.image-container {
  background-image: url('@/assets/images/elements/4.png');
  background-size: cover;
  padding-top: 3.3rem;
  padding-left: 2rem;
  padding-right: 3.2rem;
  padding-bottom: 1rem;
} */


.view-container {
  height: var(--h, 50rem);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 10rem;
}

.view-container-grid {
  padding-inline: 10rem;
  column-gap: 15rem;
  row-gap: 0rem;
  height: 50rem;
  width: 100%;
  display: grid;
  grid-template-columns: 5fr 4fr;
  grid-template-rows: 13rem;
  justify-items: center;
  align-items: center;
  grid-auto-rows: max-content;

  h2 {
    line-height: 100%;
  }
}

.view-container-grid * {
  align-self: start;
}

.form-element {
  background-color: transparent;
  border-color: white;
  border: 4px solid #ffffff;
  border-radius: 15px 15px 15px 15px;
  -webkit-border-radius: 15px 15px 15px 15px;
  -moz-border-radius: 15px 15px 15px 15px;
  padding: 1rem;
  margin: 1rem;
  width: 100%;
  height: var(--h, 4rem);
  color: white;
  font-weight: bold;
  font-size: 18px;
  display: flex;
}

.form-element::placeholder {
  vertical-align: text-top;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.form-element:focus {
  outline: none
}

.form-button {
  background-color: #b533c7;
  /* Color morado */
  color: white;
  font-weight: bold;
  font-size: 18px;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  cursor: pointer;
  text-transform: uppercase;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  width: 50vh;
  font-family: 'Poppins', sans-serif;
}

.form-button:hover {
  background-color: #9d2fad;
}

.RRSS-container-section {
  z-index: 5;
  display: flex;
  max-width: 100%;
}

.RRSS-container-grid {
  column-gap: 2rem;
  width: 50%;
  height: 25rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-items: center;
  align-items: center;
  z-index: 5;
  margin: auto;
  max-width: 100%;
}

.RRSS-item {
  background-image: url('@/assets/images/elements/6.png');
  background-size: cover;
  width: 10rem;
  height: 35rem;
  padding-top: 0rem;
  margin-top: -12rem;

}

.RRSS-item p {
  transform: rotate(-90deg);
  margin-top: 8rem;
  margin-left: -6rem;
  text-align: end;
  font-size: 4rem;
  font-family: "Anton", serif;
  color: rgb(78, 69, 153);
  width: 22rem;
}

.RRSS-item img {
  width: 15rem;
  margin-left: -2.25rem;
  height: 8rem;
  margin-top: 6rem;
}

.item-form-grid {
  grid-column-start: var(--column-s);
  grid-column-end: var(--column-e);
  grid-row-start: var(--row-s);
  grid-row-end: var(--row-e);
  height: auto;
}

.item-form-grid h2 {
  text-align: left;
  align-self: start;
  font-size: 3vw;
}

.item-form-grid p {
  text-align: left;
  align-self: start;
  font-size: 2vw;
}

.item-graph {
  font-family: 'Poppins', sans-serif;
  flex-direction: column;
  align-items: center;
  text-align: center;
  align-self: center;
  color: white;
  font-size: 28px;
}

.item-graph * {
  font-weight: bold;
}

.item-graph-img {
  width: 25rem;
  /* Tamaño de los gráficos */
  height: 25rem;
  margin: -2rem;
}

.contact-bg {
  height: 800px;
  background-image: url("src/assets/images/fondo-xd.png");
  background-size: cover;
}

.button {
  padding-inline: 10px;
  height: 40px;
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: larger;
}

.boly-container {
  position: absolute;
  top: 150px;
  left: 30%;
  width: 300px;
  height: 300px;
  z-index: 5;
  overflow: hidden;
}

.boly-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

p {
  text-align: center;
  font-family: 'Lato', sans-serif;
  font-size: 1.75rem;
  /* font-style: italic; */
  width: 100%;
}

h2 {
  text-align: center;
  font-family: "Anton", serif;
  /* font-style: italic; */
  font-size: 3.75rem;
  /* font-size: 3.125vw; */
  width: 100%;
}

h1 {
  text-align: center;
  font-family: "Anton", serif;
  /* font-style: italic; */
  font-size: 500%;
  width: 100%;
}

.img-dev {
  height: 50%;
  width: auto;
}

.section-title {
  text-align: left;
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 300%;
}

.section-text {
  text-align: left;
  font-size: 115%;
  margin: 40px;
  width: 80%;
}

.mobile-hidden {
  display: none;
}

.home-title-card {
  margin-left: auto;
}

@media only screen and (max-width: 1920px) {

  /* .RRSS-item p {
  transform: rotate(-90deg);
  margin-top: 8rem;
  margin-left: -6rem;
  text-align: end;
  font-size: 4rem;
  font-family: "Anton", serif;
  color: rgb(78, 69, 153);
  width: 22rem;
}
.view-container-grid {
  padding-inline: 10rem;
  column-gap: 15rem;
  row-gap: 15%;
  height: 50rem;
  width: 100%;
  display: grid;
  grid-template-columns: 5fr 4fr;
  grid-template-rows: 13rem;
  justify-items: center;
  align-items: center;

  h2 {
    line-height: 100%;
  }
} */
}

@media only screen and (max-width: 1280px) {

  /* 

  .carousel-img {
    width: 23rem;
    height: 21rem;
    margin-inline: 1.0rem;
    padding-bottom: 0rem;
    margin-top: 0.5rem;
  }

  .image-container {
    height: 30rem;
    width: 28rem;
  }

  .view-container-grid {
    padding-inline: 8rem;
    column-gap: 0rem;
    row-gap: 2rem;
    grid-template-rows: 15rem;
  }

  .RRSS-container-grid {
    margin-inline: 10rem;
  } */



}

@media only screen and (max-width: 768px) {

  .mobile-hidden {
    display: none;
  }

  .home-title-card {
    margin-left: 0;
  }

  div {
    max-width: 100%;
  }

  h1 {
    font-size: 3.0rem;
  }

  h2 {
    font-size: 2.0rem;
  }

  .logo {
    padding-top: 0rem;
    /* margin-top: -20rem !important; */
    /* position: relative; */
    position: relative;
    top: -70vw;
    z-index: 3;
    margin: auto;
    /* width: 75vw; */
    display: flex;
    flex-direction: column;
    height: 0px;
  }

  .logo img {
    width: 50vw;
    margin: auto;
  }

  .header {
    padding-top: 17rem;
    padding-bottom: 8rem;
    margin-top: -8rem;
    font-family: "Anton", serif;
    /* transform: skewY(-3.5deg); */
    clip-path: polygon(0% 10%, 100% 0%, 100% 100%, 0% 100%);
    transform-origin: top left;
    position: relative;
    z-index: 1;
  }

  .romboid {
    background: transparent url(@/assets/images/elements/7.png) no-repeat cover;

    margin-top: 0rem;
    padding: 6rem;
    margin-bottom: 5rem;
  }

  .romboid h2 {
    color: white;
    font-weight: bold;
    font-size: 1.1rem !important;
    transform: rotate(-3deg);
    text-align: left;
    text-wrap-mode: nowrap;
  }

  .main {
    padding-top: 100vw;
    font-family: "Anton", serif;
    /* transform: skewY(-3.5deg); */
    margin-top: -14rem;
    margin-left: 0rem;
    margin-bottom: 0rem;
    clip-path: polygon(0% 10%, 100% 0%, 100% 100%, 0% 100%);
    transform-origin: top left;
    z-index: 2;
    position: relative;
    width: 100%;

    p {
      padding-inline: 0rem;
      z-index: 2;
      position: relative;
      width: 90vw;
      font-size: 1.4rem;
      text-align: center;
    }

    img {
      width: 20rem;
    }
  }

  .home-section {
    padding: 8rem 0rem;
    font-family: "Anton", serif;
    /* transform: skewY(-3.5deg); */
    margin-top: -14rem;
    margin-left: 0rem;
    margin-bottom: 0rem;
    transform-origin: top left;
    z-index: 2;
    position: relative;
    width: 100%;

    p {
      padding-inline: 0rem;
      z-index: 2;
      position: relative;
      width: 90vw;
      font-size: 1.4rem;
      text-align: center;
    }

    img {
      width: 20rem;
    }
  }

  #main-title2 {
    font-size: 1.8rem;
    text-wrap-mode: wrap;
    width: 95vw;
  }

  .item-graph-img {
    width: 20rem;
    height: 20rem;
    margin: 0rem;
  }

  #main-title3 {
    padding-top: 0rem;
  }

  .item-graph {
    width: 90vw;
  }

  #tecnology-section {
    height: auto;
  }

  .carousel-section {
    display: grid;
    margin-top: 0rem;
    grid-template-columns: 1fr;
    justify-items: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding-inline: 0rem;
  }

  .carousel-section img {
    width: 20rem;
    height: auto;
  }


  #carousel {
    height: auto;
  }

  .RRSS-container-section {
    z-index: 5;
    display: flex;
    width: 100%;
    height: 40vh;
  }

  .RRSS-container-grid {
    column-gap: 2rem;

    height: 30rem;
    display: flex;
    /* grid-template-columns: 1fr 1fr 1fr 1fr 1fr; */

    justify-items: center;
    align-items: center;
    z-index: 5;
    margin: auto;
    column-gap: 0px;
    width: 90%;
    position: relative;
  }

  .RRSS-item {
    background-image: url('@/assets/images/elements/6.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-size: 8rem;
    width: 7rem;
    height: 52rem;
    padding-top: 0rem;
    margin-top: 8rem;
    max-width: 100%;
  }

  .RRSS-item p {
    transform: rotate(-90deg);
    margin-top: 10rem;
    margin-left: -0rem;
    text-align: end;
    font-size: 4rem;
    font-family: "Anton", serif;
    color: rgb(78, 69, 153);
    width: auto;
  }

  .RRSS-item img {
    width: auto;
    margin-left: -1.5rem;
    height: 6rem;
    margin-top: 1rem;
  }

}

@media screen and (max-width: 409px) {
  .graphics-container {
    margin-top: 90px;
  }

  svg {
    width: 100% !important;
    height: auto !important;
  }



}

/* Transition animations */
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
