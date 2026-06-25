import { AuditLogListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function AuditLogs() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <AuditLogListScreen />
    </ScrollView>
  )
}
