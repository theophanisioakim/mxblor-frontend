import { cn } from "@workspace/ui/lib/utils"
import { Modal, Pressable, ScrollView } from "react-native"
import { Button } from "../../../primitives/button"
import { ChevronDown, Icon, Search, X } from "../../../primitives/icon"
import { Input } from "../../../primitives/input"
import { Label } from "../../../primitives/label"
import { Spinner } from "../../../primitives/spinner"
import { Text } from "../../../primitives/text"
import { View } from "../../../primitives/view"
import type { RncSelectRenderProps } from "./RncSelectRenderModel"
import useRncSelectRender from "./useRncSelectRender"

/**
 * Native variant — opens the options in a bottom-sheet `Modal`, dismissed by
 * tapping the backdrop.
 */
export default function RncSelectRender(props: Readonly<RncSelectRenderProps>) {
  const {
    selectId,
    errorId,
    helperId,
    isInvalid,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    helperText,
    errorMessage,
    hidden,
    multiple,
    searchable,
    isOpen,
    isLoading,
    searchQuery,
    setSearchQuery,
    filteredOptions,
    selectedValues,
    selectedOptions,
    visibleTags,
    hiddenTagsCount,
    isSelected,
    allSelected,
    toggleOpen,
    closeDropdown,
    toggleSelectAll,
    selectOption,
    removeValue,
    clearAll,
    texts,
  } = useRncSelectRender(props)

  if (hidden) return null

  const { selectedMaxChars } = props

  function truncateLabel(value: string) {
    if (selectedMaxChars && value.length > selectedMaxChars) {
      return `${value.slice(0, selectedMaxChars)}...`
    }
    return value
  }

  function renderSelectedTags() {
    if (selectedValues.length === 0) {
      return (
        <Text className="text-muted-foreground">{props.placeholder || ""}</Text>
      )
    }
    if (!multiple) {
      const selected = selectedOptions[0]
      if (!selected) return null
      return (
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          {selected.icon && (
            <Icon
              as={selected.icon}
              size={14}
              className="shrink-0 text-foreground"
            />
          )}
          <Text className="min-w-0 flex-1 text-foreground">
            {truncateLabel(selected.label)}
          </Text>
        </View>
      )
    }
    return (
      <>
        {visibleTags.map((opt) => (
          <View
            key={opt.id}
            className="max-w-full flex-row items-center gap-1 rounded-md bg-accent px-2 py-1"
          >
            {opt.icon && (
              <Icon
                as={opt.icon}
                size={12}
                className="shrink-0 text-foreground"
              />
            )}
            <Text className="shrink text-foreground text-sm">
              {truncateLabel(opt.label)}
            </Text>
            {!isDisabled && !isReadOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                aria-label={`Remove ${opt.label}`}
                onPress={() => removeValue(opt.id)}
              >
                <Icon as={X} size={12} />
              </Button>
            )}
          </View>
        ))}
        {hiddenTagsCount > 0 && (
          <View className="rounded-md bg-muted px-2 py-1">
            <Text className="text-foreground text-sm">+{hiddenTagsCount}</Text>
          </View>
        )}
      </>
    )
  }

  function renderSearchInput() {
    if (!searchable) return null
    return (
      <View className="flex-row items-center gap-2 border-border border-b px-2 py-2">
        <Icon as={Search} size={14} className="text-muted-foreground" />
        <Input
          className="flex-1 border-0"
          placeholder={props.searchPlaceholder || texts.search}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    )
  }

  function renderOptionsList() {
    if (isLoading) {
      return (
        <View className="items-center justify-center p-4">
          <Spinner size="small" />
        </View>
      )
    }
    if (filteredOptions.length === 0) {
      return (
        <View className="items-center p-3">
          <Text className="text-muted-foreground">{texts.noOptions}</Text>
        </View>
      )
    }
    return (
      <>
        {multiple && !searchQuery && (
          <Pressable
            onPress={toggleSelectAll}
            className={cn(
              "flex-row items-center justify-between border-border border-b px-3 py-2.5",
              allSelected && "bg-accent"
            )}
          >
            <Text className="font-semibold text-foreground">
              {texts.selectAll}
            </Text>
          </Pressable>
        )}
        {filteredOptions.map((option) => {
          const selected = isSelected(option.id)
          return (
            <Pressable
              key={option.id}
              onPress={() => selectOption(option.id)}
              className={cn(
                "flex-row items-start gap-2 px-3 py-2.5",
                selected && "bg-accent"
              )}
            >
              {option.icon && (
                <Icon
                  as={option.icon}
                  size={16}
                  className="mt-0.5 shrink-0 text-foreground"
                />
              )}
              <Text className="min-w-0 flex-1 text-foreground">
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </>
    )
  }

  let selectBorderClass = "border-input"
  if (isOpen) {
    selectBorderClass = "border-ring"
  }
  if (isInvalid) {
    selectBorderClass = "border-destructive"
  }

  return (
    <View className={cn("gap-2", isDisabled && "opacity-50")}>
      {label && (
        <Label htmlFor={selectId} className="font-semibold text-foreground">
          {label}
          {isRequired && <Text className="ml-1 text-destructive">*</Text>}
        </Label>
      )}

      <Pressable
        onPress={toggleOpen}
        disabled={isDisabled || isReadOnly}
        className={cn(
          "min-h-10.5 flex-row items-center justify-between rounded-lg border bg-background px-3 py-2",
          selectBorderClass
        )}
      >
        <View className="flex-1 flex-row flex-wrap items-center gap-1.5">
          {isLoading ? <Spinner size="small" /> : renderSelectedTags()}
        </View>

        <View className="flex-row items-center gap-1">
          {selectedValues.length > 0 && !isDisabled && !isReadOnly && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              aria-label={`Clear ${label || props.placeholder || "selection"}`}
              onPress={clearAll}
            >
              <Icon as={X} size={14} />
            </Button>
          )}
          <Icon
            as={ChevronDown}
            size={16}
            className={cn("text-foreground", isOpen && "rotate-180")}
          />
        </View>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={closeDropdown}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={closeDropdown}
        >
          <Pressable className="max-h-[50%] rounded-t-2xl bg-background p-4">
            <View className="mb-2 items-center">
              <View className="h-1 w-9 rounded-full bg-muted-foreground/40" />
            </View>
            {label && (
              <Text className="mb-3 font-bold text-foreground text-lg">
                {label}
              </Text>
            )}
            {renderSearchInput()}
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderOptionsList()}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {helperText && !isInvalid && (
        <Text id={helperId} className="text-muted-foreground text-xs">
          {helperText}
        </Text>
      )}

      {isInvalid && (
        <Text id={errorId} role="alert" className="text-destructive text-xs">
          {errorMessage}
        </Text>
      )}
    </View>
  )
}
