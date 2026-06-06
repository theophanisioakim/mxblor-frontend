import "../global.css"

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { PortalHost } from "@rn-primitives/portal"
import { Stack } from "expo-router"
import { useColorScheme } from "react-native"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      {/* Required by react-native-reusables overlay components
          (dialog, popover, dropdown-menu, tooltip, etc.). */}
      <PortalHost />
    </ThemeProvider>
  )
}
