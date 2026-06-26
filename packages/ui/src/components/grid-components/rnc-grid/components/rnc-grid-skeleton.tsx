import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridSkeleton() {
  const { selectable, hasActions, hasOverflow, actionsWidth, visibleColumns } =
    useRncGridContext()

  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className="border-border border-t"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <View className="flex-row items-center gap-2 px-3 py-2">
            {selectable && (
              <View className="w-10 shrink-0 items-center justify-center">
                <View className="size-4 rounded-sm bg-muted" />
              </View>
            )}
            {hasActions && !hasOverflow && (
              <View
                className="shrink-0 self-center rounded-md bg-muted"
                style={{ width: actionsWidth, height: 16 }}
              />
            )}
            {visibleColumns.map((col) => (
              <View
                key={col.key}
                className="px-1"
                style={{
                  flexGrow: col.minWidth ?? 120,
                  flexShrink: 1,
                  flexBasis: 0,
                  minWidth: col.minWidth,
                }}
              >
                <View className="h-3.5 rounded-md bg-muted" />
              </View>
            ))}
            {hasOverflow && <View className="w-8" />}
          </View>
        </View>
      ))}
    </>
  )
}
