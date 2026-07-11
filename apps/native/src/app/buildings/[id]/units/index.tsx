import { BuildingUnitListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingUnits() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingUnitListScreen buildingId={id} />
}
