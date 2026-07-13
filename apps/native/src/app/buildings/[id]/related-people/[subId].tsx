import { BuildingRelatedPersonFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function Screen() {
  const { id, subId } = useLocalSearchParams<{ id: string; subId: string }>()

  return <BuildingRelatedPersonFormScreen buildingId={id} personId={subId} />
}
