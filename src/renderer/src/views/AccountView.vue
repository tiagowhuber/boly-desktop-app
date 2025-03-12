<script setup lang="ts">
import Loading from '@renderer/components/LoadingIcon.vue'
import { useAuth, useUser } from '@renderer/stores'
import { RouterLink, useRouter } from 'vue-router'
import EditIcon from '@renderer/components/icons/EditIcon.vue'
import { onMounted } from 'vue'
import axios from 'axios'

const router = useRouter()
const auth = useAuth()
const user = useUser()

if(!auth.isLoggedIn && !auth.token){
  router.back()
}

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

const logout = (): void => {
  auth.logout()
  router.push({ path: '/' })
}

const EditProfile = (): void => {
  router.push("/edit")
}

const AchievementPass = (): void => {
  router.push("/ach-pass")
}
</script>

<template>
  <div class="loading_container" v-if="!auth.isLoggedIn && auth.token">
    <Loading />
  </div>
  <div class="section" v-if="auth.isLoggedIn">
    <div class="main-container">
      <div class="left-container">
        <div class="account-preview">
          <img class="profile-pic" 
            :src="user.profilePictureUrl || 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'" 
            alt="Profile picture"
          >
          <div class="details">
            <div class="name">
              <h1>{{ user.username }}</h1>
              <EditIcon class="icon" @click="EditProfile"/>
            </div>
            <p>{{ user.email }}</p>
            <br>
          </div>
        </div>
        <div class="bio">
          <p class="title-bold">{{ $t('bio')}}</p>
          <p>{{ user.bio }}</p>
        </div>
      </div>
      <div class="account-details">
        <p class="info">{{ $t('profile_info', {username: user.username})}}</p>
        <br>
        <p class="title-bold">{{ $t('role')}}</p>
        <p>{{ $t(String(user.roleId)) }}</p>
        <br>
        <p class="title-bold">{{ $t('birthday')}}</p>
        <p>{{ user.birthday }}</p>
        <br>
        <RouterLink to="/ach-pass" class="button btn-blue">{{ $t('achievementpass')}}</RouterLink>
        <RouterLink to="/edit" class="button btn-purple">{{ $t('edit_profile')}}</RouterLink>
        <RouterLink to="/developer" class="button btn-blue">{{ $t('developer')}}</RouterLink>
        <button class="button btn-purple" style="cursor: pointer;" @click="logout">{{ $t('logout')}}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container{
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.left-container{
  width: 850px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-pic{
  height: 200px;
  width: 200px;
  border-radius: 50%;
  border: 3px solid var(--boly-bg-dark);
}

.account-preview{
  width:100%;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  background-color: var(--boly-bg-blue-transparent);
  border-radius: 20px;
  padding: 20px;
}

.account-details{
  min-width: 350px;
  padding: 50px;
  display: flex;
  flex-direction: column;
  text-align: start;
  align-self: flex-start;
  background-color: var(--boly-bg-dark-transparent);
  border-radius: 20px;
}

.account-details .info{
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  font-size: 150%;
}

.bio{
  width: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  text-align: start;
  background-color: var(--boly-bg-blue-transparent);
  border-radius: 20px;
  padding: 40px;
  gap: 1rem;
}

.bio .title-bold{
  font-size: 200%;
}

.account-details > p{
  font-size: large;
}

.details{
  width: 100%;
  margin-top: 25px;
  text-align: left;
}

.details > a{
  font-size: 125%;
  cursor: pointer;
}

.details > a:hover{
  color: var(--lightGreen);
}

.name{
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.name > .icon{
  width: 25px;
  height: 25px;
}

.name svg{
  color: var(--gray);
  fill: var(--gray);
}

.name svg:hover{
  color: var(--lightGreen);
  fill: var(--lightGreen);
  transition: .1s;
  cursor: pointer;
}

button, .button{
  padding: 5px;
  width: 100%;
  font-family: "Anton", serif;
  font-size: larger;
  flex-grow: 1;
  margin-top: 10px;
  color: var(--light);
  justify-content: center;
  border-radius: 5px;
  border: none;
  transition: .2s;
  text-align: center;
}

.btn-purple{
  background-color: var(--boly-button-purple);
}

.btn-purple:hover{
  background-color: var(--boly-button-purple-hover);
}

.btn-dark{
  background-color: var(--boly-bg-dark-transparent);
}

.btn-dark:hover{
  background-color: var(--boly-bg-blue);
}

.btn-blue{
  background-color: var(--boly-button-blue);
}

.btn-blue:hover{
  background-color: var(--boly-button-blue-hover);
}

</style>
