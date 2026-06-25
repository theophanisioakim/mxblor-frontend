import { IntegrationListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function Integration() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <IntegrationListScreen />
    </ScrollView>
  )
}
