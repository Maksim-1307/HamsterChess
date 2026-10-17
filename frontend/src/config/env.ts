const DEFAULT_API_URL = '/app-api'
const DEFAULT_SOCKET_URL = '/app-socket'

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

export interface AppEnv {
  /** Public prefix for the REST API (proxied by nginx/vite to the backend). */
  readonly apiUrl: string
  /** Public prefix for the future WebSocket channel. */
  readonly socketUrl: string
}

export const env: AppEnv = Object.freeze({
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL || DEFAULT_API_URL),
  socketUrl: trimTrailingSlash(import.meta.env.VITE_SOCKET_URL || DEFAULT_SOCKET_URL),
})
