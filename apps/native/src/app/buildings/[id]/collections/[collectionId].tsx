import { TCollectionFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingCollectionEdit() {
  const { id, collectionId } = useLocalSearchParams<{
    id: string
    collectionId: string
  }>()

  return <TCollectionFormScreen buildingId={id} collectionId={collectionId} />
}
