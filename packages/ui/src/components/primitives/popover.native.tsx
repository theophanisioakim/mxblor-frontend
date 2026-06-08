import {
  Popover as NativeUiPopover,
  PopoverContent as NativeUiPopoverContent,
  PopoverTrigger as NativeUiPopoverTrigger,
} from "@workspace/native-ui/components/ui/popover"
import type {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "./popover.shared"

/**
 * Cross-platform Popover — native variant.
 *
 * Wraps the react-native-reusables popover (renders into the
 * `@workspace/providers` `PortalHost`). The web variant (`popover.tsx`) wraps
 * the shadcn (radix) popover. Both expose `Popover`, `PopoverTrigger`, and
 * `PopoverContent` with the same prop contract (`popover.shared.ts`).
 */
function Popover(props: Readonly<PopoverProps>) {
  return <NativeUiPopover {...props} />
}

function PopoverTrigger(props: Readonly<PopoverTriggerProps>) {
  return <NativeUiPopoverTrigger {...props} />
}

function PopoverContent(props: Readonly<PopoverContentProps>) {
  return <NativeUiPopoverContent {...props} />
}

export type {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "./popover.shared"
export { Popover, PopoverContent, PopoverTrigger }
