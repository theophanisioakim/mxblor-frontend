import { cn } from "@workspace/ui/lib/utils"
import { View } from "../../../primitives/view"
import RncTranslationLabelSuggestionsBody from "./rnc-translation-label-suggestions-body"
import type { RncTranslationLabelSuggestionsProps } from "./rnc-translation-label-suggestions-model"

/**
 * Native variant — a plain absolute overlay inside the input's wrapper.
 *
 * No viewport anchoring is needed here: the dialog's `ScrollView` sizes itself
 * from its in-flow children, so an out-of-flow child never grows what it can
 * scroll. The web variant has to escape to the viewport because CSS
 * `overflow-y-auto` *does* count absolute descendants.
 */
export default function RncTranslationLabelSuggestions(
  props: Readonly<RncTranslationLabelSuggestionsProps>
) {
  const { open, dropUp } = props
  if (!open) return null

  return (
    <View
      className={cn(
        "absolute right-0 left-0 z-50 overflow-hidden rounded-md border border-border bg-background",
        dropUp ? "bottom-full mb-1" : "top-full mt-1"
      )}
    >
      <RncTranslationLabelSuggestionsBody {...props} />
    </View>
  )
}
