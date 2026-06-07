import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native"
import { PortalHost } from "@rn-primitives/portal"
import type { ReactNode } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AppThemeProvider, useAppTheme } from "./app-theme-provider"
import { ProviderStack } from "./provider-stack"

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppThemeProvider>
      <NativeShellProviders>
        <ProviderStack>{children}</ProviderStack>
        <PortalHost />
      </NativeShellProviders>
    </AppThemeProvider>
  )
}

function NativeShellProviders({ children }: Readonly<{ children: ReactNode }>) {
  const { theme } = useAppTheme()

  return (
    <NavigationThemeProvider
      value={theme === "dark" ? DarkTheme : DefaultTheme}
    >
      <SafeAreaProvider>{children}</SafeAreaProvider>
    </NavigationThemeProvider>
  )
}
