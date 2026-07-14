/**
 * How a distribution table's percentages are worked out.
 *
 * A distribution table is the divisor of every expense charged through the
 * building, so these shares decide what each unit actually pays. Two rules run
 * the whole module:
 *
 * 1. **The shares always total 100.** The backend rejects anything else, so the
 *    form must never hand it a table that doesn't add up.
 * 2. **A share the user typed is theirs.** Picking a calculation method fills in
 *    the untouched rows, and any rounding or manual difference is absorbed by
 *    those rows — never by pushing back over a number the user entered.
 *
 * Ported from v2 (`BuildingDistributionFormComponent.calculateDistributionPercentages`),
 * with its two rough edges filed off: v2 recomputed the whole table on every
 * keystroke-blur and let floating-point drift accumulate in the total.
 */

/** The unit fields the area-weighted methods divide by. */
export interface DistributionUnit {
  id: string
  code: string
  confinedSpace: number
  coveredTerraces?: number
  uncoveredTerraces?: number
  storeRoom?: number
  roofGardens?: number
}

/** One row of the percentages grid. */
export interface DistributionShare {
  buildingUnitId: string
  percentage: number
}

/**
 * The reference keys the backend serves from
 * `GET /building-distribution/calc-types`. Switching on the key rather than the
 * label is the point of that endpoint returning one — the label is translated
 * and changes with the user's language.
 */
export const CALC_TYPE = {
  EQUAL: "MXBLOR_DISTRIBUTION_CALC_TYPE_EQUAL_DISTRIBUTION",
  ALL_AREAS: "MXBLOR_DISTRIBUTION_CALC_TYPE_ALL_AREAS",
  CONFINED_AREA: "MXBLOR_DISTRIBUTION_CALC_TYPE_CONFINED_AREA",
  CONFINED_COVERED_AREA: "MXBLOR_DISTRIBUTION_CALC_TYPE_CONFINED_COVERED_AREA",
} as const

/**
 * The prefix marking a "copy the shares from this other table" choice.
 *
 * Such a choice is **not** a calculation type: it fills the grid and then leaves
 * `distributionCalcTypeId` null, because there is no reference row that means
 * "whatever that other table happened to say". v2 stuffed the string `DT-<id>`
 * straight into the FK column, which only survived because its column had no
 * foreign key behind it.
 */
export const COPY_FROM_PREFIX = "DT-"

/** How many decimals a share keeps. The column is NUMERIC(20,10). */
const PRECISION = 10

/** What the shares must total. */
const TOTAL = 100

export function copyFromTableOption(tableId: string): string {
  return `${COPY_FROM_PREFIX}${tableId}`
}

export function isCopyFromTable(selection: string): boolean {
  return selection.startsWith(COPY_FROM_PREFIX)
}

export function copyFromTableId(selection: string): string {
  return selection.slice(COPY_FROM_PREFIX.length)
}

function round(value: number): number {
  return Number(value.toFixed(PRECISION))
}

/** The area a given method divides by, for one unit. */
function areaOf(unit: DistributionUnit, calcTypeKey: string): number {
  switch (calcTypeKey) {
    case CALC_TYPE.ALL_AREAS:
      return (
        unit.confinedSpace +
        (unit.coveredTerraces ?? 0) +
        (unit.uncoveredTerraces ?? 0) +
        (unit.storeRoom ?? 0) +
        (unit.roofGardens ?? 0)
      )
    case CALC_TYPE.CONFINED_COVERED_AREA:
      return unit.confinedSpace + (unit.coveredTerraces ?? 0)
    case CALC_TYPE.CONFINED_AREA:
      return unit.confinedSpace
    default:
      return 0
  }
}

/**
 * The share each unit gets from a method, before any manual edits are honoured.
 *
 * `copyFrom` supplies the shares of another table of the same building; a unit
 * that table does not mention gets nothing, which is the honest answer — it is a
 * unit added after that table was written.
 */
function baseShares(
  units: DistributionUnit[],
  calcTypeKey: string,
  copyFrom?: Record<string, number>
): Map<string, number> {
  const shares = new Map<string, number>()

  if (copyFrom) {
    for (const unit of units) {
      shares.set(unit.id, copyFrom[unit.id] ?? 0)
    }
    return shares
  }

  if (calcTypeKey === CALC_TYPE.EQUAL) {
    const each = TOTAL / units.length
    for (const unit of units) {
      shares.set(unit.id, each)
    }
    return shares
  }

  const areaSum = units.reduce(
    (sum, unit) => sum + areaOf(unit, calcTypeKey),
    0
  )
  for (const unit of units) {
    // A building whose units all have zero of the chosen area gets zeros rather
    // than a division by zero. The form's total then reads 0% and blocks the save,
    // which is the right outcome: that method cannot split this building.
    shares.set(
      unit.id,
      areaSum === 0 ? 0 : (areaOf(unit, calcTypeKey) / areaSum) * TOTAL
    )
  }
  return shares
}

/**
 * The largest gap that counts as a rounding artefact rather than a real shortfall.
 *
 * Three units split evenly give 33.3333333333 × 3 = 99.9999999999 — a table the
 * backend would reject over a 1e-10 discrepancy the user cannot see, let alone
 * fix. That tail gets nudged onto the last row. A *real* gap (a copied table that
 * never mentioned one of the units, a method with no area to divide by) is far
 * bigger than this and is deliberately left alone, so the running total shows it
 * and the save stays blocked until the user resolves it.
 */
const ROUNDING_TOLERANCE = 1e-6

/**
 * Recomputes the grid.
 *
 * `dirtyUnitIds` are the units whose share the user typed by hand: those keep
 * their value, and the rest of the table is fitted around them so the total is
 * still exactly 100. That is what makes the grid usable — you can pin one unit's
 * share and let the method sort out the others.
 *
 * With nothing dirty this is simply "apply the method". With every unit dirty
 * there is nowhere to absorb a difference, so the values are returned untouched
 * and the form's running total tells the user what they still owe.
 */
export function calculateShares({
  units,
  calcTypeKey,
  current,
  dirtyUnitIds = [],
  copyFrom,
}: {
  units: DistributionUnit[]
  calcTypeKey: string
  current: DistributionShare[]
  dirtyUnitIds?: string[]
  copyFrom?: Record<string, number>
}): DistributionShare[] {
  if (units.length === 0) {
    return []
  }

  const dirty = new Set(dirtyUnitIds)
  const currentByUnit = new Map(
    current.map((row) => [row.buildingUnitId, row.percentage])
  )
  const base = baseShares(units, calcTypeKey, copyFrom)

  const rows: DistributionShare[] = units.map((unit) => ({
    buildingUnitId: unit.id,
    percentage: dirty.has(unit.id)
      ? (currentByUnit.get(unit.id) ?? 0)
      : (base.get(unit.id) ?? 0),
  }))

  const clean = rows.filter((row) => !dirty.has(row.buildingUnitId))
  if (clean.length === 0) {
    // Every row is hand-typed. Nothing may be moved, so the total is whatever the
    // user made it — the form blocks the save until they make it 100.
    return rows.map((row) => ({ ...row, percentage: round(row.percentage) }))
  }

  // What the hand-typed rows claim *beyond* their formula share. That excess has to
  // come out of the untouched rows — which keep their formula value otherwise, so
  // an area-weighted split stays area-weighted instead of collapsing into an even
  // one.
  const excess = rows
    .filter((row) => dirty.has(row.buildingUnitId))
    .reduce(
      (sum, row) =>
        sum + (row.percentage - (base.get(row.buildingUnitId) ?? 0)),
      0
    )

  if (excess !== 0) {
    const perCleanRow = excess / clean.length
    for (const row of clean) {
      row.percentage -= perCleanRow
    }
  }

  for (const row of rows) {
    row.percentage = round(row.percentage)
  }

  const drift = TOTAL - totalOf(rows)
  const lastClean = clean[clean.length - 1]
  if (lastClean && drift !== 0 && Math.abs(drift) < ROUNDING_TOLERANCE) {
    lastClean.percentage = round(lastClean.percentage + drift)
  }

  return rows
}

/** The grid's running total, rounded the way the rows are. */
export function totalOf(shares: DistributionShare[]): number {
  return round(shares.reduce((sum, row) => sum + row.percentage, 0))
}

/** Whether the shares add up, within the tolerance the backend allows. */
export function totalsTo100(shares: DistributionShare[]): boolean {
  return Math.abs(totalOf(shares) - TOTAL) < 1e-6
}
