<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const router = useRouter()

const props = defineProps(['item'])
const gameDataBaseUrl = import.meta.env.VITE_S3_BASE_URL + '/' + props.item.id + '/'

function goToManageAchievements(){
  router.push("developer/" + props.item.id + "/achievements")
}

function goToManageGameData(){
  router.push("developer/" + props.item.id + "/edit")
}

</script>

<template>
  <div class="item">
    <img class="image" :src="gameDataBaseUrl + props.item.banner_uri" />
    <div class="details">
      <h3 class="text">{{ props.item.name[i18n.locale.value] }}</h3>
    </div>
    <div class="buttons">
      <Button class="btn-purple" @click="goToManageGameData">{{ $t('developer_manage_game_data') }}</Button>
      <Button class="btn-blue" @click="goToManageAchievements">{{ $t('developer_manage_achievements') }}</Button>
    </div>
  </div>
</template>

<style scoped>
h3 {
  font-weight: bold;
}

.item {
  border-radius: 20px;
  overflow: hidden;
  height: 100px;
  width: 100%;
  transition: 0.1s;

  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: var(--boly-bg-dark);
  
}

.item img {
  height: 100%;
  aspect-ratio: 1.666666;
  object-fit: cover;
}

.item:hover {
  transition: 0.1s;
  scale: 1.015;
}

.details {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.details > div {
  height: 50px;
  display: flex;
  align-items: center;
}

.details h3{
  padding-left: 30px;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  font-size: 150%;
  font-weight: 100;
}

.buttons{
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
}

button {
  color: var(--light);
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: large;

  height: 50px;
  border: none;
  border-radius: 10px;
  transition: .1s;
}

button:hover {
  transition: .1s;
}
</style>
