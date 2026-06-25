import { UserListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

/**
 * Native `/admin/user` route. Renders the same `UserListScreen` from
 * `@workspace/app` that the web app serves at `/admin/user`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function User() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <UserListScreen />
    </ScrollView>
  )
}
