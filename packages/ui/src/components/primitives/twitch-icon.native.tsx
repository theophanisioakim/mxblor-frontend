import { createLucideIcon } from "lucide-react-native"

/**
 * Twitch brand glyph — native variant. lucide no longer ships brand icons, so we
 * define one with `createLucideIcon` (lucide-react-native) that behaves like a
 * lucide glyph and works with the rnr `Icon` (`as` prop). The web variant
 * (`twitch-icon.tsx`) builds the same glyph from `lucide-react`.
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
