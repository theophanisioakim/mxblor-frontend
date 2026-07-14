import { BuildingDistributionListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingDistributions() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingDistributionListScreen buildingId={id} />
}
