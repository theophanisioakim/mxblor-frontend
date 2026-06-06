import { config as reactConfig } from "@workspace/eslint-config/react-internal"

/**
 * `@workspace/ui` is the cross-platform abstraction layer — it is the ONE package
 * allowed to import `@workspace/web-ui` (shadcn) and `@workspace/native-ui` (rnr).
 * Re-enable those imports here (the base config denies them everywhere else).
 *
 * @type {import("eslint").Linter.Config}
 */
export default [
  ...reactConfig,
  {
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
    },
  },
]
