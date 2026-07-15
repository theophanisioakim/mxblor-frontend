import { describe, expect, it } from "@jest/globals"
import {
  defaultOpeningBalanceDate,
  formatBalance,
  formatDateOnly,
  previewBalance,
} from "@workspace/app"

describe("building unit balance calculations", () => {
  it("defaults to the previous calendar day across a year boundary", () => {
    expect(formatDateOnly(defaultOpeningBalanceDate("2026-01-01"))).toBe(
      "2025-12-31"
    )
  })

  it("defaults to the previous calendar day across a month boundary", () => {
    expect(formatDateOnly(defaultOpeningBalanceDate("2026-03-01"))).toBe(
      "2026-02-28"
    )
  })

  it("uses yesterday when a building has no management start date", () => {
    expect(
      formatDateOnly(
        defaultOpeningBalanceDate(undefined, new Date(2026, 0, 1, 12, 30))
      )
    ).toBe("2025-12-31")
  })

  it("previews a live balance by replacing the original opening amount", () => {
    expect(previewBalance(125.5, 40, 25.5)).toBe(140)
  })

  it("previews and formats a negative credit balance", () => {
    expect(formatBalance(previewBalance(-15, -40, -10))).toBe("-45.00")
  })
})
