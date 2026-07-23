"use client"

import type { ApiPermissionKey } from "@workspace/api-client"
import { usePermission } from "@workspace/providers"
import { Text, View } from "@workspace/ui"
import type { ReactNode } from "react"
import { LoadingScreen } from "./loading-screen"

export interface PermissionGuardProps {
  /**
   * The page's primary read route (from `screen-permissions.ts`). Lacking the
   * grant renders the access-denied state instead of the page.
   */
  permission: ApiPermissionKey
  children: ReactNode
}

/**
 * Page-level gate over the backend-driven permissions. Evaluates the same
 * SSR-seeded grant list on the server render and on client hydration, so the
 * guarded markup is identical on both (hydration-safe), and re-evaluates when
 * the session changes. Until the grant list is resolved it renders the shared
 * loading screen; a caller without the grant gets the access-denied state on
 * every platform, SSR included.
 */
export function PermissionGuard({
  permission,
  children,
}: Readonly<PermissionGuardProps>) {
  const { hasPermission, isResolved } = usePermission()

  if (!isResolved) {
    return <LoadingScreen />
  }

  if (!hasPermission(permission)) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-background p-6">
        <Text className="font-bold text-2xl text-foreground">
          Access denied
        </Text>
        <Text className="text-center text-muted-foreground">
          You do not have permission to view this page.
        </Text>
      </View>
    )
  }

  return <>{children}</>
}
