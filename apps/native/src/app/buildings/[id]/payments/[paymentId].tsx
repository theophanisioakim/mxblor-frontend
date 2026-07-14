import { TPaymentFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingPaymentEdit() {
  const { id, paymentId } = useLocalSearchParams<{
    id: string
    paymentId: string
  }>()

  return <TPaymentFormScreen buildingId={id} paymentId={paymentId} />
}
