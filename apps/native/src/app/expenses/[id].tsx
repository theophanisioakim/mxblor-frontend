import { EditExpenseScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"
import { ScrollView } from "react-native"

/**
 * Native `/expenses/[id]` route. Reads the dynamic segment via Expo Router and
 * renders the shared `EditExpenseScreen`.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function EditExpense() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <EditExpenseScreen id={id} />
    </ScrollView>
  )
}
