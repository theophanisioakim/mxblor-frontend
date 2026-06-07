import type { Ref } from "react"

/** Minimal layout-event shape, compatible with react-native's `onLayout`. */
export interface ContainerLayoutEvent {
  nativeEvent: { layout: { width: number } }
}

/**
 * Props spread onto the measured container. Web supplies a `ref` (observed with
 * `ResizeObserver`); native supplies an `onLayout` callback.
 */
export interface ContainerBindProps {
  ref?: Ref<unknown>
  onLayout?: (event: ContainerLayoutEvent) => void
}

export interface UseContainerWidthResult {
  width: number
  containerProps: ContainerBindProps
}
