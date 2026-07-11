import type { ReactNode } from "react"

/**
 * Web variant — the scrollable area of the suggestion list.
 *
 * The list is capped at roughly four rows and scrolls **inside itself**, so a
 * longer set of matches never spills out and never reaches the dialog. `max-h-40`
 * is shared with the native variant so both cap at the same height.
 */
export default function RncTranslationLabelSuggestionsScroll({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <div className="max-h-40 overflow-y-auto">{children}</div>
}
