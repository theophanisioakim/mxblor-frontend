"use client"

import { Controller } from "react-hook-form"
import type { RncSwitchProps } from "./RncSwitchModel"
import RncSwitchRender from "./RncSwitchRender/RncSwitchRender"
import useRncSwitch from "./useRncSwitch"

export function RncSwitch(props: Readonly<RncSwitchProps>) {
  const {
    defaultValue,
    formContext,
    validationRules,
    controllerKey,
    controllerName,
  } = useRncSwitch(props)
  return (
    <Controller
      key={controllerKey}
      name={controllerName}
      control={formContext.control}
      defaultValue={defaultValue}
      rules={validationRules}
      render={(fieldContext) => {
        return <RncSwitchRender {...props} fieldContext={fieldContext} />
      }}
    />
  )
}
