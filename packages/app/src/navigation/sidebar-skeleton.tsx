import { View } from "@workspace/ui"

export interface SidebarSkeletonProps {
  collapsed: boolean
  rows?: number
}

/** Placeholder rows shown while the menu tree is loading. */
export function SidebarSkeleton({
  collapsed,
  rows = 6,
}: Readonly<SidebarSkeletonProps>) {
  return (
    <View className="gap-2 py-2">
      {Array.from({ length: rows }, (_, i) => i).map((i) => (
        <SidebarSkeletonRow
          key={i}
          collapsed={collapsed}
          opacity={Math.max(0.25, 1 - i * 0.12)}
        />
      ))}
    </View>
  )
}

function SidebarSkeletonRow({
  collapsed,
  opacity,
}: Readonly<{ collapsed: boolean; opacity: number }>) {
  if (collapsed) {
    return (
      <View className="items-center" style={{ opacity }}>
        <View className="size-8 rounded-full bg-muted" />
      </View>
    )
  }

  return (
    <View className="flex-row items-center gap-2 px-3" style={{ opacity }}>
      <View className="size-[18px] rounded-md bg-muted" />
      <View className="h-3 flex-1 rounded-md bg-muted" />
    </View>
  )
}
