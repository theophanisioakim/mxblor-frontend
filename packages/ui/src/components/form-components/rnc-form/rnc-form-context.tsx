"use client"

import { createContext, useContext } from "react"

type RncFormContextValue = {
  /** Validates and submits the form (bound `handleSubmit`). */
  submit: () => void
  /** True while the form is loading initial values or submitting. */
  loading: boolean
}

const RncFormContext = createContext<RncFormContextValue | null>(null)

/**
 * Access the enclosing form's bound submit handler. Replaces Tamagui's
 * `Form.Trigger` so a `RncSubmitButton` can live anywhere inside the form.
 */
export function useRncFormContext(): RncFormContextValue {
  const ctx = useContext(RncFormContext)
  if (!ctx) {
    throw new Error("RncSubmitButton must be rendered inside an RncForm")
  }
  return ctx
}

export type { RncFormContextValue }
export { RncFormContext }
