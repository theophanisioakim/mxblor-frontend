import { OtpListScreen } from "@workspace/app"
import { ScrollView } from "react-native"

export default function Otp() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <OtpListScreen />
    </ScrollView>
  )
}
