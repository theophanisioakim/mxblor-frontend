import { EmailOutboxListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function EmailOutbox() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <EmailOutboxListScreen />
    </ScrollView>
  )
}
