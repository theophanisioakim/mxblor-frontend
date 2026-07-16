import {
  type ApartmentSharesReportRequestDto,
  type AttendanceSheetReportRequestDto,
  type BuildingFinancialReportRequestDto,
  type BuildingSharesReportRequestDto,
  type BuildingUnitFinancialReportRequestDto,
  generateApartmentSharesReport,
  generateAttendanceSheetReport,
  generateBuildingFinancialReport,
  generateBuildingSharesReport,
  generateBuildingUnitFinancialReport,
} from "@workspace/api-client"

export type ReportKind =
  | "building-shares"
  | "apartment-shares"
  | "building-financial"
  | "building-unit-financial"
  | "attendance-sheet"

export type ReportFormValues = {
  buildingId: string
  buildingUnitId?: string
  buildingDistributionId?: string
  referenceMonth?: Date | string
  dateFrom?: Date | string
  dateTo?: Date | string
  scope?: "ALL" | "CAPITAL" | "MONTHLY"
  locale: "en" | "el"
}

export type BuiltReportRequest =
  | { kind: "building-shares"; data: BuildingSharesReportRequestDto }
  | { kind: "apartment-shares"; data: ApartmentSharesReportRequestDto }
  | { kind: "building-financial"; data: BuildingFinancialReportRequestDto }
  | {
      kind: "building-unit-financial"
      data: BuildingUnitFinancialReportRequestDto
    }
  | { kind: "attendance-sheet"; data: AttendanceSheetReportRequestDto }

export function withReportBuilding(
  values: ReportFormValues,
  buildingId: string
): ReportFormValues {
  return {
    ...values,
    buildingId,
    buildingUnitId: "",
    buildingDistributionId: "",
  }
}

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is required`)
  return value
}

function parts(value: Date | string): [number, number, number] {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(value)
    if (match) {
      return [Number(match[1]), Number(match[2]), Number(match[3] ?? 1)]
    }
  }
  const date = value instanceof Date ? value : new Date(value)
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
}

function two(value: number): string {
  return value.toString().padStart(2, "0")
}

export function toReportDate(value: Date | string | undefined): string {
  if (!value) throw new Error("date is required")
  const [year, month, day] = parts(value)
  return `${year}-${two(month)}-${two(day)}`
}

export function toReportMonth(value: Date | string | undefined): string {
  if (!value) throw new Error("referenceMonth is required")
  const [year, month] = parts(value)
  return `${year}-${two(month)}`
}

export function buildReportRequest(
  kind: ReportKind,
  values: ReportFormValues
): BuiltReportRequest {
  const common = {
    buildingId: required(values.buildingId, "buildingId"),
    locale: values.locale,
  }

  switch (kind) {
    case "building-shares":
      return {
        kind,
        data: {
          ...common,
          referenceMonth: toReportMonth(values.referenceMonth),
        },
      }
    case "apartment-shares":
      return {
        kind,
        data: {
          ...common,
          buildingUnitId: required(values.buildingUnitId, "buildingUnitId"),
          referenceMonth: toReportMonth(values.referenceMonth),
        },
      }
    case "building-financial":
      return {
        kind,
        data: {
          ...common,
          dateFrom: toReportDate(values.dateFrom),
          dateTo: toReportDate(values.dateTo),
        },
      }
    case "building-unit-financial":
      return {
        kind,
        data: {
          ...common,
          buildingUnitId: required(values.buildingUnitId, "buildingUnitId"),
          dateFrom: toReportDate(values.dateFrom),
          dateTo: toReportDate(values.dateTo),
          scope: values.scope ?? "ALL",
        },
      }
    case "attendance-sheet":
      return {
        kind,
        data: {
          ...common,
          buildingDistributionId: required(
            values.buildingDistributionId,
            "buildingDistributionId"
          ),
        },
      }
  }
}

export function reportFilename(
  request: BuiltReportRequest,
  generatedAt = new Date()
): string {
  const fallback = `${generatedAt.getFullYear()}${two(generatedAt.getMonth() + 1)}${two(generatedAt.getDate())}`
  let details = fallback
  let unit = ""
  let scope = ""
  switch (request.kind) {
    case "building-shares":
      details = request.data.referenceMonth
      break
    case "apartment-shares":
      details = request.data.referenceMonth
      unit = `-${request.data.buildingUnitId}`
      break
    case "building-financial":
      details = `${request.data.dateFrom}-${request.data.dateTo}`
      break
    case "building-unit-financial":
      details = `${request.data.dateFrom}-${request.data.dateTo}`
      unit = `-${request.data.buildingUnitId}`
      scope = `-${request.data.scope.toLowerCase()}`
      break
    case "attendance-sheet":
      details = request.data.buildingDistributionId
      break
  }
  return `${request.kind}-${request.data.buildingId}${unit}-${details}${scope}-${request.data.locale}.pdf`
    .replaceAll(/[^A-Za-z0-9._-]+/g, "-")
    .replaceAll(/-{2,}/g, "-")
    .toLowerCase()
}

async function bytes(data: Blob | ArrayBuffer): Promise<ArrayBuffer> {
  if (data instanceof ArrayBuffer) return data
  return data.arrayBuffer()
}

export async function requestReport(
  request: BuiltReportRequest
): Promise<ArrayBuffer> {
  switch (request.kind) {
    case "building-shares":
      return bytes(await generateBuildingSharesReport(request.data))
    case "apartment-shares":
      return bytes(await generateApartmentSharesReport(request.data))
    case "building-financial":
      return bytes(await generateBuildingFinancialReport(request.data))
    case "building-unit-financial":
      return bytes(await generateBuildingUnitFinancialReport(request.data))
    case "attendance-sheet":
      return bytes(await generateAttendanceSheetReport(request.data))
  }
}
