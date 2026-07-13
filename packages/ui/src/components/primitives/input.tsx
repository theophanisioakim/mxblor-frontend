"use client"

import { Input as WebUiInput } from "@workspace/web-ui/components/ui/input"
import { Textarea as WebUiTextarea } from "@workspace/web-ui/components/ui/textarea"
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
  /**
   * Called when the user presses Enter/Return in the field. Mapped from the DOM
   * `keydown` here; forwarded straight to `TextInput.onSubmitEditing` on native.
   * Lets forms (which render a `View`, not a `<form>`) submit on Enter.
   */
  onSubmitEditing?: () => void
  /**
   * Return/Enter key label on mobile keyboards. Maps to `TextInput.returnKeyType`
   * on native and the `enterKeyHint` attribute on web (the value names overlap).
   */
  returnKeyType?: "done" | "go" | "next" | "search" | "send"
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
  /**
   * Renders a multi-line field: a `<textarea>` on web, `TextInput multiline` on
   * native. `numberOfLines` sets its initial height (RN's prop name; mapped to
   * `rows` on web).
   */
  multiline?: boolean
  numberOfLines?: number
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
  onSubmitEditing,
  returnKeyType,
  editable,
  disabled,
  secureTextEntry,
  keyboardType: _keyboardType,
  selection,
  onSelectionChange,
  type,
  multiline,
  numberOfLines,
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

  // A multi-line field is a different DOM element, not a variant of <input>.
  // The selection/Enter-to-submit behaviour above is single-line-only by design:
  // in a textarea, Enter inserts a newline.
  if (multiline) {
    return (
      <WebUiTextarea
        rows={numberOfLines}
        value={value}
        disabled={disabled || editable === false}
        onChange={(e) => onChangeText?.(e.target.value)}
        onBlur={() => onBlur?.()}
        onFocus={() => onFocus?.()}
        {...props}
      />
    )
  }

  return (
    <WebUiInput
      ref={ref}
      type={secureTextEntry ? "password" : (type ?? "text")}
      value={value}
      disabled={disabled || editable === false}
      enterKeyHint={returnKeyType}
      onChange={(e) => onChangeText?.(e.target.value)}
      onBlur={() => onBlur?.()}
      onFocus={() => onFocus?.()}
      onKeyDown={(e) => {
        // `isComposing` guards IME (e.g. CJK) Enter that confirms a candidate.
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
          onSubmitEditing?.()
        }
      }}
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
