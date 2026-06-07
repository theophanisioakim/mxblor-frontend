import { useId } from "react"
import { useFormContext } from "react-hook-form"
import type { RncCheckboxValue } from "../rnc-checkbox-model"
import type { RncCheckboxRenderProps } from "./rnc-checkbox-render-model"

export default function useRncCheckboxRender(props: RncCheckboxRenderProps) {
  const formContext = useFormContext()
  const formValue: RncCheckboxValue = formContext.getValues(
    props.fieldContext.field.name
  )
  const uniqueId = useId()
  const checkboxKey = `checkboxkey__${props.id}__${uniqueId}`
  const checkboxId = `checkboxid__${props.id}__${uniqueId}`
  const errorId = `${checkboxId}__error`
  const helperId = `${checkboxId}__helper`

  const isInvalid = props.fieldContext.fieldState.invalid
  const isDisabled = props.disabled || false
  const isReadOnly = props.readOnly || false
  const isRequired = props.required || false
  const label = props.label
  const helperText = props.helperText
  const errorMessage = props.fieldContext.fieldState.error?.message
  const hidden = props.hidden || false

  const nullable = props.nullable || false

  const checked: boolean | "indeterminate" =
    nullable && (formValue === undefined || formValue === null)
      ? "indeterminate"
      : !!formValue

  async function onCheckedChange() {
    if (isReadOnly || isDisabled) return

    let newValue: RncCheckboxValue
    if (nullable) {
      if (checked === "indeterminate") {
        newValue = true
      } else if (checked) {
        newValue = false
      } else {
        newValue = undefined
      }
    } else {
      newValue = !formValue
    }

    props.fieldContext.field.onChange(newValue)

    if (props.onChange) {
      await props.onChange(newValue, formContext, props.fieldContext)
    }
  }

  return {
    formContext,
    formValue,
    checkboxKey,
    checkboxId,
    errorId,
    helperId,
    isDisabled,
    isInvalid,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
    checked,
    onCheckedChange,
  }
}
