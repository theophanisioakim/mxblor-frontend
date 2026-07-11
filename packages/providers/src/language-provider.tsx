"use client"

import {
  LanguageConfigProvider,
  type LanguageConfigResponseDto,
} from "@workspace/api-client"
import type { ReactNode } from "react"
import { useAuth } from "./auth-provider"

export interface LanguageProviderProps {
  children: ReactNode
  /** SSR-fetched language config used as React Query `initialData` (web only). */
  initialLanguageConfig?: LanguageConfigResponseDto
}

/**
 * Adapter that feeds the session into `api-client`'s `LanguageConfigProvider`.
 *
 * The provider itself lives in `@workspace/api-client` so that `@workspace/ui`
 * (where `RncTranslationLabel` lives) can consume it — `ui` may not import this
 * package, since `ui -> providers -> router -> ui` would be a cycle. `api-client`
 * sits below both, but for that same reason it cannot read `useAuth` itself, so
 * this thin component — which does live above auth — injects it.
 */
export function LanguageProvider({
  children,
  initialLanguageConfig,
}: Readonly<LanguageProviderProps>) {
  const { isAuthenticated, selectedSchema } = useAuth()

  return (
    <LanguageConfigProvider
      isAuthenticated={isAuthenticated}
      selectedSchema={selectedSchema}
      initialData={initialLanguageConfig}
    >
      {children}
    </LanguageConfigProvider>
  )
}
