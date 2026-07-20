import { jest } from "@jest/globals"
import "react-native-gesture-handler/jestSetup"
import type React from "react"

// Self-contained reanimated mock. We can't use `react-native-reanimated/mock`
// here: reanimated 4's mock boots the real module, whose worklets native init
// throws under Jest. native-ui only needs `Animated.View`, chainable
// entering/exiting builders (`FadeIn`, `FadeOut`, …), and a few hooks.
jest.mock("react-native-reanimated", () => {
  const { View, Text, ScrollView, Image, FlatList } = require("react-native")

  // Any property access returns a callable that yields the same proxy, so
  // `FadeIn`, `FadeIn.duration(200).delay(10)`, `Layout`, etc. all work.
  const chainable: unknown = new Proxy(() => chainable, {
    get: () => () => chainable,
    apply: () => chainable,
  })

  const Animated = {
    View,
    Text,
    ScrollView,
    Image,
    FlatList,
    createAnimatedComponent: (component: unknown) => component,
  }

  const base: Record<string, unknown> = {
    __esModule: true,
    default: Animated,
    useSharedValue: (value: unknown) => ({ value }),
    useAnimatedStyle: () => ({}),
    useDerivedValue: (fn: unknown) => ({
      value: typeof fn === "function" ? fn() : undefined,
    }),
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: () => () => undefined,
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
    withDelay: (_delay: unknown, value: unknown) => value,
    withRepeat: (value: unknown) => value,
    withSequence: (value: unknown) => value,
    cancelAnimation: () => undefined,
    runOnJS: (fn: unknown) => fn,
    runOnUI: (fn: unknown) => fn,
    interpolate: () => 0,
    interpolateColor: () => "#000000",
    Extrapolation: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
    Easing: new Proxy({}, { get: () => () => 0 }),
  }

  // Builders (FadeIn/FadeOut/SlideIn…/Layout/LinearTransition…) fall through to
  // the chainable proxy.
  return new Proxy(base, {
    get: (target, prop: string) => (prop in target ? target[prop] : chainable),
  })
})

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

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>()
  return {
    __store: store,
    deleteItemAsync: async (key: string) => {
      store.delete(key)
    },
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
  }
})

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native")

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    }),
  }
})
