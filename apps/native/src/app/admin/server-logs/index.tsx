import { ServerLogListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function ServerLogs() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <ServerLogListScreen />
    </ScrollView>
  )
}
