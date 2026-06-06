import globals from "globals"

import { config as reactConfig } from "@workspace/eslint-config/react-internal"

/** @type {import("eslint").Linter.Config} */
export default [
  ...reactConfig,
  {
    // CommonJS Expo config plugins run in Node at build time.
    files: ["plugins/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      ".expo/**",
      "dist/**",
      "dist-verify/**",
      "android/**",
      "ios/**",
      "scripts/**",
      "expo-env.d.ts",
    ],
  },
]
