import type { Credentials, PublicUser } from '@/types/auth'
import { request } from './http'

const withCredentials = (credentials: Credentials): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(credentials),
})

export const register = (credentials: Credentials): Promise<PublicUser> =>
  request('/auth/register', { ...withCredentials(credentials), retryOnUnauthorized: false })

export const login = (credentials: Credentials): Promise<PublicUser> =>
  request('/auth/login', { ...withCredentials(credentials), retryOnUnauthorized: false })

export const logout = (): Promise<void> =>
  request('/auth/logout', { method: 'POST', retryOnUnauthorized: false })

export const getCurrentUser = (): Promise<PublicUser> => request('/auth/me')
