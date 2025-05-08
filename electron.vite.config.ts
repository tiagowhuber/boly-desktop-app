import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
// // If you need dotenv, make sure it's installed
// import fs from 'fs'
// import dotenv from 'dotenv'

// // Load environment variables from .env file
// const env = dotenv.config().parsed || {}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
          }
        }
      }
    },
    // Fix for the base URL in production
    base: './'
  }
})
