import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, ArrowUp, Icon } from "../../../primitives/icon"
import { Pressable } from "../../../primitives/pressable"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridSortColumnList() {
  const {
    sortableColumns,
    sort,
    getSortDirection,
    getSortIndex,
    handleSortSelection,
  } = useRncGridContext()

  return (
    <View className="min-w-[180px] gap-1 p-2">
      {sortableColumns.map((col) => {
        const sortDir = col.sortKey ? getSortDirection(col.sortKey) : undefined
        const sortIdx = col.sortKey ? getSortIndex(col.sortKey) : -1
        const isActive = sortIdx >= 0
        return (
          <Pressable
            key={col.key}
            className="cursor-pointer flex-row items-center gap-2 rounded-md px-3 py-2 hover:bg-accent"
            onPress={() => handleSortSelection(col.sortKey)}
          >
            <Text
              className={cn(
                "flex-1 text-sm",
                isActive ? "font-bold" : "font-normal"
              )}
            >
              {col.header}
              {isActive && sort.length > 1 && (
                <Text className="font-semibold text-[10px] text-muted-foreground">
                  {` (${sortIdx + 1})`}
                </Text>
              )}
            </Text>
            {isActive && (
              <Icon
                as={sortDir === "ASC" ? ArrowUp : ArrowDown}
                size={14}
                className="text-primary"
              />
            )}
          </Pressable>
        )
      })}
    </View>
  )
}
