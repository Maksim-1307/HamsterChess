import { createContext } from 'react'
import type { Credentials, PublicUser } from '@/types/auth'

export interface AuthContextValue {
  user: PublicUser | null
  /** true while the initial session is being restored */
  isInitializing: boolean
  login: (credentials: Credentials) => Promise<void>
  register: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
