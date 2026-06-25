import { TimerInfoListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function TimerInfo() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <TimerInfoListScreen />
    </ScrollView>
  )
}
