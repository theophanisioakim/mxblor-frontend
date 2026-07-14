import { TExpenseFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingCurrentExpenseNew() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TExpenseFormScreen buildingId={id} expenseId="new" />
}
