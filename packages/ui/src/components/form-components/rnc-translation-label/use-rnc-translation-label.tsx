import { useTranslation } from "@workspace/i18n"
import {
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form"
import type { RncTranslationLabelProps } from "./rnc-translation-label-model"

export default function useRncTranslationLabel(
  props: RncTranslationLabelProps
) {
  const formContext = useFormContext()
  const { t } = useTranslation(["common"])

  const validationRules: Omit<
    RegisterOptions<FieldValues, string>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  > = {
    ...props.validationRules,
    required: props.required ? t("common:required") : false,
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
