import { RoleFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"
import { ScrollView } from "react-native"

/**
 * Native `/admin/role/[id]` route (use `new` to create). Reads the dynamic
 * segment via Expo Router and renders the shared `RoleFormScreen`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function RoleForm() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <RoleFormScreen id={id} />
    </ScrollView>
  )
}
