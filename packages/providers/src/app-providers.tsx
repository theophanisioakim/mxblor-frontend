"use client"

import type { ReactNode } from "react"
import { AppThemeProvider } from "./app-theme-provider"
import { ProviderStack } from "./provider-stack"

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppThemeProvider>
      <ProviderStack>{children}</ProviderStack>
    </AppThemeProvider>
  )
}
