import { StorageKey } from "./keys"

export interface IStorage {
  getItem(key: StorageKey): string | null
  setItem(key: StorageKey, value: string): void
  removeItem(key: StorageKey): void
  clear(): void
  getAllKeys(): StorageKey[]
}

export interface ITypedStorage extends IStorage {
  getJSON<T>(key: StorageKey): T | null
  setJSON<T>(key: StorageKey, value: T): void
}
