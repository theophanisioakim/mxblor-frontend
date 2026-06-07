import { useId } from "react"
import { useFormContext } from "react-hook-form"
import type { RncSwitchValue } from "../rnc-switch-model"
import type { RncSwitchRenderProps } from "./rnc-switch-render-model"

export default function useRncSwitchRender(props: RncSwitchRenderProps) {
  const formContext = useFormContext()
  const formValue: RncSwitchValue = formContext.getValues(
    props.fieldContext.field.name
  )
  const uniqueId = useId()
  const switchKey = `switchkey__${props.id}__${uniqueId}`
  const switchId = `switchid__${props.id}__${uniqueId}`
  const errorId = `${switchId}__error`
  const helperId = `${switchId}__helper`

  const isInvalid = props.fieldContext.fieldState.invalid
  const isDisabled = props.disabled || false
  const isReadOnly = props.readOnly || false
  const isRequired = props.required || false
  const label = props.label
  const helperText = props.helperText
  const errorMessage = props.fieldContext.fieldState.error?.message
  const hidden = props.hidden || false

  const nullable = props.nullable || false

  const isIndeterminate =
    nullable && (formValue === undefined || formValue === null)
  const checked = isIndeterminate ? false : !!formValue

  async function onCheckedChange() {
    if (isReadOnly || isDisabled) return

    let newValue: RncSwitchValue
    if (nullable) {
      if (isIndeterminate) {
        newValue = true
      } else if (formValue === true) {
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
    switchKey,
    switchId,
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
    isIndeterminate,
    onCheckedChange,
  }
}
