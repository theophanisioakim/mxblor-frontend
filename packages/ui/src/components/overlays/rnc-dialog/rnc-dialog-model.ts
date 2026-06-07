import type { LucideProps } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

/** Icon component compatible with the cross-platform `Icon` primitive's `as`. */
export type RncDialogIcon = ComponentType<LucideProps>

export interface RncDialogProps {
  /** Controls whether the dialog is open. */
  open?: boolean
  /** Called when the open state changes (backdrop tap, swipe-to-dismiss). */
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  /**
   * Custom footer. When provided, replaces the default footer entirely. Pass
   * `null` to render no footer at all.
   */
  footer?: ReactNode | null
  /** Renders a secondary (outline) button + a header close button. */
  onCancel?: () => void
  /** @default "Cancel" */
  cancelLabel?: string
  /** Renders a primary button in the footer. */
  onConfirm?: () => void
  /** @default "Confirm" */
  confirmLabel?: string
  confirmDisabled?: boolean
  confirmIcon?: RncDialogIcon
  /** Caps the desktop dialog width (px). */
  maxWidth?: number
  /** Whether tapping the backdrop dismisses the dialog. @default true */
  dismissable?: boolean
}
