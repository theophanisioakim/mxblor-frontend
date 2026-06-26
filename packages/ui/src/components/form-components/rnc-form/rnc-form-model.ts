import type { ReactNode } from "react"
import type { Mode, UseFormReturn } from "react-hook-form"

export interface RncFormProps<T> {
  children?: ReactNode[] | ReactNode
  id: string
  onSubmit: (data: T, methods: UseFormReturn) => Promise<boolean>
  onLoad?: (methods: UseFormReturn) => Promise<void>
  onValuesChange?: (methods: UseFormReturn) => Promise<void>
  /** Synchronous initial values — preferred over async `loadFormValues` for SSR. */
  defaultValues?: Partial<T>
  loadFormValues?: () => Promise<Partial<T>>
  unstyled?: boolean
  mode?: Mode
}
