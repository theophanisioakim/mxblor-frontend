import { BuildingYearlyBudgetListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingBudgets() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingYearlyBudgetListScreen buildingId={id} />
}
