import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { setCurrentLanguage, translateFor } from './translations'
import { TranslationContext } from './translation-context'

export interface TranslationProviderProps {
  children: ReactNode
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const { settings } = useSettings()
  const language = settings.language

  useEffect(() => {
    setCurrentLanguage(language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      t: (key: string, vars?: Record<string, string | number>) =>
        translateFor(language, key, vars),
    }),
    [language],
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
