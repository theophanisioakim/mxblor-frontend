import { useCallback, useEffect, useRef, useState } from "react"
import { type FieldErrors, type FieldValues, useForm } from "react-hook-form"
import type { RncFormProps } from "./rnc-form-model"

export default function useRncFormInternal<T>(props: RncFormProps<T>) {
  // Only treat the form as "loading" when there is async work to wait for.
  // Passing an async `defaultValues` function unconditionally makes RHF report
  // `formState.isLoading` and our own flags `true` on the first render, which
  // doesn't survive SSR hydration: the server resolves to `false` (button
  // enabled) while the client's first render still reads `true` (disabled),
  // mismatching the `disabled` attribute. So async defaults / loading flags are
  // gated on the props that actually need them.
  const hasAsyncValues =
    Boolean(props.loadFormValues) && props.defaultValues === undefined
  const methods = useForm({
    mode: props.mode ?? "onBlur",
    defaultValues: props.defaultValues ?? (hasAsyncValues ? loadData : {}),
  })

  // State to track loading status
  const [loading, setLoading] = useState<boolean>(hasAsyncValues)
  const [loadingOnLoad, setLoadingOnLoad] = useState<boolean>(
    Boolean(props.onLoad)
  )

  // Function to load initial form values
  async function loadData() {
    if (props.loadFormValues) {
      const loadedFormValues = await props.loadFormValues()
      setLoading(false)
      return loadedFormValues
    }
    setLoading(false)
    return {}
  }

  // onSubmit handler
  const onSubmit = useCallback(
    async (data: FieldValues) => {
      return await props.onSubmit(data as T, methods)
    },
    [methods, props]
  )

  // onSubmitInvalid handler — focus the first field with an error
  const onSubmitInvalid = useCallback((errors: FieldErrors) => {
    for (const key of Object.keys(errors)) {
      const ref = errors[key]?.ref as { focus?: () => void } | undefined
      if (ref?.focus) {
        ref.focus()
        break
      }
    }
  }, [])

  const onValuesChangeRef = useRef(props.onValuesChange)
  onValuesChangeRef.current = props.onValuesChange

  // Track loading via ref so the watch effect never needs to re-run because of it.
  const isLoadingRef = useRef(true)
  isLoadingRef.current = loading || loadingOnLoad

  //Handle onValuesChange with debounce
  useEffect(() => {
    let debounceTimeout: ReturnType<typeof setTimeout> | undefined

    const subscription = methods.watch(() => {
      // Discard synchronously during loading — this suppresses the initial watch fires
      // that RHF emits when async defaultValues resolve (one per reset + one per field).
      if (isLoadingRef.current) return
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(() => {
        onValuesChangeRef.current?.(methods)
      }, 300)
    })

    return () => {
      clearTimeout(debounceTimeout)
      subscription.unsubscribe()
    }
  }, [methods])

  // Handle onLoad
  useEffect(() => {
    async function callOnLoad() {
      setLoadingOnLoad(false)
      if (props.onLoad) {
        props.onLoad(methods)
      }
    }

    if (!loading && loadingOnLoad) {
      callOnLoad()
    }
  }, [loading, loadingOnLoad, methods, props.onLoad])

  return {
    methods,
    onSubmit,
    onSubmitInvalid,
    loading: loading || loadingOnLoad || methods.formState.isLoading,
  }
}
