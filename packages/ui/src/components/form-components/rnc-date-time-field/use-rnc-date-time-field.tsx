import { useTranslation } from "@workspace/i18n"
import {
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form"
import type { RncDateTimeFieldProps } from "./rnc-date-time-field-model"
import { resolveDate } from "./rnc-date-time-field-render/date-utils"

export default function useRncDateTimeField(props: RncDateTimeFieldProps) {
  const formContext = useFormContext()
  const { t } = useTranslation(["common"])

  const resolvedMinDate = resolveDate(props.minDate)
  const resolvedMaxDate = resolveDate(props.maxDate)

  const now = new Date()
  const effectiveMinDate =
    props.disablePast && !resolvedMinDate ? now : resolvedMinDate
  const effectiveMaxDate =
    props.disableFuture && !resolvedMaxDate ? now : resolvedMaxDate

  const validationRules: Omit<
    RegisterOptions<FieldValues, string>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  > = {
    ...props.validationRules,
    required: props.required,
    validate: {
      dateRange: (value: Date | undefined) => {
        if (!value) return true
        const date = value instanceof Date ? value : new Date(value)
        if (Number.isNaN(date.getTime()))
          return t("common:validations.invalidDate")

        if (effectiveMinDate && date < effectiveMinDate) {
          return t("common:validations.minDate", {
            minDate: effectiveMinDate.toLocaleDateString(),
          })
        }
        if (effectiveMaxDate && date > effectiveMaxDate) {
          return t("common:validations.maxDate", {
            maxDate: effectiveMaxDate.toLocaleDateString(),
          })
        }
        return true
      },
      disabledDate: (value: Date | undefined) => {
        if (!value || !props.shouldDisableDate) return true
        const date = value instanceof Date ? value : new Date(value)
        if (props.shouldDisableDate(date)) {
          return t("common:validations.disabledDate")
        }
        return true
      },
      ...props.validationRules?.validate,
    },
  }

  const defaultValue = props.defaultValue
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
