import { config as reactConfig } from "@workspace/eslint-config/react-internal"

/**
 * `@workspace/native-ui` self-imports via its own package alias (e.g.
 * `@workspace/native-ui/lib/utils`), so relax the base ban for `native-ui` here —
 * but keep `@workspace/web-ui` banned (the two vendored libraries must not import
 * each other; see AGENTS.md §2).
 *
 * @type {import("eslint").Linter.Config}
 */
export default [
  ...reactConfig,
  {
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@workspace/web-ui", "@workspace/web-ui/*"],
              message:
                "native-ui must not import web-ui — both are private to @workspace/ui (AGENTS.md §2).",
            },
          ],
        },
      ],
    },
  },
]
