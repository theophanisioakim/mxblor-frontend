import { SchemaListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function Schema() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <SchemaListScreen />
    </ScrollView>
  )
}
