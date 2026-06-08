"use client"

import { cn, View } from "@workspace/ui"
import type { ReactNode } from "react"
import { BottomTabBar } from "../navigation/bottom-tab-bar"
import { Breadcrumbs } from "../navigation/breadcrumbs"
import { FloatingActionButton } from "../navigation/floating-action-button"
import { MobileSidebar, Sidebar } from "../navigation/sidebar"
import { TopBar } from "../navigation/top-bar"
import { OtpDialog } from "../overlays/otp-dialog"

export interface AppShellProps {
  children: ReactNode
  className?: string
}

/**
 * Cross-platform application shell: top bar + (desktop) sidebar + breadcrumbs +
 * scrollable content, with the mobile sidebar overlay, bottom tab bar, floating
 * action button, and OTP dialog. Reads navigation state from
 * `@workspace/providers`, so it must render inside `AppProviders`.
 */
export function AppShell({ children, className }: Readonly<AppShellProps>) {
  return (
    <View
      className={cn(
        "relative h-svh flex-1 flex-col overflow-hidden",
        className
      )}
    >
      <TopBar />

      <View className="flex-1 flex-row overflow-hidden">
        <Sidebar />
        <View className="flex-1 overflow-hidden">
          <Breadcrumbs />
          <View className="flex-1 overflow-y-auto">{children}</View>
        </View>
      </View>

      <BottomTabBar />
      <MobileSidebar />
      <FloatingActionButton />
      <OtpDialog />
    </View>
  )
}
