export const StorageKeys = {
  JWT_TOKEN: '@app/jwt-token',
  LANGUAGE: '@app/language',
  MENU_CACHE: '@app/menu-cache',
  USER: '@app/user',
  THEME: '@app/theme',
  SELECTED_SCHEMA: '@app/selected-schema',
  GRID_LATEST_SEARCH: '@ui/grid-latest-search',
} as const

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys]

export const SSR_COOKIE_KEYS = new Set<StorageKey>([
  StorageKeys.JWT_TOKEN,
  StorageKeys.LANGUAGE,
  StorageKeys.SELECTED_SCHEMA,
  StorageKeys.THEME,
  StorageKeys.MENU_CACHE,
  StorageKeys.USER,
  StorageKeys.GRID_LATEST_SEARCH,
])

export const COOKIE_NAME_MAP: Partial<Record<StorageKey, string>> = {
  [StorageKeys.JWT_TOKEN]: 'app_jwt_token',
  [StorageKeys.LANGUAGE]: 'app_language',
  [StorageKeys.SELECTED_SCHEMA]: 'app_selected_schema',
  [StorageKeys.THEME]: 'app_theme',
  [StorageKeys.MENU_CACHE]: 'app_menu_cache',
  [StorageKeys.USER]: 'app_user',
  [StorageKeys.GRID_LATEST_SEARCH]: 'app_grid_latest_search',
}
