---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript & style (react-mono-core)

Conventions for any `.ts`/`.tsx` file (root `AGENTS.md` §7). Vendored/generated trees
(`web-ui`/`native-ui` components, `api-client/src/generated`) follow their tool's output — see their
own rules.

- **Biome (`biome.json`):** no semicolons, double quotes, 2-space indent, 80-col,
  `trailingCommas: es5`, `lineEnding: lf`, Tailwind class sorting (`cn`/`cva`/`clsx` aware) + import
  organizing. Run `pnpm format` (`biome check --write --unsafe`).
- **TypeScript:** `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, NodeNext resolution. Don't
  introduce `any` on code you touch; type the public surface of shared packages (they ship `.ts`
  source via `exports`).
- **Readonly props:** All component functions must wrap their props parameter type with
  `Readonly<T>` — e.g. `export function Card(props: Readonly<CardProps>)`. This prevents
  accidental mutation and makes immutability explicit at the call site.
- **Imports:** use package entrypoints / `exports` subpaths (`@workspace/ui`,
  `@workspace/web-ui/components/...`); never reach into another package's `src` by relative path.
- **Versions:** reference `"catalog:"` (or `"catalog:tailwind3"`) in `package.json` — versions live
  in `pnpm-workspace.yaml`, not in individual packages.
- **Lint:** Biome. `pnpm lint` fails on errors; `pnpm lint:strict` (`--error-on-warnings`) also fails
  on warnings — treat warnings on code you touched as must-fix. Don't suppress rules (`biome-ignore`)
  to silence them without approval.
- **Styling:** Tailwind utilities + `cva` variants + `cn` to merge; prefer theme tokens
  (`bg-primary`, `text-foreground`) so classes work on both web and native.
