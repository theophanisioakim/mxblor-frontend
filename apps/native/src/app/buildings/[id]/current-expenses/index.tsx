import { TExpenseListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingCurrentExpenses() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TExpenseListScreen buildingId={id} />
}
