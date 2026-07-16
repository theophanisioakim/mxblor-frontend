import { describe, expect, it } from "@jest/globals"
import {
  buildReportRequest,
  type ReportFormValues,
  type ReportKind,
  reportFilename,
  toReportDate,
  toReportMonth,
  withReportBuilding,
} from "../../../packages/app/src/screens/reports/report-contract"

describe("report contract", () => {
  it("maps every report kind to its API request", () => {
    const cases: Array<{
      kind: ReportKind
      values: ReportFormValues
      expected: object
    }> = [
      {
        kind: "building-shares",
        values: {
          buildingId: "building-1",
          referenceMonth: new Date(2026, 6, 1),
          locale: "el",
        },
        expected: {
          buildingId: "building-1",
          referenceMonth: "2026-07",
          locale: "el",
        },
      },
      {
        kind: "apartment-shares",
        values: {
          buildingId: "building-1",
          buildingUnitId: "unit-2",
          referenceMonth: "2026-07",
          locale: "en",
        },
        expected: {
          buildingId: "building-1",
          buildingUnitId: "unit-2",
          referenceMonth: "2026-07",
          locale: "en",
        },
      },
      {
        kind: "building-financial",
        values: {
          buildingId: "building-1",
          dateFrom: "2026-07-01",
          dateTo: "2026-07-31",
          locale: "en",
        },
        expected: {
          buildingId: "building-1",
          dateFrom: "2026-07-01",
          dateTo: "2026-07-31",
          locale: "en",
        },
      },
      {
        kind: "building-unit-financial",
        values: {
          buildingId: "building-1",
          buildingUnitId: "unit-2",
          dateFrom: "2026-07-01",
          dateTo: "2026-07-31",
          scope: "CAPITAL",
          locale: "en",
        },
        expected: {
          buildingId: "building-1",
          buildingUnitId: "unit-2",
          dateFrom: "2026-07-01",
          dateTo: "2026-07-31",
          scope: "CAPITAL",
          locale: "en",
        },
      },
      {
        kind: "attendance-sheet",
        values: {
          buildingId: "building-1",
          buildingDistributionId: "distribution-3",
          locale: "el",
        },
        expected: {
          buildingId: "building-1",
          buildingDistributionId: "distribution-3",
          locale: "el",
        },
      },
    ]

    for (const { kind, values, expected } of cases) {
      expect(buildReportRequest(kind, values)).toEqual({
        kind,
        data: expected,
      })
    }
  })

  it("creates a deterministic sanitized filename", () => {
    const request = buildReportRequest("building-unit-financial", {
      buildingId: "Building / 1",
      buildingUnitId: "unit-2",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-31",
      scope: "CAPITAL",
      locale: "en",
    })

    expect(request.data).toMatchObject({ scope: "CAPITAL", locale: "en" })
    expect(reportFilename(request)).toBe(
      "building-unit-financial-building-1-unit-2-2026-07-01-2026-07-31-capital-en.pdf"
    )
  })

  it("rejects missing report-specific fields", () => {
    expect(() =>
      buildReportRequest("attendance-sheet", {
        buildingId: "building-1",
        locale: "en",
      })
    ).toThrow("buildingDistributionId is required")
  })

  it("clears building-dependent fields without changing completed form values", () => {
    const next = withReportBuilding(
      {
        buildingId: "old",
        buildingUnitId: "unit-1",
        buildingDistributionId: "distribution-1",
        referenceMonth: "2026-07",
        locale: "en",
      },
      "new"
    )

    expect(next).toMatchObject({
      buildingId: "new",
      buildingUnitId: "",
      buildingDistributionId: "",
      referenceMonth: "2026-07",
      locale: "en",
    })
  })

  it("formats local picker dates without UTC day drift", () => {
    expect(toReportDate(new Date(2026, 0, 2))).toBe("2026-01-02")
    expect(toReportMonth(new Date(2026, 0, 2))).toBe("2026-01")
  })
})
