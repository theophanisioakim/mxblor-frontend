import { jest } from "@jest/globals"
import "react-native-gesture-handler/jestSetup"

jest.mock("react-native-reanimated", () =>
  jest.requireActual("react-native-reanimated/mock")
)

jest.mock("react-native-mmkv", () => ({
  createMMKV: () => {
    const store = new Map<string, string>()

    return {
      getString: (key: string) => store.get(key),
      set: (key: string, value: string) => {
        store.set(key, value)
      },
      remove: (key: string) => {
        store.delete(key)
      },
      clearAll: () => {
        store.clear()
      },
      getAllKeys: () => Array.from(store.keys()),
    }
  },
}))
