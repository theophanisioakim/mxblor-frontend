import type { ReactNode } from "react"
import { ScrollView } from "react-native"

/**
 * Native variant — the scrollable area of the suggestion list.
 *
 * Same cap as the web variant (`max-h-40` ≈ four rows). `nestedScrollEnabled` is
 * required on Android: this list sits inside the dialog's own `ScrollView`, and
 * without it the outer scroller would swallow the gesture.
 */
export default function RncTranslationLabelSuggestionsScroll({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <ScrollView
      className="max-h-40"
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  )
}
