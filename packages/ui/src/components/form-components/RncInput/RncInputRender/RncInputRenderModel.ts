import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form"
import type { RncInputProps } from "../RncInputModel"

export interface RncInputRenderProps extends RncInputProps {
  fieldContext: {
    field: ControllerRenderProps<FieldValues, string>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FieldValues>
  }
}
