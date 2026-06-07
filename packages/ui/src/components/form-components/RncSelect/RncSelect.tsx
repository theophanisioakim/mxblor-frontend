"use client"

import { Controller } from "react-hook-form"
import type { RncSelectProps } from "./RncSelectModel"
import RncSelectRender from "./RncSelectRender/RncSelectRender"
import useRncSelect from "./useRncSelect"

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
