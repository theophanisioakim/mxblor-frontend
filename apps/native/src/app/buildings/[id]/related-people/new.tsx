import { BuildingRelatedPersonFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingRelatedPersonFormScreen buildingId={id} personId="new" />
}
