import { BuildingRelatedPersonListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingRelatedPersonListScreen buildingId={id} />
}
