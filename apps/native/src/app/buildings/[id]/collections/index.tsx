import { TCollectionListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingCollections() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TCollectionListScreen buildingId={id} />
}
