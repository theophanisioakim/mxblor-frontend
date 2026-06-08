"use client"

import { LinkButton } from "@workspace/router"
import { Button, Separator, Text, View } from "@workspace/ui"

export interface ErrorScreenProps {
  error?: Error & { digest?: string }
  reset?: () => void
}

/** Shared error screen rendered by the Next.js `error.tsx` boundary. */
export function ErrorScreen({ error, reset }: Readonly<ErrorScreenProps>) {
  return (
    <View className="flex-1 items-center justify-center gap-8 bg-background p-4">
      <View className="items-center gap-4">
        <Text className="text-center font-bold text-3xl text-destructive">
          Something Went Wrong
        </Text>
        <Separator className="w-24" />
        <Text className="text-center text-muted-foreground">
          {error?.message || "An unexpected error occurred."}
        </Text>
      </View>

      <View className="items-center gap-3">
        {reset ? (
          <Button onPress={reset}>
            <Text>Try Again</Text>
          </Button>
        ) : null}
        <LinkButton href="/" variant="ghost">
          Go Home
        </LinkButton>
      </View>
    </View>
  )
}
