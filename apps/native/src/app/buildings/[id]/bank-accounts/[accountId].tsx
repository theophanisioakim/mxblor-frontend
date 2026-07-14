import { TBankAccountFormScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function EditBankAccount() {
  const { id, accountId } = useLocalSearchParams<{
    id: string
    accountId: string
  }>()

  return <TBankAccountFormScreen buildingId={id} accountId={accountId} />
}
