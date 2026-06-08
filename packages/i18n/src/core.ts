import { myLocalStorage, StorageKeys } from "@workspace/storage"
import i18n from "i18next"
import "intl-pluralrules"
import { detectLanguage } from "./detect-language"
import { defaultNS, resources, type SupportedLanguage } from "./resources"

export {
  defaultNS,
  type Namespace,
  resources,
  type SupportedLanguage,
} from "./resources"

export const isSupportedLanguage = (
  language: string | null | undefined
): language is SupportedLanguage => {
  return Boolean(language && language in resources)
}

export const getStoredLanguage = (): SupportedLanguage | null => {
  const stored = myLocalStorage.getItem(StorageKeys.LANGUAGE)
  return isSupportedLanguage(stored) ? stored : null
}

export const storeLanguage = (language: string): void => {
  myLocalStorage.setItem(StorageKeys.LANGUAGE, language)
}

const getInitialLanguage = (): string => {
  const stored = getStoredLanguage()
  return stored || detectLanguage()
}

type ConfigureI18n = (instance: typeof i18n) => void

export function ensureI18nInitialized(
  language?: string,
  configure?: ConfigureI18n
): void {
  const lng = isSupportedLanguage(language) ? language : getInitialLanguage()

  if (!i18n.isInitialized) {
    configure?.(i18n)
    i18n.init({
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

export { i18n }

export const changeLanguage = async (language: SupportedLanguage) => {
  await i18n.changeLanguage(language)
  storeLanguage(language)
}

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language || "en") as SupportedLanguage
}

export const supportedLanguages: {
  code: SupportedLanguage
  name: string
  nativeName: string
}[] = [
  { code: "en", name: "English", nativeName: "English" },
  {
    code: "el",
    name: "Greek",
    nativeName: "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac",
  },
]
