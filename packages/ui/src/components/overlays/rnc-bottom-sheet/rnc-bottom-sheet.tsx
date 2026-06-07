"use client"

import { Button } from "../../primitives/button"
import { Text } from "../../primitives/text"
import { View } from "../../primitives/view"
import type { RncBottomSheetProps } from "./rnc-bottom-sheet-model"

/**
 * Cross-platform bottom sheet — web variant.
 *
 * Renders a fixed overlay anchored to the bottom of the viewport. The native
 * variant (`rnc-bottom-sheet.native.tsx`) uses a react-native `Modal`.
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

  if (!open) return null

  const height = snapPoints[0] ?? 65
  const maxHeight = typeof height === "number" ? `${height}%` : height

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
    <View className="fixed inset-0 z-50">
      <View
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <View
        className="absolute right-0 bottom-0 left-0 z-10 rounded-t-2xl bg-background p-4"
        style={{ maxHeight }}
      >
        <View className="items-center py-2">
          <View className="h-1 w-9 rounded-full bg-muted-foreground/40" />
        </View>
        <Text className="mb-4 font-bold text-foreground text-lg">{title}</Text>
        <View className="gap-4 overflow-y-auto">{children}</View>
        {renderFooter()}
      </View>
    </View>
  )
}
