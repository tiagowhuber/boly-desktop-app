<script setup lang="ts">
import { useAuth, useUser } from '@renderer/stores'
import { useRouter } from 'vue-router'
import TagAbove from '@renderer/components/forms/TagAbove.vue'
import { onMounted, ref } from 'vue';
import AlertModal from '@renderer/components/AlertModal.vue'
import SimpleLoadingIcon from '@renderer/components/icons/SimpleLoadingIcon.vue'
import type { User, UserUpdateRequest, PasswordUpdateRequest } from '@renderer/types'
import axios from 'axios'

const router = useRouter()
const auth = useAuth()
const user = useUser()

if (!auth.isLoggedIn && !auth.token) {
  router.back()
}

const showModal = ref<boolean>(false)
const modalWarning = ref<string>('')
const dataLoading = ref<boolean>(false)
const passwordLoading = ref<boolean>(false)

const username = ref<string>('')
const email = ref<string>('')
const oldpassword = ref<string>('')
const password = ref<string>('')
const repassword = ref<string>('')
const birthday = ref<string>('')
const bio = ref<string>('')

onMounted(() => {
  username.value = user.username
  email.value = user.email
  birthday.value = user.birthday?.toString() || ''
  bio.value = user.bio || ''
})

async function handleProfilePicUpload(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const result = await user.updateProfilePicture(file)
  showModal.value = true
  modalWarning.value = result.message
}

function ChangeUserInfo(): void {
  const patch: UserUpdateRequest = {
    username: username.value,
    email: email.value,
    birthday: birthday.value,
    bio: bio.value
  }

  UpdateUser(patch)
}

async function UpdateUser(patch: UserUpdateRequest): Promise<void> {
  dataLoading.value = true
  try {
    const result = await user.updateUserInfo(patch)
    showModal.value = true
    modalWarning.value = result.message
    
    if (result.success) {
      // Refresh user data before navigating back
      const response = await axios.get(`/v1/users/${user.userId}`)
      if (response.status === 200) {
        user.setUser(response.data)
      }
      router.back()
    }
  } finally {
    dataLoading.value = false
  }
}

function ChangePassword(): void {
  if (repassword.value === password.value) {
    const request: PasswordUpdateRequest = {
      oldpass: oldpassword.value,
      pass: password.value,
    }

    UpdatePassword(request)
  } else {
    showModal.value = true
    modalWarning.value = "Passwords are different!"
  }
}

async function UpdatePassword(request: PasswordUpdateRequest): Promise<void> {
  passwordLoading.value = true
  try {
    const result = await user.updatePassword(request)
    showModal.value = true
    modalWarning.value = result.message
    
    if (result.success) {
      // Clear password fields after successful update
      oldpassword.value = ''
      password.value = ''
      repassword.value = ''
    }
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="section">
    <h1 class="title-bold">{{ $t('edit_profile_title') }}</h1>
    <div class="mform">
      <h2>{{ $t('user_info') }}</h2>
      <div class="input-container">
        <div class="halfsize">
          <TagAbove>
            {{ $t('profile_picture') }}
            <template #child>
              <div class="profile-pic-container">
                <img 
                  :src="user.profilePictureUrl || 'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'" 
                  class="current-profile-pic"
                  alt="Profile picture"
                >
                <input 
                  type="file" 
                  accept="image/*"
                  @change="handleProfilePicUpload"
                  class="profile-pic-input"
                />
              </div>
            </template>
          </TagAbove>
          <TagAbove>
            {{ $t('username') }}
            <template #child>
              <input class="text" type="text" :placeholder="$t('enter_new_username')" v-model="username" />
            </template>
          </TagAbove>
          <TagAbove>
            {{ $t('email') }}
            <template #child>
              <input class="text" type="email" :placeholder="$t('enter_new_email')" v-model="email" />
            </template>
          </TagAbove>
          <TagAbove>
            {{ $t('birthday') }}
            <template #child>
              <input class="text" type="date" v-model="birthday" />
            </template>
          </TagAbove>
        </div>
        <div class="halfsize">
          <TagAbove>
            {{ $t('profile_biography') }}
            <template #child>
              <textarea class="text" type="text" :placeholder="$t('enter_new_bio')" v-model="bio"></textarea>
            </template>
          </TagAbove>
        </div>
      </div>
      <button class="apply-button btn-purple" @click="ChangeUserInfo()">
        <SimpleLoadingIcon v-if="dataLoading" />
        <span v-if="!dataLoading">{{ $t('apply') }}</span>
      </button>

      <h2>{{ $t('change_password') }}</h2>
      <TagAbove class="halfsize">
        {{ $t('password') }}
        <template #child>
          <input class="text" type="password" :placeholder="$t('enter_old_password')" v-model="oldpassword" />
          <input class="text" type="password" :placeholder="$t('enter_new_password')" v-model="password" />
          <input class="text" type="password" :placeholder="$t('repeat_password')" v-model="repassword" />
        </template>
      </TagAbove>
      <button class="apply-button btn-purple" @click="ChangePassword()">
        <SimpleLoadingIcon v-if="passwordLoading" />
        <span v-if="!passwordLoading">{{ $t('apply') }}</span>
      </button>
    </div>

    <Teleport to="body">
      <AlertModal :show="showModal" @close="showModal = false">
        <template #header>
          <h3>{{ $t('notification') }}</h3>
        </template>
        <template #body> {{ modalWarning }} </template>
      </AlertModal>
    </Teleport>
  </div>
</template>

<style scoped>
.title-bold {
  width: 100%;
  text-align: start;
  font-size: 300%;
}

h2 {
  text-align: left;
  width: 100%;
}

.mform {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: var(--boly-bg-dark-transparent);
  padding: 30px;
  border-radius: 20px;
}

.halfsize {
  width: 50%;
}

.mform>div {
  display: flex;
  gap: 5px;
}

.input-container {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

input,
textarea {
  resize: none;
  max-width: 100%;
  outline: none;
  padding: 1rem 1rem;
  border-radius: 1rem;
  background-color: var(--boly-bg-dark-transparent);
  color-scheme: dark;
  border: none;
  margin-top: 5px;
}

textarea {
  height: 200px;
}

.apply-button {
  width: 200px;
  color: var(--light);
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: 120%;
  border-radius: 10px;
  border: none;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
}

.profile-pic-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.current-profile-pic {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px solid var(--boly-button-purple);
  object-fit: cover;
}

.profile-pic-input {
  width: 100%;
  padding: 0.5rem;
  background-color: var(--boly-bg-dark-transparent);
  border: none;
  border-radius: 5px;
  color: var(--light);
  cursor: pointer;
}
</style>
