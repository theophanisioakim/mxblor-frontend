import { SchemaPropertiesListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function SchemaProperties() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <SchemaPropertiesListScreen />
    </ScrollView>
  )
}
