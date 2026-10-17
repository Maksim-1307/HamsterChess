import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/i18n/translations'
import { DEFAULT_BOARD_THEME, isBoardTheme } from './board-themes'

export interface AppSettings {
  language: string
  boardTheme: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: DEFAULT_LANGUAGE,
  boardTheme: DEFAULT_BOARD_THEME,
}

const STORAGE_KEY = 'hamster-chess:settings'

const normalize = (value: unknown): AppSettings => {
  if (!value || typeof value !== 'object') return DEFAULT_SETTINGS
  const { language, boardTheme } = value as { language?: unknown; boardTheme?: unknown }
  return {
    language:
      typeof language === 'string' && isSupportedLanguage(language)
        ? language
        : DEFAULT_SETTINGS.language,
    boardTheme: isBoardTheme(boardTheme) ? boardTheme : DEFAULT_SETTINGS.boardTheme,
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
