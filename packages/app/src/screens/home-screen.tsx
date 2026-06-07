import { Button, Text, View } from "@workspace/ui"
import type { ReactNode } from "react"

/**
 * Shared, cross-platform screen.
 *
 * It is written once here and consumed by both the Next.js web app and the
 * Expo native app. It only depends on `@workspace/ui`, whose primitives
 * (`View`, `Text`, `Button`) resolve to the correct platform implementation
 * at build time (web -> `@workspace/web-ui`, native -> `@workspace/native-ui`).
 *
 * Navigation is framework-specific, so each app passes its own platform link
 * via `footer` rather than the shared screen importing a router.
 */
export function HomeScreen({ footer }: { footer?: ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text className="font-bold text-2xl text-foreground">Project ready!</Text>
      <Text className="text-muted-foreground">
        One screen, shared by the web and native apps.
      </Text>
      <Button>
        <Text>Button</Text>
      </Button>
      {footer}
    </View>
  )
}
