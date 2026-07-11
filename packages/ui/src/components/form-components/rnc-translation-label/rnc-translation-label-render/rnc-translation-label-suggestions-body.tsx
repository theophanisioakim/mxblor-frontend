import { Pressable } from "../../../primitives/pressable"
import { Spinner } from "../../../primitives/spinner"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import type { RncTranslationLabelSuggestionsProps } from "./rnc-translation-label-suggestions-model"
import RncTranslationLabelSuggestionsScroll from "./rnc-translation-label-suggestions-scroll"

type BodyProps = Pick<
  RncTranslationLabelSuggestionsProps,
  "isSearching" | "suggestions" | "suggestionText" | "texts" | "onPick"
>

/**
 * What goes *inside* the floating list. Identical on both platforms — only the
 * positioning of the panel around it differs, so only that is split.
 */
export default function RncTranslationLabelSuggestionsBody(
  props: Readonly<BodyProps>
) {
  const { isSearching, suggestions, suggestionText, texts, onPick } = props

  if (isSearching) {
    return (
      <View className="items-center p-2">
        <Spinner size="small" />
      </View>
    )
  }

  if (suggestions.length === 0) {
    return (
      <View className="p-2">
        <Text className="text-muted-foreground text-xs">
          {texts.noSuggestions}
        </Text>
      </View>
    )
  }

  return (
    <>
      {/* Pinned: stays put while the matches below it scroll. */}
      <View className="bg-muted px-2 py-1">
        <Text className="text-muted-foreground text-xs">
          {texts.suggestions}
        </Text>
      </View>
      <RncTranslationLabelSuggestionsScroll>
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion.id}
            onPress={() => onPick(suggestion)}
            className="border-border border-t px-2 py-2"
          >
            <Text className="text-foreground text-sm">
              {suggestionText(suggestion)}
            </Text>
          </Pressable>
        ))}
      </RncTranslationLabelSuggestionsScroll>
    </>
  )
}
