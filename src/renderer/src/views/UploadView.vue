<script setup>
import PlusIcon from '@renderer/components/icons/PlusIcon.vue'
import TagAbove from '@renderer/components/forms/TagAbove.vue'
import XMarkIcon from '@renderer/components/icons/XMarkIcon.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useUser } from '../stores'

const router = useRouter()
const auth = useAuth()
const user = useUser()

if(!auth.isLoggedIn && !auth.verifying){
  router.back()
}

const name = ref('')
const description = ref('')
const price = ref(0)

async function createPreview(){
  try {

    const preview = {
      name: name.value,
      description: description.value,
      price: price.value,
    }

    console.log(preview);

    const response = await fetch(import.meta.env.VITE_APP_API_URL+'/api/v1/games/createGamePreview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify(preview)
    })

    if(response.ok){
      await auth.checkToken()
      router.push('/developer')
    }
    else{
      console.log(await response.json())
    }
  } catch (error) {
    console.log(error)
  }
}

</script>

<template>
  <div class="section">
    <h1 class="title-bold">Create a game preview</h1>
    <p>
      If you intend to publish a game in boly, this is the place! 
      Add your game's detail in this page to create a game preview.
      <br>Don't worry, you can change the details anytime before requesting a release.
    </p>
    <div class="mform">
      <div>
        <h2>Game Info</h2>
        <TagAbove>
          Title
          <template #child>
            <input
              class="poppins text"
              type="text"
              placeholder="Enter a game title"
              v-model="name"
            />
          </template>
        </TagAbove>
        <TagAbove>
          Description
          <template #child>
            <textarea
              class="poppins text"
              type="text"
              placeholder="Add a description"
              v-model="description"
            ></textarea>
          </template>
        </TagAbove>
        <div class="row">
          <TagAbove>
            Price
            <template #child>
              <input 
              class="poppins text" 
              type="integer" 
              placeholder="0"
              v-model="price" />
            </template>
          </TagAbove>
        </div>
      </div>
    </div>
    <button class="text" @click="createPreview()">Create preview</button>
  </div>
</template>

<style scoped>
h2 {
  text-align: left;
  width: 100%;
}

.mform {
  width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mform > div {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.halfsize {
  width: 50%;
}

input,
textarea {
  resize: vertical;
  max-width: 100%;
  outline: none;
  padding: 1rem 1rem;
  border-radius: 1rem;
  background-color: var(--bgGreenTransparent);
  border: 2px solid var(--bgGreen);
  margin-top: 5px;
}


.row {
  width: 100%;
  display: flex;
  gap: 5px;
}

.row > * {
  flex: 1;
}

button {
  width: 250px;
  height: 60px;
  background-color: var(--lightGreen);
  border: none;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: larger;
}

button:hover {
  background-color: var(--lightCyan);
}

.images_grid {
  display: grid;
  padding: 1rem;
  background-color: var(--bgGreenTransparent);
  border: 2px solid var(--bgGreen);
  border-radius: 1rem;
  margin-top: 5px;

  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-template-rows: auto;

  column-gap: 5px;
  row-gap: 5px;
}

.image_container {
  display: grid;
  grid-template-columns: auto 50px;
  grid-template-rows: 50px auto;
}

.image_container > img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 5px;

  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

.image_container > .icon_container {
  grid-column: 2 / 3;
  grid-row: 1 / 2;

  opacity: 0.5;
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;
}

.image_container > .icon_container:hover {
  opacity: 1;
}

.add_image_input {
  display: none;
}

.add_image_button {
  aspect-ratio: 1;
  border-radius: 5px;
  background-color: var(--lightGreen);
  display: flex;
  justify-content: center;
  align-items: center;
}

.add_image_button:hover {
  background-color: var(--lightCyan);
}
</style>
