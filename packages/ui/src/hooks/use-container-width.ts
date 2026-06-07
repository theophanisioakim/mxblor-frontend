"use client"

import { useEffect, useRef, useState } from "react"
import type { UseContainerWidthResult } from "./use-container-width.shared"

/**
 * Measures a container's width — web variant.
 *
 * Observes the bound element with `ResizeObserver` so the grid can recompute
 * which columns fit and which collapse into the expandable detail row. The
 * native variant (`use-container-width.native.ts`) uses `onLayout` instead.
 */
export function useContainerWidth(): UseContainerWidthResult {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0
      setWidth((prev) => (Math.abs(prev - next) > 1 ? next : prev))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { width, containerProps: { ref } }
}
