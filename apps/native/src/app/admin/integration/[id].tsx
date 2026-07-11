import { IntegrationFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function IntegrationForm() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <IntegrationFormScreen id={id} />
}
