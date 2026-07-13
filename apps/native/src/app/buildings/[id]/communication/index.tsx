import { BuildingUnitCommListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingUnitCommListScreen buildingId={id} />
}
