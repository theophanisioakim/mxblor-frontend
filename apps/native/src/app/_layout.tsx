import "../global.css"

import { AppShell } from "@workspace/app"
import { AppProviders } from "@workspace/providers"
import { Stack } from "expo-router"
import type { ReactNode } from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function RootLayout() {
  return (
    <AppProviders>
      <SafeAreaShell>
        <AppShell>
          <Stack screenOptions={{ headerShown: false }} />
        </AppShell>
      </SafeAreaShell>
    </AppProviders>
  )
}

/**
 * Applies the device safe-area insets once, around the whole app shell, so the
 * `TopBar` clears the status bar / notch and the `BottomTabBar` clears the home
 * indicator. The inset region is painted `bg-background` to match both bars,
 * making the padding blend seamlessly. Individual screens must NOT wrap their
 * content in `SafeAreaView` — that would inset the content region instead of the
 * chrome (and double-pad).
 */
function SafeAreaShell({ children }: Readonly<{ children: ReactNode }>) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {children}
    </View>
  )
}
