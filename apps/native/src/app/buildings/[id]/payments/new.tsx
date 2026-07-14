import { TPaymentFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingPaymentNew() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TPaymentFormScreen buildingId={id} paymentId="new" />
}
