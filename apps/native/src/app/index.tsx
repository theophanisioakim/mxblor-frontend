import { HomeScreen } from "@workspace/app"
import { Button, Text } from "@workspace/ui"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

/**
 * Native home route. Renders the exact same `HomeScreen` that the Next.js
 * web app renders — it comes from `@workspace/app`. The `@workspace/ui`
 * primitives it uses resolve to their react-native-reusables implementations
 * here (via Metro's `.native.tsx` resolution).
 */
export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen
        footer={
          <Link href="/forms" asChild>
            <Button variant="outline">
              <Text>View form components</Text>
            </Button>
          </Link>
        }
      />
    </SafeAreaView>
  )
}
