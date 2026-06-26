import { cn } from "@workspace/ui/lib/utils"
import { useMemo } from "react"
import type { UseFormReturn } from "react-hook-form"
import { RncForm } from "../../../form-components/rnc-form/rnc-form"
import { Checkbox } from "../../../primitives/checkbox"
import { Pressable } from "../../../primitives/pressable"
import type { PressableEvent } from "../../../primitives/pressable.shared"
import { View } from "../../../primitives/view"
import { useRncGridContext } from "../rnc-grid-context"
import { RncGridDataCell } from "./rnc-grid-data-cell"
import { RncGridExpandChevron } from "./rnc-grid-expand-chevron"
import { RncGridExpandedDetail } from "./rnc-grid-expanded-detail"
import { RncGridRowActions } from "./rnc-grid-row-actions"

export function RncGridRow<T>({
  row,
  rowIndex,
}: Readonly<{ row: T; rowIndex: number }>) {
  const {
    keyExtractor,
    selectable,
    rowClickable,
    isRowSelected,
    toggleRowSelection,
    isRowEditing,
    id,
    columns,
    visibleColumns,
    saveEditingRow,
    inlineEdit,
    registerRowForm,
    handleRowFormChange,
    handleDraftFormChange,
    isDraftRow,
  } = useRncGridContext()

  const key = keyExtractor(row, rowIndex)
  const selected = selectable && isRowSelected(row, rowIndex)
  const editing = isRowEditing(row, rowIndex)
  const isEditAll = inlineEdit?.mode === "all"
  const draftRow = isDraftRow(row)
  const clickable = selectable && rowClickable

  const rowContent = (
    <Pressable
      className={cn(
        "flex-row items-start px-3 py-2",
        selected ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted",
        clickable && "cursor-pointer"
      )}
      onPress={clickable ? () => toggleRowSelection(row, rowIndex) : undefined}
    >
      {selectable && (
        <Pressable
          className="w-10 shrink-0 items-center justify-center self-center"
          onPress={
            clickable
              ? (e?: PressableEvent) => e?.stopPropagation?.()
              : undefined
          }
        >
          <Checkbox
            checked={isRowSelected(row, rowIndex)}
            onCheckedChange={() => toggleRowSelection(row, rowIndex)}
          />
        </Pressable>
      )}
      <RncGridRowActions row={row} rowIndex={rowIndex} editing={editing} />
      {visibleColumns.map((col) => (
        <RncGridDataCell
          key={col.key}
          col={col}
          row={row}
          rowIndex={rowIndex}
          editing={editing}
        />
      ))}
      <RncGridExpandChevron rowKey={key} />
    </Pressable>
  )

  const expandedDetail = <RncGridExpandedDetail row={row} rowIndex={rowIndex} />

  const editAllHandlers = isEditAll
    ? {
        onLoad: async (methods: UseFormReturn) => registerRowForm(key, methods),
        onValuesChange: async () => handleRowFormChange(key),
      }
    : {}

  const draftRowHandlers =
    draftRow && editing && !isEditAll
      ? {
          onLoad: async (methods: UseFormReturn) =>
            registerRowForm(key, methods),
          onValuesChange: async () => handleDraftFormChange(key),
        }
      : {}

  const rowDefaultValues = useMemo(() => {
    const values: Record<string, unknown> = {}
    for (const col of columns) {
      if (col.editable !== false) {
        const value = (row as Record<string, unknown>)[col.key]
        values[col.key] = value ?? undefined
      }
    }
    return values
  }, [columns, row])

  return (
    <View className="border-border border-t">
      {editing ? (
        <RncForm
          id={`${id}-row-${key}`}
          mode={isEditAll ? "onTouched" : undefined}
          onSubmit={async (formData) =>
            saveEditingRow(row, rowIndex, formData as Record<string, unknown>)
          }
          defaultValues={rowDefaultValues}
          {...editAllHandlers}
          {...draftRowHandlers}
          unstyled
        >
          {rowContent}
          {expandedDetail}
        </RncForm>
      ) : (
        <>
          {rowContent}
          {expandedDetail}
        </>
      )}
    </View>
  )
}
