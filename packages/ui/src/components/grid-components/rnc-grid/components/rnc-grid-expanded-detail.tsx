import { Eye, Icon, Pencil, Trash2 } from "../../../primitives/icon"
import { Pressable } from "../../../primitives/pressable"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import { RncGridCellResolver } from "../../cells/rnc-grid-cell-resolver"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridExpandedDetail<T>({
  row,
  rowIndex,
}: Readonly<{ row: T; rowIndex: number }>) {
  const {
    keyExtractor,
    hasOverflow,
    isRowExpanded,
    isRowEditing,
    overflowColumns,
    resolvedColumnTypes,
    expandableRender,
    hasActions,
    actions,
    handleViewPress,
    handleEditPress,
    handleDeletePress,
  } = useRncGridContext()

  if (!hasOverflow) return null

  const key = keyExtractor(row, rowIndex)
  if (!isRowExpanded(key)) return null

  const editing = isRowEditing(row, rowIndex)

  return (
    <View className="gap-2 border-border border-t bg-muted/50 px-4 py-3">
      {hasActions && (
        <View className="flex-row items-center justify-end gap-1">
          {/* The `hidden` predicates are honoured here exactly as in
              RncGridRowActions — this is the same action set, just rendered in
              the expanded detail when the row's columns overflow. Without them a
              system-default row would still offer Edit and Delete on a narrow
              viewport. */}
          {actions?.view && !actions.view.hidden?.(row) && (
            <Pressable
              className="size-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
              onPress={() => handleViewPress(row)}
              aria-label="View"
            >
              <Icon as={Eye} size={18} className="text-muted-foreground" />
            </Pressable>
          )}
          {actions?.edit && !actions.edit.hidden?.(row) && (
            <Pressable
              className="size-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
              onPress={() => handleEditPress(row)}
              aria-label="Edit"
            >
              <Icon as={Pencil} size={18} className="text-muted-foreground" />
            </Pressable>
          )}
          {actions?.delete && !actions.delete.hidden?.(row) && (
            <Pressable
              className="size-9 cursor-pointer items-center justify-center rounded-md hover:bg-red-100"
              onPress={() => handleDeletePress(row)}
              aria-label="Delete"
            >
              <Icon as={Trash2} size={18} className="text-red-600" />
            </Pressable>
          )}
          {actions?.custom?.map((action) => (
            <Pressable
              key={action.key}
              className="size-9 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
              onPress={() => action.onPress(row)}
              aria-label={action.label}
            >
              {action.icon}
            </Pressable>
          ))}
        </View>
      )}
      {overflowColumns.map((col) => (
        <View key={col.key} className="flex-row items-start gap-3">
          <Text className="min-w-20 font-semibold text-muted-foreground text-xs">
            {col.header}
          </Text>
          <View className="flex-1">
            <RncGridCellResolver
              col={col}
              row={row}
              rowIndex={rowIndex}
              editing={editing && col.editable !== false}
              colType={resolvedColumnTypes.get(col.key) ?? "string"}
            />
          </View>
        </View>
      ))}
      {expandableRender?.(row)}
    </View>
  )
}
