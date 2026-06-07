import { RncCheckbox } from "../../form-components/rnc-checkbox/rnc-checkbox"
import { Check, CircleOff, Icon, Minus } from "../../primitives/icon"

interface RncGridBooleanCellProps {
  id: string
  value: boolean | null | undefined
  editing: boolean
  nullable?: boolean
}

export function RncGridBooleanCell({
  id,
  value,
  editing,
  nullable = true,
}: Readonly<RncGridBooleanCellProps>) {
  if (editing) {
    return (
      <RncCheckbox
        id={id}
        defaultValue={value ?? undefined}
        nullable={nullable}
      />
    )
  }

  if (value === true)
    return <Icon as={Check} size={14} className="text-green-600" />
  if (value === false)
    return <Icon as={Minus} size={14} className="text-muted-foreground" />
  return <Icon as={CircleOff} size={14} className="text-muted-foreground/50" />
}
