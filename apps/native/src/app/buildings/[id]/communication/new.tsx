import { BuildingUnitCommFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingUnitCommFormScreen buildingId={id} commId="new" />
}
