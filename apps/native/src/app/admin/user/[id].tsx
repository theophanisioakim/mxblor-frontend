import { UserFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

/**
 * Native `/admin/user/[id]` route (use `new` to create). Reads the dynamic
 * segment via Expo Router and renders the shared `UserFormScreen`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function UserForm() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <UserFormScreen id={id} />
}
