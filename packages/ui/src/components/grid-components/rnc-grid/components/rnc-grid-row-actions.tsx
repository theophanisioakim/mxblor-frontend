import { cn } from "@workspace/ui/lib/utils"
import { useRncFormContext } from "../../../form-components/rnc-form/rnc-form-context"
import {
  Check,
  Eye,
  Icon,
  Pencil,
  Trash2,
  Undo2,
  X,
} from "../../../primitives/icon"
import { Pressable } from "../../../primitives/pressable"
import type { PressableEvent } from "../../../primitives/pressable.shared"
import { useRncGridContext } from "../rnc-grid-context"

const ICON_BTN = "size-[30px] items-center justify-center rounded-md"

function RncGridSaveButton() {
  const { submit } = useRncFormContext()
  return (
    <Pressable
      className={cn(ICON_BTN, "cursor-pointer hover:bg-green-100")}
      onPress={() => submit()}
      aria-label="Save"
    >
      <Icon as={Check} size={16} className="text-green-600" />
    </Pressable>
  )
}

export function RncGridRowActions<T>({
  row,
  rowIndex,
  editing,
}: Readonly<{ row: T; rowIndex: number; editing: boolean }>) {
  const {
    hasActions,
    hasOverflow,
    actionsWidth,
    rowClickable,
    addEditMode,
    inlineEdit,
    actions,
    handleViewPress,
    handleEditPress,
    handleDeletePress,
    cancelEditingRow,
    keyExtractor,
    isRowDirty,
    discardRow,
    isDraftRow,
  } = useRncGridContext()

  const isEditAll = addEditMode === "inline" && inlineEdit?.mode === "all"
  if (!hasActions && !isEditAll) return null
  if (hasOverflow && !isEditAll) return null

  const stopPress = rowClickable
    ? (e?: PressableEvent) => e?.stopPropagation?.()
    : undefined
  const key = keyExtractor(row, rowIndex)

  // In mode 'all', show per-row discard when dirty
  if (isEditAll) {
    const dirty = isRowDirty(key)
    return (
      <Pressable
        className="shrink-0 flex-row items-center gap-1 self-center"
        style={{ width: actionsWidth || 30 }}
        onPress={stopPress}
      >
        {dirty && (
          <Pressable
            className={cn(ICON_BTN, "cursor-pointer hover:bg-amber-100")}
            onPress={() => discardRow(key)}
            aria-label="Discard"
          >
            <Icon as={Undo2} size={16} className="text-amber-700" />
          </Pressable>
        )}
      </Pressable>
    )
  }

  if (!hasActions) return null

  // In mode 'row', show save/cancel when editing
  if (editing && addEditMode === "inline") {
    return (
      <Pressable
        className="shrink-0 flex-row items-center gap-1 self-center"
        style={{ width: actionsWidth }}
        onPress={stopPress}
      >
        <RncGridSaveButton />
        <Pressable
          className={cn(ICON_BTN, "cursor-pointer hover:bg-accent")}
          onPress={() => cancelEditingRow(row, rowIndex)}
          aria-label="Cancel"
        >
          <Icon as={X} size={16} className="text-muted-foreground" />
        </Pressable>
      </Pressable>
    )
  }

  return (
    <Pressable
      className="shrink-0 flex-row items-center gap-1 self-center"
      style={{ width: actionsWidth }}
      onPress={stopPress}
    >
      {actions?.view && !isDraftRow(row) && !actions.view.hidden?.(row) && (
        <Pressable
          className={cn(ICON_BTN, "cursor-pointer hover:bg-accent")}
          onPress={() => handleViewPress(row)}
          aria-label="View"
        >
          <Icon as={Eye} size={16} className="text-muted-foreground" />
        </Pressable>
      )}
      {actions?.edit && !isDraftRow(row) && !actions.edit.hidden?.(row) && (
        <Pressable
          className={cn(
            ICON_BTN,
            actions.edit.disabled?.(row)
              ? "opacity-50"
              : "cursor-pointer hover:bg-accent"
          )}
          onPress={() => handleEditPress(row)}
          disabled={actions.edit.disabled?.(row)}
          aria-label="Edit"
        >
          <Icon as={Pencil} size={16} className="text-muted-foreground" />
        </Pressable>
      )}
      {actions?.delete && !isDraftRow(row) && !actions.delete.hidden?.(row) && (
        <Pressable
          className={cn(
            ICON_BTN,
            actions.delete.disabled?.(row)
              ? "opacity-50"
              : "cursor-pointer hover:bg-red-100"
          )}
          onPress={() => handleDeletePress(row)}
          disabled={actions.delete.disabled?.(row)}
          aria-label="Delete"
        >
          <Icon as={Trash2} size={16} className="text-red-600" />
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
    </Pressable>
  )
}
