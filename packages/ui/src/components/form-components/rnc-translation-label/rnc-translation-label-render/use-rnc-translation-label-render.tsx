import {
  searchTranslationLabels,
  type TranslationLabelResponseDto,
  useGetTranslationLabelById,
  useLanguageConfig,
  useUpsertTranslationLabel,
} from "@workspace/api-client"
import { useTranslation } from "@workspace/i18n"
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import type { RncTranslationLabelProps } from "../rnc-translation-label-model"
import type { RncTranslationLabelRenderProps } from "./rnc-translation-label-render-model"

/** Locale code -> text. */
export type Locales = Record<string, string>

type FireOnChange = NonNullable<RncTranslationLabelProps["onChange"]>

/** Debounce applied to the autocomplete search, in ms. */
const SEARCH_DEBOUNCE_MS = 275
/**
 * Shortest query that triggers a search. Below this the field issues no request
 * at all and shows no list — one or two characters match almost everything in a
 * namespace, so those calls are pure noise.
 */
const MIN_SEARCH_CHARS = 3
/**
 * How many labels the autocomplete asks for. All of them are reachable: the list
 * shows about four rows and scrolls **within itself** for the rest, so the extra
 * matches never spill onto the dialog (see `rnc-translation-label-suggestions`).
 */
const SEARCH_LIMIT = 8
/** Grace period between an input blurring and its suggestion list closing. */
const SUGGESTION_CLOSE_DELAY_MS = 150

const DEFAULT_GLOBAL_NAMESPACE = "global"

function trimmed(locales: Locales | undefined, language: string): string {
  return (locales?.[language] ?? "").trim()
}

/** Drops blank texts — the backend ignores them anyway. */
function compactLocales(locales: Locales): Locales {
  const compacted: Locales = {}
  for (const [language, text] of Object.entries(locales)) {
    const value = text.trim()
    if (value) compacted[language] = value
  }
  return compacted
}

function sameLocales(a: Locales | undefined, b: Locales | undefined): boolean {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])
  for (const key of keys) {
    if (trimmed(a, key) !== trimmed(b, key)) return false
  }
  return true
}

export default function useRncTranslationLabelRender(
  props: RncTranslationLabelRenderProps
) {
  const { t, i18n } = useTranslation(["common"])
  const texts = {
    title: t("common:translationLabel.title"),
    empty: t("common:translationLabel.empty"),
    defaultBadge: t("common:translationLabel.defaultBadge"),
    globalNamespace: t("common:translationLabel.globalNamespace"),
    suggestions: t("common:translationLabel.suggestions"),
    noSuggestions: t("common:translationLabel.noSuggestions"),
    disclaimer: t("common:translationLabel.disclaimer"),
    save: t("common:translationLabel.save"),
    cancel: t("common:translationLabel.cancel"),
    saveError: t("common:translationLabel.saveError"),
    languagesUnavailable: t("common:translationLabel.languagesUnavailable"),
  }

  const formContext = useFormContext()
  const labelId: string | undefined = formContext.getValues(
    props.fieldContext.field.name
  )

  const uniqueId = useId()
  const fieldId = `translationlabelid__${props.id}__${uniqueId}`
  const errorId = `${fieldId}__error`
  const helperId = `${fieldId}__helper`

  const variant = props.variant || "rounded"
  const size = props.size || "md"
  const display = props.display || "default"
  const requiredLanguages = props.requiredLanguages || "default"
  const globalNamespace = props.globalNamespace || DEFAULT_GLOBAL_NAMESPACE
  const isInvalid = props.fieldContext.fieldState.invalid
  const isDisabled = props.disabled || false
  const isReadOnly = props.readOnly || false
  const isRequired = props.required || false
  const label = props.label
  const helperText = props.helperText
  const errorMessage = props.fieldContext.fieldState.error?.message
  const hidden = props.hidden || false

  /**
   * Languages of the tenant — the default one is always first. Read from
   * context, not fetched: `LanguageConfigProvider` loads this once for the whole
   * app (and refetches on login/logout/tenant switch), so a screen with several
   * of these fields costs no extra requests.
   */
  const {
    defaultLanguage,
    availableLanguages: languages,
    isLoading: isLoadingLanguages,
  } = useLanguageConfig()

  /** Hydrates the field's current value so the trigger can show its texts. */
  const { data: hydratedLabel, isFetching: isHydratingLabel } =
    useGetTranslationLabelById(labelId ?? "", {
      query: { enabled: !!labelId },
    })

  /**
   * Locales of the label we just picked/saved — avoids a refetch round-trip
   * before the trigger can show the new texts.
   */
  const [resolved, setResolved] = useState<TranslationLabelResponseDto>()

  const currentLabel: TranslationLabelResponseDto | undefined = useMemo(() => {
    if (!labelId) return undefined
    if (resolved?.id === labelId) return resolved
    if (hydratedLabel?.id === labelId) return hydratedLabel
    return undefined
  }, [labelId, resolved, hydratedLabel])

  const currentLocales: Locales | undefined = currentLabel?.locales

  /**
   * The modal is not safe to open yet. Either the field holds a label whose
   * texts are still on their way — opening now would seed empty inputs, which
   * Save would read as "clear the field" — or the tenant's languages have not
   * arrived, which would render a modal with no inputs at all. The trigger waits
   * on both.
   */
  const isHydrating =
    isLoadingLanguages || (!!labelId && !currentLabel && isHydratingLabel)

  /**
   * Required fields need a default language to save. If the tenant config never
   * arrived, block the modal and keep Save disabled so a save cannot clear the
   * field by treating empty drafts as "no default-language text".
   */
  const isLanguagesUnavailable =
    isRequired && !isLoadingLanguages && !defaultLanguage

  /** The text shown on the closed field. */
  const triggerText = useMemo(() => {
    if (!labelId || !currentLocales) return ""
    if (display === "all") {
      return languages
        .map((language) => ({
          language,
          text: trimmed(currentLocales, language),
        }))
        .filter((entry) => entry.text)
        .map((entry) => `${entry.language}: ${entry.text}`)
        .join(" · ")
    }
    if (display === "current") {
      return (
        trimmed(currentLocales, i18n.language) ||
        trimmed(currentLocales, defaultLanguage)
      )
    }
    return trimmed(currentLocales, defaultLanguage)
  }, [
    labelId,
    currentLocales,
    display,
    languages,
    i18n.language,
    defaultLanguage,
  ])

  /* ----------------------------- modal state ----------------------------- */

  const [isOpen, setIsOpen] = useState(false)
  const [drafts, setDrafts] = useState<Locales>({})
  /** The label the user picked from the autocomplete (or the field's value). */
  const [pickedLabelId, setPickedLabelId] = useState<string>()
  /** Its locales as they were when picked — the reuse baseline. */
  const [pickedLocales, setPickedLocales] = useState<Locales>()
  const [useGlobalNamespace, setUseGlobalNamespace] = useState(false)
  const [saveError, setSaveError] = useState<string>()

  const [searchLanguage, setSearchLanguage] = useState<string>()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<TranslationLabelResponseDto[]>(
    []
  )
  const [isSearching, setIsSearching] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Never let a queued blur-close fire after the field is gone. Clears the timer
  // directly rather than calling `cancelPendingClose` — that function is rebuilt
  // every render, and depending on it would re-run this cleanup on every render,
  // cancelling the very timer the blur-close relies on.
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    },
    []
  )

  const upsertMutation = useUpsertTranslationLabel()
  const isSaving = upsertMutation.isPending

  const activeNamespace = useGlobalNamespace
    ? globalNamespace
    : props.keyNamespace

  const mandatoryLanguages = useMemo(() => {
    if (!isRequired) return []
    if (requiredLanguages === "all") return languages
    return defaultLanguage ? [defaultLanguage] : []
  }, [isRequired, requiredLanguages, languages, defaultLanguage])

  const canSave = useMemo(() => {
    if (isSaving || isLanguagesUnavailable) return false
    return mandatoryLanguages.every((language) => trimmed(drafts, language))
  }, [isSaving, isLanguagesUnavailable, mandatoryLanguages, drafts])

  const isPristinePick =
    !!pickedLabelId && sameLocales(pickedLocales, drafts) && !!pickedLocales

  /* --------------------------- open / close ------------------------------ */

  function resetSearch() {
    cancelPendingClose()
    setSearchLanguage(undefined)
    setSearchQuery("")
    setSuggestions([])
    setIsSearching(false)
  }

  function cancelPendingClose() {
    if (!closeTimer.current) return
    clearTimeout(closeTimer.current)
    closeTimer.current = undefined
  }

  /**
   * The suggestion list floats *over* the language inputs below it, so it has to
   * close on blur — otherwise it would swallow the tap meant for the input it
   * covers. The delay lets a tap on a suggestion land before the list unmounts
   * (blur fires first on both platforms).
   */
  function blurLanguage() {
    cancelPendingClose()
    closeTimer.current = setTimeout(resetSearch, SUGGESTION_CLOSE_DELAY_MS)
  }

  /** Opens the list for a language without touching its draft text. */
  function focusLanguage(language: string) {
    cancelPendingClose()
    setSearchLanguage(language)
    setSearchQuery(drafts[language] ?? "")
  }

  function openModal() {
    if (isDisabled || isReadOnly || isHydrating || isLanguagesUnavailable)
      return
    const seed: Locales = { ...(currentLocales ?? {}) }
    setDrafts(seed)
    setPickedLabelId(labelId)
    setPickedLocales(labelId ? seed : undefined)
    setUseGlobalNamespace(
      !!props.allowGlobalNamespace &&
        currentLabel?.namespace === globalNamespace
    )
    setSaveError(undefined)
    resetSearch()
    setIsOpen(true)
  }

  function closeModal() {
    // A dismissal must never interrupt a save in flight.
    if (isSaving) return
    setIsOpen(false)
    resetSearch()
    setSaveError(undefined)
  }

  /* ----------------------------- autocomplete ---------------------------- */

  const query = searchQuery.trim()
  const isQueryLongEnough = query.length >= MIN_SEARCH_CHARS

  /**
   * The language whose suggestion list is currently showing. Below the minimum
   * query length there is no list at all — not an empty one — so a couple of
   * stray keystrokes never pop a panel over the fields.
   */
  const suggestionsLanguage = isQueryLongEnough ? searchLanguage : undefined

  useEffect(() => {
    if (!isOpen || !searchLanguage) return

    // Too short to be worth a round trip: drop anything already listed and stop
    // before the debounce timer is even armed.
    if (!isQueryLongEnough) {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    setIsSearching(true)
    const timer = setTimeout(() => {
      searchTranslationLabels(
        {
          namespace: activeNamespace,
          q: query,
          limit: SEARCH_LIMIT,
        },
        controller.signal
      )
        .then((results) => {
          setSuggestions(results)
          setIsSearching(false)
        })
        .catch(() => {
          if (controller.signal.aborted) return
          setSuggestions([])
          setIsSearching(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [isOpen, searchLanguage, query, isQueryLongEnough, activeNamespace])

  function changeDraft(language: string, text: string) {
    cancelPendingClose()
    setDrafts((previous) => ({ ...previous, [language]: text }))
    setSearchLanguage(language)
    setSearchQuery(text)
  }

  function pickSuggestion(suggestion: TranslationLabelResponseDto) {
    const locales: Locales = { ...(suggestion.locales ?? {}) }
    setDrafts(locales)
    setPickedLabelId(suggestion.id)
    setPickedLocales(locales)
    resetSearch()
  }

  function toggleGlobalNamespace(next: boolean) {
    setUseGlobalNamespace(next)
    // The picked label belongs to the previous namespace — it can no longer be
    // reused, and the open search must re-run against the new namespace.
    setPickedLabelId(undefined)
    setPickedLocales(undefined)
    setSuggestions([])
  }

  /* -------------------------------- save --------------------------------- */

  const fireOnChange = useCallback(
    async (newLabelId: string | undefined) => {
      const onChange: FireOnChange | undefined = props.onChange
      if (onChange) {
        await onChange(newLabelId, formContext, props.fieldContext)
      }
    },
    [props.onChange, props.fieldContext, formContext]
  )

  async function commit(
    newLabelId: string | undefined,
    labelValue?: TranslationLabelResponseDto
  ) {
    setResolved(labelValue)
    props.fieldContext.field.onChange(newLabelId)
    setIsOpen(false)
    resetSearch()
    await fireOnChange(newLabelId)
  }

  async function save() {
    if (!canSave || isSaving) return
    setSaveError(undefined)

    // No default-language text -> the field is cleared (only reachable when the
    // field is not required, since Save stays disabled otherwise).
    if (!trimmed(drafts, defaultLanguage)) {
      await commit(undefined, undefined)
      return
    }

    // Untouched pick of an existing label -> reuse it, write nothing.
    if (pickedLabelId && isPristinePick) {
      await commit(pickedLabelId, {
        id: pickedLabelId,
        namespace: activeNamespace,
        locales: pickedLocales,
      })
      return
    }

    try {
      const result = await upsertMutation.mutateAsync({
        data: {
          namespace: activeNamespace,
          locales: compactLocales(drafts),
        },
      })
      await commit(result.id, result)
    } catch {
      setSaveError(texts.saveError)
    }
  }

  return {
    texts,
    fieldId,
    errorId,
    helperId,
    variant,
    size,
    display,
    isInvalid,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
    labelId,
    isHydrating,
    isLanguagesUnavailable,
    triggerText,
    languages,
    defaultLanguage,
    mandatoryLanguages,
    isOpen,
    openModal,
    closeModal,
    drafts,
    changeDraft,
    focusLanguage,
    blurLanguage,
    allowGlobalNamespace: props.allowGlobalNamespace || false,
    useGlobalNamespace,
    toggleGlobalNamespace,
    suggestionsLanguage,
    suggestions,
    isSearching,
    pickSuggestion,
    canSave,
    isSaving,
    saveError,
    save,
  }
}
