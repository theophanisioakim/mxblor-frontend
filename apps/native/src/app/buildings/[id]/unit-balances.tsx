import { BuildingUnitBalancesScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingUnitBalances() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingUnitBalancesScreen buildingId={id} />
}
