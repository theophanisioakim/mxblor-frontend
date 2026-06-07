import type { RncDateTimeFieldType } from "../RncDateTimeFieldModel"

// Pure date <-> string helpers shared by the web and native render variants.
// Kept free of any `react-native` import so the web build never pulls RN in.

export function resolveDate(
  value: Date | (() => Date) | undefined
): Date | undefined {
  if (!value) return undefined
  return typeof value === "function" ? value() : value
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0")
}

export function dateToInputString(
  date: Date | undefined | null,
  type: RncDateTimeFieldType
): string {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime()))
    return ""
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const min = pad(date.getMinutes())

  switch (type) {
    case "date":
      return `${y}-${m}-${d}`
    case "time":
      return `${h}:${min}`
    case "datetime":
      return `${y}-${m}-${d}T${h}:${min}`
    case "year":
      return String(y)
    case "month":
      return `${y}-${m}`
    case "minutes":
      return String(date.getMinutes())
    default:
      return ""
  }
}

export function inputStringToDate(
  value: string,
  type: RncDateTimeFieldType,
  currentFormValue?: Date
): Date | undefined {
  if (!value || value.trim() === "") return undefined

  switch (type) {
    case "date": {
      const parsed = new Date(`${value}T00:00:00`)
      return Number.isNaN(parsed.getTime()) ? undefined : parsed
    }
    case "time": {
      const base =
        currentFormValue instanceof Date
          ? new Date(currentFormValue)
          : new Date()
      const [h, min] = value.split(":").map(Number)
      if (
        h === undefined ||
        min === undefined ||
        Number.isNaN(h) ||
        Number.isNaN(min)
      )
        return undefined
      base.setHours(h, min, 0, 0)
      return base
    }
    case "datetime": {
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime()) ? undefined : parsed
    }
    case "year": {
      const y = Number.parseInt(value, 10)
      if (Number.isNaN(y)) return undefined
      const d =
        currentFormValue instanceof Date
          ? new Date(currentFormValue)
          : new Date()
      d.setFullYear(y)
      return d
    }
    case "month": {
      const [y, m] = value.split("-").map(Number)
      if (
        y === undefined ||
        m === undefined ||
        Number.isNaN(y) ||
        Number.isNaN(m)
      )
        return undefined
      const d =
        currentFormValue instanceof Date
          ? new Date(currentFormValue)
          : new Date()
      d.setFullYear(y)
      d.setMonth(m - 1)
      return d
    }
    case "minutes": {
      const min = Number.parseInt(value, 10)
      if (Number.isNaN(min) || min < 0 || min > 59) return undefined
      const d =
        currentFormValue instanceof Date
          ? new Date(currentFormValue)
          : new Date()
      d.setMinutes(min)
      return d
    }
    default:
      return undefined
  }
}

export function dateToDisplayString(
  date: Date | undefined | null,
  type: RncDateTimeFieldType,
  format?: string
): string {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime()))
    return ""

  if (format) {
    return format
      .replace("YYYY", String(date.getFullYear()))
      .replace("MM", pad(date.getMonth() + 1))
      .replace("DD", pad(date.getDate()))
      .replace("HH", pad(date.getHours()))
      .replace("mm", pad(date.getMinutes()))
      .replace("ss", pad(date.getSeconds()))
  }

  switch (type) {
    case "date":
      return date.toLocaleDateString()
    case "time":
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    case "datetime":
      return date.toLocaleString()
    case "year":
      return String(date.getFullYear())
    case "month":
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    case "minutes":
      return String(date.getMinutes())
    default:
      return ""
  }
}

export function getHtmlInputType(type: RncDateTimeFieldType): string {
  switch (type) {
    case "date":
      return "date"
    case "time":
      return "time"
    case "datetime":
      return "datetime-local"
    case "month":
      return "month"
    case "year":
      return "number"
    case "minutes":
      return "number"
    default:
      return "text"
  }
}
