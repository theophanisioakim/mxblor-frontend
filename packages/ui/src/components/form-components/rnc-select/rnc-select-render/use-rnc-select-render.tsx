import { useTranslation } from "@workspace/i18n"
import { useCallback, useEffect, useId, useMemo, useState } from "react"
import { type UseFormReturn, useFormContext } from "react-hook-form"
import type {
  RncSelectFieldContext,
  RncSelectOption,
} from "../rnc-select-model"
import type { RncSelectRenderProps } from "./rnc-select-render-model"

type SelectValue = string | number
type FormValue = SelectValue | SelectValue[] | undefined
type FireOnChange = (
  nv: FormValue,
  context: UseFormReturn,
  fieldContext: RncSelectFieldContext
) => Promise<void>

export default function useRncSelectRender(props: RncSelectRenderProps) {
  const { t } = useTranslation(["common"])
  const texts = {
    search: t("common:select.search"),
    noOptions: t("common:select.noOptions"),
    selectAll: t("common:select.selectAll"),
  }
  const formContext = useFormContext()
  const formValue: FormValue = formContext.getValues(
    props.fieldContext.field.name
  )
  const uniqueId = useId()
  const selectId = `selectid__${props.id}__${uniqueId}`
  const errorId = `${selectId}__error`
  const helperId = `${selectId}__helper`

  const isInvalid = props.fieldContext.fieldState.invalid
  const isDisabled = props.disabled || false
  const isReadOnly = props.readOnly || false
  const isRequired = props.required || false
  const label = props.label
  const helperText = props.helperText
  const errorMessage = props.fieldContext.fieldState.error?.message
  const hidden = props.hidden || false
  const multiple = props.multiple || false
  const searchable = props.searchable !== false
  const limitTags = props.multiple ? props.limitTags : undefined

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Async options loading
  const [loadedOptions, setLoadedOptions] = useState<RncSelectOption[] | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(!!props.optionsLoader)
  const watchedValues = formContext.watch(props.watchFields ?? [])

  useEffect(() => {
    if (!props.optionsLoader) return
    let cancelled = false
    setIsLoading(true)
    setLoadedOptions(null)
    props.optionsLoader(formContext).then((result) => {
      if (cancelled) return
      setLoadedOptions(result)
      setIsLoading(false)

      // Clear selected values that are no longer available in the new options
      const validIds = new Set(result.map((opt) => opt.id))
      const currentValue: FormValue = formContext.getValues(
        props.fieldContext.field.name
      )
      if (multiple && Array.isArray(currentValue)) {
        const cleaned = currentValue.filter((v) => validIds.has(v))
        if (cleaned.length !== currentValue.length) {
          props.fieldContext.field.onChange(cleaned)
        }
      } else if (
        !multiple &&
        currentValue !== undefined &&
        currentValue !== null &&
        !Array.isArray(currentValue) &&
        !validIds.has(currentValue)
      ) {
        props.fieldContext.field.onChange(undefined)
      }
    })
    return () => {
      cancelled = true
    }
  }, [
    props.optionsLoader,
    ...watchedValues,
    formContext.getValues,
    multiple,
    props.fieldContext.field.name,
    props.fieldContext.field.onChange,
    formContext,
  ])

  // optionsLoader takes priority over static options
  const rawOptions = props.optionsLoader
    ? (loadedOptions ?? [])
    : (props.options ?? [])

  // Deduplicate if uniqueOptions is set
  const options = useMemo(() => {
    if (!props.uniqueOptions) return rawOptions
    const seen = new Set<SelectValue>()
    return rawOptions.filter((opt) => {
      if (seen.has(opt.id)) return false
      seen.add(opt.id)
      return true
    })
  }, [rawOptions, props.uniqueOptions])

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options
    const query = searchQuery.toLowerCase()
    return options.filter((option) => {
      const searchTarget = option.filterString ?? option.label
      return searchTarget.toLowerCase().includes(query)
    })
  }, [options, searchQuery])

  const selectedValues: SelectValue[] = useMemo(() => {
    if (formValue === undefined || formValue === null) return []
    if (Array.isArray(formValue)) return formValue
    return [formValue]
  }, [formValue])

  const selectedOptions = useMemo(() => {
    return selectedValues
      .map((val) => options.find((opt) => opt.id === val))
      .filter((opt): opt is RncSelectOption => Boolean(opt))
  }, [selectedValues, options])

  const visibleTags = useMemo(() => {
    if (!multiple || limitTags === undefined) return selectedOptions
    return selectedOptions.slice(0, limitTags)
  }, [multiple, limitTags, selectedOptions])

  const hiddenTagsCount = useMemo(() => {
    if (!multiple || limitTags === undefined) return 0
    return Math.max(0, selectedOptions.length - limitTags)
  }, [multiple, limitTags, selectedOptions])

  const isSelected = useCallback(
    (id: SelectValue) => selectedValues.includes(id),
    [selectedValues]
  )

  const allSelected = useMemo(() => {
    if (!multiple || options.length === 0) return false
    return options.every((opt) => selectedValues.includes(opt.id))
  }, [multiple, options, selectedValues])

  async function fireOnChange(newValue: FormValue) {
    const onChange = props.onChange as FireOnChange | undefined
    if (onChange) {
      await onChange(newValue, formContext, props.fieldContext)
    }
  }

  function openDropdown() {
    if (isDisabled || isReadOnly) return
    setIsOpen(true)
  }

  function closeDropdown() {
    setIsOpen(false)
    setSearchQuery("")
  }

  function toggleOpen() {
    if (isDisabled || isReadOnly) return
    if (isOpen) {
      closeDropdown()
    } else {
      setIsOpen(true)
    }
  }

  async function selectOption(optionId: SelectValue) {
    if (multiple) {
      const current = Array.isArray(formValue) ? formValue : []
      const newValue = current.includes(optionId)
        ? current.filter((v) => v !== optionId)
        : [...current, optionId]
      props.fieldContext.field.onChange(newValue)
      await fireOnChange(newValue)
    } else {
      const newValue = formValue === optionId ? undefined : optionId
      props.fieldContext.field.onChange(newValue)
      closeDropdown()
      await fireOnChange(newValue)
    }
  }

  async function toggleSelectAll() {
    if (!multiple) return
    const newValue = allSelected ? [] : options.map((opt) => opt.id)
    props.fieldContext.field.onChange(newValue)
    await fireOnChange(newValue)
  }

  function removeValue(valueToRemove: SelectValue) {
    if (isDisabled || isReadOnly) return
    if (multiple) {
      const current = Array.isArray(formValue) ? formValue : []
      const newValue = current.filter((v) => v !== valueToRemove)
      props.fieldContext.field.onChange(newValue)
    }
  }

  function clearAll() {
    if (isDisabled || isReadOnly) return
    const newValue = multiple ? [] : undefined
    props.fieldContext.field.onChange(newValue)
    setSearchQuery("")
  }

  return {
    texts,
    formValue,
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
    openDropdown,
    closeDropdown,
    toggleOpen,
    toggleSelectAll,
    selectOption,
    removeValue,
    clearAll,
  }
}
