import { CreateExpenseScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function NewExpense() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <CreateExpenseScreen />
    </ScrollView>
  )
}
