<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import emailjs from '@emailjs/browser';
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Navigation } from 'vue3-carousel';

// Import Boly action images
import bolyAction1 from '@/assets/images/boly/bolyaction/1action.jpg';
import bolyAction2 from '@/assets/images/boly/bolyaction/2action.jpg';
import bolyAction3 from '@/assets/images/boly/bolyaction/3action.jpg';
import bolyAction4 from '@/assets/images/boly/bolyaction/4action.jpg';

const { t } = useI18n();
const i18n = useI18n();

// Carousel setup
const carouselRef = ref<any>();
const currentSlide = ref<number>(0);
const isMobile = ref(window.innerWidth <= 768);

// Boly images data
const bolyImages = ref([
  {
    id: 1,
    src: bolyAction1,
    title: 'Boly in Action 1',
    description: 'Dynamic gameplay moments'
  },
  {
    id: 2,
    src: bolyAction2,
    title: 'Boly in Action 2',
    description: 'Adventure and exploration'
  },
  {
    id: 3,
    src: bolyAction3,
    title: 'Boly in Action 3',
    description: 'Interactive learning experiences'
  },
  {
    id: 4,
    src: bolyAction4,
    title: 'Boly in Action 4',
    description: 'Educational gaming at its best'
  }
]);

// Carousel settings
const settings = computed(() => ({
  itemsToShow: isMobile.value ? 1 : 2,
  snapAlign: 'center',
  wrapAround: true,
  autoplay: isMobile.value ? undefined : 5000,
  pauseAutoplayOnHover: true,
  transition: 300,
  mouseDrag: isMobile.value,
  touchDrag: true
}));

// Calculate number of navigation dots needed
const totalSlides = computed(() => {
  const itemsPerSlide = isMobile.value ? 1 : 2;
  return Math.ceil(bolyImages.value.length / itemsPerSlide);
});

// Navigation functions
function next() {
  carouselRef.value.next();
  carouselRef.value.updateSlidesData();
}

function prev() {
  carouselRef.value.prev();
  carouselRef.value.updateSlidesData();
}

function moveToSlide(i: number) {
  carouselRef.value.slideTo(i);
  carouselRef.value.updateSlidesData();
}

// Handle window resize
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Contact form reactive variables
const form = ref(null);
const showModal = ref(false);
const modalText = ref('');
const canSend = ref(true);
const name = ref('');
const company = ref('');
const email = ref('');
const phone = ref('');
const message = ref('');

async function SendEmail() {
  if (email.value.length === 0 ||
      name.value.length === 0 ||
      company.value.length === 0 ||
      phone.value.length === 0 ||
      message.value.length === 0) {
    modalText.value = i18n.t('modal_all_fields');
    showModal.value = true;
    return;
  }

  canSend.value = false;

  emailjs
    .sendForm('service_lbut1ys', 'template_aznai5p', form.value != null ? form.value : "none", {
      publicKey: 'e3bm7Vy4Y4uUrLkmf',
    })
    .then(
      () => {
        console.log('SUCCESS!');
        modalText.value = i18n.t('send_query_success');
        showModal.value = true;
        canSend.value = true;
      },
      (error) => {
        console.log('FAILED...', error.text);
        modalText.value = i18n.t('send_query_error');
        showModal.value = true;
        canSend.value = true;
      },
    );
}

// Lifecycle hooks
onMounted(() => {
  // Add resize event listener
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // Clean up event listener
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="section color-orange header"></div>
  
  <div class="logo">
    <img src="@/assets/images/elements/1.png" />
    <div class="romboid">
      <h2>{{ $t('home_body1').toUpperCase() }}</h2>
      <p class="home-body1-description">{{ $t('home_body1_description') }}</p>
    </div>
  </div>
  
  
  <div class="section color-pink main"></div>
  
  <div class="section color-pink home-section">
    <div class="svg-container">
        <router-link to="/educators" class="svg-link">
          <div class="svg-left">
              <img src="@/assets/svgs/HomeViewSvgs/teacherwithbook.svg" alt="Teacher with book" />
              <h3>{{ $t('home_svg1_title').toLocaleUpperCase() }}</h3>
              <p>{{ $t('home_svg1_description') }}</p>
          </div>
        </router-link>
        <router-link to="/developer-contact" class="svg-link">
          <div class="svg-right">
              <img src="@/assets/svgs/HomeViewSvgs/womanwithlaptop.svg" alt="Woman with laptop" />
              <h3>{{ $t('home_svg2_title').toLocaleUpperCase() }}</h3>
              <p>{{ $t('home_svg2_description') }}</p>
          </div>
        </router-link>
    </div>
  </div>
  
  <div class="divider color-blue"></div>
  
  <div id="our-project-section" class="section color-blue view-container" style="--h:100rem">
    <div class="our-project-content">
      <h1 class="our-project-title">{{ $t('home_title2').toUpperCase() }}</h1>
      
      <div class="project-description">
        <p class="main-description">
          {{ $t('project_main_text') }}
        </p>
        <p class="secondary-description">
          {{ $t('project_secondary_text') }}
        </p>
      </div>

      <div class="process-flow">
        <div class="flow-item">
          <div class="flow-icon">
            <img src="@/assets/svgs/HomeViewSvgs/book.svg" alt="Book" />
          </div>
        </div>
        
        <div class="flow-arrow">→</div>
        
        <div class="flow-item">
          <div class="flow-icon affinity-icon">
            <img src="@/assets/svgs/HomeViewSvgs/affinity.svg" alt="Affinity" />
          </div>
        </div>
        
        <div class="flow-arrow">→</div>
        
        <div class="flow-item">
          <div class="flow-icon">
            <img src="@/assets/svgs/HomeViewSvgs/gamepad.svg" alt="Game Controller" />
          </div>
        </div>
        
        <div class="flow-arrow">→</div>
        
        <div class="flow-item">
          <div class="flow-icon">
            <img src="@/assets/svgs/HomeViewSvgs/innovation.svg" alt="Innovation" />
          </div>
        </div>
      </div>

      <div class="connection-text">
        <p>
          {{ $t('connection_text') }}
        </p>
      </div>

      <div class="target-audience">
        <h2>{{ $t('revolution_question') }}</h2>
        
        <div class="audience-grid">
          <div class="audience-column">
            <h3>{{ $t('educators') }}</h3>
            <ul>
              <li>{{ $t('personalization') }}</li>
              <li>{{ $t('automatic_reports') }}</li>
              <li>{{ $t('tracking') }}</li>
            </ul>
            <router-link to="/educators">
              <button class="cta-button educators-btn">{{ $t('want_know_more') }}</button>
            </router-link>
          </div>
          
          <div class="audience-column">
            <h3>{{ $t('developers') }}</h3>
            <ul>
              <li>{{ $t('monetization') }}</li>
              <li>{{ $t('visibility') }}</li>
              <li>{{ $t('direct_integration') }}</li>
            </ul>
            <router-link to="/developer-contact">
              <button class="cta-button developers-btn">{{ $t('want_know_more') }}</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="divider color-orange"></div>
  
  <div id="technology-section" class="section color-orange view-container" style="--h:60rem">
    <div class="technology-content">
      <h1 class="our-project-title">{{ $t('home_title3').toUpperCase() }}</h1>
      
      <div class="technology-cards">
        <div class="tech-card">
          <div class="card-visual">
            <img src="@/assets/svgs/HomeViewSvgs/down88.svg" alt="88% Statistics" class="card-svg" />
          </div>
          <div class="card-text">
            <p>{{ $t('home_graph1_data_text1') }}<strong>{{ $t('home_graph1_data_text2') }}</strong></p>
          </div>
        </div>

        <div class="tech-card solution-card">
          <div class="card-visual">
            <img src="@/assets/svgs/HomeViewSvgs/lampandgear.svg" alt="Solution" class="card-svg solution-svg" />
          </div>
          <div class="card-text">
            <p><strong>{{ $t('technology_solution_text1') }}</strong></p>
            <p><strong>{{ $t('technology_solution_text2') }}</strong></p>
          </div>
        </div>

        <div class="tech-card">
          <div class="card-visual">
            <img src="@/assets/svgs/HomeViewSvgs/up92.svg" alt="92% Statistics" class="card-svg" />
          </div>
          <div class="card-text">
            <p>{{ $t('technology_mobile_learning_text1') }}</p>
            <p><strong>{{ $t('technology_mobile_learning_text2') }}</strong></p>
          </div>
        </div>
      </div>

      <div class="concrete-example">
        <p>{{ $t('technology_classroom_example') }}</p>
      </div>
    </div>
  </div>
  
  <div id="games-section" class="color-pink section view-container games-section-bg"style="--h:60rem">
    <div class="our-games-content">
      <h2 class="our-games-title">{{ $t('our_games_title') }}</h2>
      
      <div class="project-description">
        <p class="secondary-description">
          {{ $t('our_games_secondary_text') }}
        </p>
        <router-link to="/games">
          <button class="cta-button developers-btn games-btn">
        {{ $t('lets_go') }}
          </button>
        </router-link>
      </div>
    </div>
  </div>
  
  <div class="divider color-pink"></div>
  
  <!-- Boly Images Carousel Section -->
  <div class="section color-pink view-container" style="--h:50rem">
    <div class="boly-carousel-content">
      <h1 class="our-project-title">{{ $t('boly_gallery_title').toUpperCase() || 'MEET BOLY' }}</h1>
      
      <div class="carousel-container" :class="{ 'mobile-carousel': isMobile }">
        <carousel v-bind="settings" ref="carouselRef" v-model="currentSlide">
          <slide v-for="item in bolyImages" :key="item.id">
            <div class="boly-slide-image-only" :class="{ 'mobile-slide': isMobile }">
              <div class="boly-image-wrapper" :class="{ 'mobile-image': isMobile }">
                <img 
                  :src="item.src" 
                  :alt="item.title"
                  loading="lazy"
                >
              </div>
            </div>
          </slide>

          <template #addons>
            <navigation v-if="!isMobile" />
          </template>
        </carousel>
      </div>
      
      <div class="boly-nav-counter" :class="{ 'mobile-nav-counter': isMobile }">
        <span 
          v-for="i in totalSlides" 
          :key="i" 
          @click="moveToSlide(i-1)"
          class="boly-nav-dot"
          :class="{ active: currentSlide === i-1 }"
        >
          {{ currentSlide === i-1 ? '●' : '○' }}
        </span>
      </div>
    </div>
  </div>
   
  
  <div class="divider color-blue"></div>
  
  <div class="color-blue">
      <h1 class="our-project-title">{{ $t('home_title5').toUpperCase() }}</h1>
  </div>
  
  <div class="view-container-grid form-grid color-blue">
    <div class="item-form-grid" style="--column-s:1;">
      <h1 class="form-subtitle">{{ $t('home_form_title').toUpperCase() }}</h1>
    </div>
    <div class="item-form-grid" style="--column-s:1;--row-s:2;">
      <p style="font-family: 'Poppins', sans-serif; font-size: 1.9rem">{{ $t('home_form_text') }}</p>
    </div>
    <form ref="form" @submit.prevent="SendEmail">
      <div class="item-form-grid" style="--column-s:2;--row-s:1;--row-e:2">
        <input class="form-element" type="text" name="name" v-model="name" :placeholder="$t('name')" />
        <input class="form-element" type="text" name="company" v-model="company" :placeholder="$t('company')" />
        <input class="form-element" type="email" name="email" v-model="email" :placeholder="$t('email')" />
        <input 
          class="form-element" 
          type="tel"
          pattern="((\+\d{1,3}(-|.| )?\(?\d\)?(-| |.)?\d{1,5})|(\(?\d{2,6}\)?))(-|.| )?(\d{3,4})(-|.| )?(\d{4})(( x| ext)\d{1,5}){0,1}$"
          name="phone" 
          v-model="phone" 
          placeholder="---------"
          @input="phone = phone.replace(/\D/g, '').slice(0, 9)" 
        />
        <textarea 
          class="form-element" 
          style="--h:10rem;" 
          type="text" 
          name="message" 
          v-model="message"
          :placeholder="$t('query_home')"
        ></textarea>
        <button class="form-button" type="submit" :value="i18n.t('send_query')" :disabled="!canSend">
          Enviar
        </button>
      </div>
    </form>
  </div>
  
  <div class="divider color-purple"></div>
  
  <div class="color-purple RRSS-container-section">
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
  padding-bottom: 20px;
}

.darkened {
  background: rgb(57, 23, 117);
  background: linear-gradient(135deg, rgba(57, 23, 117, 1) 15%, rgba(0, 83, 205, 1) 98%);
}

.color-green {
  background: rgb(187, 217, 37);
}

.color-blue {
  background: rgb(64, 168, 226);
}

.color-orange {
  background: var(--boly-bg-orange);
}

.color-pink {
  background: rgb(247, 70, 171);
}

.color-purple {
  background: rgb(78, 69, 153);
  border: 1px solid rgb(78, 69, 153);
}

.header {
  padding-top: 25vw;
  padding-bottom: 10rem;
  margin-top: -10rem;
  font-family: "Anton", serif;
  clip-path: polygon(0% 10%, 100% 0%, 100% 100%, 0% 100%);
  transform-origin: top left;
  position: relative;
  z-index: 1;
  width: 100%;
}

.logo {
  padding-top: 0rem;
  position: relative;
  z-index: 6 !important;
  margin: auto;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0 auto;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  padding: 2rem;
}

.romboid p {
  font-family: 'Poppins', sans-serif;
  color: white;
  transform: none;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.romboid h2 {
  font-family: 'Poppins', sans-serif;
  background: white; 
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: white !important;
  font-size: 70px;
  transform: rotate(-2deg);
  font-weight: 900;
  -webkit-text-stroke: 3px rgba(255, 255, 255, 0.2);
  filter: drop-shadow(2px 2px 0px rgba(135, 206, 250, 0.6)) drop-shadow(0 2px 4px rgba(173, 216, 230, 0.4));
}

.home-body1-description {
  font-family: 'Poppins', sans-serif !important;
  transform: none !important;
  font-size: 28px !important;
  text-align: center !important;
  font-weight: 400 !important;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  width: 80%;
}

.title-section {
  transform: rotate(-3deg);
}

.main {
  padding-top: 30rem;
  margin-bottom: 0rem;
  margin-top: -20rem;
  font-family: "Anton", serif;
  clip-path: polygon(0% 20%, 100% 0%, 100% 100%, 0% 100%);
  transform-origin: top left;
  z-index: 2;
  position: relative;
  width: 100%;
}

.home-section {
  padding: 12rem 4rem;
  margin-top: -1rem;
  font-family: "Anton", serif;
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

.divider {
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
}

.view-container-grid h2 {
  line-height: 100%;
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
  outline: none;
}

.form-button {
  background-color: #b533c7;
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
  width: 100%;
}

h2 {
  text-align: center;
  font-family: "Anton", serif;
  font-size: 3.75rem;
  width: 100%;
}

h1 {
  text-align: center;
  font-family: "Anton", serif;
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

.home-title-card {
  margin-left: auto;
}

.svg-container {
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  width: 60%;
  padding: 0 5vw;
  gap: 8rem;
}

.svg-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.svg-left,
.svg-right {
  transition: all 0.3s ease;
  cursor: pointer;
}

.svg-left {
  align-self: flex-start;
}

.svg-right {
  align-self: flex-end;
}

.svg-left img,
.svg-right img {
  width: 15vw;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  transition: all 0.3s ease;
}

.svg-left:hover,
.svg-right:hover {
  transform: scale(1.05);
}


.svg-left:hover::before,
.svg-right:hover::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  z-index: -1;
  transition: all 0.3s ease;
}

.svg-left h3,
.svg-right h3 {
  font-family: "Anton", serif;
  font-size: 2rem;
  color: white;
  text-align: center;
  margin: 2rem 0 0rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.svg-left p,
.svg-right p {
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem;
  color: white;
  text-align: center;
  margin: 0 1rem;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: 400;
}

/* Our Project Section Styles */
.our-project-content {
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}
.flow-arrow {
  font-size: 2rem;
  color: white;
  margin: 0 1rem;
}

.flow-item {
    display: flex;
    align-items: center;
    filter: drop-shadow(10px 8px 2px rgba(0, 0, 0, 0.2));
}

.flow-icon {
  width: 180px;
  height: 180px;
  display: flex;
  justify-content: space-between;
}

.flow-icon:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 12px 40px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.project-description {
  text-align: center;
  max-width: 900px;
}

.main-description {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 2rem;
  line-height: 1.4;
}

.secondary-description {
  font-family: 'Poppins', sans-serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: white;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 100px;
}

.process-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
}

.dev-icons-image {
  max-width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  filter: drop-shadow(0 8px 32px rgba(0, 0, 0, 0.2));
  transition: all 0.3s ease;
}

.dev-icons-image:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 12px 40px rgba(0, 0, 0, 0.3));
}

.connection-text {
  text-align: center;
  max-width: 800px;
}

.connection-text p {
  font-family: 'Poppins', sans-serif;
  font-size: 1.3rem;
  color: white;
  line-height: 1.6;
  font-weight: 400;
}

.target-audience {
  width: 100%;
}

.target-audience h2 {
    text-align: center;
    font-family: "Anton", serif;
    font-size: 2.5rem;
    color: white;
    margin: 0 auto 3rem auto;
    width: 65%;
    filter: drop-shadow(0 12px 40px rgba(0, 0, 0, 0.3));
}

.audience-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0rem;
  max-width: 880px;
  margin: 0 auto;
  position: relative;
}

.audience-grid::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 10%;
  bottom: 10%;
  width: 4px;
  background: #ffffff;
  transform: translateX(-50%);
  z-index: 10;
  border-radius: 2px;
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.5);
}

.audience-column {
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1rem;
  position: relative;
  z-index: 2;
}

.audience-column h3 {
  font-family: "Anton", serif;
  font-size: 2rem;
  color: white;
  margin-bottom: 1.5rem;
}

.audience-column ul {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.audience-column li {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  color: white;
  margin-bottom: 0.8rem;
  position: relative;
  padding-left: 7rem;
  text-align: left;
}

.audience-column li::before {
  content: '';
  background-image: url('@/assets/svgs/HomeViewSvgs/tick.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 1rem;
  height: 1rem;
  position: absolute;
  left: 5.5rem;
  top: 0.15rem;
}

.cta-button {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.educators-btn {
  background: var(--boly-button-pink);
  color: white;
}

.educators-btn:hover {
  background: var(--boly-button-pink-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.developers-btn {
  background: linear-gradient(135deg, #512da8, #4527a0);
  color: white;
}

.developers-btn:hover {
  background: linear-gradient(135deg, #673ab7, #512da8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.our-project-title {
  font-family: 'Poppins', sans-serif;
  background: white; 
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: white !important;
  font-size: 70px;
  transform: rotate(-2deg);
  font-weight: 900;
}

.our-games-title {
  font-family: 'Poppins', sans-serif;
  background: white; 
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: white !important;
  font-size: 50px;
  font-weight: 900;
  filter: drop-shadow(0 12px 40px rgba(0, 0, 0, 0.3));
  margin-top: 200px;
}

.our-games-content {
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}

.games-section-bg {
  background-image: url('@/assets/images/boly/back-bd.png');
  background-size: cover;
  background-repeat: no-repeat;
}

.games-btn {
  background: var(--boly-button-pink);
  color: white;
  font-family: 'Poppins', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  padding: 1rem 3rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.games-btn:hover {
  background: var(--boly-button-pink-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .audience-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .main-description {
    font-size: 1.5rem;
  }
  
  .secondary-description {
    font-size: 1.2rem;
  }
  
  .dev-icons-image {
    max-width: 90%;
  }
}

/* Technology Section Styles */
.technology-content {
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}

.technology-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
}

.tech-card {
  background: rgba(255, 255, 255, 0.15);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 300px;
}

.tech-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.solution-card {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.card-visual {
  width: 240px;
  height: 240px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-svg {
  width: 240px;
  height: 240px;
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.solution-svg {
  animation: pulse-glow 3s ease-in-out infinite;
}

.tech-card:hover .card-svg {
  transform: scale(1.1);
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 8px 16px rgba(255, 215, 0, 0.4));
    transform: scale(1.05);
  }
}

.card-percentage {
  font-family: "Anton", serif;
  font-size: 3rem;
  color: white;
  font-weight: 900;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.card-text {
  text-align: center;
}

.card-text p {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: white;
  margin: 0.5rem 0;
  line-height: 1.4;
}

.card-text strong {
  font-weight: 700;
}

.concrete-example {
  max-width: 800px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.concrete-example p {
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem;
  color: white;
  margin: 0;
  line-height: 1.6;
  font-style: italic;
}

@media (max-width: 768px) {
  .technology-cards {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .card-percentage {
    font-size: 2.5rem;
  }
  
  .concrete-example {
    padding: 1.5rem;
  }
  
  .concrete-example p {
    font-size: 1rem;
  }
}

/* Boly Carousel Section Styles */

.boly-carousel-content {
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.boly-carousel-content .carousel-container {
  flex-direction: column;
  background-color: white;
  border-radius: 20px;
  align-items: center;
  overflow: hidden;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.boly-carousel-content .mobile-carousel {
  margin: 0 auto;
  max-width: 100%;
  border-radius: 15px;
}

.boly-slide {
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: 3rem;
  gap: 2rem;
  align-items: center;
}

.boly-slide.mobile-slide {
  flex-direction: column;
  padding: 2rem 1rem;
  gap: 1.5rem;
}

.boly-slide-image-only {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.boly-slide-image-only.mobile-slide {
  padding: 1rem;
}

.boly-image-wrapper {
  position: relative;
  width: 350px;
  height: 250px;
  overflow: hidden;
  border-radius: 15px;
  flex-shrink: 0;
  margin: 0 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.boly-image-wrapper.mobile-image {
  width: 100%;
  height: auto;
  max-height: 250px;
  border-radius: 10px;
  margin: 0;
}

.boly-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.boly-image-wrapper img:hover {
  transform: scale(1.02);
}

.boly-details {
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding-left: 2rem;
}

.boly-details.mobile-details {
  text-align: center;
  padding: 0;
  max-width: 100%;
}

.boly-details h3 {
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 2rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.boly-details.mobile-details h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.boly-desc {
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.boly-desc.mobile-desc {
  font-size: 1rem;
}

.boly-nav-counter {
  height: 50px;
  display: flex;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 200%;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.boly-nav-counter.mobile-nav-counter {
  height: 40px;
  gap: 0.4rem;
  font-size: 150%;
}

.boly-nav-dot {
  transition: transform 0.2s ease, color 0.2s ease;
  user-select: none;
  color: rgba(255, 255, 255, 0.5);
}

.boly-nav-dot:hover {
  transform: scale(1.2);
  color: rgba(255, 255, 255, 0.8);
}

.boly-nav-dot.active {
  color: white;
}

/* Carousel component styling for boly section */
.boly-carousel-content .carousel__icon {
  fill: white;
  transition: transform 0.2s ease;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
}

.boly-carousel-content .carousel__icon:hover {
  transform: scale(1.2);
}

.form-subtitle {
  font-family: 'Anton', sans-serif;
  font-size: 2.5rem;
  color: white;
  margin-top: 1rem;
  text-align: left;
}

@media (max-width: 768px) {
  .boly-slide {
    padding: 1.5rem;
  }
  
  .boly-carousel-content .carousel__slide {
    touch-action: pan-y;
  }
  
  .boly-carousel-content .carousel__pagination {
    margin-top: 10px;
  }
  
  .boly-carousel-content .carousel__pagination-button {
    padding: 5px;
  }
}
</style>

<style>
/* Global pink carousel navigation buttons */
.carousel__prev,
.carousel__next {
  background: rgb(247, 70, 171) !important;
  background-color: rgb(247, 70, 171) !important;
  border-radius: 50% !important;
  width: 50px !important;
  height: 50px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.carousel__prev:hover,
.carousel__next:hover {
  background: rgb(227, 50, 151) !important;
  background-color: rgb(227, 50, 151) !important;
}

.carousel__icon {
  fill: white !important;
}
</style>