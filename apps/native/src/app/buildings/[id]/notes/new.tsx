import { BuildingNoteFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <BuildingNoteFormScreen buildingId={id} noteId="new" />
}
