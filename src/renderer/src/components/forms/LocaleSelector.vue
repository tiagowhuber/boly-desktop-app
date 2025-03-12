<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['languageChanged'])

const selectedLanguage = ref('en') // Default to 'en'

watch(selectedLanguage, (newLanguage) => {
  emit('languageChanged', newLanguage)
})

</script>

<template>
  <div id="firstFilter" class="filter-switch">
    <input
      id="option1"
      name="options"
      type="radio"
      value="en"
      v-model="selectedLanguage"
    />
    <label class="option" for="option1">EN</label>

    <input
      id="option2"
      name="options"
      type="radio"
      value="es"
      v-model="selectedLanguage"
    />
    <label class="option" for="option2">ES</label>
    <span class="background"></span>
  </div>
</template>

<style scoped>

.filter-switch {
  border: 2px solid var(--light);
  border-radius: 30px;
  position: relative;
  display: flex;
  align-items: center;
  height: 50px;
  width: 100px;
  overflow: hidden;
  flex-direction: row;
  gap: none;
}

.filter-switch input {
  display: none;
}

.filter-switch label {
  flex: 1;
  text-align: center;
  cursor: pointer;
  border: none;
  border-radius: 30px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: all 0.5s;
  font-weight: 500;
  font-size: 18px;
}
.filter-switch .background {
  position: absolute;
  width: 45%;
  height: 38px;
  background-color: var(--lightGreen);
  top: 4px;
  left: 4px;
  border-radius: 30px;
  transition: left 0.4s cubic-bezier(0.075, 0.82, 0.165, 1)
}
#option2:checked ~ .background {
  left: 50%;
}
#option1:checked + label[for="option1"] {
  color: var(--light);
}
#option2:checked + label[for="option2"] {
  color: var(--light);
}
#option1:not(:checked) + label[for="option1"],
#option2:not(:checked) + label[for="option2"] {
  color: var(--boly-button-blue);
}

</style>
