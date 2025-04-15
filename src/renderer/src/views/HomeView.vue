<script setup lang="ts">
import InfoCard from '@/components/InfoCard.vue';
import ContactForm from '@/components/ContactForm.vue';
import { RouterLink } from 'vue-router';

import { ref, onMounted } from 'vue';
import DataCard from '@/components/DataCard.vue';

import emailjs from '@emailjs/browser';
import { useI18n } from 'vue-i18n';
const i18n = useI18n();

import finalWebVideo from '@/assets/webm/finalweb.webm?url';
import TheLogo from '../components/logo/TheLogo.vue'


const { t } = useI18n();
const isMobile = ref(window.innerWidth <= 768);

onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
});

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
</style>
