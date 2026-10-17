/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public prefix used by the frontend to reach the backend REST API. */
  readonly VITE_API_URL?: string
  /** Public prefix used by the frontend to reach the backend WebSocket. */
  readonly VITE_SOCKET_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
