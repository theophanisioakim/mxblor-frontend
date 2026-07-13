import { EditBuildingScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function EditBuilding() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <EditBuildingScreen id={id} />
}
