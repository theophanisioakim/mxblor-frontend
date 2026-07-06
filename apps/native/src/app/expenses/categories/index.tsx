import { ExpenseCategoryListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function ExpenseCategories() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <ExpenseCategoryListScreen />
    </ScrollView>
  )
}
