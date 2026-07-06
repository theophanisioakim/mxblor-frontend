import { ExpenseListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function Expenses() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <ExpenseListScreen />
    </ScrollView>
  )
}
