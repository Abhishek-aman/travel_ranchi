/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_FARE_PER_SEAT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
