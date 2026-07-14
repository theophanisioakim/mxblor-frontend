import { TPaymentListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingPayments() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TPaymentListScreen buildingId={id} />
}
