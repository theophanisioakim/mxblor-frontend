import { TExpenseFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingCurrentExpenseEdit() {
  const { id, expenseId } = useLocalSearchParams<{
    id: string
    expenseId: string
  }>()

  return <TExpenseFormScreen buildingId={id} expenseId={expenseId} />
}
