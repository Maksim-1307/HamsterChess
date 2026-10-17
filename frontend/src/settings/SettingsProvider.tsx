import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { applyBoardTheme } from './board-themes'
import { loadSettings, persistSettings } from './settings'
import type { AppSettings } from './settings'
import { SettingsContext } from './settings-context'

export interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  // Apply the board colors before paint so the theme does not flash on load.
  useLayoutEffect(() => {
    applyBoardTheme(settings.boardTheme)
  }, [settings.boardTheme])

  useEffect(() => {
    persistSettings(settings)
  }, [settings])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((previous) => ({ ...previous, ...patch }))
  }, [])

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
