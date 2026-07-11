import { Geist_Mono, Inter } from "next/font/google"

import "@workspace/ui/globals.css"
import {
  getLanguageConfig,
  getMyMenus,
  type LanguageConfigResponseDto,
  type SbfMenuTreeResponseDto,
} from "@workspace/api-client"
import { AppShell } from "@workspace/app"
import {
  ensureI18nInitialized,
  isSupportedLanguage,
} from "@workspace/i18n/server"
import { AppProviders } from "@workspace/providers"
import { setServerCookies } from "@workspace/storage"
import { cn } from "@workspace/ui/lib/utils"
import { cookies } from "next/headers"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  // Bridge the request's cookies into `@workspace/storage` so server-side reads
  // (e.g. the persisted language) resolve during SSR — there is no
  // localStorage on the server. Mirrors the old project's layout cookie logic.
  const cookieStore = await cookies()
  const cookieMap: Record<string, string> = {}
  for (const cookie of cookieStore.getAll()) {
    cookieMap[cookie.name] = cookie.value
  }
  setServerCookies(cookieMap)

  // `app_language` is the cookie backing `StorageKeys.LANGUAGE` (see
  // `@workspace/storage` keys). Render the server tree in that language.
  const lang = isSupportedLanguage(cookieMap.app_language)
    ? cookieMap.app_language
    : "en"
  ensureI18nInitialized(lang)

  // Server-side render the user's menu tree on first load so the sidebar/top
  // nav paint immediately instead of waiting for the client `useGetMyMenus`
  // query. `setServerCookies` above bridged the JWT + selected schema into
  // `@workspace/storage`, so `getMyMenus` -> `customInstance` attaches the
  // Authorization / x-schema-id headers during SSR. Only fetch when those
  // cookies exist (matching MenuProvider's `enabled` gating); on any failure
  // we leave `initialMenus` undefined and fall back to client-side fetching.
  let initialMenus: SbfMenuTreeResponseDto | undefined
  if (cookieMap.app_jwt_token && cookieMap.app_selected_schema) {
    try {
      initialMenus = await getMyMenus()
    } catch {
      // SSR fetch failed (e.g. not authenticated, API unreachable) — the
      // client MenuProvider will retry via React Query.
    }
  }

  // The tenant's languages, so a form with an `RncTranslationLabel` paints with
  // its inputs on first load. Unlike the menus this needs no cookie gating: the
  // endpoint is public, and the schema comes from the x-schema-id header when
  // one is selected (falling back to the main schema's defaults otherwise).
  let initialLanguageConfig: LanguageConfigResponseDto | undefined
  try {
    initialLanguageConfig = await getLanguageConfig()
  } catch {
    // SSR fetch failed (e.g. API unreachable) — the client LanguageProvider
    // will retry via React Query.
  }

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <AppProviders
          initialLanguage={lang}
          initialMenus={initialMenus}
          initialLanguageConfig={initialLanguageConfig}
        >
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  )
}
