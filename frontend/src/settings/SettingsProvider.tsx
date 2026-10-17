import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { loadSettings, persistSettings } from './settings'
import type { AppSettings } from './settings'
import { SettingsContext } from './settings-context'

export interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  useEffect(() => {
    persistSettings(settings)
  }, [settings])

  const setLanguage = useCallback((language: string) => {
    setSettings((previous) =>
      previous.language === language ? previous : { ...previous, language },
    )
  }, [])

  const value = useMemo(() => ({ settings, setLanguage }), [settings, setLanguage])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
