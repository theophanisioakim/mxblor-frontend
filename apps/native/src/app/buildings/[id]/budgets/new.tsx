import { BuildingYearlyBudgetFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function NewBuildingBudget() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingYearlyBudgetFormScreen buildingId={id} budgetId="new" />
}
