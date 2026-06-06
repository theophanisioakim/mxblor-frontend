import { SafeAreaView } from "react-native-safe-area-context"

import { HomeScreen } from "@workspace/app"

/**
 * Native home route. Renders the exact same `HomeScreen` that the Next.js
 * web app renders — it comes from `@workspace/app`. The `@workspace/ui`
 * primitives it uses resolve to their react-native-reusables implementations
 * here (via Metro's `.native.tsx` resolution).
 */
export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen />
    </SafeAreaView>
  )
}
