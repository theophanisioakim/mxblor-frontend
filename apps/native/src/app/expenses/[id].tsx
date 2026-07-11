import { EditExpenseScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

/**
 * Native `/expenses/[id]` route. Reads the dynamic segment via Expo Router and
 * renders the shared `EditExpenseScreen`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function EditExpense() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <EditExpenseScreen id={id} />
}
