<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const router = useRouter()

const props = defineProps(['item'])
const gameDataBaseUrl = import.meta.env.VITE_S3_BASE_URL + '/' + props.item.id + '/'

function GoToGame() {
  const rel_url = '/games/' + props.item._id
  console.log('rel_url: ' + rel_url)
  router.push(rel_url)
}
</script>

<template>
  <div class="item" @click="GoToGame">
    <img class="image" :src="gameDataBaseUrl + props.item.banner_uri" />
    <div class="details">
      <h3 class="text">{{ props.item.name[i18n.locale.value] }}</h3>
      <div>
        <p class="text">{{ props.item.description[i18n.locale.value] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
h3 {
  font-weight: bold;
}

.item {
  border-radius: 5px;
  overflow: hidden;
  height: 100px;
  width: 100%;
  transition: 0.1s;

  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--light);
  
}

.item:hover {
  transition: 0.1s;
  scale: 1.03;
  cursor: pointer;
}

.item img {
  width: 200px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 5px;
}

.details {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.details > div {
  height: 50px;
  display: flex;
  align-items: center;
}

.details p {
  display: -webkit-box;
  line-clamp: 1;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.price {
  padding: 0 2rem;
  color: var(--bgGreen);
  font-weight: bold;
  
}

.buy-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0px;
  width: 100%;
  height: 40px;
  position: relative;
  border: none;
  background-color: var(--highlight);
  overflow: hidden;
  cursor: pointer;
  color: white;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.button-text {
  width: 100%;
  height: 100%;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.button-icon {
  width: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--highlight);
  position: absolute;
  right: 0;
  transition: all 0.2s;
}

.remove_button_container {
  height: 100%;
  aspect-ratio: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove_button {
  cursor: pointer;
  transition: 0.2s;

  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove_button > .icon {
  height: 24px;
  fill: var(--bgGreen);
  transition: 0.2s;
}

.remove_button:hover > .icon {
  fill: var(--lightGreen);
  transition: 0.2s;
}
</style>
