"use client"

import { cn } from "@workspace/ui/lib/utils"
import { useIsMobile } from "../../../hooks/use-is-mobile"
import { Button } from "../../primitives/button"
import { Icon, X } from "../../primitives/icon"
import { Text } from "../../primitives/text"
import { View } from "../../primitives/view"
import type { RncDialogProps } from "./rnc-dialog-model"

/**
 * Cross-platform confirmation/edit dialog — web variant.
 *
 * Renders a centered modal card on desktop and a bottom sheet on small screens.
 * The native variant (`rnc-dialog.native.tsx`) uses a react-native `Modal`.
 */
export function RncDialog(props: Readonly<RncDialogProps>) {
  const {
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    onCancel,
    cancelLabel = "Cancel",
    onConfirm,
    confirmLabel = "Confirm",
    confirmDisabled,
    confirmIcon,
    maxWidth,
    dismissable = true,
  } = props

  const isMobile = useIsMobile()

  if (!open) return null

  function handleBackdrop() {
    if (!dismissable) return
    onOpenChange?.(false)
  }

  function renderFooter() {
    if (footer !== undefined) return footer
    if (!onCancel && !onConfirm) return null
    return (
      <View className="flex-row justify-end gap-3">
        {onCancel && (
          <Button
            variant="outline"
            onPress={onCancel}
            className={isMobile ? "flex-1" : undefined}
          >
            <Text>{cancelLabel}</Text>
          </Button>
        )}
        {onConfirm && (
          <Button
            onPress={onConfirm}
            disabled={confirmDisabled}
            className={isMobile ? "flex-1" : undefined}
          >
            {confirmIcon && <Icon as={confirmIcon} size={16} />}
            <Text>{confirmLabel}</Text>
          </Button>
        )}
      </View>
    )
  }

  return (
    <View className="fixed inset-0 z-50 items-center justify-center">
      <View className="absolute inset-0 bg-black/50" onClick={handleBackdrop} />
      <View
        className={cn(
          "relative z-10 m-4 max-h-[90vh] w-full gap-3 overflow-y-auto rounded-xl border border-border bg-background p-4",
          isMobile ? "max-w-full self-end rounded-b-none" : "max-w-lg"
        )}
        style={maxWidth ? { maxWidth, width: "90vw" } : undefined}
      >
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 font-bold text-foreground text-lg">
            {title}
          </Text>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Close"
              onPress={onCancel}
            >
              <Icon as={X} size={18} />
            </Button>
          )}
        </View>

        {description && (
          <Text className="text-muted-foreground">{description}</Text>
        )}

        {children}

        {renderFooter()}
      </View>
    </View>
  )
}
