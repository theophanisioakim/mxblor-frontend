"use client"

import { Input as WebUiInput } from "@workspace/web-ui/components/ui/input"
import { useEffect, useRef } from "react"

type InputSelection = { start: number; end: number }

/**
 * Cross-platform Input contract — a React-Native-flavored API so the same
 * field code works on both platforms. The native variant (`input.native.tsx`)
 * forwards straight to the rnr `TextInput`; this web variant maps the contract
 * onto a DOM `<input>` (shadcn `Input`).
 */
type InputProps = {
  value?: string
  onChangeText?: (text: string) => void
  onBlur?: () => void
  onFocus?: () => void
  placeholder?: string
  editable?: boolean
  disabled?: boolean
  readOnly?: boolean
  secureTextEntry?: boolean
  keyboardType?: string
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  autoComplete?: string
  maxLength?: number
  autoFocus?: boolean
  selection?: InputSelection
  onSelectionChange?: (e: {
    nativeEvent: { selection: InputSelection }
  }) => void
  className?: string
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-required"?: boolean
  // Web-only passthrough (HTML date/number inputs). Ignored on native.
  type?: string
  min?: string
  max?: string
}

function Input({
  value,
  onChangeText,
  onBlur,
  onFocus,
  editable,
  disabled,
  secureTextEntry,
  keyboardType: _keyboardType,
  selection,
  onSelectionChange,
  type,
  ...props
}: Readonly<InputProps>) {
  const ref = useRef<HTMLInputElement>(null)

  // Emulate React Native's controlled `selection` prop on the DOM input so the
  // number-formatting cursor logic in the field hooks behaves identically.
  useEffect(() => {
    const el = ref.current
    if (!selection || !el) return
    if (
      el.selectionStart !== selection.start ||
      el.selectionEnd !== selection.end
    ) {
      try {
        el.setSelectionRange(selection.start, selection.end)
      } catch {
        // setSelectionRange throws on input types that don't support it
        // (date/number) — those never pass `selection`, so this is just a guard.
      }
    }
  }, [selection])

  return (
    <WebUiInput
      ref={ref}
      type={secureTextEntry ? "password" : (type ?? "text")}
      value={value}
      disabled={disabled || editable === false}
      onChange={(e) => onChangeText?.(e.target.value)}
      onBlur={() => onBlur?.()}
      onFocus={() => onFocus?.()}
      onSelect={(e) => {
        const el = e.currentTarget
        onSelectionChange?.({
          nativeEvent: {
            selection: {
              start: el.selectionStart ?? 0,
              end: el.selectionEnd ?? 0,
            },
          },
        })
      }}
      {...props}
    />
  )
}

export type { InputProps, InputSelection }
export { Input }
