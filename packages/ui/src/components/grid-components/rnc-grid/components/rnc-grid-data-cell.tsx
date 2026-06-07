import { View } from "../../../primitives/view"
import { RncGridCellResolver } from "../../cells/rnc-grid-cell-resolver"
import { useRncGridContext } from "../rnc-grid-context"
import type { RncGridColumn } from "../rnc-grid-model"

export function RncGridDataCell<T, S>({
  col,
  row,
  rowIndex,
  editing = false,
}: Readonly<{
  col: RncGridColumn<T, S>
  row: T
  rowIndex: number
  editing?: boolean
}>) {
  const { resolvedColumnTypes } = useRncGridContext()
  const colType = resolvedColumnTypes.get(col.key) ?? "string"

  return (
    <View
      className="pr-3 pl-1"
      style={{
        flexGrow: col.minWidth ?? 120,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: col.minWidth,
      }}
    >
      <RncGridCellResolver
        col={col}
        row={row}
        rowIndex={rowIndex}
        editing={editing && col.editable !== false}
        colType={colType}
      />
    </View>
  )
}
