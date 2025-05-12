/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_GOOGLE_CLIENT_ID: string;
  readonly VITE_APP_API_URL: string;
  readonly VITE_S3_BASE_URL: string;
  readonly GH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
