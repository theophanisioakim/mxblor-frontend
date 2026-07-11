"use client"

import type {
  LanguageConfigResponseDto,
  SbfMenuTreeResponseDto,
} from "@workspace/api-client"
import type { SupportedLanguage } from "@workspace/i18n"
import type { ReactNode } from "react"
import { AppThemeProvider } from "./app-theme-provider"
import { ProviderStack } from "./provider-stack"

export type AppProvidersProps = Readonly<{
  children: ReactNode
  initialLanguage?: SupportedLanguage
  /** SSR-fetched menu tree used as React Query `initialData` (web only). */
  initialMenus?: SbfMenuTreeResponseDto
  /** SSR-fetched tenant language config used as `initialData` (web only). */
  initialLanguageConfig?: LanguageConfigResponseDto
}>

export function AppProviders({
  children,
  initialLanguage,
  initialMenus,
  initialLanguageConfig,
}: AppProvidersProps) {
  return (
    <AppThemeProvider>
      <ProviderStack
        initialLanguage={initialLanguage}
        initialMenus={initialMenus}
        initialLanguageConfig={initialLanguageConfig}
      >
        {children}
      </ProviderStack>
    </AppThemeProvider>
  )
}
