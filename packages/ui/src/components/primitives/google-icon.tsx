import { createLucideIcon } from "lucide-react"

/**
 * Google brand glyph — web variant. lucide no longer ships brand icons, so we
 * define one with `createLucideIcon` (lucide-react) that behaves like a lucide
 * glyph and works with the `Icon` primitive's `as` prop. It is drawn as a filled
 * mark (`fill: currentColor`, `stroke: none`) so it inherits the surrounding
 * text color. The native variant (`google-icon.native.tsx`) builds the same
 * glyph from `lucide-react-native`.
 */
export const Google = createLucideIcon("Google", [
  [
    "path",
    {
      d: "M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-0.013z",
      fill: "currentColor",
      stroke: "none",
      key: "google-g",
    },
  ],
])
