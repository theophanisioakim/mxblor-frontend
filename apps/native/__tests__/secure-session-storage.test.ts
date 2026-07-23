import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { StorageKeys } from "../../../packages/storage/src/keys"
import { myLocalStorage } from "../../../packages/storage/src/storage.native"

const secureStore = jest.requireMock("expo-secure-store") as {
  __store: Map<string, string>
}

describe("native secure session storage", () => {
  beforeEach(() => {
    myLocalStorage.clear()
    secureStore.__store.clear()
  })

  it("routes authentication secrets through SecureStore names", () => {
    myLocalStorage.setItem(StorageKeys.JWT_TOKEN, "access")
    myLocalStorage.setItem(StorageKeys.REFRESH_TOKEN, "refresh")
    myLocalStorage.setItem(StorageKeys.SCHEMA_SELECTION_TOKEN, "selection")

    expect(secureStore.__store.get("app.access_token")).toBe("access")
    expect(secureStore.__store.get("app.refresh_token")).toBe("refresh")
    expect(secureStore.__store.get("app.schema_selection_token")).toBe(
      "selection"
    )
    expect(myLocalStorage.getItem(StorageKeys.JWT_TOKEN)).toBe("access")
  })

  it("makes removed secrets unreadable synchronously", () => {
    myLocalStorage.setItem(StorageKeys.REFRESH_TOKEN, "refresh")
    myLocalStorage.removeItem(StorageKeys.REFRESH_TOKEN)

    expect(myLocalStorage.getItem(StorageKeys.REFRESH_TOKEN)).toBeNull()
    expect(secureStore.__store.get("app.refresh_token")).toBe("")

    myLocalStorage.setItem(StorageKeys.REFRESH_TOKEN, "next-refresh")
    expect(myLocalStorage.getItem(StorageKeys.REFRESH_TOKEN)).toBe(
      "next-refresh"
    )
  })
})
