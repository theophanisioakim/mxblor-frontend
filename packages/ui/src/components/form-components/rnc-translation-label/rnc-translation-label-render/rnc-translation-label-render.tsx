"use client"

import type { TranslationLabelResponseDto } from "@workspace/api-client"
import { cn } from "@workspace/ui/lib/utils"
import { RncDialog } from "../../../overlays/rnc-dialog/rnc-dialog"
import { Button } from "../../../primitives/button"
import { Globe, Icon, Pencil } from "../../../primitives/icon"
import { Input } from "../../../primitives/input"
import { Label } from "../../../primitives/label"
import { Pressable } from "../../../primitives/pressable"
import { Spinner } from "../../../primitives/spinner"
import { Switch } from "../../../primitives/switch"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import type { RncTranslationLabelRenderProps } from "./rnc-translation-label-render-model"
import RncTranslationLabelSuggestions from "./rnc-translation-label-suggestions"
import useRncTranslationLabelRender from "./use-rnc-translation-label-render"

const VARIANT_CLASS = {
  rounded: "rounded-lg border",
  outline: "rounded-md border",
  underlined: "rounded-none border-b",
} as const

const SIZE_CLASS = {
  lg: "min-h-12 px-4 py-3",
  md: "min-h-10.5 px-3 py-2",
  sm: "min-h-9 px-2 py-1.5",
} as const

/**
 * Platform-free render — every piece it composes (`RncDialog`, `Input`,
 * `Switch`, `Pressable`, …) already ships its own web/native variant.
 *
 * The one genuine platform difference — how the floating suggestion list is
 * positioned so it does not make the dialog scroll — is isolated in
 * `RncTranslationLabelSuggestions`, which has the `.tsx`/`.native.tsx` pair.
 */
export default function RncTranslationLabelRender(
  props: Readonly<RncTranslationLabelRenderProps>
) {
  const {
    texts,
    fieldId,
    errorId,
    helperId,
    variant,
    size,
    isInvalid,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
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
    allowGlobalNamespace,
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
  } = useRncTranslationLabelRender(props)

  if (hidden) return null

  function suggestionText(suggestion: TranslationLabelResponseDto) {
    const locales = suggestion.locales
    if (!locales) return ""
    return languages
      .map((language) => locales[language]?.trim())
      .filter((text) => !!text)
      .join(" · ")
  }

  function renderLanguageInput(language: string, index: number) {
    const isDefault = language === defaultLanguage
    const isMandatory = mandatoryLanguages.includes(language)
    const isSearchOpen = suggestionsLanguage === language
    // Only the last language has nothing below it to cover, so only it drops up.
    const dropUp = index === languages.length - 1 && languages.length > 1
    return (
      // The open row must outrank the rows after it, or its floating list would
      // paint *under* them: React Native's `zIndex` only orders siblings, so
      // lifting the list alone is not enough — the row has to be lifted too.
      <View key={language} className={cn("gap-2", isSearchOpen && "z-50")}>
        <View className="flex-row items-center gap-2">
          <Label className="font-semibold text-foreground uppercase">
            {language}
          </Label>
          {isDefault && (
            <View className="rounded-md bg-muted px-2 py-0.5">
              <Text className="text-muted-foreground text-xs">
                {texts.defaultBadge}
              </Text>
            </View>
          )}
          {isMandatory && <Text className="text-destructive">*</Text>}
        </View>
        <View className="relative">
          <Input
            value={drafts[language] ?? ""}
            onChangeText={(text) => changeDraft(language, text)}
            onFocus={() => focusLanguage(language)}
            onBlur={blurLanguage}
            placeholder={props.placeholder}
            editable={!isSaving}
            aria-label={language}
          />
          <RncTranslationLabelSuggestions
            open={isSearchOpen}
            dropUp={dropUp}
            isSearching={isSearching}
            suggestions={suggestions}
            suggestionText={suggestionText}
            texts={texts}
            onPick={pickSuggestion}
          />
        </View>
      </View>
    )
  }

  function renderTriggerContent() {
    if (isHydrating) {
      return (
        <View className="min-w-0 flex-1">
          <Spinner size="small" />
        </View>
      )
    }
    if (triggerText) {
      return (
        <Text className="min-w-0 flex-1 text-foreground">{triggerText}</Text>
      )
    }
    return (
      <Text className="min-w-0 flex-1 text-muted-foreground">
        {props.placeholder || texts.empty}
      </Text>
    )
  }

  function renderFooter() {
    return (
      <View className="flex-row justify-end gap-3">
        <Button variant="outline" onPress={closeModal} disabled={isSaving}>
          <Text>{texts.cancel}</Text>
        </Button>
        <Button onPress={save} disabled={!canSave}>
          {isSaving && <Spinner size="small" />}
          <Text>{texts.save}</Text>
        </Button>
      </View>
    )
  }

  let triggerBorderClass = "border-input"
  if (isOpen) {
    triggerBorderClass = "border-ring"
  }
  if (isInvalid) {
    triggerBorderClass = "border-destructive"
  }

  return (
    <View className={cn("gap-2", isDisabled && "opacity-50")}>
      {label && (
        <Label htmlFor={fieldId} className="font-semibold text-foreground">
          {label}
          {isRequired && <Text className="ml-1 text-destructive">*</Text>}
        </Label>
      )}

      <Pressable
        id={fieldId}
        onPress={openModal}
        disabled={
          isDisabled || isReadOnly || isHydrating || isLanguagesUnavailable
        }
        aria-invalid={isInvalid}
        aria-required={isRequired}
        aria-describedby={
          `${isInvalid ? errorId : ""} ${helperText ? helperId : ""}`.trim() ||
          undefined
        }
        className={cn(
          "flex-row items-center justify-between gap-2 bg-background",
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          triggerBorderClass
        )}
      >
        {renderTriggerContent()}
        <Icon as={Pencil} size={16} className="shrink-0 text-foreground" />
      </Pressable>

      {isLanguagesUnavailable && (
        <Text className="text-destructive text-xs">
          {texts.languagesUnavailable}
        </Text>
      )}

      {helperText && !isInvalid && !isLanguagesUnavailable && (
        <Text id={helperId} className="text-muted-foreground text-xs">
          {helperText}
        </Text>
      )}

      {isInvalid && (
        <Text id={errorId} role="alert" className="text-destructive text-xs">
          {errorMessage}
        </Text>
      )}

      <RncDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeModal()
        }}
        dismissable={!isSaving}
        title={label ? `${texts.title} — ${label}` : texts.title}
        onCancel={closeModal}
        footer={renderFooter()}
      >
        <View className="gap-4">
          {allowGlobalNamespace && (
            <View className="flex-row items-center gap-2">
              <Switch
                checked={useGlobalNamespace}
                onCheckedChange={toggleGlobalNamespace}
                disabled={isSaving}
                aria-label={texts.globalNamespace}
              />
              <Icon as={Globe} size={16} className="text-muted-foreground" />
              <Text className="text-foreground text-sm">
                {texts.globalNamespace}
              </Text>
            </View>
          )}

          {languages.map((language, index) =>
            renderLanguageInput(language, index)
          )}

          <Text className="text-muted-foreground text-xs">
            {texts.disclaimer}
          </Text>

          {saveError && (
            <View className="rounded-md bg-destructive/10 p-2">
              <Text className="text-destructive text-sm">{saveError}</Text>
            </View>
          )}
        </View>
      </RncDialog>
    </View>
  )
}
