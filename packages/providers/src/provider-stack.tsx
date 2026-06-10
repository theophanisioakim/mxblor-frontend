"use client"

import {
  ApiQueryClientProvider,
  type SbfMenuTreeResponseDto,
} from "@workspace/api-client"
import {
  changeLanguage,
  ensureI18nInitialized,
  getCurrentLanguage,
  getStoredLanguage,
  i18n,
  type SupportedLanguage,
} from "@workspace/i18n"
import { type ReactNode, useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import { AuthProvider } from "./auth-provider"
import { BreadcrumbsProvider } from "./breadcrumbs-provider"
import { MenuProvider } from "./menu-provider"
import { OtpProvider } from "./otp-provider"
import { PathnameProvider } from "./pathname-provider"
import { SidebarProvider } from "./sidebar-provider"

export type ProviderStackProps = Readonly<{
  children: ReactNode
  initialLanguage?: SupportedLanguage
  /** SSR-fetched menu tree forwarded to MenuProvider as `initialData`. */
  initialMenus?: SbfMenuTreeResponseDto
}>

export function ProviderStack({
  children,
  initialLanguage,
  initialMenus,
}: ProviderStackProps) {
  ensureI18nInitialized(initialLanguage)

  useEffect(() => {
    const storedLanguage = getStoredLanguage()

    if (storedLanguage && storedLanguage !== getCurrentLanguage()) {
      void changeLanguage(storedLanguage)
    }
  }, [])

  return (
    <PathnameProvider>
      <I18nextProvider i18n={i18n}>
        <ApiQueryClientProvider>
          <AuthProvider>
            <MenuProvider initialMenus={initialMenus}>
              <SidebarProvider>
                <BreadcrumbsProvider>
                  <OtpProvider>{children}</OtpProvider>
                </BreadcrumbsProvider>
              </SidebarProvider>
            </MenuProvider>
          </AuthProvider>
        </ApiQueryClientProvider>
      </I18nextProvider>
    </PathnameProvider>
  )
}
