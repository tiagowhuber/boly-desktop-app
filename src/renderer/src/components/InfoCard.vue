<script setup>
const props = defineProps({
  width: Number,
  imgSize: Number,
})

</script>

<template>
  <div class="info-card" :style="'width: ' + props.width + 'px; max-height: ' + props.imgSize + 'px;'">
    <slot name="image"></slot>
    <div class="info-card-title">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<style>
.info-card {
  height: 600px;
  display: flex;
  flex-direction: row;
}

.info-card img {
  height: 100%;
  width: auto;
}

.info-card-title {
  text-align: left;
  flex-direction: column;
  align-content: center;
  gap: 1rem;
}

.info-card-title p {
  text-align: left;
  font-size: 120%;
}

.info-card-title h2 {
  text-align: left;
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 300%;
}

.info-card-title h3 {
  text-align: left;
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 200%;
  color: var(--boly-highlight)
}

.info-card-title button {
  margin-top: 10px;
  color: var(--light);
  height: 30px;
  background-color: var(--boly-button-purple);
  justify-content: center;
  border-radius: 5px;
  border: none;
}

.info-card-title button:hover {
  background-color: var(--boly-button-purple-hover);
}
</style>
