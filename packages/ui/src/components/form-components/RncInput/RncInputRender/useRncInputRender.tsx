import { useEffect, useId, useState } from "react"
import { useFormContext } from "react-hook-form"
import type { InputSelection } from "../../../primitives/input"
import type { RncInputRenderProps } from "./RncInputRenderModel"

type FieldValue = string | number | undefined

function resolveKeyboardType(
  props: RncInputRenderProps
): NonNullable<RncInputRenderProps["keyboardType"]> {
  if (props.type !== "number") return "default"
  return props.numberValidationRules?.decimalPlaces === 0
    ? "number-pad"
    : "decimal-pad"
}

function resolveAutoCapitalize(
  props: RncInputRenderProps
): NonNullable<RncInputRenderProps["autoCapitalize"]> {
  return props.type === "password" ? "none" : "sentences"
}

function resolveAutoComplete(
  props: RncInputRenderProps
): NonNullable<RncInputRenderProps["autoComplete"]> {
  return props.type === "password" ? "password" : "off"
}

export default function useRncInputRender(props: RncInputRenderProps) {
  // Variables and defaults
  const formContext = useFormContext()
  const formValue: FieldValue = formContext.getValues(
    props.fieldContext.field.name
  )
  const uniqueId = useId()
  const inputKey = `inputkey__${props.id}__${uniqueId}`
  const inputId = `inputid__${props.id}__${uniqueId}`
  const errorId = `${inputId}__error`
  const helperId = `${inputId}__helper`

  const variant = props.variant || "rounded"
  const size = props.size || "md"
  const placeholder = props.placeholder || ""
  const type: "text" | "password" =
    !props.type || ["integer", "number", "text"].includes(props.type)
      ? "text"
      : "password"
  const keyboardType = props.keyboardType ?? resolveKeyboardType(props)
  const autoCapitalize = props.autoCapitalize ?? resolveAutoCapitalize(props)
  const autoComplete = props.autoComplete ?? resolveAutoComplete(props)
  const isInvalid = props.fieldContext.fieldState.invalid
  const isDisabled = props.disabled || false
  const isReadOnly = props.readOnly || false
  const isRequired = props.required || false
  const label = props.label
  const helperText = props.helperText
  const errorMessage = props.fieldContext.fieldState.error?.message
  const hidden = props.hidden || false
  const thousandsSeparator =
    props.numberValidationRules?.thousandsSeparator || ","
  const decimalSeparator = props.numberValidationRules?.decimalSeparator || "."
  const maxLength = props.textValidationRules?.maxLength
  const [previousFormValue, setPreviousFormValue] =
    useState<FieldValue>(formValue)

  const [inputValue, setInputValue] = useState<string>(
    formValue === undefined || formValue === null ? "" : String(formValue)
  )
  const [selection, setSelection] = useState<InputSelection>({
    start: inputValue.length,
    end: inputValue.length,
  })
  const [showPassword, setShowPassword] = useState(false)

  //Validation of props
  if (props.type !== "number" && props.numberValidationRules) {
    throw new Error(
      "Number validation rules can only be used with type 'number'."
    )
  }
  if (thousandsSeparator === decimalSeparator) {
    throw new Error(
      "Thousands separator and decimal separator cannot be the same character."
    )
  }
  if (
    props.numberValidationRules?.fixedDecimalPlaces &&
    props.numberValidationRules?.decimalPlaces === undefined
  ) {
    throw new Error(
      "When using fixedDecimalPlaces, decimalPlaces must be defined."
    )
  }

  // Sync inputValue when formValue changes externally (e.g., form reset / programmatic
  // updates). onChangeText/onBlur are recreated each render and would loop if listed as deps.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run only on external formValue changes.
  useEffect(() => {
    async function syncInputValue() {
      // Only update if the values actually differ to avoid unnecessary re-renders
      if (formValue !== previousFormValue) {
        const newInputValue =
          formValue === undefined || formValue === null ? "" : String(formValue)
        await onChangeText(newInputValue, true)
        await onBlur()
      }
    }
    syncInputValue()
  }, [formValue])

  function onSelectionChange(e: {
    nativeEvent?: { selection?: InputSelection }
  }) {
    if (e?.nativeEvent?.selection !== undefined) {
      setSelection(e.nativeEvent.selection)
    }
  }

  async function onBlur() {
    // Remove trailing decimal separator
    if (
      formValue &&
      typeof formValue === "string" &&
      formValue.endsWith(decimalSeparator) &&
      props.type === "number"
    ) {
      const newValue = formValue.slice(0, -1)
      setPreviousFormValue(Number(newValue))
      props.fieldContext.field.onChange(Number(newValue))
      setInputValue(newValue)
    }

    // Fix to fixed decimal places if needed
    if (
      props.type === "number" &&
      props.numberValidationRules?.fixedDecimalPlaces &&
      props.numberValidationRules?.decimalPlaces !== undefined &&
      typeof formValue === "number"
    ) {
      const newValue = formValue.toFixed(
        props.numberValidationRules.decimalPlaces
      )

      const formatNumberStringResult = formatNumberString(newValue)

      const newInputValue =
        formatNumberStringResult.nv === undefined ||
        formatNumberStringResult.nv === null
          ? ""
          : String(formatNumberStringResult.nv)
      setInputValue(newInputValue)
    }

    props.fieldContext.field.onBlur()
    if (props.onBlur) {
      await props.onBlur(formValue, formContext, props.fieldContext)
    }
  }

  async function onChangeText(nv: string, dontCallOnChangeText?: boolean) {
    let newSelection = selection

    const singleModification = isSingleModification(newSelection)
    const deleteKeyPressed = isDeleteKeyPressed(nv, newSelection)

    const handleBackspaceOnThousandsSeparatorResult =
      handleBackspaceOnThousandsSeparator(
        nv,
        newSelection,
        singleModification,
        deleteKeyPressed
      )
    nv = handleBackspaceOnThousandsSeparatorResult.nv
    newSelection = handleBackspaceOnThousandsSeparatorResult.selection

    const handleDeleteOnThousandsSeparatorResult =
      handleDeleteOnThousandsSeparator(
        nv,
        newSelection,
        singleModification,
        deleteKeyPressed
      )
    nv = handleDeleteOnThousandsSeparatorResult.nv
    newSelection = handleDeleteOnThousandsSeparatorResult.selection

    const formatNumberStringResult = formatNumberString(nv)

    const newInputValue =
      formatNumberStringResult.nv === undefined ||
      formatNumberStringResult.nv === null
        ? ""
        : String(formatNumberStringResult.nv)
    calculateCursorPosition(
      newSelection,
      newInputValue,
      singleModification,
      deleteKeyPressed
    )
    setInputValue(newInputValue)

    setPreviousFormValue(formatNumberStringResult.newValue)
    props.fieldContext.field.onChange(formatNumberStringResult.newValue)

    if (
      props.onChangeText &&
      formatNumberStringResult.isValueValid &&
      !dontCallOnChangeText
    ) {
      await props.onChangeText(
        formatNumberStringResult.newValue,
        formContext,
        props.fieldContext
      )
    }
  }

  function isDeleteKeyPressed(nv: string, selection: InputSelection): boolean {
    return (
      nv.length > 0 &&
      isSingleModification(selection) &&
      nv.substring(0, selection.start) ===
        inputValue.substring(0, selection.start) &&
      inputValue.length > nv.length
    )
  }

  function isSingleModification(selection: InputSelection): boolean {
    return selection.start === selection.end
  }

  function handleBackspaceOnThousandsSeparator(
    nv: string,
    selection: InputSelection,
    singleModification: boolean,
    deleteKeyPressed: boolean
  ) {
    if (
      singleModification &&
      !deleteKeyPressed &&
      nv.length > 0 &&
      inputValue.at(selection.start - 1) === thousandsSeparator &&
      inputValue.length > nv.length &&
      props.numberValidationRules?.hasThousandsSeparator
    ) {
      nv =
        nv.substring(0, selection.start - 2) +
        nv.substring(selection.start - 1, nv.length)
      const newCursorPosition = selection.start - 1
      selection = { start: newCursorPosition, end: newCursorPosition }
    }
    return { nv, selection }
  }
  function formatNumberString(nv: string): {
    newValue?: number | string
    nv: string
    isValueValid: boolean
  } {
    if (props.type !== "number") {
      return { newValue: nv, nv, isValueValid: true }
    }

    const sign = nv.trim().startsWith("-") ? "-" : ""
    if (nv.split(decimalSeparator).length > 2) {
      nv = inputValue
    }
    const parts = nv.split(decimalSeparator)
    const integerPart = parts[0]?.replace(/\D/g, "") || ""
    let decimalPart = parts[1]?.replace(/\D/g, "") || ""
    if (props.numberValidationRules?.decimalPlaces !== undefined) {
      decimalPart = decimalPart.slice(
        0,
        props.numberValidationRules.decimalPlaces
      )
    }
    let normalizedInteger =
      integerPart === "" && nv.includes(decimalSeparator) ? "0" : integerPart

    if (props.numberValidationRules?.hasThousandsSeparator) {
      // Remove existing thousands separators from integer part
      const rawIntegerPart = normalizedInteger
        .split(thousandsSeparator)
        .join("")
      // Re-insert thousands separators
      normalizedInteger = rawIntegerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousandsSeparator
      )
    }

    const hasDot = nv.includes(decimalSeparator)
    const isTrailingDot = hasDot && decimalPart.length === 0

    let signPrefix = sign
    if (props.numberValidationRules?.positiveOnly) {
      signPrefix = ""
    } else if (
      props.numberValidationRules?.negativeOnly &&
      integerPart.length > 0
    ) {
      signPrefix = "-"
    }

    const decimalDot =
      hasDot && props.numberValidationRules?.decimalPlaces !== 0
        ? decimalSeparator
        : ""

    nv = `${signPrefix}${normalizedInteger}${decimalDot}${decimalPart}`

    const { newValue, isValueValid } = evaluateNumberValue(nv, isTrailingDot)
    return { newValue, nv, isValueValid }
  }

  function evaluateNumberValue(
    nv: string,
    isTrailingDot: boolean
  ): { newValue?: number | string; isValueValid: boolean } {
    const numeric = nv
      .replaceAll(thousandsSeparator, "")
      .replaceAll(decimalSeparator, ".")

    let isValueValid = true
    let newValue: number | string | undefined
    if (nv === "") {
      newValue = undefined
    } else if (nv === "-") {
      newValue = "-"
      isValueValid = false
    } else if (isTrailingDot) {
      newValue = nv
      isValueValid = false
    } else {
      newValue = Number(numeric)
    }

    if (numeric === String(formValue)) {
      isValueValid = false
    }
    return { newValue, isValueValid }
  }

  function handleDeleteOnThousandsSeparator(
    nv: string,
    selection: InputSelection,
    singleModification: boolean,
    deleteKeyPressed: boolean
  ) {
    if (
      singleModification &&
      deleteKeyPressed &&
      inputValue.at(selection.start) === thousandsSeparator &&
      inputValue.length > nv.length &&
      props.numberValidationRules?.hasThousandsSeparator
    ) {
      nv =
        nv.substring(0, selection.start) +
        nv.substring(selection.start + 1, nv.length)
      const newCursorPosition = selection.start + 1
      selection = { start: newCursorPosition, end: newCursorPosition }
    }
    return { nv, selection }
  }

  function calculateCursorPosition(
    selection: InputSelection,
    newInputValue: string,
    singleModification: boolean,
    deleteKeyPressed: boolean
  ) {
    const moveCusorSpots = newInputValue.length - inputValue.length
    const newCursorPositionBeforeAdjust =
      (singleModification ? selection.start : selection.end) +
      moveCusorSpots +
      (deleteKeyPressed ? 1 : 0)
    const newCursorPosition = Math.max(0, newCursorPositionBeforeAdjust)
    setSelection({ start: newCursorPosition, end: newCursorPosition })
  }

  return {
    formContext,
    formValue,
    inputKey,
    inputId,
    errorId,
    helperId,
    variant,
    size,
    placeholder,
    type,
    onBlur,
    onChangeText,
    inputValue,
    keyboardType,
    onSelectionChange,
    selection,
    isDisabled,
    isInvalid,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
    autoCapitalize,
    autoComplete,
    maxLength,
    showPassword,
    setShowPassword,
  }
}
