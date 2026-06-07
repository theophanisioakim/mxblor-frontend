import { cn } from "@workspace/ui/lib/utils"
import { ArrowDown, ArrowUp, ArrowUpDown, Icon } from "../../../primitives/icon"
import { Pressable } from "../../../primitives/pressable"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"
import type { RncGridColumn } from "../rnc-grid-model"

export function RncGridHeaderCell<T, S>({
  col,
}: Readonly<{ col: RncGridColumn<T, S> }>) {
  const { getSortDirection, getSortIndex, sort, handleSortSelection } =
    useRncGridContext()

  const isSortable = !!(col.sortable && col.sortKey)
  const sortDirection = col.sortKey ? getSortDirection(col.sortKey) : undefined
  const sortIndex = col.sortKey ? getSortIndex(col.sortKey) : -1
  const isSorted = sortIndex >= 0
  const showSortNumber = isSorted && sort.length > 1

  let SortIcon = ArrowUpDown
  if (isSorted) {
    SortIcon = sortDirection === "ASC" ? ArrowUp : ArrowDown
  }

  return (
    <Pressable
      className={cn(
        "flex-row items-center gap-1 rounded-md py-1 pr-3 pl-1",
        isSortable && "cursor-pointer hover:bg-accent"
      )}
      style={{
        flexGrow: col.minWidth ?? 120,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: col.minWidth,
      }}
      onPress={
        isSortable ? () => handleSortSelection(col.sortKey as S) : undefined
      }
    >
      <Text className="font-bold text-foreground text-sm">{col.header}</Text>
      {isSortable && (
        <View className="flex-row items-center gap-0.5">
          <Icon as={SortIcon} size={14} className="text-foreground" />
          {showSortNumber && (
            <Text className="font-semibold text-[10px] text-muted-foreground">
              {sortIndex + 1}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  )
}
