import { resources, type SupportedLanguage } from './resources'

// Web: derive the language from the browser, falling back to English.
export const detectLanguage = (): SupportedLanguage => {
  const deviceLanguage =
    typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] || 'en' : 'en'

  return deviceLanguage in resources ? (deviceLanguage as SupportedLanguage) : 'en'
}
