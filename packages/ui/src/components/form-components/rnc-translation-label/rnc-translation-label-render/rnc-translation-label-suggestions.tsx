"use client"

import { useLayoutEffect, useRef, useState } from "react"
import RncTranslationLabelSuggestionsBody from "./rnc-translation-label-suggestions-body"
import type { RncTranslationLabelSuggestionsProps } from "./rnc-translation-label-suggestions-model"

/** Gap between the input and the floating list, in px. */
const OFFSET = 4

type Anchor = {
  left: number
  width: number
  /** Viewport offset of the input's bottom edge (used when dropping down). */
  top: number
  /** Distance from the viewport's bottom to the input's top (dropping up). */
  bottom: number
}

/**
 * Web variant — anchored to the **viewport** (`position: fixed`), not to the
 * input's container.
 *
 * The dialog panel is `max-h-[90vh] overflow-y-auto`. An absolutely-positioned
 * descendant of it still counts toward its scrollable overflow, so a list
 * hanging below the input made the whole modal scroll. A fixed element's
 * containing block is the viewport instead: it is neither clipped by the panel
 * nor added to what the panel can scroll. (The panel sets no `transform` /
 * `filter` / `will-change`, so nothing re-captures the fixed containing block.)
 */
export default function RncTranslationLabelSuggestions(
  props: Readonly<RncTranslationLabelSuggestionsProps>
) {
  const { open, dropUp } = props
  // Sits in-flow inside the input's wrapper purely so we can measure that
  // wrapper — a fixed panel has no positional relationship to it any more.
  const markerRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState<Anchor>()

  useLayoutEffect(() => {
    if (!open) return
    const input = markerRef.current?.parentElement
    if (!input) return

    function measure() {
      if (!input) return
      const rect = input.getBoundingClientRect()
      setAnchor({
        left: rect.left,
        width: rect.width,
        top: rect.bottom,
        bottom: window.innerHeight - rect.top,
      })
    }

    measure()
    window.addEventListener("resize", measure)
    // Capture phase: the panel scrolls, not the window, and scroll events from a
    // nested scroller do not bubble.
    window.addEventListener("scroll", measure, true)
    return () => {
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [open])

  return (
    <>
      <div ref={markerRef} className="hidden" />
      {open && anchor && (
        <div
          className="fixed z-[60] overflow-hidden rounded-md border border-border bg-background shadow-md"
          style={{
            left: anchor.left,
            width: anchor.width,
            top: dropUp ? undefined : anchor.top + OFFSET,
            bottom: dropUp ? anchor.bottom + OFFSET : undefined,
          }}
        >
          <RncTranslationLabelSuggestionsBody {...props} />
        </div>
      )}
    </>
  )
}
