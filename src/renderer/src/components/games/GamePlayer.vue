<script>
import { onMounted,watch,ref } from 'vue';
import UnityWebgl from 'unity-webgl';
import UnityVue from 'unity-webgl/vue';
import { useRoute } from 'vue-router'
import { useGames } from '@renderer/stores/games.ts'
import { storeToRefs } from 'pinia'
import { useAuth } from '@renderer/stores'



export default {
  components: {
    UnityVue
  },
setup(){
  const gamesStore = useGames()
  // const unityContext = ref(gamesStore.unityPlayer)
  const router = useRoute()
  const auth = useAuth()
  const onFullscreen = () => {
    gamesStore.unityPlayer.setFullscreen(true);
    };

watch(()=> gamesStore.webGameData,(newVal) =>{
  console.log("new val")
  console.log(newVal)
  
//   unityContext.value = new UnityWebgl({
//   loaderUrl:
//   newVal.loader,
//   dataUrl:
//   newVal.data,
//   frameworkUrl:
//   newVal.framework,
//   codeUrl:
//   newVal.wasm,
// });
})


watch(()=> gamesStore.unityPlayer,(newVal) =>{
  // gamesStore.unityPlayer.reload({
  //             loaderUrl:
  //             "https://mem-testbuk-24092024.s3.us-east-2.amazonaws.com/AS/build.loader.js?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIQCc15S9QsxuclCNCYSTTLvu0gDJ8GpFoaV2JoVjzLp%2BXwIgcoZTKBWb4U4RwD6qe3pQI2UQ0A7UXy%2Bz8KuTqjztufUq8QII3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw0NDI0MjY4NjU0MzMiDCg%2FFxZDD%2B9zzEzSnyrFAs62CR8tbXveXUgRQqB4opH8MIjLPRHypj79k1iYGEq6kg2MUPLZRh8x3QhUhMVTOQEre20z3fdxM%2BPrSuEQc4%2B3t56z4F38lGTEmvj0zSSyS8JvUhrYyhR3VX5c%2FxNSkzOS79rTlBuH1ehFBxLEgZrfRXMtKgMWV0XeUI%2BRl7BYs5ZdA9wQCYNgXuDi3Pd7%2F%2Bm76VaoeMmxRvatMbjNZWfwEh7lNE%2Fy4HuwbhhoFCc3zfZlyzGukgb2qZwPlkR6Qg9wM2rOptVTDGFENHEDZllyauLJRE6uJnHD1Q8actOKJuM%2FpaPlGirMYrrZipJ9U0wX1Nf043SmOV8aVD95WTtlomhwbfw82%2FuG4OFqIBTPtpHuBAq9hXp78sm6WR3nN2ke2CTJncJ%2FmDA4fZ8jXZEAwGUYN0VnPI6KErXGWHkh8fWAplow38SBuAY6swLQ7SDeKDIGw%2BDDpDCIqfNzcLPCqPVyeA4OAWSNQ5%2F5LEiQfVghOsaIQZarLpbLDXDnhVphOV7V4BOsc%2Bt0Gq3XInRWH1K3fSuXcOhD2A3NIMnCE9X5L543Cc6Ixx3MOupf4TXw%2BvqqpZyUYzqlbTXsWdqkqkQ35gNmGQP9X4spMRWuUa1aA%2FoVt0KyBgVQjt07KJ70Sp5LxAywUQutyCAHJNdbhEuXuGjvsJr3pArMsw72GvXcqShs0wgF63%2FTjH%2BoKjb7MvtDHlahuC%2BO7bUmbxbHgMTtbEK2kyTW5QF3l99%2FNRss7i%2FRWVa14cVMiYJz5JwTSw4sHUWIIXJ5HEbNmsVqCaqAAcYGxho8kzaQYwjh6xSFGjb%2BV0BQ6r6vZcFuvf7sToxXmWP%2BNHbGEJF0zIDh&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241004T214930Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAWOAVSG4M7ITNCRVC%2F20241004%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=064030c921cf180fbd764130acb22e5a51bee62c387a724aea673bf10b823384",
  //             dataUrl:
  //             "https://mem-testbuk-24092024.s3.us-east-2.amazonaws.com/AS/build.data.unityweb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIQCc15S9QsxuclCNCYSTTLvu0gDJ8GpFoaV2JoVjzLp%2BXwIgcoZTKBWb4U4RwD6qe3pQI2UQ0A7UXy%2Bz8KuTqjztufUq8QII3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw0NDI0MjY4NjU0MzMiDCg%2FFxZDD%2B9zzEzSnyrFAs62CR8tbXveXUgRQqB4opH8MIjLPRHypj79k1iYGEq6kg2MUPLZRh8x3QhUhMVTOQEre20z3fdxM%2BPrSuEQc4%2B3t56z4F38lGTEmvj0zSSyS8JvUhrYyhR3VX5c%2FxNSkzOS79rTlBuH1ehFBxLEgZrfRXMtKgMWV0XeUI%2BRl7BYs5ZdA9wQCYNgXuDi3Pd7%2F%2Bm76VaoeMmxRvatMbjNZWfwEh7lNE%2Fy4HuwbhhoFCc3zfZlyzGukgb2qZwPlkR6Qg9wM2rOptVTDGFENHEDZllyauLJRE6uJnHD1Q8actOKJuM%2FpaPlGirMYrrZipJ9U0wX1Nf043SmOV8aVD95WTtlomhwbfw82%2FuG4OFqIBTPtpHuBAq9hXp78sm6WR3nN2ke2CTJncJ%2FmDA4fZ8jXZEAwGUYN0VnPI6KErXGWHkh8fWAplow38SBuAY6swLQ7SDeKDIGw%2BDDpDCIqfNzcLPCqPVyeA4OAWSNQ5%2F5LEiQfVghOsaIQZarLpbLDXDnhVphOV7V4BOsc%2Bt0Gq3XInRWH1K3fSuXcOhD2A3NIMnCE9X5L543Cc6Ixx3MOupf4TXw%2BvqqpZyUYzqlbTXsWdqkqkQ35gNmGQP9X4spMRWuUa1aA%2FoVt0KyBgVQjt07KJ70Sp5LxAywUQutyCAHJNdbhEuXuGjvsJr3pArMsw72GvXcqShs0wgF63%2FTjH%2BoKjb7MvtDHlahuC%2BO7bUmbxbHgMTtbEK2kyTW5QF3l99%2FNRss7i%2FRWVa14cVMiYJz5JwTSw4sHUWIIXJ5HEbNmsVqCaqAAcYGxho8kzaQYwjh6xSFGjb%2BV0BQ6r6vZcFuvf7sToxXmWP%2BNHbGEJF0zIDh&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241004T214757Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43199&X-Amz-Credential=ASIAWOAVSG4M7ITNCRVC%2F20241004%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=87e488295c8d0114d6115240e86bd7c905455e63d6d16c12ddb69f698e16966e",
  //             frameworkUrl:
  //             "https://mem-testbuk-24092024.s3.us-east-2.amazonaws.com/AS/build.framework.js.unityweb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIQCc15S9QsxuclCNCYSTTLvu0gDJ8GpFoaV2JoVjzLp%2BXwIgcoZTKBWb4U4RwD6qe3pQI2UQ0A7UXy%2Bz8KuTqjztufUq8QII3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw0NDI0MjY4NjU0MzMiDCg%2FFxZDD%2B9zzEzSnyrFAs62CR8tbXveXUgRQqB4opH8MIjLPRHypj79k1iYGEq6kg2MUPLZRh8x3QhUhMVTOQEre20z3fdxM%2BPrSuEQc4%2B3t56z4F38lGTEmvj0zSSyS8JvUhrYyhR3VX5c%2FxNSkzOS79rTlBuH1ehFBxLEgZrfRXMtKgMWV0XeUI%2BRl7BYs5ZdA9wQCYNgXuDi3Pd7%2F%2Bm76VaoeMmxRvatMbjNZWfwEh7lNE%2Fy4HuwbhhoFCc3zfZlyzGukgb2qZwPlkR6Qg9wM2rOptVTDGFENHEDZllyauLJRE6uJnHD1Q8actOKJuM%2FpaPlGirMYrrZipJ9U0wX1Nf043SmOV8aVD95WTtlomhwbfw82%2FuG4OFqIBTPtpHuBAq9hXp78sm6WR3nN2ke2CTJncJ%2FmDA4fZ8jXZEAwGUYN0VnPI6KErXGWHkh8fWAplow38SBuAY6swLQ7SDeKDIGw%2BDDpDCIqfNzcLPCqPVyeA4OAWSNQ5%2F5LEiQfVghOsaIQZarLpbLDXDnhVphOV7V4BOsc%2Bt0Gq3XInRWH1K3fSuXcOhD2A3NIMnCE9X5L543Cc6Ixx3MOupf4TXw%2BvqqpZyUYzqlbTXsWdqkqkQ35gNmGQP9X4spMRWuUa1aA%2FoVt0KyBgVQjt07KJ70Sp5LxAywUQutyCAHJNdbhEuXuGjvsJr3pArMsw72GvXcqShs0wgF63%2FTjH%2BoKjb7MvtDHlahuC%2BO7bUmbxbHgMTtbEK2kyTW5QF3l99%2FNRss7i%2FRWVa14cVMiYJz5JwTSw4sHUWIIXJ5HEbNmsVqCaqAAcYGxho8kzaQYwjh6xSFGjb%2BV0BQ6r6vZcFuvf7sToxXmWP%2BNHbGEJF0zIDh&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241004T214905Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAWOAVSG4M7ITNCRVC%2F20241004%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=1cf0d3d266537f81201862d981f68b071a3a1976cdaa4bf8c32a9bd69187e8e9",
  //             codeUrl:
  //             "https://mem-testbuk-24092024.s3.us-east-2.amazonaws.com/AS/build.wasm.unityweb?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMiJHMEUCIQCc15S9QsxuclCNCYSTTLvu0gDJ8GpFoaV2JoVjzLp%2BXwIgcoZTKBWb4U4RwD6qe3pQI2UQ0A7UXy%2Bz8KuTqjztufUq8QII3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw0NDI0MjY4NjU0MzMiDCg%2FFxZDD%2B9zzEzSnyrFAs62CR8tbXveXUgRQqB4opH8MIjLPRHypj79k1iYGEq6kg2MUPLZRh8x3QhUhMVTOQEre20z3fdxM%2BPrSuEQc4%2B3t56z4F38lGTEmvj0zSSyS8JvUhrYyhR3VX5c%2FxNSkzOS79rTlBuH1ehFBxLEgZrfRXMtKgMWV0XeUI%2BRl7BYs5ZdA9wQCYNgXuDi3Pd7%2F%2Bm76VaoeMmxRvatMbjNZWfwEh7lNE%2Fy4HuwbhhoFCc3zfZlyzGukgb2qZwPlkR6Qg9wM2rOptVTDGFENHEDZllyauLJRE6uJnHD1Q8actOKJuM%2FpaPlGirMYrrZipJ9U0wX1Nf043SmOV8aVD95WTtlomhwbfw82%2FuG4OFqIBTPtpHuBAq9hXp78sm6WR3nN2ke2CTJncJ%2FmDA4fZ8jXZEAwGUYN0VnPI6KErXGWHkh8fWAplow38SBuAY6swLQ7SDeKDIGw%2BDDpDCIqfNzcLPCqPVyeA4OAWSNQ5%2F5LEiQfVghOsaIQZarLpbLDXDnhVphOV7V4BOsc%2Bt0Gq3XInRWH1K3fSuXcOhD2A3NIMnCE9X5L543Cc6Ixx3MOupf4TXw%2BvqqpZyUYzqlbTXsWdqkqkQ35gNmGQP9X4spMRWuUa1aA%2FoVt0KyBgVQjt07KJ70Sp5LxAywUQutyCAHJNdbhEuXuGjvsJr3pArMsw72GvXcqShs0wgF63%2FTjH%2BoKjb7MvtDHlahuC%2BO7bUmbxbHgMTtbEK2kyTW5QF3l99%2FNRss7i%2FRWVa14cVMiYJz5JwTSw4sHUWIIXJ5HEbNmsVqCaqAAcYGxho8kzaQYwjh6xSFGjb%2BV0BQ6r6vZcFuvf7sToxXmWP%2BNHbGEJF0zIDh&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241004T214944Z&X-Amz-SignedHeaders=host&X-Amz-Expires=43200&X-Amz-Credential=ASIAWOAVSG4M7ITNCRVC%2F20241004%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=c0a5df8aabe72938984177294cb233ef51c4d229d7e8921b0141362a3496b514",
  //           })
  console.log("unity updated")
  gamesStore.unityPlayer.on('device', () => alert('click device ...'));
  
})

onMounted(async () => {
if(auth.user != null){
  const id = router.params.game
  if(!id || id == "") $router.back()
  gamesStore.getGameUrl(id,auth)
  
  
}
})

return{
  gamesStore,
  onFullscreen
}

}
}

</script>



<template>
  <div v-if="gamesStore.loadingUnity" style="width: 768px; height: 432px; background-color: black;"></div>
  <div v-else style="width: 768px; height: 432px; background-color: black;">
    <UnityVue :unity="gamesStore.unityPlayer" tabindex="0" />
    <div class="buttons">
    <button :onclick="onFullscreen" class="buy-button text">Fullscreen</button>
    </div>
  </div>
</template>

<style>
.buy-button{
  cursor: pointer;
  align-items: center;
  justify-content: center;
  margin: 16px 16px;
  border-radius: 10px;
  
  gap: 0.5rem;
  width: 200px;
  height: 50px;
  background-color: var(--lightGreen);
  border: none;
  border-radius: 10px;

}

.buy-button:hover{
  background-color: var(--lightCyan);
}
</style>
