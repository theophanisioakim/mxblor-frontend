"use client"

import { Controller } from "react-hook-form"
import type { RncDateTimeFieldProps } from "./rnc-date-time-field-model"
import RncDateTimeFieldRender from "./rnc-date-time-field-render/rnc-date-time-field-render"
import useRncDateTimeField from "./use-rnc-date-time-field"

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
