import { RevenueCategoryFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function EditRevenueCategory() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <RevenueCategoryFormScreen id={id} />
}
