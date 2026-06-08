"use client"

import {
  initReactI18next,
  useTranslation as useTranslationBase,
} from "react-i18next"
import {
  type defaultNS,
  ensureI18nInitialized as ensureCoreI18nInitialized,
  isSupportedLanguage,
  type Namespace,
} from "./core"

export {
  changeLanguage,
  defaultNS,
  getCurrentLanguage,
  getStoredLanguage,
  i18n,
  isSupportedLanguage,
  type Namespace,
  resources,
  type SupportedLanguage,
  storeLanguage,
  supportedLanguages,
} from "./core"
export type {
  CommonKey,
  ErrorsKey,
  NestedKeyOf,
  ScreensKey,
  TranslationKey,
} from "./types"

export function ensureI18nInitialized(language?: string): void {
  ensureCoreI18nInitialized(language, (instance) => {
    instance.use(initReactI18next)
  })
}

const getHydrationLanguage = () => {
  if (globalThis.document === undefined) return undefined

  const [language] = document.documentElement.lang.split("-")
  return isSupportedLanguage(language) ? language : undefined
}

ensureI18nInitialized(getHydrationLanguage())

export const useTranslation = <
  NS extends Namespace | Namespace[] = typeof defaultNS,
>(
  ns?: NS
) => {
  return useTranslationBase(ns)
}
