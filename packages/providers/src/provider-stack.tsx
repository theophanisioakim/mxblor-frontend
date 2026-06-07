"use client"

import { ApiQueryClientProvider } from "@workspace/api-client"
import { i18n } from "@workspace/i18n"
import type { ReactNode } from "react"
import { I18nextProvider } from "react-i18next"
import { AuthProvider } from "./auth-provider"
import { BreadcrumbsProvider } from "./breadcrumbs-provider"
import { MenuProvider } from "./menu-provider"
import { OtpProvider } from "./otp-provider"
import { PathnameProvider } from "./pathname-provider"
import { SidebarProvider } from "./sidebar-provider"

export function ProviderStack({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <PathnameProvider>
      <I18nextProvider i18n={i18n}>
        <ApiQueryClientProvider>
          <AuthProvider>
            <MenuProvider>
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
