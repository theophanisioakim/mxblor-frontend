import { Button, Text, View } from "@workspace/ui"

/**
 * Shared, cross-platform screen.
 *
 * It is written once here and consumed by both the Next.js web app and the
 * Expo native app. It only depends on `@workspace/ui`, whose primitives
 * (`View`, `Text`, `Button`) resolve to the correct platform implementation
 * at build time (web -> `@workspace/web-ui`, native -> `@workspace/native-ui`).
 */
export function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text className="text-2xl font-bold text-foreground">Project ready!</Text>
      <Text className="text-muted-foreground">
        One screen, shared by the web and native apps.
      </Text>
      <Button>
        <Text>Button</Text>
      </Button>
    </View>
  )
}
