<script setup>
import { ref } from 'vue';

const props = defineProps(['show'])
const checked = ref(false)
</script>

<template>
  <Transition name="confirm-modal">
    <div v-if="show" class="confirm-modal-mask">
      <div class="confirm-modal-container">
        <div class="confirm-modal-header">
          <slot name="header"></slot>
        </div>

        <div class="confirm-modal-body">
          <div class="terms-scroll">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque, cumque minus. Non cum aut laudantium officia soluta beatae corrupti repudiandae, quis neque sint, rerum, tempora eligendi delectus provident dolorem sed. Voluptate laborum dolore inventore, soluta totam quibusdam aspernatur eius corporis? Quibusdam officia consectetur cupiditate laborum fugiat voluptate incidunt animi esse, ducimus facere ut recusandae blanditiis asperiores nesciunt labore officiis perspiciatis aut necessitatibus sequi. Nihil, velit ullam. Placeat eos, animi dolores earum, mollitia corporis dolorum aut eligendi atque asperiores quisquam accusantium in illum, quam nobis? Repellat deserunt deleniti debitis, numquam perferendis, quaerat ipsam optio nostrum labore eos culpa ad animi quis sit, eveniet totam praesentium mollitia accusantium dignissimos unde maiores rerum. Odio eligendi nobis ut corrupti illum omnis labore, animi quae esse voluptatibus quas rem at, impedit exercitationem quam et quasi reprehenderit sequi debitis possimus consectetur doloremque. Iure dolorem eveniet, nemo cum nam libero fugit eius porro dolor perferendis, molestiae reiciendis illo, quaerat dolores rerum minima qui illum asperiores? Ipsa repellat perspiciatis assumenda dolore, sint aliquid sed sunt dolor maiores deleniti velit temporibus commodi, veritatis amet ipsam accusamus enim vero pariatur eum numquam odit ipsum dolores quos asperiores? Tenetur voluptates iusto mollitia. Unde nostrum voluptate adipisci dicta a, enim tempore corporis ipsa corrupti eligendi atque recusandae quas eos ratione sed autem, consequatur repellat, cupiditate et aspernatur. Quas, ea laborum qui labore odit perspiciatis corrupti cumque quo, et quisquam magni expedita repellendus quasi facilis doloribus distinctio placeat culpa recusandae minima asperiores earum harum. Dolorum, nostrum dolores temporibus tenetur labore dicta earum nobis, similique doloribus optio sequi consequatur error. Pariatur incidunt nobis, quis libero alias quidem ab itaque blanditiis vitae perspiciatis esse illum eum quae excepturi minus quo recusandae repellat at nemo asperiores delectus, adipisci eligendi. Dolores, quam quidem ipsa velit deserunt sint ipsum laboriosam error, et, facere quia nihil! Veniam, dicta a.
              </div>
              <input type="checkbox" v-model="checked" />
              {{$t('terms_confirm')}}
        </div>

        <div class="confirm-modal-footer">
          <button
              class="confirm-modal-close-button"
              @click="$emit('close'); checked=false"
            >{{$t('close')}}
          </button><button
              class="confirm-modal-confirm-button"
              @click="$emit('confirm')"
              :disabled="!checked"
            >{{$t('register')}}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>


<style>
.confirm-modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.confirm-modal-container {
  min-width: 300px;
  margin: auto;
  padding: 20px 30px;
  border: var(--lightGreen) solid 2px;
  background-color: var(--boly-bg-darker);
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.confirm-modal-header h3 {
  text-align: start;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-style: italic;
  font-size: xx-large;
}

.confirm-modal-body {
  margin: 20px 0;
  color: var(--light);
}

.confirm-modal-confirm-button {
  height: 30px;
  padding: 0 15px;
  margin: 0 5px;
  float: right;
  background-color: var(--lightGreen);
  color: white;
  border: none;
  border-radius: 2px;
}

.confirm-modal-confirm-button:hover{
  transition: .2s;
  background-color: var(--lightCyan);
}

.confirm-modal-confirm-button:disabled{
  transition: .2s;
  background-color: var(--gray);
}

.confirm-modal-close-button {
  height: 30px;
  padding: 0 15px;
  margin: 0 5px;
  float: right;
  background-color: transparent;
  color: var(--lightGreen);
  border: var(--lightGreen) solid 1px;
  border-radius: 2px;
}

.confirm-modal-close-button:hover{
  color: var(--lightCyan);
  border: var(--lightCyan) solid 1px;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.confirm-modal-enter-from {
  opacity: 0;
}

.confirm-modal-leave-to {
  opacity: 0;
}

.confirm-modal-enter-from .confirm-modal-container,
.confirm-modal-leave-to .confirm-modal-container {
  -webkit-transform: translateY(-15px);
  transform: translateY(-15px);
}

.terms-scroll{
  height:300px;
  width:500px;
  font: message-box;
  color:var(--light);
  background-color: rgb(21, 21, 21);
  border:1px solid gray;
  border-radius: 5px;
  overflow: auto;
  white-space: pre-line;
  margin-bottom: 10px;
}
</style>