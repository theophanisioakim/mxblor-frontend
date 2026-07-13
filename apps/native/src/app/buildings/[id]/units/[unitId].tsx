import { BuildingUnitFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function EditBuildingUnit() {
  const { id, unitId } = useLocalSearchParams<{ id: string; unitId: string }>()

  return <BuildingUnitFormScreen buildingId={id} unitId={unitId} />
}
