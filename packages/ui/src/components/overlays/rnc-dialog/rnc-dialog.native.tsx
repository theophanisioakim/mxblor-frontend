import { cn } from "@workspace/ui/lib/utils"
import { Modal, Pressable, ScrollView } from "react-native"
import { useIsMobile } from "../../../hooks/use-is-mobile"
import { Button } from "../../primitives/button"
import { Icon, X } from "../../primitives/icon"
import { Text } from "../../primitives/text"
import { View } from "../../primitives/view"
import type { RncDialogProps } from "./rnc-dialog-model"

/**
 * Cross-platform confirmation/edit dialog — native variant.
 *
 * Renders a react-native `Modal`: a bottom sheet on phones and a centered card
 * on wide screens. The web variant (`rnc-dialog.tsx`) uses a fixed overlay.
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
    dismissable = true,
  } = props

  const isMobile = useIsMobile()

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
    <Modal
      visible={!!open}
      transparent
      animationType={isMobile ? "slide" : "fade"}
      onRequestClose={handleBackdrop}
    >
      <Pressable
        className={cn(
          "flex-1 bg-black/50",
          isMobile ? "justify-end" : "items-center justify-center"
        )}
        onPress={handleBackdrop}
      >
        <Pressable
          className={cn(
            "gap-3 bg-background p-4",
            isMobile
              ? "max-h-[85%] rounded-t-2xl"
              : "m-4 max-h-[85%] w-full max-w-lg rounded-2xl border border-border"
          )}
        >
          {isMobile && (
            <View className="items-center py-2">
              <View className="h-1 w-9 rounded-full bg-muted-foreground/40" />
            </View>
          )}
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

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-3">{children}</View>
          </ScrollView>

          {renderFooter()}
        </Pressable>
      </Pressable>
    </Modal>
  )
}
