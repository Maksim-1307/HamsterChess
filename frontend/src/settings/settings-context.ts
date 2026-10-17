import { createContext } from 'react'
import type { AppSettings } from './settings'

export interface SettingsContextValue {
  settings: AppSettings
  updateSettings: (patch: Partial<AppSettings>) => void
}

export const SettingsContext = createContext<SettingsContextValue | null>(null)
