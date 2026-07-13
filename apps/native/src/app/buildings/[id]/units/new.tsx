import { BuildingUnitFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function CreateBuildingUnit() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingUnitFormScreen buildingId={id} unitId="new" />
}
