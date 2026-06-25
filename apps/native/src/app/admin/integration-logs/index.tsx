import { IntegrationLogListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function IntegrationLogs() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <IntegrationLogListScreen />
    </ScrollView>
  )
}
