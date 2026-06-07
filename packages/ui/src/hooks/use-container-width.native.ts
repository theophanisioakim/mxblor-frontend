import { useCallback, useState } from "react"
import type {
  ContainerLayoutEvent,
  UseContainerWidthResult,
} from "./use-container-width.shared"

/**
 * Measures a container's width — native variant.
 *
 * Reads the width from `onLayout` so the grid can recompute which columns fit
 * and which collapse into the expandable detail row. The web variant
 * (`use-container-width.ts`) uses `ResizeObserver` instead.
 */
export function useContainerWidth(): UseContainerWidthResult {
  const [width, setWidth] = useState(0)

  const onLayout = useCallback((event: ContainerLayoutEvent) => {
    const next = event.nativeEvent.layout.width
    setWidth((prev) => (Math.abs(prev - next) > 1 ? next : prev))
  }, [])

  return { width, containerProps: { onLayout } }
}
