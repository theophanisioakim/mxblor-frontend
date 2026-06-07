import { GridShowcaseScreen } from "@workspace/app"
import { ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

/**
 * Native `/grid` route. Renders the same `GridShowcaseScreen` from
 * `@workspace/app` that the web app serves at `/grid`.
 */
export default function Grid() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <GridShowcaseScreen />
      </ScrollView>
    </SafeAreaView>
  )
}
