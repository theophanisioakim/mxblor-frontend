import { cn } from "@workspace/ui/lib/utils"
import type { LucideProps } from "lucide-react"
import * as LucideIcons from "lucide-react"
import type { ComponentType, ReactNode } from "react"

const registry = LucideIcons as unknown as Record<
  string,
  ComponentType<LucideProps> | undefined
>

/**
 * Resolve a lucide glyph by its (PascalCase) name and render it — web variant.
 *
 * Mirrors the legacy `iconFor` helper: backend menu DTOs carry an `icon` name
 * (e.g. `"LayoutDashboard"`), resolved here against `lucide-react`. The native
 * variant (`icon-for.native.tsx`) resolves against `lucide-react-native` and
 * renders through the rnr `Icon` so NativeWind colors the glyph. Pass a Tailwind
 * text-color class via `className` (e.g. `"text-muted-foreground"`).
 */
export function iconFor(
  name: string | null | undefined,
  size = 16,
  className?: string
): ReactNode {
  if (!name) {
    return null
  }
  const Glyph = registry[name]
  if (!Glyph) {
    return null
  }
  return <Glyph className={cn("text-foreground", className)} size={size} />
}
