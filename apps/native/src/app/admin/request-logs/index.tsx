import { RequestLogListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function RequestLogs() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <RequestLogListScreen />
    </ScrollView>
  )
}
