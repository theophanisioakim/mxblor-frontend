import { ChevronDown, ChevronUp, Icon } from "../../../primitives/icon"
import { Pressable } from "../../../primitives/pressable"
import type { PressableEvent } from "../../../primitives/pressable.shared"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridExpandChevron({
  rowKey,
}: Readonly<{ rowKey: string | number }>) {
  const { hasOverflow, isRowExpanded, toggleRowExpanded, rowClickable } =
    useRncGridContext()

  if (!hasOverflow) return null

  const expanded = isRowExpanded(rowKey)
  return (
    <Pressable
      className="size-8 cursor-pointer items-center justify-center rounded-md hover:bg-accent"
      onPress={(e?: PressableEvent) => {
        if (rowClickable) e?.stopPropagation?.()
        toggleRowExpanded(rowKey)
      }}
      aria-label={expanded ? "Collapse details" : "Expand details"}
    >
      <Icon
        as={expanded ? ChevronUp : ChevronDown}
        size={16}
        className="text-muted-foreground"
      />
    </Pressable>
  )
}
