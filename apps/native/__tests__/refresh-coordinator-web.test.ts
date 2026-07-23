import { afterEach, describe, expect, it, jest } from "@jest/globals"
import { coordinateRefresh } from "../../../packages/api-client/src/refresh-coordinator.web"
import { StorageKeys } from "../../../packages/storage/src/keys"

const originalLocalStorage = globalThis.localStorage
const originalLocks = globalThis.navigator?.locks

afterEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: originalLocalStorage,
  })
  if (globalThis.navigator) {
    Object.defineProperty(globalThis.navigator, "locks", {
      configurable: true,
      value: originalLocks,
    })
  }
})

describe("web refresh lease fallback", () => {
  it("waits for another tab's rotation instead of consuming the cookie again", async () => {
    const values = new Map<string, string>()
    const storage: Storage = {
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => [...values.keys()][index] ?? null,
      get length() {
        return values.size
      },
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    }
    values.set(
      StorageKeys.AUTH_REFRESH_LEASE,
      JSON.stringify({ owner: "other-tab", expiresAt: Date.now() + 5_000 })
    )
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    })
    Object.defineProperty(globalThis.navigator, "locks", {
      configurable: true,
      value: undefined,
    })

    let token = "expired"
    const refresh = jest.fn(async () => undefined)
    const coordinated = coordinateRefresh({
      previousAccessToken: token,
      readAccessToken: () => token,
      refresh,
    })
    setTimeout(() => {
      token = "rotated-by-other-tab"
    }, 10)
    await coordinated

    expect(refresh).not.toHaveBeenCalled()
    expect(token).toBe("rotated-by-other-tab")
  })
})
