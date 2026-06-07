import { FormShowcaseScreen } from "@workspace/app"
import { ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

/**
 * Native `/forms` route. Renders the same `FormShowcaseScreen` from
 * `@workspace/app` that the web app serves at `/forms`.
 */
export default function Forms() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <FormShowcaseScreen />
      </ScrollView>
    </SafeAreaView>
  )
}
