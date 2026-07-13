import { EditRevenueScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function EditRevenue() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <EditRevenueScreen id={id} />
}
