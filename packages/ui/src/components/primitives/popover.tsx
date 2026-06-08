import {
  Popover as WebUiPopover,
  PopoverContent as WebUiPopoverContent,
  PopoverTrigger as WebUiPopoverTrigger,
} from "@workspace/web-ui/components/ui/popover"
import type {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "./popover.shared"

/**
 * Cross-platform Popover — web variant.
 *
 * Wraps the shadcn (radix) popover. The native variant (`popover.native.tsx`)
 * wraps the react-native-reusables popover, which renders into the
 * `@workspace/providers` `PortalHost`. Both expose `Popover`, `PopoverTrigger`,
 * and `PopoverContent` with the same prop contract (`popover.shared.ts`).
 */
function Popover(props: Readonly<PopoverProps>) {
  return <WebUiPopover {...props} />
}

function PopoverTrigger(props: Readonly<PopoverTriggerProps>) {
  return <WebUiPopoverTrigger {...props} />
}

function PopoverContent(props: Readonly<PopoverContentProps>) {
  return <WebUiPopoverContent {...props} />
}

export type {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "./popover.shared"
export { Popover, PopoverContent, PopoverTrigger }
