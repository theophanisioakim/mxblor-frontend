import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
  UseFormStateReturn,
} from "react-hook-form"

export type RncSwitchValue = boolean | undefined

export interface RncSwitchProps {
  id: string
  label?: string
  helperText?: string
  defaultValue?: RncSwitchValue
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  readOnly?: boolean
  nullable?: boolean

  validationRules?: Omit<
    RegisterOptions<FieldValues, string>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >

  onChange?: (
    nv: RncSwitchValue,
    context: UseFormReturn,
    fieldContext: {
      field: ControllerRenderProps<FieldValues, string>
      fieldState: ControllerFieldState
      formState: UseFormStateReturn<FieldValues>
    }
  ) => Promise<void>
}
