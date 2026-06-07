"use client"

import { Controller } from "react-hook-form"
import type { RncCheckboxProps } from "./RncCheckboxModel"
import RncCheckboxRender from "./RncCheckboxRender/RncCheckboxRender"
import useRncCheckbox from "./useRncCheckbox"

export function RncCheckbox(props: Readonly<RncCheckboxProps>) {
  const {
    defaultValue,
    formContext,
    validationRules,
    controllerKey,
    controllerName,
  } = useRncCheckbox(props)
  return (
    <Controller
      key={controllerKey}
      name={controllerName}
      control={formContext.control}
      defaultValue={defaultValue}
      rules={validationRules}
      render={(fieldContext) => {
        return <RncCheckboxRender {...props} fieldContext={fieldContext} />
      }}
    />
  )
}
