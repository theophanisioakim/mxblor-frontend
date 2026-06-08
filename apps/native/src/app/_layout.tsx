import "../global.css"

import { AppShell } from "@workspace/app"
import { AppProviders } from "@workspace/providers"
import { Stack } from "expo-router"

export default function RootLayout() {
  return (
    <AppProviders>
      <AppShell>
        <Stack screenOptions={{ headerShown: false }} />
      </AppShell>
    </AppProviders>
  )
}
