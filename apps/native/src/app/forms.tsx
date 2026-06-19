import { FormShowcaseScreen } from "@workspace/app"
import { ScrollView } from "react-native"

/**
 * Native `/forms` route. Renders the same `FormShowcaseScreen` from
 * `@workspace/app` that the web app serves at `/forms`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function Forms() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <FormShowcaseScreen />
    </ScrollView>
  )
}
