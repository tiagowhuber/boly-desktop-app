<script setup>
import { useAuth, useUser } from '@renderer/stores'
import { useRouter } from 'vue-router'
import Loading from '@renderer/components/LoadingIcon.vue'
import { onMounted, ref } from 'vue';
import AlertModal from '@renderer/components/AlertModal.vue'

const router = useRouter()
const auth = useAuth()
const user = useUser()

if(!auth.isLoggedIn && !auth.verifying){
  router.back()
}

const showModal = ref(false)
const modalWarning = ref('')

const pass = ref('--------')
const loading = ref(false)

onMounted( ()=>{
})

async function RequestNewPass(){

  if(!auth.isLoggedIn || !auth.token){
    console.log("Error: Not logged in.");
    return;
  }

  loading.value = true;

  const response = await fetch(import.meta.env.VITE_APP_API_URL+'/api/v1/achievements/requestPass', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

  if(!response || response.status != 200){
    loading.value = false;
    return;
  }

  const result = await response.json();

  if(result){
    pass.value = result.pass;
  }
  loading.value = false;
}
</script>

<template>
  <div class="section">
    <div class="main-container">
      <div class="left-container">
        <h1>{{ $t('ach_pass_title')}}</h1>
        <div class="center">
          <h3>{{ $t('ach_pass_1')}}
            <br>{{ $t('ach_pass_2')}}
            <br><br>{{ $t('ach_pass_3')}}
          </h3>
        </div>
      </div>
      <div class="pass-container">
        <div class="pass">
          <h1> {{ pass }} </h1>
        </div>
        <button class="generate-button" @click="RequestNewPass()">{{ $t('generate_pass')}}</button>
        <div class="loading_container" v-if="loading">
          <Loading />
        </div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <AlertModal :show="showModal" @close="showModal = false">
      <template #header>
        <h3></h3>
      </template>
      <template #body> {{ modalWarning }} </template>
    </AlertModal>
  </Teleport>
</template>

<style scoped>

.main-container{
  height: 300px;
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.left-container{
  width: 50%;
  text-align: start;
}

.left-container h1{
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
}

h2 {
  text-align: center;
  width: 100%;
}

.pass-container{
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pass{
  width: 300px;
  height: 60px;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 1rem;
  align-content: center;
}

.generate-button{
  width: 250px;
  height: 60px;
  background-color: var(--lightGreen);
  border: none;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: larger;
  color: var(--light);
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

.generate-button:hover{
  background-color: var(--lightCyan);
}
</style>
