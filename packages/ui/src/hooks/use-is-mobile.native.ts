import { useWindowDimensions } from "react-native"

/** Viewport widths below this (px) are treated as mobile. */
export const MOBILE_BREAKPOINT = 768

/**
 * Cross-platform "is mobile" hook — native variant.
 *
 * Derives the mobile flag from `useWindowDimensions`. The web variant
 * (`use-is-mobile.ts`) tracks `window.matchMedia`.
 */
export function useIsMobile(): boolean {
  const { width } = useWindowDimensions()
  return width < MOBILE_BREAKPOINT
}
