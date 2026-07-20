import { describe, expect, it } from "@jest/globals"
import type { AxiosRequestConfig } from "axios"
import {
  axiosInstance,
  customInstance,
  prepareRequestConfig,
} from "../../../packages/api-client/src/axios-instance"
import { StorageKeys } from "../../../packages/storage/src/keys"
import { myLocalStorage } from "../../../packages/storage/src/storage.native"

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

  it("sends credentialed bearer requests without client schema/channel headers", async () => {
    const originalAdapter = axiosInstance.defaults.adapter
    let captured: AxiosRequestConfig | undefined
    axiosInstance.defaults.adapter = async (config) => {
      captured = config
      return {
        config,
        data: { ok: true },
        headers: {},
        status: 200,
        statusText: "OK",
      }
    }
    myLocalStorage.setItem(StorageKeys.JWT_TOKEN, "signed-access-token")
    myLocalStorage.setItem(StorageKeys.SELECTED_SCHEMA, "tenant-a")

    try {
      await customInstance({ method: "GET", url: "/protected" })
      const headers = captured?.headers as Record<string, string>
      expect(axiosInstance.defaults.withCredentials).toBe(true)
      expect(headers.Authorization).toBe("Bearer signed-access-token")
      expect(headers["x-schema-id"]).toBeUndefined()
      expect(headers["x-channel-id"]).toBeUndefined()
    } finally {
      axiosInstance.defaults.adapter = originalAdapter
      myLocalStorage.removeItem(StorageKeys.JWT_TOKEN)
      myLocalStorage.removeItem(StorageKeys.SELECTED_SCHEMA)
    }
  })
})
