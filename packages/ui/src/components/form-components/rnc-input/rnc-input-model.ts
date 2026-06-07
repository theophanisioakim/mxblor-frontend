import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
  UseFormStateReturn,
} from "react-hook-form"

export interface RncInputProps {
  id: string
  type?: "text" | "password" | "number"
  variant?: "underlined" | "outline" | "rounded"
  size?: "lg" | "md" | "sm"
  label?: string
  helperText?: string
  placeholder?: string
  defaultValue?: string | number
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  readOnly?: boolean
  textValidationRules?: {
    maxLength?: number
    minLength?: number
  }
  numberValidationRules?: {
    min?: number
    max?: number
    positiveOnly?: boolean
    negativeOnly?: boolean
    fixedDecimalPlaces?: boolean
    decimalPlaces?: number
    hasThousandsSeparator?: boolean
    decimalSeparator?: string
    thousandsSeparator?: string
  }

  //for validation rules check: https://react-hook-form.com/docs/useform/register#options
  //you can do asynchronous validation as well
  //example:
  //   validationRules={{
  //     required: true,
  //     maxLength: {
  //       value: 2,
  //       message: "error message",
  //     },
  //     validate: {
  //       positive: v => parseInt(v) > 0 || 'should be greater than 0',
  //       lessThanTen: v => parseInt(v) < 10 || 'should be lower than 10',
  //       // you can do asynchronous validation as well
  //       checkUrl: async (test1: any,test2: any) => {
  //         return "error message"
  //       },
  //     }
  //   }}
  validationRules?: Omit<
    RegisterOptions<FieldValues, string>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >

  onChangeText?: (
    nv: string | number | undefined,
    context: UseFormReturn,
    fieldContext: {
      field: ControllerRenderProps<FieldValues, string>
      fieldState: ControllerFieldState
      formState: UseFormStateReturn<FieldValues>
    }
  ) => Promise<void>
  onBlur?: (
    nv: string | number | undefined,
    context: UseFormReturn,
    fieldContext: {
      field: ControllerRenderProps<FieldValues, string>
      fieldState: ControllerFieldState
      formState: UseFormStateReturn<FieldValues>
    }
  ) => Promise<void>

  keyboardType?:
    | "default"
    | "number-pad"
    | "decimal-pad"
    | "numeric"
    | "email-address"
    | "phone-pad"
    | "url"
    | "ascii-capable"
    | "numbers-and-punctuation"
    | "name-phone-pad"
    | "twitter"
    | "web-search"
    | "visible-password"
  autoCapitalize?: "none" | "sentences" | "words" | "characters"
  autoComplete?:
    | "additional-name"
    | "address-line1"
    | "address-line2"
    | "birthdate-day"
    | "birthdate-full"
    | "birthdate-month"
    | "birthdate-year"
    | "cc-csc"
    | "cc-exp"
    | "cc-exp-day"
    | "cc-exp-month"
    | "cc-exp-year"
    | "cc-number"
    | "cc-name"
    | "cc-given-name"
    | "cc-middle-name"
    | "cc-family-name"
    | "cc-type"
    | "country"
    | "current-password"
    | "email"
    | "family-name"
    | "gender"
    | "given-name"
    | "honorific-prefix"
    | "honorific-suffix"
    | "name"
    | "name-family"
    | "name-given"
    | "name-middle"
    | "name-middle-initial"
    | "name-prefix"
    | "name-suffix"
    | "new-password"
    | "nickname"
    | "one-time-code"
    | "organization"
    | "organization-title"
    | "password"
    | "password-new"
    | "postal-address"
    | "postal-address-country"
    | "postal-address-extended"
    | "postal-address-extended-postal-code"
    | "postal-address-locality"
    | "postal-address-region"
    | "postal-code"
    | "street-address"
    | "sms-otp"
    | "tel"
    | "tel-country-code"
    | "tel-national"
    | "tel-device"
    | "url"
    | "username"
    | "username-new"
    | "off"
}
