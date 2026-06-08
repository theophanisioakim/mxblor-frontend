"use client"

import type { SupportedLanguage } from "@workspace/i18n"
import type { ReactNode } from "react"
import { AppThemeProvider } from "./app-theme-provider"
import { ProviderStack } from "./provider-stack"

export type AppProvidersProps = Readonly<{
  children: ReactNode
  initialLanguage?: SupportedLanguage
}>

export function AppProviders({ children, initialLanguage }: AppProvidersProps) {
  return (
    <AppThemeProvider>
      <ProviderStack initialLanguage={initialLanguage}>
        {children}
      </ProviderStack>
    </AppThemeProvider>
  )
}
