import { myLocalStorage, StorageKeys } from "@workspace/storage"
import i18n from "i18next"
import "intl-pluralrules"
import {
  initReactI18next,
  useTranslation as useTranslationBase,
} from "react-i18next"
import { detectLanguage } from "./detect-language"
import {
  defaultNS,
  type Namespace,
  resources,
  type SupportedLanguage,
} from "./resources"

// Re-export types for consumers
export {
  defaultNS,
  type Namespace,
  resources,
  type SupportedLanguage,
} from "./resources"
export type {
  CommonKey,
  ErrorsKey,
  NestedKeyOf,
  ScreensKey,
  TranslationKey,
} from "./types"

const getStoredLanguage = (): string | null => {
  return myLocalStorage.getItem(StorageKeys.LANGUAGE)
}

export const storeLanguage = (language: string): void => {
  myLocalStorage.setItem(StorageKeys.LANGUAGE, language)
}

// Get initial language
const getInitialLanguage = (): string => {
  const stored = getStoredLanguage()
  return stored || detectLanguage()
}

// Initialize i18n or update the language if already initialized.
// Called at module load time, and can be called again from the Next.js layout
// with the language from cookies to ensure the server renders the correct language.
export function ensureI18nInitialized(language?: string): void {
  const lng = language || getInitialLanguage()

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources,
      lng,
      fallbackLng: "en",
      defaultNS,
      ns: ["common", "screens", "errors"],
      interpolation: {
        escapeValue: false,
      },
    })
  } else if (i18n.language !== lng) {
    i18n.changeLanguage(lng)
  }
}

// Always initialize at module load time.
// On the server, storage returns null gracefully so i18n falls back to the default language.
// The Next.js layout can call ensureI18nInitialized() with the cookie language to update it.
ensureI18nInitialized()

// Export initialized i18n instance
export { i18n }

// Type-safe useTranslation hook
export const useTranslation = <
  NS extends Namespace | Namespace[] = typeof defaultNS,
>(
  ns?: NS
) => {
  return useTranslationBase(ns)
}

// Change language utility
export const changeLanguage = async (language: SupportedLanguage) => {
  await i18n.changeLanguage(language)
  storeLanguage(language)
}

// Get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || "en") as SupportedLanguage
}

// Get supported languages
export const supportedLanguages: {
  code: SupportedLanguage
  name: string
  nativeName: string
}[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
]
