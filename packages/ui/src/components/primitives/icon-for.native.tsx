import { Icon } from "@workspace/native-ui/components/ui/icon"
import { cn } from "@workspace/ui/lib/utils"
import type { LucideIcon } from "lucide-react-native"
import * as LucideIcons from "lucide-react-native"
import type { ReactNode } from "react"

const registry = LucideIcons as unknown as Record<
  string,
  LucideIcon | undefined
>

/**
 * Resolve a lucide glyph by its (PascalCase) name and render it — native variant.
 *
 * Mirrors the legacy `iconFor` helper: backend menu DTOs carry an `icon` name
 * (e.g. `"LayoutDashboard"`), resolved here against `lucide-react-native` and
 * rendered through the rnr `Icon` so NativeWind `className` colors the glyph. The
 * web variant (`icon-for.tsx`) resolves against `lucide-react`. Pass a Tailwind
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
  return (
    <Icon as={Glyph} className={cn("text-foreground", className)} size={size} />
  )
}
