import { describe, expect, it, jest } from "@jest/globals"
import { coordinateRefresh } from "../../../packages/api-client/src/refresh-coordinator.native"

describe("native refresh coordination", () => {
  it("runs one rotation for concurrent failed requests", async () => {
    let token = "expired"
    let finishRefresh = () => undefined
    const refresh = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishRefresh = () => {
            token = "rotated"
            resolve()
          }
        })
    )
    const task = {
      previousAccessToken: "expired",
      readAccessToken: () => token,
      refresh,
    }

    const first = coordinateRefresh(task)
    const second = coordinateRefresh(task)
    expect(refresh).toHaveBeenCalledTimes(1)
    finishRefresh()
    await Promise.all([first, second])

    expect(token).toBe("rotated")
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
