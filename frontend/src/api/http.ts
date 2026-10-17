import { env } from '@/config/env'

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export interface RequestOptions extends RequestInit {
  /** Retry the request once after refreshing the session when it 401s. Defaults to true. */
  retryOnUnauthorized?: boolean
}

const buildUrl = (path: string): string => `${env.apiUrl}${path}`

const safeParse = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

const extractMessage = (data: unknown, response: Response): string => {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
  }
  return `Request failed with status ${response.status}`
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

/** Registers the callback invoked when a request is rejected as unauthenticated. */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null): void => {
  unauthorizedHandler = handler
}

const performFetch = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(buildUrl(path), {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

let refreshPromise: Promise<boolean> | null = null

const refreshSession = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = performFetch('/auth/refresh', { method: 'POST' })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export const request = async <T>(path: string, options?: RequestOptions): Promise<T> => {
  const { retryOnUnauthorized = true, ...init } = options ?? {}

  let response = await performFetch(path, init)

  if (response.status === 401 && retryOnUnauthorized) {
    const refreshed = await refreshSession()
    response = await performFetch(path, init)
    if (!refreshed && response.status === 401) {
      unauthorizedHandler?.()
    }
  }

  const text = await response.text()
  const data: unknown = text ? safeParse(text) : undefined

  if (!response.ok) {
    if (response.status === 401) unauthorizedHandler?.()
    throw new ApiError(response.status, extractMessage(data, response), data)
  }

  return data as T
}
