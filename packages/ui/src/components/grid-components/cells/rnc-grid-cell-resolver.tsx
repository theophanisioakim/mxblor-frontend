import type {
  RncGridColumn,
  RncGridColumnType,
} from "../rnc-grid/rnc-grid-model"
import { RncGridBooleanCell } from "./rnc-grid-boolean-cell"
import { RncGridDateTimeCell } from "./rnc-grid-date-time-cell"
import { RncGridNumberCell } from "./rnc-grid-number-cell"
import { RncGridStringCell } from "./rnc-grid-string-cell"

export function inferColumnType(value: unknown): RncGridColumnType {
  if (typeof value === "boolean") return "boolean"
  if (typeof value === "number") return "number"
  if (value instanceof Date) return "date"
  return "string"
}

export function resolveColumnType<T, S>(
  col: RncGridColumn<T, S>,
  data: T[]
): RncGridColumnType {
  if (col.type) return col.type
  for (const row of data) {
    const value = (row as Record<string, unknown>)[col.key]
    if (value != null) return inferColumnType(value)
  }
  return "string"
}

interface RncGridCellResolverProps<T, S> {
  col: RncGridColumn<T, S>
  row: T
  rowIndex: number
  editing: boolean
  colType: RncGridColumnType
}

export function RncGridCellResolver<T, S>({
  col,
  row,
  rowIndex,
  editing,
  colType,
}: Readonly<RncGridCellResolverProps<T, S>>) {
  if (!editing && col.renderCell) {
    return <>{col.renderCell(row, rowIndex)}</>
  }

  if (editing && col.renderEditCell) {
    return <>{col.renderEditCell(row, rowIndex)}</>
  }

  const value = (row as Record<string, unknown>)[col.key]

  switch (colType) {
    case "boolean":
      return (
        <RncGridBooleanCell
          id={col.key}
          value={value as boolean | null | undefined}
          editing={editing}
          nullable={col.nullable !== false}
        />
      )
    case "number":
      return (
        <RncGridNumberCell
          id={col.key}
          value={Number(value) || 0}
          editing={editing}
        />
      )
    case "date":
    case "datetime":
    case "time": {
      const dateType =
        colType === "datetime"
          ? "datetime"
          : colType === "time"
            ? "time"
            : "date"
      return (
        <RncGridDateTimeCell
          id={col.key}
          value={value as Date | string | undefined}
          editing={editing}
          dateType={dateType}
        />
      )
    }
    default:
      return (
        <RncGridStringCell
          id={col.key}
          value={value != null ? String(value) : ""}
          editing={editing}
        />
      )
  }
}
