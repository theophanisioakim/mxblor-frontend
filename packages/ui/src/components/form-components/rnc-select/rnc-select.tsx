"use client"

import { Controller } from "react-hook-form"
import type { RncSelectProps } from "./rnc-select-model"
import RncSelectRender from "./rnc-select-render/rnc-select-render"
import useRncSelect from "./use-rnc-select"

export function RncSelect(props: Readonly<RncSelectProps>) {
  const {
    defaultValue,
    formContext,
    validationRules,
    controllerKey,
    controllerName,
  } = useRncSelect(props)
  return (
    <Controller
      key={controllerKey}
      name={controllerName}
      control={formContext.control}
      defaultValue={defaultValue}
      rules={validationRules}
      render={(fieldContext) => {
        return <RncSelectRender {...props} fieldContext={fieldContext} />
      }}
    />
  )
}
