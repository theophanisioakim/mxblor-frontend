"use client"

import { useTranslation } from "@workspace/i18n"
import { useRncFormContext } from "@workspace/ui/components/form-components/RncForm/RncFormContext"
import { useFormContext } from "react-hook-form"
import { Button, type ButtonProps } from "../primitives/button"
import { Spinner } from "../primitives/spinner"
import { Text } from "../primitives/text"

export interface SubmitButtonProps
  extends Omit<ButtonProps, "onPress" | "children"> {
  label?: string
  disabled?: boolean
}

/**
 * Submit button that integrates with `RncFormWrapper`. Pressing it validates
 * and submits the enclosing form (via `RncFormContext`) and shows a loading
 * spinner while the submission is in flight. Can be placed anywhere inside the
 * form.
 *
 * @example
 * ```tsx
 * <RncFormWrapper id="my-form" onSubmit={handleSubmit}>
 *   <RncInput id="name" label="Name" />
 *   <RncSubmitButton label="Save" />
 * </RncFormWrapper>
 * ```
 */
export function RncSubmitButton({
  label,
  disabled,
  ...props
}: Readonly<SubmitButtonProps>) {
  const { submit, loading } = useRncFormContext()
  const methods = useFormContext()
  const { t } = useTranslation(["common"])

  const isDisabled =
    methods.formState.isSubmitting ||
    methods.formState.isLoading ||
    loading ||
    disabled

  return (
    <Button {...props} disabled={isDisabled} onPress={submit}>
      {methods.formState.isSubmitting && <Spinner />}
      <Text>{label ?? t("common:submit")}</Text>
    </Button>
  )
}
