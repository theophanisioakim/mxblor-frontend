import { RoleListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

/**
 * Native `/admin/role` route. Renders the same `RoleListScreen` from
 * `@workspace/app` that the web app serves at `/admin/role`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function Role() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <RoleListScreen />
    </ScrollView>
  )
}
