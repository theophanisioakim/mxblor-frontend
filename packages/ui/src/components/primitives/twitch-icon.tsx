import { createLucideIcon } from "lucide-react"

/**
 * Twitch brand glyph — web variant. lucide no longer ships brand icons, so we
 * define one with `createLucideIcon` (lucide-react) that behaves exactly like a
 * lucide glyph and works with the `Icon` primitive's `as` prop. The native
 * variant (`twitch-icon.native.tsx`) builds the same glyph from
 * `lucide-react-native`.
 */
export const Twitch = createLucideIcon("Twitch", [
  [
    "path",
    {
      d: "M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7",
      key: "twitch-body",
    },
  ],
])
