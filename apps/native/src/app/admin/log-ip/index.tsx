import { IpLogListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function LogIp() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <IpLogListScreen />
    </ScrollView>
  )
}
