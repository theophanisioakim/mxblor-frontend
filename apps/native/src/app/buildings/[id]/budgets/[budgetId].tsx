import { BuildingYearlyBudgetFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function EditBuildingBudget() {
  const { id, budgetId } = useLocalSearchParams<{
    id: string
    budgetId: string
  }>()

  return <BuildingYearlyBudgetFormScreen buildingId={id} budgetId={budgetId} />
}
