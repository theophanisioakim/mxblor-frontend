import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form"
import type { RncSwitchProps } from "../RncSwitchModel"

export interface RncSwitchRenderProps extends RncSwitchProps {
  fieldContext: {
    field: ControllerRenderProps<FieldValues, string>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FieldValues>
  }
}
