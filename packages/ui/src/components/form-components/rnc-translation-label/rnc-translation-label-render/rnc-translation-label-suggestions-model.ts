import type { TranslationLabelResponseDto } from "@workspace/api-client"

/**
 * The floating autocomplete list. Its two variants exist for one reason: on web
 * the dialog panel is `overflow-y-auto`, and an absolutely-positioned descendant
 * still counts toward that panel's scrollable region — so a list anchored inside
 * it gives the modal a scrollbar. The web variant escapes the panel by anchoring
 * to the viewport (`position: fixed`). React Native's `ScrollView` sizes itself
 * from in-flow children only, so out-of-flow children never grow it and the
 * native variant can stay a plain absolute overlay.
 */
export interface RncTranslationLabelSuggestionsProps {
  open: boolean
  /** Open upward — used on the last language, which has nothing below it. */
  dropUp: boolean
  isSearching: boolean
  suggestions: TranslationLabelResponseDto[]
  /** Renders one label's texts as a single line. */
  suggestionText: (label: TranslationLabelResponseDto) => string
  texts: { suggestions: string; noSuggestions: string }
  onPick: (label: TranslationLabelResponseDto) => void
}
