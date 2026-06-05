// English translations
import enCommon from './locales/en/common.json'
import enScreens from './locales/en/screens.json'
import enErrors from './locales/en/errors.json'

// Greek translations
import elCommon from './locales/el/common.json'
import elScreens from './locales/el/screens.json'
import elErrors from './locales/el/errors.json'

export const defaultNS = 'common'

export const resources = {
  en: {
    common: enCommon,
    screens: enScreens,
    errors: enErrors,
  },
  el: {
    common: elCommon,
    screens: elScreens,
    errors: elErrors,
  },
} as const

export type SupportedLanguage = keyof typeof resources
export type Namespace = keyof typeof resources.en
