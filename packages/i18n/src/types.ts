import type { resources, defaultNS } from './resources'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: (typeof resources)['en']
  }
}

// Type-safe translation keys
export type TranslationKey<NS extends keyof (typeof resources)['en']> =
  keyof (typeof resources)['en'][NS]

// Utility type for nested keys
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

// Common namespace keys
export type CommonKey = TranslationKey<'common'>

// Screens namespace keys
export type ScreensKey = NestedKeyOf<(typeof resources)['en']['screens']>

// Errors namespace keys
export type ErrorsKey = TranslationKey<'errors'>
