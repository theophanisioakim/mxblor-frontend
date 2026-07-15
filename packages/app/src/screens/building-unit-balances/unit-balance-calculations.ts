export type DateInput = Date | string | null | undefined

function dateOnly(value: DateInput, fallback: Date): Date {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    }
  }

  const source = value instanceof Date ? value : fallback
  return new Date(source.getFullYear(), source.getMonth(), source.getDate())
}

/** The opening-balance date is the calendar day before management starts. */
export function defaultOpeningBalanceDate(
  startedAt?: DateInput,
  today = new Date()
): Date {
  const result = dateOnly(startedAt, today)
  result.setDate(result.getDate() - 1)
  return result
}

/** Parses an API DATE without UTC/local-time shifting. */
export function parseDateOnly(value?: string): Date | undefined {
  if (!value) return undefined
  return dateOnly(value, new Date())
}

/** Serializes a form date as the backend's YYYY-MM-DD contract. */
export function formatDateOnly(value: Date | string): string {
  const date = dateOnly(value, new Date())
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Preview a ledger after replacing its opening amount, before saving. */
export function previewBalance(
  serverBalance: number,
  editedOpening: number,
  originalOpening: number
): number {
  return serverBalance + editedOpening - originalOpening
}

export function formatBalance(value: number): string {
  return value.toFixed(2)
}
