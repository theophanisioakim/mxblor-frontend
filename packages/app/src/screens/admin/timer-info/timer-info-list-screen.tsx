"use client"

import { Text, View } from "@workspace/ui"
import { PermissionGuard } from "../../permission-guard"
import { viewPermissions } from "../../screen-permissions"
import { TimerInfoListGrid } from "./timer-info-list-grid"

export function TimerInfoListScreen() {
  return (
    <PermissionGuard permission={viewPermissions.timerInfo}>
      <View className="w-full gap-4 self-center p-4 md:p-6 lg:py-8">
        <Text className="font-bold text-2xl text-foreground md:text-3xl">
          Timer Info
        </Text>

        <TimerInfoListGrid />
      </View>
    </PermissionGuard>
  )
}
