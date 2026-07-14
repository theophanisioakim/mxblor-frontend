import { TBankAccountFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function NewBankAccount() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TBankAccountFormScreen buildingId={id} accountId="new" />
}
