<template>
  <div class="three-container" ref="threeContainer">
    <div v-if="loadingStatus" class="loading-overlay">
      {{ loadingStatus }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import bolyModelUrl from '../assets/3DModels/pet_modelo3d_boly.glb?url';

const threeContainer = ref(null);

const loadingStatus = ref('Initializing...');

let scene, camera, renderer;
let bolyModel;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Initialize Three.js scene
function initScene() {
  loadingStatus.value = 'Setting up scene...';
  scene = new THREE.Scene();
  
  // Create camera
  camera = new THREE.PerspectiveCamera(
    45,
    threeContainer.value.clientWidth / threeContainer.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  camera.position.y = 30;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    premultipliedAlpha: false
  });
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
  renderer.setClearColor(0x000000, 0);
  threeContainer.value.appendChild(renderer.domElement);
  
  // lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); 
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);
  
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 0, 3);
  scene.add(pointLight);
  
  // const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);
  
  // Load the model
  loadBolyModel();
}

// Load the GLB model
function loadBolyModel() {
  loadingStatus.value = 'Loading model...';
  console.log('Attempting to load model from:', bolyModelUrl);
  
  const loader = new GLTFLoader();
  
  loader.load(
    bolyModelUrl,
    (gltf) => {
      loadingStatus.value = 'Model loaded, processing...';
      console.log('Model loaded successfully:', gltf);
      
      bolyModel = gltf.scene;
      
      bolyModel.scale.set(2, 2, 2); // bigger
      bolyModel.position.set(0, -2, 0); 
      
      scene.add(bolyModel);
      
      bolyModel.rotation.x = 0.2;
      bolyModel.rotation.y = 0.4;
      
      loadingStatus.value = 'Model visible now';
      setTimeout(() => {
        loadingStatus.value = '';
      }, 3000);
      
      // Fit camera to the model
      fitCameraToObject(bolyModel);
    },
    (xhr) => {
      // Loading progress
      const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
      loadingStatus.value = `Loading: ${percentComplete}%`;
      console.log(`${percentComplete}% loaded`);
    },
    (error) => {
      loadingStatus.value = `Error loading model: ${error.message}`;
      console.error('Error loading model:', error);
      
      tryLoadingWithAbsolutePath();
    }
  );
}

function tryLoadingWithAbsolutePath() {
  loadingStatus.value = 'Trying with absolute path...';
  const absolutePath = 'D:/Boly/frontend/ffstudios-shop/src/assets/3DModels/pet_modelo3d_boly.glb';
  console.log('Trying absolute path:', absolutePath);
  
  const loader = new GLTFLoader();
  loader.load(
    absolutePath,
    (gltf) => {
      loadingStatus.value = 'Model loaded from absolute path';
      bolyModel = gltf.scene;
      scene.add(bolyModel);
      bolyModel.scale.set(2, 2, 2);
      
      // Fit camera to the model
      fitCameraToObject(bolyModel);
    },
    (xhr) => {
      const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
      loadingStatus.value = `Loading (fallback): ${percentComplete}%`;
    },
    (error) => {
      loadingStatus.value = `Both paths failed: ${error.message}`;
      console.error('Both loading methods failed:', error);
    }
  );
}

function fitCameraToObject(object) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());
  
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  
  // Zoom out
  cameraZ *= 1.5;
  
  camera.position.z = cameraZ;
  
  const minZ = boundingBox.min.z;
  const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;
  
  camera.far = cameraToFarEdge * 3;
  camera.updateProjectionMatrix();
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  targetX = mouseX * 0.001;
  targetY = mouseY * 0.001;
  
  if (bolyModel) {
    // rotation based on mouse position
    bolyModel.rotation.y += (targetX - bolyModel.rotation.y) * 0.05;
    bolyModel.rotation.x += (targetY - bolyModel.rotation.x) * 0.05;
    
    // bobbing motion
    bolyModel.position.y = Math.sin(Date.now() * 0.002) * 0.9;
  }
  
  renderer.render(scene, camera);
}

// Handle mouse movement
function onMouseMove(event) {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
}

// Handle window resize
function onWindowResize() {
  if (!threeContainer.value) return;
  
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  
  camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight);
}

// Clean up Three.js resources
function cleanupThreeJS() {
  if (renderer) {
    renderer.dispose();
    threeContainer.value?.removeChild(renderer.domElement);
  }
  
  if (bolyModel) {
    scene.remove(bolyModel);
    bolyModel.traverse((object) => {
      if (object.isMesh) {
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => {
              if (material.map) material.map.dispose();
              material.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      }
    });
  }
}

// Lifecycle hooks
onMounted(() => {
  loadingStatus.value = 'Component mounted, initializing scene...';
  initScene();
  animate();
  
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onWindowResize);
  
  cleanupThreeJS();
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  background-color: transparent;
}

.loading-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 4px;
  z-index: 10;
}
</style>