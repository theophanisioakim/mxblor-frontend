import { SystemPropertiesListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function SystemProperties() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <SystemPropertiesListScreen />
    </ScrollView>
  )
}
