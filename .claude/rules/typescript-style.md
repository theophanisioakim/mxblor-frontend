---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript & style (react-mono-core)

Conventions for any `.ts`/`.tsx` file (root `AGENTS.md` §7). Vendored/generated trees
(`web-ui`/`native-ui` components, `api-client/src/generated`) follow their tool's output — see their
own rules.

- **Prettier:** no semicolons, double quotes, 2-space indent, 80-col, `trailingComma: es5`,
  `endOfLine: lf`, Tailwind class sorting (`cn`/`cva` aware). Run `pnpm format`.
- **TypeScript:** `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, NodeNext resolution. Don't
  introduce `any` on code you touch; type the public surface of shared packages (they ship `.ts`
  source via `exports`).
- **Imports:** use package entrypoints / `exports` subpaths (`@workspace/ui`,
  `@workspace/web-ui/components/...`); never reach into another package's `src` by relative path.
- **Versions:** reference `"catalog:"` (or `"catalog:tailwind3"`) in `package.json` — versions live
  in `pnpm-workspace.yaml`, not in individual packages.
- **Lint:** `eslint-plugin-only-warn` reports as warnings; treat warnings on code you touched as
  must-fix. Don't suppress rules to silence them without approval.
- **Styling:** Tailwind utilities + `cva` variants + `cn` to merge; prefer theme tokens
  (`bg-primary`, `text-foreground`) so classes work on both web and native.
