import { HomeScreen } from "@workspace/app"

/**
 * Native home route. Renders the exact same `HomeScreen` that the Next.js
 * web app renders — it comes from `@workspace/app`. The `@workspace/ui`
 * primitives it uses resolve to their react-native-reusables implementations
 * here (via Metro's `.native.tsx` resolution).
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`,
 * so screens render their content directly without a `SafeAreaView`.
 */
export default function Index() {
  return <HomeScreen />
}
