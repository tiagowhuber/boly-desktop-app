<script setup>
import TagAbove from '@/components/forms/TagAbove.vue'
import AlertModal from '@/components/AlertModal.vue'
import { onMounted, ref } from 'vue';
import emailjs from '@emailjs/browser';
import { useI18n } from 'vue-i18n';
const i18n = useI18n();

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
    .sendForm('service_lbut1ys', 'template_aznai5p', form.value, {
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
  <div class="contact-form">
    <div class="contact-form-title">
      <h3>{{ $t('contact_lets_talk').toUpperCase() }}</h3>
        <h2>{{ $t('contact_body').toUpperCase() }}</h2>
        <p style="font-family: 'Poppins', sans-serif;">{{ $t('contact_text') }}</p>
      </div>
      <div class="form-container">
        <form ref="form" class="mform" @submit.prevent="SendEmail">
          <div>
            <TagAbove>
              {{$t('name')}}
              <template #child>
                <input
                  class="text"
                  type="text"
                  name="name"
                  v-model="name" 
                  :placeholder="$t('name')"
                />
              </template>
            </TagAbove>
            <TagAbove>
              {{$t('company')}}
              <template #child>
                <input
                  class="text"
                  type="text"
                  name="company"
                  v-model="company"
                  :placeholder="$t('company')"
                />
              </template>
            </TagAbove>
            <TagAbove>
              {{$t('email')}}
              <template #child>
                <input
                  class="text"
                  type="email"
                  name="email"
                  v-model="email"
                  :placeholder="$t('email')"
                />
              </template>
            </TagAbove>
            <TagAbove>
              {{$t('phone')}}
              <template #child>
                <div class="phone-input">
                  <p>+56</p>
                  <input type="tel" 
                  pattern="((\+\d{1,3}(-|.| )?\(?\d\)?(-| |.)?\d{1,5})|(\(?\d{2,6}\)?))(-|.| )?(\d{3,4})(-|.| )?(\d{4})(( x| ext)\d{1,5}){0,1}$"
                  name="phone"
                  v-model="phone"
                  placeholder="---------"
                  @input="phone = phone.replace(/\D/g, '').slice(0, 9)">
                </div>
              </template>
            </TagAbove>
            <TagAbove>
              {{$t('query')}}
              <template #child>
                <textarea
                  class="text"
                  type="text"
                  name="message"
                  v-model="message"
                  :placeholder="$t('query')"
                ></textarea>
              </template>
            </TagAbove>
            <input class="apply-button button_text" type="submit" :value="i18n.t('send_query')" :disabled="!canSend">
          </div>
        </form>
    </div>
  </div>
  

  <Teleport to="body">
      <AlertModal :show="showModal" @close="showModal = false">
        <template #header>
          <h3>{{$t('notification')}}</h3>
        </template>
        <template #body> {{ modalText }} </template>
      </AlertModal>
    </Teleport>
</template>

<style scoped>
.contact-form{
  width: 1600px;
  height: 800px;
  display: flex;
  flex-direction: row;
  gap: 100px;
  align-items: center;
}

.form-container{
  flex-grow: .8;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 20px;
  padding: 30px;
}

.contact-form img{
  height: 100%;
  width: auto;
}

.contact-form-title{
  width: 700px;
  display: flex;
  text-align: left;
  flex-direction: column;
  align-content: center;
  gap: 1rem;
}

.contact-form-title p{
  font-size: 120%;
}

.contact-form-title h2{
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 300%;
}

.contact-form-title h3{
  text-align: left;
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 200%;
  color: var(--boly-highlight)
}

.contact-form-title button {
  margin-top: 10px;
  color: var(--light);
  height: 30px;
  background-color: var(--boly-button-purple);
  justify-content: center;
  border-radius: 5px;
  border: none;
}

.contact-form-title button:hover{
  background-color: var(--boly-button-purple-hover);
}


.mform {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mform > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

input,
textarea {
  resize: none;
  max-width: 100%;
  outline: none;
  padding: 1rem 1rem;
  border-radius: 1rem;
  background-color: var(--boly-bg-blue-transparent);
  border: 2px solid var(--light);
  margin-top: 5px;
}

textarea {
  height: 200px;
}

.phone-input{
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.phone-input > input{
  flex-grow: 1;
  color: var(--light);
}

.phone-input > p{
  padding: 1rem 0px;
  border-radius: 1rem;
  margin-top: 5px;
}

.apply-button{
  width: 100%;
  height: 50px;
  background-color: var(--boly-button-purple);
  border: none;
  border-radius: 10px;

  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: larger;
  transition: .2s;
}

.apply-button:hover{
  background-color: var(--boly-button-purple-hover);
  transition: .2s;
}

.button_text{
  padding: 0px;
}
</style>