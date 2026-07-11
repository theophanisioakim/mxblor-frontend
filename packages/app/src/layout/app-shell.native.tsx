"use client"

import { cn, View } from "@workspace/ui"
import { ScrollView } from "react-native"
import { BottomTabBar } from "../navigation/bottom-tab-bar"
import { Breadcrumbs } from "../navigation/breadcrumbs"
import { FloatingActionButton } from "../navigation/floating-action-button"
import { MobileSidebar, Sidebar } from "../navigation/sidebar"
import { TopBar } from "../navigation/top-bar"
import { OtpDialog } from "../overlays/otp-dialog"
import type { AppShellProps } from "./app-shell"

/**
 * Native application shell. Mirrors `app-shell.tsx` but uses a `ScrollView` for
 * the content region — React Native has no CSS `overflow-y-auto`. `flexGrow: 1`
 * on the scroll content keeps short screens (home, login) full-height so
 * `flex-1` centering inside shared screens still works.
 */
export function AppShell({ children, className }: Readonly<AppShellProps>) {
  return (
    <View className={cn("relative flex-1 flex-col overflow-hidden", className)}>
      <TopBar />

      <View className="flex-1 flex-row overflow-hidden">
        <Sidebar />
        <View className="flex-1 overflow-hidden">
          <Breadcrumbs />
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {children}
          </ScrollView>
        </View>
      </View>

      <BottomTabBar />
      <MobileSidebar />
      <FloatingActionButton />
      <OtpDialog />
    </View>
  )
}
