import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/i18n/translations'

export interface AppSettings {
  language: string
}

export const DEFAULT_SETTINGS: AppSettings = { language: DEFAULT_LANGUAGE }

const STORAGE_KEY = 'hamster-chess:settings'

const normalize = (value: unknown): AppSettings => {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS
  const language = (value as { language?: unknown }).language
  return {
    language:
      typeof language === 'string' && isSupportedLanguage(language)
        ? language
        : DEFAULT_SETTINGS.language,
  }
}

/** Reads the persisted settings from the browser, falling back to defaults. */
export const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return normalize(JSON.parse(raw))
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Persists the settings in the browser so they survive reloads. */
export const persistSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore storage errors (private mode, quota exceeded, ...)
  }
}
