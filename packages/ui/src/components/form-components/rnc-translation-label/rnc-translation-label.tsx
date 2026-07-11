"use client"

import { Controller } from "react-hook-form"
import type { RncTranslationLabelProps } from "./rnc-translation-label-model"
import RncTranslationLabelRender from "./rnc-translation-label-render/rnc-translation-label-render"
import useRncTranslationLabel from "./use-rnc-translation-label"

export function RncTranslationLabel(props: Readonly<RncTranslationLabelProps>) {
  const {
    defaultValue,
    formContext,
    validationRules,
    controllerKey,
    controllerName,
  } = useRncTranslationLabel(props)
  return (
    <Controller
      key={controllerKey}
      name={controllerName}
      control={formContext.control}
      defaultValue={defaultValue}
      rules={validationRules}
      render={(fieldContext) => {
        return (
          <RncTranslationLabelRender {...props} fieldContext={fieldContext} />
        )
      }}
    />
  )
}
