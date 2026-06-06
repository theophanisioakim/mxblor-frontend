import { createMMKV, type MMKV } from "react-native-mmkv"
import type { StorageKey } from "./keys"
import type { ITypedStorage } from "./types"

const localInstance = createMMKV({ id: "app-local-storage" })
const sessionInstance = createMMKV({ id: "app-session-storage" })

// Clear session storage on app cold start (simulates web sessionStorage behavior)
sessionInstance.clearAll()

function createMMKVStorage(mmkv: MMKV): ITypedStorage {
  return {
    getItem(key: StorageKey): string | null {
      return mmkv.getString(key) ?? null
    },
    setItem(key: StorageKey, value: string): void {
      mmkv.set(key, value)
    },
    removeItem(key: StorageKey): void {
      mmkv.remove(key)
    },
    clear(): void {
      mmkv.clearAll()
    },
    getAllKeys(): StorageKey[] {
      const keys = mmkv.getAllKeys()
      return keys as StorageKey[]
    },
    getJSON<T>(key: StorageKey): T | null {
      const raw = mmkv.getString(key)
      if (raw == null) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },
    setJSON<T>(key: StorageKey, value: T): void {
      mmkv.set(key, JSON.stringify(value))
    },
  }
}

export const myLocalStorage: ITypedStorage = createMMKVStorage(localInstance)
export const mySessionStorage: ITypedStorage =
  createMMKVStorage(sessionInstance)
