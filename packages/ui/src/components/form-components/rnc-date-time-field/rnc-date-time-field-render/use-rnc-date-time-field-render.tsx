import { useId } from "react"
import { useFormContext } from "react-hook-form"
import {
  dateToInputString,
  getHtmlInputType,
  inputStringToDate,
  resolveDate,
} from "./date-utils"
import type { RncDateTimeFieldRenderProps } from "./rnc-date-time-field-render-model"

/**
 * Platform-free hook shared by both render variants. It does NOT compute the
 * displayed `inputValue` — that is platform-specific (web uses the HTML input
 * string, native a human-readable string) and lives in each render file.
 */
export default function useRncDateTimeFieldRender(
  props: RncDateTimeFieldRenderProps
) {
  const formContext = useFormContext()
  const formValue: Date | undefined = formContext.getValues(
    props.fieldContext.field.name
  )
  const uniqueId = useId()
  const inputKey = `datetimeinputkey__${props.id}__${uniqueId}`
  const inputId = `datetimeinputid__${props.id}__${uniqueId}`
  const errorId = `${inputId}__error`
  const helperId = `${inputId}__helper`

  const isInvalid = props.fieldContext.fieldState.invalid
  const isDisabled = props.disabled || false
  const isReadOnly = props.readOnly || false
  const isRequired = props.required || false
  const label = props.label
  const helperText = props.helperText
  const errorMessage = props.fieldContext.fieldState.error?.message
  const hidden = props.hidden || false

  const htmlInputType = getHtmlInputType(props.type)

  const resolvedMinDate = resolveDate(props.minDate)
  const resolvedMaxDate = resolveDate(props.maxDate)
  const resolvedMinTime = resolveDate(props.minTime)
  const resolvedMaxTime = resolveDate(props.maxTime)

  const now = new Date()
  const effectiveMinDate =
    props.disablePast && !resolvedMinDate ? now : resolvedMinDate
  const effectiveMaxDate =
    props.disableFuture && !resolvedMaxDate ? now : resolvedMaxDate

  const minSource = effectiveMinDate ?? resolvedMinTime
  const minInputValue = minSource
    ? dateToInputString(minSource, props.type)
    : undefined
  const maxSource = effectiveMaxDate ?? resolvedMaxTime
  const maxInputValue = maxSource
    ? dateToInputString(maxSource, props.type)
    : undefined

  const placeholder =
    props.placeholder ||
    {
      date: "YYYY-MM-DD",
      time: "HH:mm",
      datetime: "YYYY-MM-DD HH:mm",
      year: "YYYY",
      month: "YYYY-MM",
      minutes: "mm",
    }[props.type]

  async function onChangeValue(text: string) {
    const newDate = inputStringToDate(text, props.type, formValue)
    props.fieldContext.field.onChange(newDate)

    if (props.onChange) {
      await props.onChange(newDate, formContext, props.fieldContext)
    }
  }

  function onBlur() {
    props.fieldContext.field.onBlur()
  }

  return {
    formContext,
    formValue,
    inputKey,
    inputId,
    errorId,
    helperId,
    isInvalid,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
    htmlInputType,
    minInputValue,
    maxInputValue,
    placeholder,
    onChangeValue,
    onBlur,
  }
}
