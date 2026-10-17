import { createContext } from 'react'
import type { TranslationVars } from './translations'

export interface TranslationContextValue {
  language: string
  t: (key: string, vars?: TranslationVars) => string
}

export const TranslationContext = createContext<TranslationContextValue | null>(null)
