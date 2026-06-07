"use client"

import { Controller } from "react-hook-form"
import type { RncInputProps } from "./RncInputModel"
import RncInputRender from "./RncInputRender/RncInputRender"
import useRncInput from "./useRncInput"

export function RncInput(props: Readonly<RncInputProps>) {
  const {
    defaultValue,
    formContext,
    validationRules,
    controllerKey,
    controllerName,
  } = useRncInput(props)
  return (
    <Controller
      key={controllerKey}
      name={controllerName}
      control={formContext.control}
      defaultValue={defaultValue}
      rules={validationRules}
      render={(fieldContext) => {
        return <RncInputRender {...props} fieldContext={fieldContext} />
      }}
    />
  )
}
