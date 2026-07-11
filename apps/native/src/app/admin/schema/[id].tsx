import { SchemaFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function SchemaForm() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <SchemaFormScreen id={id} />
}
