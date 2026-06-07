import { useFormContext } from "react-hook-form"
import type { RncSelectProps } from "./RncSelectModel"

export default function useRncSelect(props: RncSelectProps) {
  const formContext = useFormContext()

  const validationRules = {
    ...props.validationRules,
    required: props.required,
  }

  const defaultValue = props.multiple
    ? (props.defaultValue ?? [])
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
