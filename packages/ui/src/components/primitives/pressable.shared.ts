/**
 * Minimal press-event shape shared by the web and native `Pressable` variants.
 * Web passes a DOM `MouseEvent` (which has `stopPropagation`); native passes a
 * `GestureResponderEvent`. Consumers that need to stop row-click propagation use
 * `event?.stopPropagation?.()`, a no-op where the method is absent.
 */
export interface PressableEvent {
  stopPropagation?: () => void
  preventDefault?: () => void
}
