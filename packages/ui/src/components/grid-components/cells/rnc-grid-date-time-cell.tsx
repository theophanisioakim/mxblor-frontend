import { RncDateTimeField } from "../../form-components/rnc-date-time-field/rnc-date-time-field"
import { Text } from "../../primitives/text"

interface RncGridDateTimeCellProps {
  id: string
  value: Date | string | undefined
  editing: boolean
  dateType?: "date" | "time" | "datetime"
}

function formatDateValue(
  value: Date | string | undefined,
  dateType: "date" | "time" | "datetime"
): string {
  if (value == null) return ""
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime()))
    return typeof value === "string" ? value : ""

  switch (dateType) {
    case "time":
      return date.toLocaleTimeString()
    case "datetime":
      return date.toLocaleString()
    default:
      return date.toLocaleDateString()
  }
}

function coerceToDate(value: Date | string | undefined): Date | undefined {
  if (value == null) return undefined
  if (value instanceof Date) return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function RncGridDateTimeCell({
  id,
  value,
  editing,
  dateType = "date",
}: Readonly<RncGridDateTimeCellProps>) {
  if (editing) {
    return (
      <RncDateTimeField
        id={id}
        type={dateType}
        defaultValue={coerceToDate(value)}
      />
    )
  }

  return (
    <Text className="text-foreground text-sm">
      {formatDateValue(value, dateType)}
    </Text>
  )
}
