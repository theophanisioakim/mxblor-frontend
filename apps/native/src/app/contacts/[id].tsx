import { ContactFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

/**
 * Native `/contacts/[id]` route. Safe-area insets are handled once around the
 * whole app shell in `_layout.tsx`.
 */
export default function EditContact() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <ContactFormScreen id={id} />
}
