import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form"
import type { RncCheckboxProps } from "../rnc-checkbox-model"

export interface RncCheckboxRenderProps extends RncCheckboxProps {
  fieldContext: {
    field: ControllerRenderProps<FieldValues, string>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FieldValues>
  }
}
