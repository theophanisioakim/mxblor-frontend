import { TCollectionFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingCollectionNew() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TCollectionFormScreen buildingId={id} collectionId="new" />
}
