import { getCookie, removeCookie, setCookie } from "./cookies"
import { SSR_COOKIE_KEYS, type StorageKey } from "./keys"
import type { ITypedStorage } from "./types"

const isServer = globalThis.window === undefined

function getWebStorage(
  type: "localStorage" | "sessionStorage"
): Storage | null {
  try {
    if (!isServer && window[type]) {
      return window[type]
    }
  } catch {
    // Restricted access
  }
  return null
}

function createWebStorage(storage: Storage | null): ITypedStorage {
  return {
    getItem(key: StorageKey): string | null {
      if (isServer) {
        return SSR_COOKIE_KEYS.has(key) ? getCookie(key) : null
      }
      return storage?.getItem(key) ?? null
    },

    setItem(key: StorageKey, value: string): void {
      storage?.setItem(key, value)
      if (!isServer && SSR_COOKIE_KEYS.has(key)) {
        setCookie(key, value)
      }
    },

    removeItem(key: StorageKey): void {
      storage?.removeItem(key)
      if (!isServer && SSR_COOKIE_KEYS.has(key)) {
        removeCookie(key)
      }
    },

    clear(): void {
      storage?.clear()
      if (!isServer) {
        for (const key of SSR_COOKIE_KEYS) {
          removeCookie(key)
        }
      }
    },

    getAllKeys(): StorageKey[] {
      if (!storage) return []
      const keys = Array.from({ length: storage.length }, (_, i) =>
        storage.key(i)
      ).filter((key): key is string => Boolean(key))
      return keys as StorageKey[]
    },

    getJSON<T>(key: StorageKey): T | null {
      const raw = this.getItem(key)
      if (raw == null) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },

    setJSON<T>(key: StorageKey, value: T): void {
      this.setItem(key, JSON.stringify(value))
    },
  }
}

export const myLocalStorage: ITypedStorage = createWebStorage(
  getWebStorage("localStorage")
)
export const mySessionStorage: ITypedStorage = createWebStorage(
  getWebStorage("sessionStorage")
)

// One-time migration: seed cookies from localStorage for SSR-critical keys
if (!isServer) {
  const ls = getWebStorage("localStorage")
  if (ls) {
    for (const key of SSR_COOKIE_KEYS) {
      const value = ls.getItem(key)
      if (value && !getCookie(key)) {
        setCookie(key, value)
      }
    }
  }
}
