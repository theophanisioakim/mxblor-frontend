import { BuildingListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function Buildings() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <BuildingListScreen />
    </ScrollView>
  )
}
