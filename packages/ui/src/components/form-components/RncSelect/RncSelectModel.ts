import type { ComponentType } from "react"
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
  UseFormStateReturn,
} from "react-hook-form"

export interface RncSelectOption {
  id: string | number
  label: string
  filterString?: string
  /** A lucide icon component (rendered through `@workspace/ui`'s `Icon`). */
  icon?: ComponentType<{
    size?: string | number
    color?: string
    className?: string
  }>
}

export type RncSelectFieldContext = {
  field: ControllerRenderProps<FieldValues, string>
  fieldState: ControllerFieldState
  formState: UseFormStateReturn<FieldValues>
}

/** Data source — if both are provided, optionsLoader takes priority */
interface RncSelectDataSource {
  options?: RncSelectOption[]
  optionsLoader?: (context: UseFormReturn) => Promise<RncSelectOption[]>
  watchFields?: string[]
  uniqueOptions?: boolean
}

/** Props specific to multiple selection mode */
interface RncSelectMultipleProps
  extends RncSelectBaseProps,
    RncSelectDataSource {
  multiple: true
  limitTags?: number
  defaultValue?: (string | number)[]
  onChange?: (
    nv: (string | number)[],
    context: UseFormReturn,
    fieldContext: RncSelectFieldContext
  ) => Promise<void>
}

/** Props specific to single selection mode */
interface RncSelectSingleProps extends RncSelectBaseProps, RncSelectDataSource {
  multiple?: false
  defaultValue?: string | number
  onChange?: (
    nv: string | number | undefined,
    context: UseFormReturn,
    fieldContext: RncSelectFieldContext
  ) => Promise<void>
}

interface RncSelectBaseProps {
  id: string
  searchable?: boolean
  variant?: "underlined" | "outline" | "rounded"
  size?: "lg" | "md" | "sm"

  /** Display */
  label?: string
  helperText?: string
  placeholder?: string
  searchPlaceholder?: string
  /** Max characters to show for a selected option label before truncating with "..." */
  selectedMaxChars?: number

  /** State */
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  readOnly?: boolean

  /** Validation — https://react-hook-form.com/docs/useform/register#options */
  validationRules?: Omit<
    RegisterOptions<FieldValues, string>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >
}

export type RncSelectProps = RncSelectSingleProps | RncSelectMultipleProps
