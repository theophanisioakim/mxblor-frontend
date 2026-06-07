import {
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form"
import type { RncSwitchProps } from "./rnc-switch-model"

export default function useRncSwitch(props: RncSwitchProps) {
  const formContext = useFormContext()

  const validationRules: Omit<
    RegisterOptions<FieldValues, string>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  > = {
    ...props.validationRules,
    required: props.required,
    validate: {
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
