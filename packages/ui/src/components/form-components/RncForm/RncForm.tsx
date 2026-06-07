"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useCallback, useMemo } from "react"
import { FormProvider } from "react-hook-form"
import { View } from "../../primitives/view"
import { RncFormContext } from "./RncFormContext"
import type { RncFormProps } from "./RncFormModel"
import useRncFormInternal from "./useRncFormInternal"

//T is the type of the form data
export function RncForm<T>(props: Readonly<RncFormProps<T>>) {
  const { methods, onSubmit, onSubmitInvalid, loading } =
    useRncFormInternal(props)
  const submit = useCallback(
    () => methods.handleSubmit(onSubmit, onSubmitInvalid)(),
    [methods, onSubmit, onSubmitInvalid]
  )

  const contextValue = useMemo(() => ({ submit, loading }), [submit, loading])

  return (
    <FormProvider {...methods}>
      <RncFormContext.Provider value={contextValue}>
        <View
          className={cn(
            "gap-2",
            !props.unstyled &&
              "min-w-75 items-center rounded-xl border border-border bg-background p-8"
          )}
        >
          <View className="w-full gap-2">{props.children}</View>
        </View>
      </RncFormContext.Provider>
    </FormProvider>
  )
}
