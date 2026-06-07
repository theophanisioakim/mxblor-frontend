import type { DimensionValue } from "react-native"
import { Modal, Pressable, ScrollView } from "react-native"
import { Button } from "../../primitives/button"
import { Text } from "../../primitives/text"
import { View } from "../../primitives/view"
import type { RncBottomSheetProps } from "./rnc-bottom-sheet-model"

/**
 * Cross-platform bottom sheet — native variant.
 *
 * Renders a react-native `Modal` that slides up from the bottom. The web
 * variant (`rnc-bottom-sheet.tsx`) uses a fixed overlay.
 */
export function RncBottomSheet(props: Readonly<RncBottomSheetProps>) {
  const {
    open,
    onOpenChange,
    title,
    children,
    snapPoints = [65],
    footer,
    onConfirm,
    confirmLabel = "Apply",
    onCancel,
    cancelLabel = "Clear",
  } = props

  const height = snapPoints[0] ?? 65
  const maxHeight: DimensionValue =
    typeof height === "number" ? `${height}%` : (height as DimensionValue)

  function renderFooter() {
    if (footer !== undefined) return footer
    if (!onConfirm && !onCancel) return null
    return (
      <View className="mt-4 flex-row gap-3">
        {onCancel && (
          <Button className="flex-1" variant="outline" onPress={onCancel}>
            <Text>{cancelLabel}</Text>
          </Button>
        )}
        {onConfirm && (
          <Button className="flex-1" onPress={onConfirm}>
            <Text>{confirmLabel}</Text>
          </Button>
        )}
      </View>
    )
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => onOpenChange(false)}
    >
      <Pressable
        className="flex-1 justify-end bg-black/50"
        onPress={() => onOpenChange(false)}
      >
        <Pressable
          className="rounded-t-2xl bg-background p-4"
          style={{ maxHeight }}
        >
          <View className="items-center py-2">
            <View className="h-1 w-9 rounded-full bg-muted-foreground/40" />
          </View>
          <Text className="mb-4 font-bold text-foreground text-lg">
            {title}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-4">{children}</View>
          </ScrollView>
          {renderFooter()}
        </Pressable>
      </Pressable>
    </Modal>
  )
}
