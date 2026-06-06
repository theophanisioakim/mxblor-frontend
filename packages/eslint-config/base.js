import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import globals from "globals"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    rules: {
      // Boundary: @workspace/web-ui (shadcn) and @workspace/native-ui (rnr) are
      // PRIVATE to the @workspace/ui abstraction layer. Nothing else may import
      // them directly (see AGENTS.md §2). Denied everywhere by default; packages/ui,
      // packages/web-ui, and packages/native-ui re-enable what they legitimately
      // need in their own eslint.config.js.
      //
      // Note: eslint-plugin-only-warn (below) downgrades this to a warning locally;
      // CI runs `eslint --max-warnings 0`, so a violation still fails the build.
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@workspace/web-ui",
                "@workspace/web-ui/*",
                "@workspace/native-ui",
                "@workspace/native-ui/*",
              ],
              message:
                "Import UI through @workspace/ui — web-ui (shadcn) and native-ui (rnr) are private to the @workspace/ui abstraction layer (AGENTS.md §2).",
            },
          ],
        },
      ],
      // Ignore intentionally-unused bindings: `_`-prefixed names and props
      // destructured only to omit them from a `...rest` (a common UI pattern).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // CommonJS config files (metro / babel / tailwind / postcss).
    files: ["**/*.config.{js,cjs}"],
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
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**", ".next/**", "**/.turbo/**", "**/coverage/**"],
  },
]
