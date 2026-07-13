import { ExpenseCategoryFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

/**
 * Native `/expenses/categories/[id]` route. Reads the dynamic segment via Expo
 * Router and renders the shared `ExpenseCategoryFormScreen`, which decides for
 * itself whether the category is editable or view-only.
 *
 * Safe-area insets are handled once around the whole app shell in `_layout.tsx`.
 */
export default function EditExpenseCategory() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <ExpenseCategoryFormScreen id={id} />
}
