import { TBankAccountListScreen } from "@workspace/app"
import { useLocalSearchParams } from "expo-router"

export default function BuildingBankAccounts() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <TBankAccountListScreen buildingId={id} />
}
