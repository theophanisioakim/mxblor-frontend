import { BuildingDistributionFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function NewBuildingDistribution() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingDistributionFormScreen buildingId={id} distributionId="new" />
}
