"use client"

import { useOtp } from "@workspace/providers"
import {
  Button,
  cn,
  Input,
  RncDialog,
  Spinner,
  Text,
  View,
} from "@workspace/ui"

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

/** OTP verification dialog wired to the shared OTP provider. */
export function OtpDialog() {
  const otp = useOtp()

  return (
    <RncDialog
      description="Enter the one-time password to continue."
      footer={
        <View className="flex-row justify-end gap-3">
          {otp.expired ? (
            <Button onPress={otp.onCancel} variant="outline">
              <Text>Close</Text>
            </Button>
          ) : (
            <>
              <Button
                disabled={otp.submitting}
                onPress={otp.onCancel}
                variant="outline"
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                disabled={!otp.otpValue.trim() || otp.submitting}
                onPress={() => void otp.onSubmit()}
              >
                {otp.submitting ? <Spinner size="small" /> : null}
                <Text>Verify</Text>
              </Button>
            </>
          )}
        </View>
      }
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          otp.onCancel()
        }
      }}
      open={otp.isOtpDialogVisible}
      title="OTP Verification"
    >
      <View className="gap-3">
        {otp.errorMessage ? (
          <Text className="text-center text-destructive text-sm">
            {otp.errorMessage}
          </Text>
        ) : null}

        {otp.expired ? null : (
          <>
            <Input
              autoComplete="one-time-code"
              autoFocus
              keyboardType="number-pad"
              onChangeText={otp.onOtpValueChange}
              placeholder="Enter OTP"
              readOnly={otp.submitting}
              value={otp.otpValue}
            />
            <View className="items-center">
              <Text
                className={cn(
                  "text-sm",
                  otp.remainingSeconds <= 10
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                Expires in {formatTime(otp.remainingSeconds)}
              </Text>
            </View>
          </>
        )}
      </View>
    </RncDialog>
  )
}
