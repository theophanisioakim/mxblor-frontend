import type { ReactNode } from "react"

export type PopoverAlign = "start" | "center" | "end"
// Native (rnr) popover content only supports vertical placement; keep the
// shared contract to the subset valid on both platforms.
export type PopoverSide = "top" | "bottom"

/** Root props — controlled open state. */
export type PopoverProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

/** Trigger props — `asChild` lets a custom element act as the trigger. */
export type PopoverTriggerProps = {
  asChild?: boolean
  children?: ReactNode
}

/** Content props — placement + styling shared by both platforms. */
export type PopoverContentProps = {
  className?: string
  children?: ReactNode
  align?: PopoverAlign
  side?: PopoverSide
  sideOffset?: number
}
