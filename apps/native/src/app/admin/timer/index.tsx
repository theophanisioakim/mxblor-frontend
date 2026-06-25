import { TimerListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function Timer() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <TimerListScreen />
    </ScrollView>
  )
}
