import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form"
import type { RncDateTimeFieldProps } from "../rnc-date-time-field-model"

export interface RncDateTimeFieldRenderProps extends RncDateTimeFieldProps {
  fieldContext: {
    field: ControllerRenderProps<FieldValues, string>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FieldValues>
  }
}
