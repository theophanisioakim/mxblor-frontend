/**
 * Cross-platform Pressable — native variant.
 *
 * Re-exports react-native's `Pressable` (NativeWind adds `className` support).
 * The web variant (`pressable.tsx`) renders a `<div>` and maps `onPress` to the
 * DOM click. Its `onPress` receives a `GestureResponderEvent`, which is
 * compatible with the shared `PressableEvent` contract used by consumers.
 */
export type { PressableProps } from "react-native"
export { Pressable } from "react-native"
