export type SeparatorOrientation = "horizontal" | "vertical"

/**
 * Shared props for the cross-platform `Separator` primitive. Both the web
 * (`separator.tsx`, wraps shadcn) and native (`separator.native.tsx`, wraps rnr)
 * variants accept this contract.
 */
export type SeparatorProps = {
  className?: string
  orientation?: SeparatorOrientation
  decorative?: boolean
}
