import type { ReactNode } from "react"
import type { UseFormReturn } from "react-hook-form"

export interface RncFormProps<T> {
  children?: ReactNode[] | ReactNode
  id: string
  onSubmit: (data: T, methods: UseFormReturn) => Promise<boolean>
  onLoad?: (methods: UseFormReturn) => Promise<void>
  onValuesChange?: (methods: UseFormReturn) => Promise<void>
  loadFormValues?: () => Promise<Partial<T>>
  unstyled?: boolean
}
