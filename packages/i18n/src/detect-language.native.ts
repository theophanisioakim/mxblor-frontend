import type { SupportedLanguage } from './resources'

// Native: default to English. A stored language (if any) still takes
// precedence in getInitialLanguage().
export const detectLanguage = (): SupportedLanguage => 'en'
