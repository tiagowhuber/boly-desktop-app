/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string
  readonly VITE_IMAGES_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
