import { cn } from "@workspace/ui/lib/utils"
import { Checkbox as WebUiCheckbox } from "@workspace/web-ui/components/ui/checkbox"
import { Minus } from "lucide-react"

type CheckedState = boolean | "indeterminate"

type CheckboxProps = {
  checked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  disabled?: boolean
  className?: string
  id?: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
  "aria-required"?: boolean
}

/**
 * Cross-platform Checkbox — web variant.
 *
 * Wraps the shadcn (radix) `Checkbox`, supporting a three-state `checked`
 * (`true` | `false` | `"indeterminate"`). The vendored indicator only renders a
 * check, so for the indeterminate state we hide it and overlay a `Minus` glyph
 * (matching the native variant). Customizing here keeps the vendored component
 * untouched (root AGENTS.md §4).
 */
function Checkbox({ checked, className, ...props }: Readonly<CheckboxProps>) {
  const indeterminate = checked === "indeterminate"
  return (
    <span className="relative inline-flex">
      <WebUiCheckbox
        checked={checked}
        className={cn(
          indeterminate &&
            "border-primary bg-primary text-primary-foreground [&_svg]:hidden",
          className
        )}
        {...props}
      />
      {indeterminate && (
        <Minus className="pointer-events-none absolute inset-0 m-auto size-3.5 text-primary-foreground" />
      )}
    </span>
  )
}

export type { CheckboxProps, CheckedState }
export { Checkbox }
