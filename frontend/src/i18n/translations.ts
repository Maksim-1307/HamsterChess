export type TranslationVars = Record<string, string | number>
export type TranslationDictionary = Record<string, unknown>

// Every `*.json` file in `./locales` is registered automatically as a language,
// so adding a new language only requires dropping a new file in that folder.
const modules = import.meta.glob<{ default: TranslationDictionary }>('./locales/*.json', {
  eager: true,
})

const dictionaries: Record<string, TranslationDictionary> = {}

for (const [path, module] of Object.entries(modules)) {
  const code = path.match(/\/([^/]+)\.json$/)?.[1]
  if (code) dictionaries[code] = module.default
}

export const DEFAULT_LANGUAGE = 'ru'
export const FALLBACK_LANGUAGE = 'en'
export const SUPPORTED_LANGUAGES = Object.keys(dictionaries).sort()

let currentLanguage = DEFAULT_LANGUAGE

export const isSupportedLanguage = (code: string): boolean =>
  Object.prototype.hasOwnProperty.call(dictionaries, code)

export const getCurrentLanguage = (): string => currentLanguage

export const setCurrentLanguage = (code: string): void => {
  currentLanguage = isSupportedLanguage(code) ? code : DEFAULT_LANGUAGE
}

export const getTranslations = (code: string): TranslationDictionary =>
  dictionaries[code] ?? {}

export const resolve = (dictionary: TranslationDictionary, key: string): unknown =>
  key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, dictionary)

const interpolate = (template: string, vars?: TranslationVars): string =>
  vars
    ? template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
        vars[name] != null ? String(vars[name]) : `{{${name}}}`,
      )
    : template

export const getLanguageName = (code: string): string => {
  const name = resolve(getTranslations(code), 'language.name')
  return typeof name === 'string' ? name : code.toUpperCase()
}

/** Resolves a translation for an explicit language (useful inside React). */
export const translateFor = (
  language: string,
  key: string,
  vars?: TranslationVars,
): string => {
  const value =
    resolve(getTranslations(language), key) ?? resolve(getTranslations(FALLBACK_LANGUAGE), key)
  return interpolate(typeof value === 'string' ? value : key, vars)
}

/** Resolves a translation for the current language (useful outside React). */
export const translate = (key: string, vars?: TranslationVars): string =>
  translateFor(currentLanguage, key, vars)
