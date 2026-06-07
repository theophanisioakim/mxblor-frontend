import { useTranslation } from "@workspace/i18n"
import {
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form"
import type { RncInputProps } from "./rnc-input-model"

type Translation = ReturnType<typeof useTranslation>["t"]
type NumberValidation = (value: unknown) => true | string
type NumberValidationRules = RncInputProps["numberValidationRules"]

const createNumberValidation = (
  props: RncInputProps,
  t: Translation
): NumberValidation | undefined => {
  if (props.type !== "number") {
    return undefined
  }

  return (value: unknown) => {
    if (value === undefined) {
      return true
    }

    const numericValue = typeof value === "number" ? value : Number(value)
    const requiresInteger = props.numberValidationRules?.decimalPlaces === 0
    const errorKey = requiresInteger
      ? "common:validations.integer"
      : "common:validations.number"

    if (
      Number.isNaN(numericValue) ||
      (requiresInteger && !Number.isInteger(numericValue)) ||
      (typeof value === "string" && value.trim().endsWith("."))
    ) {
      return t(errorKey)
    }

    return true
  }
}

const getMinValue = (rules: NumberValidationRules): number | undefined => {
  if (!rules?.positiveOnly) {
    return rules?.min
  }

  return rules.min === undefined ? 0 : Math.max(rules.min, 0)
}

const getMaxValue = (rules: NumberValidationRules): number | undefined => {
  if (!rules?.negativeOnly) {
    return rules?.max
  }

  return rules.max === undefined ? 0 : Math.min(rules.max, 0)
}

const getNumberBounds = (
  props: RncInputProps
): { maxValue: number | undefined; minValue: number | undefined } => {
  if (props.type !== "number") {
    return { maxValue: undefined, minValue: undefined }
  }

  return {
    maxValue: getMaxValue(props.numberValidationRules),
    minValue: getMinValue(props.numberValidationRules),
  }
}

export default function useRncInput(props: RncInputProps) {
  const formContext = useFormContext()
  const { t } = useTranslation(["common"])
  const numberValidation = createNumberValidation(props, t)
  const { maxValue, minValue } = getNumberBounds(props)
  const validationRules: Omit<
    RegisterOptions<FieldValues, string>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  > = {
    ...props.validationRules,
    required: props.required,
    maxLength: props.textValidationRules?.maxLength
      ? {
          value: props.textValidationRules.maxLength,
          message: `${t("common:validations.maxLength")}: ${props.textValidationRules.maxLength}`,
        }
      : undefined,
    minLength: props.textValidationRules?.minLength
      ? {
          value: props.textValidationRules.minLength,
          message: `${t("common:validations.minLength")}: ${props.textValidationRules.minLength}`,
        }
      : undefined,
    max:
      maxValue === undefined
        ? undefined
        : {
            value: maxValue,
            message: `${t("common:validations.maxValue", { maxValue })}`,
          },
    min:
      minValue === undefined
        ? undefined
        : {
            value: minValue,
            message: `${t("common:validations.minValue", { minValue })}`,
          },

    validate: {
      ...(numberValidation ? { numberType: numberValidation } : {}),
      ...props.validationRules?.validate,
    },
  }

  const defaultValue =
    props.type === "number" && typeof props.defaultValue === "string"
      ? Number(props.defaultValue)
      : props.defaultValue

  const controllerKey = `controllerkey__${props.id}`
  const controllerName = props.id

  return {
    formContext,
    validationRules,
    defaultValue,
    controllerKey,
    controllerName,
  }
}
