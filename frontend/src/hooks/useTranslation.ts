import { useContext } from 'react'
import { TranslationContext } from '@/i18n/translation-context'
import type { TranslationContextValue } from '@/i18n/translation-context'

export const useTranslation = (): TranslationContextValue => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
