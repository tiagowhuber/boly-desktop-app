<template>
  <div class="section">
    <h1 class="title-bold">About us</h1>
    <p>Meet the team behind it all!</p>
    <div class="highlighted_hand">
      <div>
        <img src="../assets/images/1.png" alt="" />
      </div>
      <div>
        <img src="../assets/images/2.png" alt="" />
      </div>
      <div>
        <img src="../assets/images/3.png" alt="" />
      </div>
      <div>
        <img src="../assets/images/4.png" alt="" />
      </div>
      <div>
        <img src="../assets/images/5.png" alt="" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.highlighted_hand > :first-child > img {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.highlighted_hand > :last-child > img {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}

.highlighted_hand {
  display: flex;
  height: 500px;
}

.highlighted_hand > div {
  flex: 1;
  transition-duration: 0.4s;
}

.highlighted_hand > div:hover {
  flex: 3;
  transition-duration: 0.4s;
}

.highlighted_hand > div > img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>
