import { createContext } from 'react'
import type { AppSettings } from './settings'

export interface SettingsContextValue {
  settings: AppSettings
  setLanguage: (language: string) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)
