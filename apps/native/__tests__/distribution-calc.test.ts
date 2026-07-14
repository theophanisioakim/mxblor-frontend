import { describe, expect, it } from "@jest/globals"
import {
  CALC_TYPE,
  calculateShares,
  type DistributionUnit,
  totalOf,
  totalsTo100,
} from "@workspace/app"

/**
 * The distribution calculator decides what every unit of a building actually
 * pays, on every expense, for as long as the table exists. The backend refuses a
 * table whose shares don't total 100, so anything this module produces must
 * total 100 — and it must never quietly overwrite a share the user typed.
 *
 * Lives here because `apps/native` is the workspace with a jest runner; the
 * module under test is platform-free.
 */

/** Three units with deliberately different areas, so each method gives a different answer. */
const UNITS: DistributionUnit[] = [
  {
    id: "u1",
    code: "101",
    confinedSpace: 100,
    coveredTerraces: 20,
    uncoveredTerraces: 10,
    storeRoom: 5,
    roofGardens: 0,
  },
  {
    id: "u2",
    code: "102",
    confinedSpace: 50,
    coveredTerraces: 10,
    uncoveredTerraces: 0,
    storeRoom: 5,
    roofGardens: 0,
  },
  {
    id: "u3",
    code: "103",
    confinedSpace: 50,
    coveredTerraces: 0,
    uncoveredTerraces: 0,
    storeRoom: 0,
    roofGardens: 0,
  },
]

const sharesOf = (units: DistributionUnit[]) =>
  units.map((unit) => ({ buildingUnitId: unit.id, percentage: 0 }))

describe("distribution calculator", () => {
  it("splits evenly, and the rounding tail still lands on exactly 100", () => {
    const result = calculateShares({
      units: UNITS,
      calcTypeKey: CALC_TYPE.EQUAL,
      current: sharesOf(UNITS),
    })

    // 100/3 does not divide cleanly. Three rows of 33.3333333333 total
    // 99.9999999999 — which the backend rejects — so the remainder has to land
    // somewhere. It lands on the last row.
    expect(totalsTo100(result)).toBe(true)
    expect(totalOf(result)).toBe(100)
  })

  it("weights by confined area", () => {
    const result = calculateShares({
      units: UNITS,
      calcTypeKey: CALC_TYPE.CONFINED_AREA,
      current: sharesOf(UNITS),
    })

    // Confined: 100 / 50 / 50 of 200 → 50% / 25% / 25%.
    expect(result.map((row) => row.percentage)).toEqual([50, 25, 25])
    expect(totalsTo100(result)).toBe(true)
  })

  it("weights by confined + covered area", () => {
    const result = calculateShares({
      units: UNITS,
      calcTypeKey: CALC_TYPE.CONFINED_COVERED_AREA,
      current: sharesOf(UNITS),
    })

    // 120 / 60 / 50 of 230.
    expect(totalsTo100(result)).toBe(true)
    expect(result[0]?.percentage).toBeCloseTo((120 / 230) * 100, 6)
  })

  it("weights by every area", () => {
    const result = calculateShares({
      units: UNITS,
      calcTypeKey: CALC_TYPE.ALL_AREAS,
      current: sharesOf(UNITS),
    })

    // 135 / 65 / 50 of 250.
    expect(result.map((row) => row.percentage)).toEqual([54, 26, 20])
    expect(totalsTo100(result)).toBe(true)
  })

  it("copies the shares of another table", () => {
    const result = calculateShares({
      units: UNITS,
      calcTypeKey: "",
      current: sharesOf(UNITS),
      copyFrom: { u1: 60, u2: 30, u3: 10 },
    })

    expect(result.map((row) => row.percentage)).toEqual([60, 30, 10])
  })

  it("gives a unit the copied-from table never mentions a share of zero", () => {
    // A unit added to the building after that table was written. Zero is the honest
    // answer — and it forces the user to give it a share before the total can reach
    // 100, which is exactly what v1 failed to do.
    const result = calculateShares({
      units: UNITS,
      calcTypeKey: "",
      current: sharesOf(UNITS),
      copyFrom: { u1: 60, u2: 40 },
    })

    expect(result[2]?.percentage).toBe(0)
  })

  it("holds a hand-typed share and absorbs the difference in the untouched rows", () => {
    // The user pins unit 1 at 70%. The method must fit the other two around it
    // rather than writing back over the number they entered.
    const current = [
      { buildingUnitId: "u1", percentage: 70 },
      { buildingUnitId: "u2", percentage: 25 },
      { buildingUnitId: "u3", percentage: 25 },
    ]

    const result = calculateShares({
      units: UNITS,
      calcTypeKey: CALC_TYPE.CONFINED_AREA,
      current,
      dirtyUnitIds: ["u1"],
    })

    expect(result[0]?.percentage).toBe(70)
    expect(totalsTo100(result)).toBe(true)
    // The remaining 30 is split across the two untouched rows.
    expect((result[1]?.percentage ?? 0) + (result[2]?.percentage ?? 0)).toBe(30)
  })

  it("leaves the values alone when every row is hand-typed", () => {
    // Nowhere left to absorb a difference. The values stand as entered and the
    // form's running total is what tells the user they are short.
    const current = [
      { buildingUnitId: "u1", percentage: 10 },
      { buildingUnitId: "u2", percentage: 10 },
      { buildingUnitId: "u3", percentage: 10 },
    ]

    const result = calculateShares({
      units: UNITS,
      calcTypeKey: CALC_TYPE.EQUAL,
      current,
      dirtyUnitIds: ["u1", "u2", "u3"],
    })

    expect(result.map((row) => row.percentage)).toEqual([10, 10, 10])
    expect(totalsTo100(result)).toBe(false)
  })

  it("returns zeros rather than dividing by zero when the method cannot split the building", () => {
    // No unit has a roof garden, so a roof-garden-weighted split has nothing to
    // divide by. Zeros keep the total at 0%, which blocks the save — the right
    // outcome, and better than NaN in every cell.
    const noArea: DistributionUnit[] = UNITS.map((unit) => ({
      ...unit,
      confinedSpace: 0,
      coveredTerraces: 0,
      uncoveredTerraces: 0,
      storeRoom: 0,
      roofGardens: 0,
    }))

    const result = calculateShares({
      units: noArea,
      calcTypeKey: CALC_TYPE.ALL_AREAS,
      current: sharesOf(noArea),
    })

    expect(result.map((row) => row.percentage)).toEqual([0, 0, 0])
    expect(totalsTo100(result)).toBe(false)
  })
})
