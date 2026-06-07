"use client"

import { useEffect, useState } from "react"

/** Viewport widths below this (px) are treated as mobile. */
export const MOBILE_BREAKPOINT = 768

/**
 * Cross-platform "is mobile" hook — web variant.
 *
 * Tracks `window.matchMedia` so the grid can switch between its desktop layout
 * and the mobile bottom-sheet layout. Defaults to `false` on the server so SSR
 * renders the desktop layout, then corrects after hydration. The native variant
 * (`use-is-mobile.native.ts`) measures `useWindowDimensions`.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const update = () => setIsMobile(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  return isMobile
}
