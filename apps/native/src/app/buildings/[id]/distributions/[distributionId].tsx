import { BuildingDistributionFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function EditBuildingDistribution() {
  const { id, distributionId } = useLocalSearchParams<{
    id: string
    distributionId: string
  }>()

  return (
    <BuildingDistributionFormScreen
      buildingId={id}
      distributionId={distributionId}
    />
  )
}
