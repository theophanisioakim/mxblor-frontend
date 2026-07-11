import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
  UseFormStateReturn,
} from "react-hook-form"

export type RncTranslationLabelFieldContext = {
  field: ControllerRenderProps<FieldValues, string>
  fieldState: ControllerFieldState
  formState: UseFormStateReturn<FieldValues>
}

/** What the closed field shows for the label it holds. */
export type RncTranslationLabelDisplay = "default" | "current" | "all"

/** Which languages have to be filled in before the label can be saved. */
export type RncTranslationLabelRequiredLanguages = "default" | "all"

/**
 * A form field whose value is a **translation label id** (a uuid), not text.
 * The texts of every configured language are edited in a modal; the enclosing
 * form only ever submits the resulting label id.
 */
export interface RncTranslationLabelProps {
  id: string
  /**
   * Key namespace that scopes every label this field reads or writes,
   * e.g. `"mxblor.expense.name"`. Autocomplete never leaves it.
   */
  keyNamespace: string
  /** What the trigger shows. @default "default" */
  display?: RncTranslationLabelDisplay
  /** Which languages are mandatory when `required`. @default "default" */
  requiredLanguages?: RncTranslationLabelRequiredLanguages
  /** Show the "use the global namespace" toggle in the modal. @default false */
  allowGlobalNamespace?: boolean
  /** Namespace used while that toggle is on. @default "global" */
  globalNamespace?: string

  /** Display */
  label?: string
  helperText?: string
  placeholder?: string
  variant?: "underlined" | "outline" | "rounded"
  size?: "lg" | "md" | "sm"

  /** The label id the field starts with. */
  defaultValue?: string

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

  onChange?: (
    labelId: string | undefined,
    context: UseFormReturn,
    fieldContext: RncTranslationLabelFieldContext
  ) => Promise<void>
}
