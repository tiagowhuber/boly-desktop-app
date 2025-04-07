<template>
    <div class="section">
        <h1>Welcome test</h1>
        <p>hello</p>
    </div>
    <div class="p-4">
    <h1>Instalador de Archivos ZIP</h1>
    <button @click="seleccionarZip">Seleccionar Instalador</button>
    <input v-model="rutaExe"></input>
    <button @click="seleccionarDestino">Seleccionar Destino</button>
    <input v-model="rutaDestino"></input>
    <button @click="instalar" :disabled="!rutaExe || !rutaDestino">Instalar</button>
    <p>Archivos extraídos:</p>
    <ul>
      <li v-for="(item, index) in archivos" :key="index">{{ item }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rutaExe: '',
      rutaDestino: '',
      archivos: []
    };
  },
  methods: {
    async seleccionarZip() {
      window.electronAPI.seleccionarArchivo().then((archivo) => {
  console.log('Archivo seleccionado:', archivo)
  this.rutaExe = archivo
})
      // this.zipPath = await window.electronAPI.invoke('seleccionar-archivo');
    },
    async seleccionarDestino() {
      window.electronAPI.seleccionarCarpeta().then((path) => {
        this.rutaDestino=path
})
    },
    async instalar() {
      console.log(this.rutaExe)
      console.log(this.rutaDestino)
      window.electronAPI.instalarDesdeZip(this.rutaExe,this.rutaDestino).then((archivo) => {
        // this.archivos=archivo
})
    }
  }
};
</script>

<style scoped>
ul { margin-top: 10px; }
.section {
  padding-bottom: 10px;
}
.darkened {
  background: rgb(57, 23, 117);
  background: linear-gradient(135deg, rgba(57, 23, 117, 1) 15%, rgba(0, 83, 205, 1) 98%);
}

.contact-bg {
  height: 800px;
  background-image: url("src/assets/images/fondo-xd.png");
  background-size: cover;
}

.button {
  padding-inline: 10px;
  height: 40px;
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Anton', Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
  font-size: larger;
}

.boly-container {
  position: absolute;
  top: 150px;
  left: 30%; 
  width: 300px;
  height: 300px;
  z-index: 5;
}

h2 {
  text-align: left;
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 300%;
  width: 60%;
}

.section-title {
  text-align: left;
  font-family: "Anton", serif;
  font-style: italic;
  font-size: 300%;
}

.section-text {
  text-align: left;
  font-size: 115%;
  margin: 40px;
  width: 80%;
}

.home-title-card {
  margin-left: auto;
}

</style>
