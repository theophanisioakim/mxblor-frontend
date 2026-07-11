import { RequestLogDetailScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function RequestLogDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <RequestLogDetailScreen id={id} />
}
