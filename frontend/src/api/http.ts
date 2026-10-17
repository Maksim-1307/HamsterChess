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

export const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  const text = await response.text()
  const data: unknown = text ? safeParse(text) : undefined

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(data, response), data)
  }

  return data as T
}
