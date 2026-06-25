import { PermissionListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function Permission() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <PermissionListScreen />
    </ScrollView>
  )
}
