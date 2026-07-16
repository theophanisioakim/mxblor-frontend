import { describe, expect, it } from "@jest/globals"
import { prepareRequestConfig } from "../../../packages/api-client/src/axios-instance"

describe("binary API request configuration", () => {
  it("normalizes every blob response to a cross-platform arraybuffer", () => {
    const config = {
      headers: { Accept: "application/pdf, application/json" },
      responseType: "blob" as const,
      url: "/files/export",
    }

    expect(prepareRequestConfig(config)).toMatchObject({
      headers: { Accept: "application/pdf, application/json" },
      responseType: "arraybuffer",
      url: "/files/export",
    })
    expect(config.responseType).toBe("blob")
  })

  it("does not alter ordinary JSON requests", () => {
    expect(
      prepareRequestConfig({
        headers: { Accept: "application/json" },
        responseType: "json",
        url: "/resources/search",
      })
    ).toMatchObject({
      headers: { Accept: "application/json" },
      responseType: "json",
    })
  })
})
