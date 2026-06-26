import { Checkbox } from "../../../primitives/checkbox"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"
import { RncGridHeaderCell } from "./rnc-grid-header-cell"

export function RncGridHeader() {
  const {
    selectable,
    singleSelection,
    allSelected,
    someSelected,
    toggleSelectAll,
    hasActions,
    hasOverflow,
    actionsWidth,
    visibleColumns,
    addEditMode,
    inlineEdit,
  } = useRncGridContext()

  let selectAllChecked: boolean | "indeterminate" = false
  if (allSelected) selectAllChecked = true
  else if (someSelected) selectAllChecked = "indeterminate"

  const showActionsSpacer =
    (hasActions || actionsWidth > 0) &&
    (!hasOverflow || (addEditMode === "inline" && inlineEdit?.mode === "all"))

  return (
    <View className="flex-row items-center rounded-t-lg bg-muted px-3 py-2">
      {selectable && (
        <View className="w-10 shrink-0 items-center justify-center">
          {!singleSelection && (
            <Checkbox
              checked={selectAllChecked}
              onCheckedChange={toggleSelectAll}
            />
          )}
        </View>
      )}
      {showActionsSpacer && (
        <View
          className="shrink-0 flex-row items-center"
          style={{ width: actionsWidth }}
        />
      )}
      {visibleColumns.map((col) => (
        <RncGridHeaderCell key={col.key} col={col} />
      ))}
      {hasOverflow && <View className="w-8" />}
    </View>
  )
}
