"use client"

import { Controller } from "react-hook-form"
import type { RncDateTimeFieldProps } from "./RncDateTimeFieldModel"
import RncDateTimeFieldRender from "./RncDateTimeFieldRender/RncDateTimeFieldRender"
import useRncDateTimeField from "./useRncDateTimeField"

export function RncDateTimeField(props: Readonly<RncDateTimeFieldProps>) {
  const {
    defaultValue,
    formContext,
    validationRules,
    controllerKey,
    controllerName,
  } = useRncDateTimeField(props)
  return (
    <Controller
      key={controllerKey}
      name={controllerName}
      control={formContext.control}
      defaultValue={defaultValue}
      rules={validationRules}
      render={(fieldContext) => {
        return <RncDateTimeFieldRender {...props} fieldContext={fieldContext} />
      }}
    />
  )
}
