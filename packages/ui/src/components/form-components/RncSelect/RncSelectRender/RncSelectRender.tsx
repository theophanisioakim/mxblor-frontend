import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useRef } from "react"
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
 * Web variant — renders an absolutely-positioned dropdown below the trigger and
 * closes it on an outside click.
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

  const containerRef = useRef<HTMLDivElement>(null)

  // Close the dropdown when clicking outside of it.
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, closeDropdown])

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
        <Text className="text-muted-foreground text-sm">
          {props.placeholder || ""}
        </Text>
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
          <Text className="wrap-break-word min-w-0 flex-1 text-foreground">
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
            <Text className="wrap-break-word min-w-0 shrink text-foreground text-sm">
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
          autoFocus
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
          <View
            onClick={toggleSelectAll}
            className={cn(
              "cursor-pointer flex-row items-center justify-between border-border border-b px-3 py-2.5 hover:bg-accent",
              allSelected && "bg-accent"
            )}
          >
            <Text className="font-semibold text-foreground">
              {texts.selectAll}
            </Text>
          </View>
        )}
        {filteredOptions.map((option) => {
          const selected = isSelected(option.id)
          return (
            <View
              key={option.id}
              onClick={() => selectOption(option.id)}
              className={cn(
                "cursor-pointer flex-row items-start gap-2 px-3 py-2.5 hover:bg-accent",
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
              <Text className="wrap-break-word min-w-0 flex-1 text-foreground">
                {option.label}
              </Text>
            </View>
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

      <View ref={containerRef} className="relative">
        {/* Trigger */}
        <View
          id={selectId}
          onClick={toggleOpen}
          role="combobox"
          aria-expanded={isOpen}
          aria-invalid={isInvalid}
          aria-describedby={
            `${isInvalid ? errorId : ""} ${helperText ? helperId : ""}`.trim() ||
            undefined
          }
          aria-required={isRequired}
          className={cn(
            "min-h-10.5 flex-row items-center justify-between rounded-lg border bg-background px-3 py-2",
            selectBorderClass,
            isDisabled || isReadOnly ? "cursor-not-allowed" : "cursor-pointer"
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
              className={cn(
                "text-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </View>
        </View>

        {/* Dropdown */}
        {isOpen && (
          <View className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-border bg-background">
            {renderSearchInput()}
            <View className="max-h-52 overflow-y-auto">
              {renderOptionsList()}
            </View>
          </View>
        )}
      </View>

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
