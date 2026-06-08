import { Geist_Mono, Inter } from "next/font/google"

import "@workspace/ui/globals.css"
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
        <AppProviders initialLanguage={lang}>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  )
}
