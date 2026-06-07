import type { ReactNode } from "react"

export interface RncBottomSheetProps {
  /** Controls whether the sheet is open. */
  open: boolean
  /** Called when the open state changes (backdrop tap / swipe down). */
  onOpenChange: (open: boolean) => void
  /** Title displayed below the handle bar. */
  title: string
  /** Scrollable content inside the sheet. */
  children?: ReactNode
  /**
   * Snap points as percentages of screen height. The first entry caps the
   * sheet height. @default [65]
   */
  snapPoints?: (string | number)[]
  /** Whether swiping/tapping the backdrop dismisses the sheet. @default true */
  dismissOnSnapToBottom?: boolean
  /**
   * Custom footer. When provided, replaces the default footer entirely. Pass
   * `null` to render no footer at all.
   */
  footer?: ReactNode | null
  /** Renders a primary action button in the footer. */
  onConfirm?: () => void
  /** @default "Apply" */
  confirmLabel?: string
  /** Renders a secondary (outline) button in the footer. */
  onCancel?: () => void
  /** @default "Clear" */
  cancelLabel?: string
}
