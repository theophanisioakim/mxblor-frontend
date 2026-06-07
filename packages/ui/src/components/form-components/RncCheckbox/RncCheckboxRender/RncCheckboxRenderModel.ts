import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form"
import type { RncCheckboxProps } from "../RncCheckboxModel"

export interface RncCheckboxRenderProps extends RncCheckboxProps {
  fieldContext: {
    field: ControllerRenderProps<FieldValues, string>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FieldValues>
  }
}
