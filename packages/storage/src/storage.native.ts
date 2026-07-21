import * as SecureStore from "expo-secure-store"
import { createMMKV, type MMKV } from "react-native-mmkv"
import { type StorageKey, StorageKeys } from "./keys"
import type { ITypedStorage } from "./types"

const localInstance = createMMKV({ id: "app-local-storage" })
const sessionInstance = createMMKV({ id: "app-session-storage" })
const TWITCH_OAUTH_SECURE_KEY = "app.twitch_oauth_flow"

const SECURE_KEY_NAMES: Partial<Record<StorageKey, string>> = {
  [StorageKeys.JWT_TOKEN]: "app.access_token",
  [StorageKeys.REFRESH_TOKEN]: "app.refresh_token",
  [StorageKeys.SCHEMA_SELECTION_TOKEN]: "app.schema_selection_token",
  [StorageKeys.TWITCH_OAUTH_FLOW]: TWITCH_OAUTH_SECURE_KEY,
}
const AUTH_STORAGE_VERSION = "1"

// Clear session storage on app cold start (simulates web sessionStorage behavior).
// The Twitch verifier is transient but remains SecureStore-backed while active.
sessionInstance.clearAll()
SecureStore.setItem(TWITCH_OAUTH_SECURE_KEY, "")

function createMMKVStorage(mmkv: MMKV): ITypedStorage {
  const secureKeyName = (key: StorageKey) => SECURE_KEY_NAMES[key]

  return {
    getItem(key: StorageKey): string | null {
      const secureKey = secureKeyName(key)
      if (secureKey) {
        return SecureStore.getItem(secureKey) || null
      }
      return mmkv.getString(key) ?? null
    },
    setItem(key: StorageKey, value: string): void {
      const secureKey = secureKeyName(key)
      if (secureKey) {
        SecureStore.setItem(secureKey, value)
        return
      }
      mmkv.set(key, value)
    },
    removeItem(key: StorageKey): void {
      const secureKey = secureKeyName(key)
      if (secureKey) {
        // SecureStore only deletes asynchronously. Keep an empty tombstone so
        // callers cannot observe the old token and a delayed delete cannot race
        // with a subsequent login and remove its newly stored token.
        SecureStore.setItem(secureKey, "")
        return
      }
      mmkv.remove(key)
    },
    clear(): void {
      mmkv.clearAll()
      for (const secureKey of Object.values(SECURE_KEY_NAMES)) {
        if (secureKey) {
          SecureStore.setItem(secureKey, "")
        }
      }
    },
    getAllKeys(): StorageKey[] {
      const secureKeys = Object.entries(SECURE_KEY_NAMES)
        .filter(([, secureKey]) =>
          secureKey ? Boolean(SecureStore.getItem(secureKey)) : false
        )
        .map(([key]) => key)
      const keys = [...mmkv.getAllKeys(), ...secureKeys]
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

// Pre-signed-session native auth values lived in plain MMKV. Drop them once
// rather than migrating bearer material into the new credential store.
if (
  localInstance.getString(StorageKeys.AUTH_STORAGE_VERSION) !==
  AUTH_STORAGE_VERSION
) {
  localInstance.remove(StorageKeys.JWT_TOKEN)
  localInstance.remove(StorageKeys.REFRESH_TOKEN)
  localInstance.remove(StorageKeys.SCHEMA_SELECTION_TOKEN)
  localInstance.remove(StorageKeys.SCHEMA_SELECTION)
  localInstance.remove(StorageKeys.SELECTED_SCHEMA)
  localInstance.remove(StorageKeys.USER)
  for (const secureKey of Object.values(SECURE_KEY_NAMES)) {
    if (secureKey) {
      SecureStore.setItem(secureKey, "")
    }
  }
  localInstance.set(StorageKeys.AUTH_STORAGE_VERSION, AUTH_STORAGE_VERSION)
}

export const myLocalStorage: ITypedStorage = createMMKVStorage(localInstance)
export const mySessionStorage: ITypedStorage =
  createMMKVStorage(sessionInstance)
