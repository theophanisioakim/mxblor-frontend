import { act, render, waitFor } from "@testing-library/react-native"
import Axios from "axios"
import {
  axiosInstance,
  customInstance,
} from "../../../packages/api-client/src/axios-instance"
import {
  type OtpContextValue,
  OtpProvider,
  useOtp,
} from "../../../packages/providers/src/otp-provider"

let otpContext: OtpContextValue | undefined

function OtpContextProbe() {
  otpContext = useOtp()
  return null
}

describe("OTP cancellation", () => {
  it("rejects the intercepted request as cancelled instead of returning a null response", async () => {
    const originalAdapter = axiosInstance.defaults.adapter
    axiosInstance.defaults.adapter = async (config) => {
      const response = {
        config,
        data: {
          errorCode: "OTP_REQUIRED",
          expiryTimeInSeconds: 60,
          otpId: "otp-id",
        },
        headers: {},
        status: 401,
        statusText: "Unauthorized",
      }
      throw new Axios.AxiosError(
        "OTP required",
        Axios.AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response
      )
    }

    const screen = await render(
      <OtpProvider>
        <OtpContextProbe />
      </OtpProvider>
    )

    try {
      let request: Promise<unknown> | undefined
      await act(async () => {
        request = customInstance({ method: "PUT", url: "/sbf-timer/1" })
        await Promise.resolve()
      })
      if (!request) {
        throw new Error("Expected the OTP-protected request to start")
      }
      const cancellation = expect(request).rejects.toMatchObject({
        code: Axios.AxiosError.ERR_CANCELED,
        message: "OTP request was cancelled",
      })

      await waitFor(() => {
        expect(otpContext?.isOtpDialogVisible).toBe(true)
      })

      await act(() => {
        otpContext?.onCancel()
      })

      await cancellation
      expect(otpContext?.isOtpDialogVisible).toBe(false)
    } finally {
      screen.unmount()
      axiosInstance.defaults.adapter = originalAdapter
      otpContext = undefined
    }
  })
})
