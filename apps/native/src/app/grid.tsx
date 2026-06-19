import { GridShowcaseScreen } from "@workspace/app"
import { ScrollView } from "react-native"

/**
 * Native `/grid` route. Renders the same `GridShowcaseScreen` from
 * `@workspace/app` that the web app serves at `/grid`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function Grid() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <GridShowcaseScreen />
    </ScrollView>
  )
}
