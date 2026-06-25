import { SchemaFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"
import { ScrollView } from "react-native"

export default function SchemaForm() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <SchemaFormScreen id={id} />
    </ScrollView>
  )
}
