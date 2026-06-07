import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
  UseFormStateReturn,
} from "react-hook-form"

export type RncDateTimeFieldType =
  | "date"
  | "time"
  | "datetime"
  | "year"
  | "month"
  | "minutes"

export type TimeView = "hours" | "minutes" | "seconds"

export interface RncDateTimeFieldProps {
  id: string
  label?: string
  helperText?: string
  type: RncDateTimeFieldType
  defaultValue?: Date
  format?: string
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  readOnly?: boolean
  disableFuture?: boolean
  disablePast?: boolean
  maxDate?: Date | (() => Date)
  minDate?: Date | (() => Date)
  maxTime?: Date | (() => Date)
  minTime?: Date | (() => Date)
  placeholder?: string
  onlyPicker?: boolean
  shouldDisableDate?: (date: Date) => boolean
  shouldDisableTime?: (value: Date, view: TimeView) => boolean

  validationRules?: Omit<
    RegisterOptions<FieldValues, string>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >

  onChange?: (
    nv: Date | undefined,
    context: UseFormReturn,
    fieldContext: {
      field: ControllerRenderProps<FieldValues, string>
      fieldState: ControllerFieldState
      formState: UseFormStateReturn<FieldValues>
    }
  ) => Promise<void>
}
