import { LinkButton } from "@workspace/router"
import { Separator, Text, View } from "@workspace/ui"

/** Shared 404 screen rendered by the Next.js `not-found.tsx` / Expo `+not-found`. */
export function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-8 bg-background p-4">
      <View className="items-center gap-4">
        <Text className="font-bold text-6xl text-muted-foreground/40">404</Text>
        <Text className="text-center font-bold text-2xl text-foreground">
          Page Not Found
        </Text>
        <Separator className="w-24" />
        <Text className="text-center text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </Text>
      </View>

      <LinkButton href="/" variant="default">
        Go Home
      </LinkButton>
    </View>
  )
}
