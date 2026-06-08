import { Spinner, View } from "@workspace/ui"

/** Shared loading screen rendered by the Next.js `loading.tsx` boundary. */
export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Spinner size="large" />
    </View>
  )
}
