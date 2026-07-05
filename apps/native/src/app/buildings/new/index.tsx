import { CreateBuildingScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function NewBuilding() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <CreateBuildingScreen />
    </ScrollView>
  )
}
