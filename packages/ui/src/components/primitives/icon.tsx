import { cn } from "@workspace/ui/lib/utils"
import type { LucideProps } from "lucide-react"
import type * as React from "react"

type IconProps = LucideProps & {
  as: React.ComponentType<LucideProps>
}

/**
 * Cross-platform Icon — web variant.
 *
 * Renders a `lucide-react` glyph passed via `as`, defaulting to the foreground
 * color and `size-4`. The native variant (`icon.native.tsx`) re-exports the
 * react-native-reusables `Icon` (which applies the same `className`/`as`
 * contract through `cssInterop`). The glyphs are re-exported from each file so
 * shared render code imports one icon set per platform.
 */
function Icon({ as: As, className, size = 16, ...props }: IconProps) {
  return (
    <As className={cn("text-foreground", className)} size={size} {...props} />
  )
}

export {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  CircleOff,
  Eye,
  EyeOff,
  FileX,
  Filter,
  Globe,
  LogIn,
  LogOut,
  Menu,
  Minus,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sun,
  Trash2,
  Undo2,
  User,
  X,
} from "lucide-react"
export type { IconProps }
export { Icon }
