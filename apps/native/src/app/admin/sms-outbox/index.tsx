import { SmsOutboxListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function SmsOutbox() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <SmsOutboxListScreen />
    </ScrollView>
  )
}
