import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
  UseFormStateReturn,
} from "react-hook-form"

export type RncCheckboxValue = boolean | undefined

export interface RncCheckboxProps {
  id: string
  label?: string
  helperText?: string
  defaultValue?: RncCheckboxValue
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
    nv: RncCheckboxValue,
    context: UseFormReturn,
    fieldContext: {
      field: ControllerRenderProps<FieldValues, string>
      fieldState: ControllerFieldState
      formState: UseFormStateReturn<FieldValues>
    }
  ) => Promise<void>
}
