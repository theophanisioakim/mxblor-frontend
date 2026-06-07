"use client"

import { Controller } from "react-hook-form"
import type { RncCheckboxProps } from "./rnc-checkbox-model"
import RncCheckboxRender from "./rnc-checkbox-render/rnc-checkbox-render"
import useRncCheckbox from "./use-rnc-checkbox"

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
