<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

> The block above is **auto-managed by the Next.js CLI** — don't hand-edit it. The canonical
> agent guide for the whole repo starts below.

---

# react-mono-core — Agent Guide (AGENTS.md)

> **Canonical instructions for all AI coding agents** (Claude Code, Codex, Cursor, etc.).
> This is the single source of truth. Claude Code loads it via `@AGENTS.md` from `CLAUDE.md`.
> Per-package rules live in nested `AGENTS.md` files under `packages/<pkg>/` and `apps/<app>/`
> and load automatically when you work on files in that workspace.

---

## Minimal-change policy

- Make the smallest correct diff that satisfies the request.
- Touch the fewest files and lines possible, and follow existing patterns.
- Do not refactor, rename, reorganize, reformat, or clean up unrelated code.
- Do not add abstractions, dependencies, or public API changes unless they are required.
- Add or update only directly relevant tests.
- If the fix requires broader changes, stop and explain why before expanding the scope.

## 0. ⛔ Execution policy — the agent does not start the apps

**Hard rule:** an AI agent working in this repo must **never manually start a dev server or a
device/emulator build.** Validate changes through compilation, automated tests, and the browser
rules below. The sanctioned E2E commands are allowed and may let their test harness start and stop
its own test server. Outside an E2E run, browser inspection is allowed only for an app that the
**user explicitly confirms they started**; that permission applies only to the already-running
instance and never authorizes the agent to start, restart, stop, or otherwise manage its process.

**✅ Allowed**
- **Build / typecheck:** `pnpm build`, `pnpm typecheck` (and `pnpm --filter <pkg> …`).
- **Lint / format:** `pnpm lint` / `lint:strict` / `lint:deps` / `format` / `format:check` /
  `biome:ci`.
- **Unit tests:** `pnpm test`, `pnpm --filter web test`, `pnpm --filter native test`. These are
  isolated (jsdom / RN test renderer) and require no server, browser, or emulator.
- **End-to-end tests:** `pnpm test:e2e`, `pnpm --filter web test:e2e`, and
  `pnpm --filter native test:e2e`. The E2E harness may manage its own test server. Native E2E still
  requires the user to have prepared and started the emulator/simulator and installed app.
- **Codegen from the checked-in spec:** `pnpm generate` (Orval reads the local
  `packages/api-client/openapi.json` — it hits no running backend and only rewrites source).
- **The gate:** `pnpm check:all` (generate → format → lint:deps → typecheck → lint:strict → **test**
  → build) — every step is allowed, since `test` is the unit suite (E2E is intentionally excluded).
- **Read-only browser inspection of a user-started app:** only after the user explicitly confirms
  that they started the server. The agent may navigate, inspect DOM/console/network state, take
  screenshots, and verify behavior, but must not use the running app to perform destructive or
  externally visible actions unless the user separately requested those actions.

**⛔ Never run — hand these to the user instead**
- **Dev servers** — `pnpm dev`, `pnpm run dev`, `turbo dev`, `pnpm --filter web dev` (Next dev
  server), `pnpm --filter native start` (Metro).
- **Native device/emulator builds & launches** — `pnpm --filter native prebuild` / `android` /
  `ios`.
- Anything else that manually boots a long-running process or reaches an external device/service
  outside the sanctioned E2E commands.

When a task needs an app to be running and the user has not explicitly confirmed that they started
it, **stop and hand them the exact command**, state what you changed and what remains, and don't
fabricate the result. After the user confirms that they started it, the read-only browser exception
above applies. A `PreToolUse`/permissions layer denies agent-started app commands to enforce this
(`settings.json`; see `CLAUDE.md`).

---

## 1. What this project is

`react-mono-core` is a **cross-platform monorepo** that ships one shared UI and one shared set of
screens to **two apps from a single codebase**:

- **`apps/web`** — a **Next.js 16** (App Router, React 19) web app.
- **`apps/native`** — an **Expo SDK 55 / React Native 0.83** (New Architecture, expo-router) app.

The same screens (`@workspace/app`) render on both. Platform differences are resolved at **build
time** by file extension (`*.tsx` for web, `*.native.tsx` / `*.native.ts` for native) inside shared
packages — app and screen code never branches on platform.

- **Package manager:** pnpm **11.9.0** (workspaces + **catalog** for single-sourced versions)
- **Node:** **26.2.0** (pinned in root `engines`)
- **Task runner:** **Turborepo** (`turbo.json`) — `build`, `dev`, `typecheck`, `test`, `test:e2e`,
  `generate`. Lint and
  format are **not** Turbo tasks: they run **Biome directly from the repo root** over the whole
  workspace (one `biome.json`), so they cover root-level files (`biome.json`, `tsconfig.json`,
  `typescript-config/*`) that a per-package fan-out can't reach
- **Styling:** Tailwind — **v4** on web (`@workspace/web-ui`), **v3 + NativeWind v4** on native
  (`@workspace/native-ui`, via `catalog:tailwind3`). The same `className` contract works on both.
- **Data layer:** TanStack Query hooks generated by **Orval** from the backend's OpenAPI spec.
- **Backend:** the sibling **`springboot-core`** (`sbf`) service — `api-client` is generated from its
  OpenAPI document; the generated tags (`sbf-user`, `sbf-role`, …) mirror that backend's entities.
  **Deployment-critical:** the backend access and refresh signing secrets checked into its
  `application.yml` are development-only values. Every shared, staging, or production environment
  must override both secrets through higher-priority external configuration; never reuse the
  checked-in values outside local development.
- **OS for local dev:** both Windows 11 (PowerShell) and Linux. Always run scripts through `pnpm`
  (cross-platform); in PowerShell prefer PowerShell-safe syntax (`$env:VAR`, `$null`, backtick
  line-continuation). Repo tooling that must run on both (e.g. agent hooks) is written in Node, and
  the repo avoids committed symlinks (they break on Windows checkouts without developer mode).

The root `README.md` is the upstream shadcn-monorepo template and is **not** authoritative — this
file is.

---

## 2. The golden rule: package layering & the UI abstraction

Like a layered backend, **dependencies only flow in one direction**. The most important invariant
in this repo is the **three-tier UI structure**:

```
   ┌──────────────────────────────────────────────────────────┐
   │  apps/web (Next.js)            apps/native (Expo)          │   ← consumers
   └───────────────┬──────────────────────────┬───────────────┘
                   │                           │
            @workspace/app  ──────────────────┘   ← shared screens (write once)
            @workspace/providers                 ← shared app-shell providers
                   │
            @workspace/ui   ← cross-platform ABSTRACTION LAYER (the only public UI API)
              ┌────┴─────┐
   @workspace/web-ui   @workspace/native-ui   ← vendored component libraries (PRIVATE to `ui`)
     (shadcn/ui)        (react-native-reusables)
```

### Dependency graph

| Package                        | Depends on (workspace)                                | Provides                                                                              | May be imported by              |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------- |
| `@workspace/storage`           | _(none)_                                              | typed local/session storage — web: Web Storage + cookies; native: MMKV (`.native.ts`) | api-client, i18n, ui, app, apps |
| `@workspace/i18n`              | storage                                               | i18next setup, type-safe `useTranslation`, locale JSON                                | ui, app, apps                   |
| `@workspace/api-client`        | storage                                               | **Orval-generated** React Query hooks + axios instance + query provider               | ui, app, apps                   |
| `@workspace/providers`         | api-client, i18n, router, storage                     | cross-platform app-shell providers (auth, OTP, menus, breadcrumbs, theme state)       | app, apps                       |
| `@workspace/web-ui`            | _(external: shadcn / radix / base-ui)_                | shadcn/ui components — **web only**                                                   | **`@workspace/ui` only**        |
| `@workspace/native-ui`         | _(external: react-native-reusables / @rn-primitives)_ | rnr components — **native only**                                                      | **`@workspace/ui` only**        |
| `@workspace/ui`                | web-ui, native-ui, api-client, i18n, storage          | cross-platform primitives (incl. `Popover`, `Separator`, dynamic `iconFor`) + form fields (`Rnc*`) + overlays (`RncDialog`, `RncBottomSheet`) + data grid (`RncGrid`) + PDF preview/share (`PdfResult`) | app, apps                       |
| `@workspace/router`            | ui (+ peer next / expo-router adapters)               | cross-platform routing API (`Link`, `LinkButton`, `useRouter`) — **no Solito**        | app, apps                       |
| `@workspace/app`               | ui, router, providers (+ api-client, i18n)            | shared, cross-platform **screens** + the **app shell / navigation chrome** (Sidebar, TopBar, mega/popover menus, BottomTabBar, Breadcrumbs, FAB, OtpDialog) | apps                            |
| `@workspace/typescript-config` | —                                                     | shared `tsconfig` bases (`base`, `nextjs`, `react-library`)                           | all (dev)                       |
| `apps/web`                     | app, providers, ui, api-client                        | Next.js app (transpiles the `@workspace/*` source it pulls in)                        | _(top)_                         |
| `apps/native`                  | app, providers, ui, api-client                        | Expo app (Metro resolves workspace source directly)                                   | _(top)_                         |

### ⛔ The two non-negotiable boundary rules

1. **`web-ui` and `native-ui` are private to `ui`.** Nothing outside `packages/ui` may import
   `@workspace/web-ui` or `@workspace/native-ui` — not screens, not apps, not other packages. They
   are the raw, platform-specific component libraries; **`@workspace/ui` is the only sanctioned UI
   API** for the rest of the repo. (See §4 for why, and §6 for the current known exception.)
2. **`ui` is the abstraction layer.** Every component exported from `@workspace/ui` must have a
   **synchronized pair**: a web variant (`<name>.tsx`, wrapping `web-ui`) and a native variant
   (`<name>.native.tsx`, wrapping `native-ui`), with the **same component name, props, and exports**
   from both, re-exported through `packages/ui/src/index.ts`. The two variants must be behaviorally
   equivalent — same business logic wherever the platform allows (§4).

Data/util packages follow the same downward-only flow: `storage` is the leaf; `api-client`,
`i18n`, and `ui` build on it; `ui` and `app` sit above; `apps` are the top and depend on nobody.
Note `ui` must **not** depend on `@workspace/router` (router depends on `ui` — that would invert the
graph); this is **machine-enforced** by a Biome `noRestrictedImports` rule scoped to `packages/ui/**`
in `biome.json`. Components that need navigation (e.g. `RncGrid`'s `route`-based actions) take an
injected `onNavigate` callback that the consumer wires with `useRouter().push`.

The **app shell / navigation chrome** (`Sidebar`, `TopBar`, `BottomTabBar`, `Breadcrumbs`,
`FloatingActionButton`, `OtpDialog`, composed as `AppShell`) lives in **`@workspace/app`**, not
`@workspace/ui`, because it reads provider state (`useMenu`, `useSidebar`, `useMyPathname`,
`useAuth`, `useOtp`, `useAppTheme`) — so `app` depends on `@workspace/providers`. It must **not** go
in `ui`: `ui → providers → router → ui` would be a cycle. Pure, provider-free building blocks the
chrome needs (e.g. the `Popover`/`Separator` primitives and the dynamic `iconFor` resolver, whose
native variant must import `native-ui`) do live in `ui`.

### Navigation menus are backend-driven

**Do not hardcode nav items in the frontend.** The sidebar, top bar, mega/popover menus, and bottom
tab bar all render from the menu tree returned by the backend `getMyMenus` API (Orval hook:
`useGetMyMenus`, type `SbfMenuTreeResponseDto` with `top` and `side` arrays).

- **`@workspace/providers`** — `MenuProvider` fetches the tree and exposes it via `useMenu()`.
  Authenticated users get their role/schema-specific tree; anonymous users get public menus. The tree
  refetches on login/logout (query key includes auth + `selectedSchema`).
- **`apps/web`** — `layout.tsx` may SSR-fetch `getMyMenus()` and pass `initialMenus` into
  `AppProviders` so the chrome paints on first load without a client round-trip.
- **`apps/native`** — fetches client-side only (`initialMenus` is undefined).
- **`@workspace/app`** — navigation chrome (`src/navigation/`) maps the API tree to UI. To add,
  reorder, or permission-gate a nav entry, change the backend menu data — not a hardcoded link list
  in the frontend.

### API permissions are backend-driven

**Do not hardcode role or permission logic in the frontend.** The backend endpoint
`GET /sbf-permission/my-permissions` returns the current context's grant list (public permissions
plus the authenticated user's effective role grants after user blocks and channel restrictions);
a grant is the `(endpoint, method)` route pair.

- **`@workspace/api-client`** — permission keys are generated from `openapi.json` into
  `src/generated/api-permissions.ts` (`ApiPermissionKey` = `"<METHOD> <endpoint template>"`,
  `CrudBasePath`) by `scripts/generate-api-permissions.mjs`, which runs as part of
  `pnpm generate` — a backend route change surfaces as a type error, not a dead gate.
- **`@workspace/providers`** — `PermissionProvider` fetches the grants (mirroring `MenuProvider`)
  and exposes `usePermission()` (`hasPermission(key: ApiPermissionKey)`) plus
  `useCrudPermissions(basePath: CrudBasePath)` for the generated CRUD route family. Refetch on
  login/logout is driven by the query key.
- **`@workspace/app`** — screens read their keys from the central config
  `packages/app/src/screens/screen-permissions.ts`; never inline a permission string in a screen.
  **Every admin page screen wraps its content in `PermissionGuard`** (keyed on the page's primary
  read route via `viewPermissions`/`formPermissions`), so an unauthorized caller gets the
  access-denied page — during SSR as well as after client navigation.
- **Hydration safety** — while the SSR seed is active, `PermissionProvider` derives grants directly
  from the `initialPermissions` prop (byte-identical on server and client via the RSC payload)
  instead of the React Query cache: the server-side query client is a module-level singleton with
  `gcTime: 0`, so SSR cache reads are not deterministic and routing the seed through it caused
  hydration mismatches on permission-gated markup.
  The audit test `apps/native/__tests__/api-permission-gating.test.ts` enforces the gating rules
  (ungated mutation hooks, unguarded admin page screens, inline permission strings all fail).
- **`apps/web`** — `layout.tsx` SSR-fetches `getMyPermissions()` and passes `initialPermissions`
  into `AppProviders` so gated controls render correctly on first paint (same seed/release pattern
  as `initialMenus`). **`apps/native`** fetches client-side only.
- **Every UI control that triggers an API call must be disabled when the user lacks that call's
  permission** — grid edit/delete/add/bulk actions, form save buttons, inline-edit grids. See
  `.claude/rules/api-permissions.md` and the reference implementation in
  `packages/app/src/screens/admin/user/`. The client gate is UX only; the backend remains the
  enforcement point.

---

## 3. Build, test, format — commands

Always go through **pnpm** (which drives **Turbo**) — the scripts run on both Windows (PowerShell)
and Linux shells.

| Task                                        | Command                                                           |
| ------------------------------------------- | ----------------------------------------------------------------- |
| Install deps                                | `pnpm install`                                                    |
| Run everything (the full CI gate)           | `pnpm check:all`                                                  |
| Build all                                   | `pnpm build`                                                      |
| Dev (all apps, watch)                       | `pnpm dev`                                                        |
| Test all                                    | `pnpm test`                                                       |
| E2E tests                                   | `pnpm test:e2e`                                                   |
| Lint / Format / Typecheck (all)             | `pnpm lint` · `pnpm format` · `pnpm typecheck`                    |
| Lint, fail on any warning (CI/gate)         | `pnpm lint:strict`                                                |
| Biome format check, no writes               | `pnpm format:check`                                               |
| Biome CI gate (format + lint + assist)      | `pnpm biome:ci`                                                   |
| Workspace dependency hygiene (sherif)       | `pnpm lint:deps`                                                  |
| Regenerate the API client (Orval)           | `pnpm generate`                                                   |
| One workspace only                          | `pnpm --filter web dev` / `pnpm --filter @workspace/ui typecheck` |
| Web app dev                                 | `pnpm --filter web dev`                                           |
| Web E2E tests                               | `pnpm --filter web test:e2e`                                      |
| Native app (Metro)                          | `pnpm --filter native start`                                      |
| Native tests                                | `pnpm --filter native test`                                       |
| Native E2E tests                            | `pnpm --filter native test:e2e`                                   |
| Native: prebuild / run Android / iOS        | `pnpm --filter native prebuild` · `... android` · `... ios`       |
| Regenerate **all** shadcn web components ⚠️ | `pnpm shadcn-update`                                              |
| Regenerate **all** rnr native components ⚠️ | `pnpm rnr-update`                                                 |
| Dependency hygiene                          | `pnpm outdated-deps` · `pnpm update-deps` · `pnpm dedupe-deps`    |

> **⛔ Agent execution note (§0).** Manual app commands — `pnpm dev`,
> `pnpm --filter web dev`, `pnpm --filter native start`, and native
> `prebuild`/`android`/`ios` builds — are **for the user, not the agent**. E2E commands are allowed;
> their test harness may manage its own test server. Hand manual dev-server and device/emulator
> setup to the user.

`pnpm check:all` runs the gate in order: **`generate → format → lint:deps → typecheck → lint:strict → test → build`**. Run it
(or at least `typecheck` + `lint` for the workspaces you touched) before declaring work done, and
report real results — if something fails, say so.

`pnpm lint:deps` runs **sherif** (`-r unordered-dependencies`) — a workspace dependency linter that
enforces a single version of each dependency across all packages, no unused/mismatched deps, and
catalog discipline. The cosmetic `unordered-dependencies` rule is disabled because it conflicts with
the house ordering that keeps `@biomejs/biome` after the `@types/*` block. Add the `sherif` version
in the catalog like any other dependency.

E2E tests are intentionally explicit rather than part of `check:all`: web E2E requires Playwright
browsers (`pnpm --filter web exec playwright install chromium`), and native E2E requires a built app
installed on an emulator/simulator plus the Maestro CLI.

> **Lint enforcement note.** `pnpm lint` (`biome lint`) fails on **errors** — including the
> `web-ui`/`native-ui` import boundary (§2) and the `ui`→`router` boundary (both
> `noRestrictedImports` errors). CI and the git hooks run
> **`pnpm lint:strict`** (`biome lint --error-on-warnings`), which additionally fails on **warnings**
> (e.g. unused vars, Tailwind class order). Treat warnings on code you touch as must-fix.

> **Catalog versions.** Almost every dependency version is centralized in `pnpm-workspace.yaml`
> under `catalog:` (and the `tailwind3` named catalog for native). Packages reference `"catalog:"` /
> `"catalog:tailwind3"` instead of literal versions. **Add or bump a version in the catalog, not in
> a package's `package.json`** — keep the whole workspace on one version of each library.

---

## 4. ⚠️ Vendored UI libraries — `web-ui` and `native-ui` are CLI-managed

This is the most important "what gets overwritten" rule, analogous to generated code in a backend.

`@workspace/web-ui` holds **all shadcn/ui components**, added by the shadcn CLI. `@workspace/native-ui`
holds **all react-native-reusables (rnr) components**, added by the rnr CLI. Both can be regenerated
**wholesale**:

```powershell
pnpm shadcn-update   # = pnpm dlx shadcn@latest add -c packages/web-ui --all --overwrite
pnpm rnr-update      # = pnpm dlx @react-native-reusables/cli@latest add -c packages/native-ui --all --overwrite
```

Both pass **`--all --overwrite`**, so a re-run **replaces every component file** in
`packages/web-ui/src/components/ui/` and `packages/native-ui/src/components/ui/`. Treat these
directories as **vendored / generated**:

- **Do not edit `web-ui` or `native-ui` component files unless absolutely necessary.** Any hand-edit
  is silently lost the next time someone runs the update script, and it desyncs the component from
  its upstream registry. Adding a _new_ component (a CLI-supported component not yet present) is fine
  — that's what the CLI is for. **Modifying** an existing vendored component is the thing to avoid.
- **Customize at the `ui` layer instead.** When you need different behavior or styling, wrap or
  adjust the component in `@workspace/ui` (the abstraction), not in the vendored source. If a change
  truly must live in the vendored file (e.g. a registry component is genuinely broken), **call it out
  explicitly**, keep it minimal, and document it so the next CLI run doesn't surprise anyone.
- The CLI config for each lives in its `components.json` (style, aliases, base color). The `cn`
  helper and any shared lib live in `packages/<pkg>/src/lib/`.

### The `ui` abstraction contract (mandatory)

`@workspace/ui` is the **only** package allowed to import `web-ui`/`native-ui`. For each primitive it
exposes, it ships a **synchronized pair** that Metro/Next pick between automatically:

| File                                           | Picked on          | Wraps                            |
| ---------------------------------------------- | ------------------ | -------------------------------- |
| `packages/ui/src/components/<name>.tsx`        | web (Next/webpack) | `@workspace/web-ui` component    |
| `packages/ui/src/components/<name>.native.tsx` | native (Metro)     | `@workspace/native-ui` component |

Both files **must export the same names and a compatible props type**, and be **registered in
`packages/ui/src/index.ts`**. See `button.tsx` / `button.native.tsx` and `text` / `view` for the
canonical pattern. Rules when adding or changing a `ui` primitive:

1. **Add/modify both variants together** — never ship a web variant without its native sibling (or
   vice versa). A primitive exported from `ui` that resolves on only one platform is a bug.
2. **Keep the public API identical** across the pair: same exported component & helper names
   (e.g. `Button`, `buttonVariants`), same prop names and meaning. Types may be sourced differently
   per platform (web: `React.ComponentProps<"button">`; native: the rnr `ButtonProps`) but the
   _contract the screen sees_ must match.
3. **Keep business logic the same wherever the platform allows.** State, event handling, variant
   selection, and conditional rendering should be written once per behavior, not diverge. Only the
   irreducibly platform-specific bits (DOM element vs. `Pressable`, hover vs. press, `<span>` vs.
   rnr `Text`) should differ.
4. **Re-export from `index.ts`** so consumers do `import { Button } from "@workspace/ui"`.
5. Styling rides on Tailwind class names that are valid in **both** Tailwind v4 (web) and
   NativeWind/Tailwind v3 (native) — prefer the design-token classes (`bg-primary`,
   `text-foreground`, …) that both theme layers define.

---

## 5. ⚠️ Generated API client — `api-client/src/generated/`

`@workspace/api-client` is split into **hand-written** utilities and **Orval-generated** code:

| Path                                                                    | Source of truth                | Hand-edit?                                              |
| ----------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------- |
| `src/generated/**` (per-tag hooks + `*.schemas.ts`)                     | **Orval**, from `openapi.json` | ❌ **Never** — `pnpm generate` wipes it (`clean: true`) |
| `src/axios-instance.ts` (`customInstance`, interceptors, OTP/401 hooks) | hand-written                   | ✅ Yes                                                  |
| `src/query-client-provider.tsx`, `src/channel*.ts`, `src/index.ts`      | hand-written                   | ✅ Yes                                                  |
| `orval.config.ts`, `openapi.json`                                       | config / input                 | ✅ Yes (re-generate after)                              |

- To change generated hooks, change the **OpenAPI input** (regenerate the backend's
  `springboot-core` spec, refresh `openapi.json`) and/or `orval.config.ts`, then run `pnpm generate`
  — never hand-edit files under `src/generated/`. Orval runs with `clean: true`, so edits are deleted.
- All generated React Query hooks and schemas are re-exported via `src/index.ts` (`export *`); import
  them from `@workspace/api-client`, not deep paths.

---

## 6. Cross-platform conventions (web vs. native)

- **Platform resolution is by file extension**, never by runtime branching in shared code:
  - `foo.tsx` → web (Next/webpack/Turbopack)
  - `foo.native.tsx` / `foo.native.ts` → native (Metro)
  - A plain `foo.ts` with no `.native` sibling is shared by both.
  - Examples: `storage.ts`/`storage.native.ts`, `i18n` `detect-language[.native].ts`,
    `api-client` `channel[.native].ts`, `router` `link[.native].tsx` /
    `router[.native].ts`, every `ui` primitive.
- **Shared routing goes through `@workspace/router`.** It wraps Next App Router on web and
  Expo Router on native without Solito. Shared screens must import `Link`, `LinkButton`,
  `useRouter`, `usePathname`, and `useSearchParams` from `@workspace/router`, not `next/*` or
  `expo-router`. App route/layout shells may still import framework router primitives that are not
  part of the shared screen surface (for example Expo Router `Stack`).
- **Web pulls workspace source through transpilation.** `apps/web/next.config.ts` lists
  `transpilePackages` for the `@workspace/*` packages it consumes (incl. `web-ui` transitively via
  `ui`). If you add a new workspace package to the web app, add it there too.
- **Native resolves workspace source via Metro.** `apps/native/metro.config.js` watches the
  workspace root and uses `nodeLinker: hoisted` (see `pnpm-workspace.yaml` — required for the RN New
  Architecture C++ build on Windows path limits). NativeWind input is `apps/native/src/global.css`;
  Tailwind content globs in `apps/native/tailwind.config.js` must include any new package whose
  classes need compiling.
- **Single React / React Native version.** Enforced via the catalog + `overrides.react-native` in
  `pnpm-workspace.yaml`. Don't introduce a second copy.
- `@rn-primitives/portal` is used by `@workspace/providers` for the native `PortalHost` that rnr
  overlays require. Apps should not import `@workspace/native-ui` directly.

---

## 7. Code style & conventions

- **Formatter:** Biome (`biome.json`) — **no semicolons**, **double quotes**, 2-space indent,
  80-col, `trailingCommas: es5`, `lineEnding: lf`. Tailwind class sorting (`useSortedClasses`, aware
  of `cn`/`cva`/`clsx`) and import organizing are applied by `pnpm format` (`biome check --write
  --unsafe`). Don't fight it — run `pnpm format`.
- **Linting:** Biome (`biome.json`) — a **single root config** for the whole workspace (no
  per-package configs). `pnpm lint` fails on errors; `pnpm lint:strict` (`--error-on-warnings`)
  additionally fails on warnings — **leave zero warnings on code you touch** (treat them as must-fix,
  like the backend's "zero Sonar findings" rule). The `web-ui`/`native-ui` import boundary (§2) is a
  Biome `noRestrictedImports` error, relaxed inside `web-ui`/`native-ui` and swapped for a
  `ui`→`router` restriction inside `ui`, all via config `overrides`.
- **TypeScript:** `strict`, `noUncheckedIndexedAccess`, `isolatedModules`, NodeNext resolution
  (from `@workspace/typescript-config`). No `any` escape hatches on code you touch; type the public
  surface of every package (they ship `.ts` source via `exports`, so types must be sound).
- **Imports:** use the package entrypoints / `exports` subpaths (`@workspace/ui`,
  `@workspace/web-ui/components/...`), not relative cross-package paths. Never reach into another
  package's `src` by relative path.
- **Styling:** Tailwind utility classes + `cva` for variants + `cn` to merge. Prefer theme tokens so
  the same class works on web and native.
- **Page layout (large screens):** Screens and app routes should use the full width available inside
  the shell (`w-full` with responsive padding). Do **not** add narrow `max-w-*` wrappers at the page
  root unless the UX genuinely needs a constrained column (e.g. login, OTP, a single-field prompt).
  Data-heavy pages (grids, tables, dashboards, admin lists) must stay full-width on large viewports —
  let `RncGrid` and similar components use the space. When a form benefits from a reading width, cap
  **the form block only** (not the whole page) and scale the cap up at `lg`/`xl` rather than leaving
  `max-w-sm` / `max-w-xl` in place on desktop. See `packages/app/AGENTS.md` and
  `.claude/rules/page-layout.md`.
- **Match the surrounding code** — file layout, naming, comment density, the `.native` split pattern.

---

## 8. Workflow expectations for agents

1. **Identify the package/layer and platform** of any file before editing, and obey §2 boundaries.
   If a screen needs a component, it goes through `@workspace/ui` — never import `web-ui`/`native-ui`
   outside `ui`, and never import data deps in a way that inverts the graph.
2. **Touching a `ui` primitive? Update both variants** (`*.tsx` + `*.native.tsx`) and `index.ts`
   together, keeping name/prop/behavior parity (§4). A one-sided change is incomplete.
3. **Don't hand-edit vendored or generated code** — `web-ui`/`native-ui` component files (§4) or
   `api-client/src/generated/**` (§5). Change the source (CLI / OpenAPI) and regenerate, or
   customize at the `ui` layer.
4. **Versions go in the catalog** (`pnpm-workspace.yaml`), not in individual `package.json` files (§3).
5. **Run the gate** — `pnpm check:all` (or at least `typecheck` + `lint` for touched workspaces) —
   before declaring done. Run relevant unit and E2E tests; **never manually start a dev server or
   device/emulator build** (§0). E2E harness-managed test servers are allowed. After editing, check
   IDE diagnostics (`mcp__ide__getDiagnostics`) for the files you changed and resolve every finding;
   if diagnostics look stale, ask the user to refresh rather than assuming clean. Don't suppress
   findings to silence them without approval.
6. **Don't commit or push unless asked.** When you do, don't bypass the husky hooks with
   `--no-verify` (§11) — pre-commit formats staged files, pre-push runs the full gate, and CI runs it
   again regardless.
7. **Keep changes minimal, targeted, and scoped.** Whenever possible, make the smallest complete
   change that satisfies the request. Avoid unrelated refactors, opportunistic cleanup, broad
   rewrites, dependency upgrades, renames, or formatting untouched files unless they are required
   for correctness or explicitly requested. Do not omit required tests, documentation, generated
   artifacts, or cross-platform parity updates in the name of a small diff. This is shared
   infrastructure feeding two apps — a small change in `ui`/`app`/`api-client` ripples into both web
   and native.
8. **Update the docs with the change.** Before declaring done, review whether your change made any of
   these stale and fix it in the same change set: this root **`AGENTS.md`**; the relevant per-package
   **`packages/<pkg>/AGENTS.md`** / **`apps/<app>/AGENTS.md`**; the relevant **screen SDD(s) under
   `docs/screens/`** (see item 9); relevant code comments. Edit the `AGENTS.md` files (not the
   `CLAUDE.md` import shims) so Claude Code and Codex stay in sync. Note which docs you updated (or
   that none applied) when reporting.
   **`packages/<pkg>/AGENTS.md`** / **`apps/<app>/AGENTS.md`**; relevant code comments. Edit the
   `AGENTS.md` files (not the `CLAUDE.md` import shims) so Claude Code and Codex stay in sync. Note
   which docs you updated (or that none applied) when reporting.
9. **Keep the screen SDDs in sync.** `docs/screens/` holds a Screen Design Document per screen
   (what the user sees and does — layout, fields, validation, states, actions; **no** implementation
   detail). Whenever a task adds, removes, or changes a screen's fields, validation, states, actions,
   navigation, or layout, update the matching SDD (`docs/screens/<domain>/<screen>.md`)
   **in the same change set**, and add a new SDD when you build a screen that doesn't have one yet.
   Keep them behaviour-only — leave API/data/component specifics to code and the `AGENTS.md` files.

---

## 9. Repo map (quick reference)

```
react-mono-core/
├── AGENTS.md                 ← this file (canonical agent guide; top block is Next.js-managed)
├── CLAUDE.md                 ← imports AGENTS.md + Claude-specific notes
├── .agents/                  ← tool-agnostic agent assets: skills/ (canonical SKILL.md dirs) + hooks/ (Node guard)
├── .claude/                  ← Claude Code config (settings, commands, agents, rules; skills/ are stubs → .agents/skills/)
├── .codex/                   ← Codex config (MCP, agents, hooks.json → .agents/hooks/ guard)
├── .gemini/settings.json     ← Gemini CLI: context.fileName → AGENTS.md
├── .aider.conf.yml           ← Aider: read AGENTS.md
├── .github/copilot-instructions.md ← legacy-Copilot stub → AGENTS.md
├── .cursor/mcp.json · .vscode/mcp.json · .mcp.json ← shadcn MCP server (per-tool mirrors)
├── .husky/                   ← git hooks (pre-commit: lint-staged; pre-push: the full gate) — §11
├── .github/workflows/ci.yml  ← CI: generate-drift + biome:ci + typecheck + test + build + web E2E
├── package.json              ← root scripts (turbo build/typecheck/test/test:e2e + biome lint/format) + engines + catalog dev deps + lint-staged
├── pnpm-workspace.yaml       ← workspaces, catalog (single-sourced versions), nodeLinker, overrides
├── turbo.json                ← task graph (build/dev/typecheck/test/test:e2e/generate; lint/format run via Biome, not Turbo)
├── biome.json                ← Biome config — format + lint, single source for the workspace
├── apps/
│   ├── web/        ← Next.js 16 app (App Router)                 (AGENTS.md)
│   └── native/     ← Expo SDK 55 / RN 0.83 app (expo-router)     (AGENTS.md — Expo note)
└── packages/
    ├── ui/             ← cross-platform ABSTRACTION layer (the public UI API)   (AGENTS.md)
    ├── web-ui/         ← shadcn/ui components — VENDORED, private to `ui`        (AGENTS.md)
    ├── native-ui/      ← react-native-reusables — VENDORED, private to `ui`      (AGENTS.md)
    ├── app/            ← shared cross-platform screens                          (AGENTS.md)
    ├── providers/      ← shared cross-platform app-shell providers              (AGENTS.md)
    ├── api-client/     ← Orval-generated React Query hooks + axios              (AGENTS.md)
    ├── storage/        ← typed storage (web Storage/cookies, native MMKV)       (AGENTS.md)
    ├── i18n/           ← i18next setup + locales                                (AGENTS.md)
    ├── router/         ← Next/Expo Router abstraction — no Solito               (AGENTS.md)
    └── typescript-config/  ← shared tsconfig bases
```

Each meaningful package/app has an `AGENTS.md` (its rules) + a `CLAUDE.md` import stub that load
automatically when you work in that workspace.

---

## 10. Tooling notes for each agent

**This file (plus the nested per-package `AGENTS.md`) is the single source of truth.** Every
tool-specific file is a thin pointer to it — never duplicate guidance into a tool file.

| Tool | Reads instructions via |
| --- | --- |
| Codex, Cursor, Windsurf, Copilot (coding agent, code review, VS Code), Amp, Zed, Jules, Devin, Junie, Aider | `AGENTS.md` natively (root + nested; nearest file wins) |
| Claude Code | `CLAUDE.md` → `@AGENTS.md` import shim (root + 1-line stubs per workspace) |
| Gemini CLI | `.gemini/settings.json` sets `context.fileName` to `AGENTS.md` |
| Aider (explicit load) | `.aider.conf.yml` → `read: [AGENTS.md]` |
| Legacy Copilot IDE surfaces | `.github/copilot-instructions.md` (2-line stub → AGENTS.md) |

Other shared agent assets:

- **Skills** (portable `SKILL.md` procedures, the cross-tool Agent Skills format): canonical copies
  live in **`.agents/skills/`** (read natively by Codex, VS Code Copilot, Gemini CLI, Cursor, …).
  `.claude/skills/` contains thin stubs pointing there. Edit only the `.agents/skills/` copy.
- **Subagents** (not standardized across tools): `.claude/agents/*.md` (Claude Code) and their
  `.codex/agents/*.toml` ports. Both cite this file's sections rather than restating rules — keep
  each pair in sync when changing one.
- **Edit-guard hook**: `.agents/hooks/guard-protected-paths.mjs` (Node, cross-platform), wired via
  `.claude/settings.json` and `.codex/hooks.json`. It denies edits to build output and
  `api-client/src/generated/**`, and asks before edits to vendored `web-ui`/`native-ui` components.
- **MCP** (shadcn server): `.mcp.json` (Claude Code), `.codex/config.toml` (Codex),
  `.cursor/mcp.json` (Cursor), `.vscode/mcp.json` (VS Code) — same server, per-tool config formats;
  update all four together.

Keep tools in sync by **editing only the `AGENTS.md` files** — the `CLAUDE.md` files and other
pointers are thin shims and rarely need changes.

---

## 11. Git hooks & CI (local + remote enforcement)

The boundary rules in this guide are **machine-enforced**, not just documented.

### Git hooks — husky (`.husky/`)

Registered automatically by the root `package.json` `"prepare": "husky"` script, which runs on
`pnpm install` (sets `core.hooksPath` to `.husky/_`). No manual `git config` needed; verify with
`git config --get core.hooksPath` → `.husky/_`.

- **`pre-commit`** → `pnpm exec lint-staged`. Runs **`biome check --write`** (safe fixes: format +
  organize imports) on staged `*.{ts,tsx,js,jsx,json,jsonc}` — formats only what you're committing
  (fast). It does **not** apply unsafe fixes (Tailwind class sorting), so run `pnpm format` if
  `lint:strict` later flags class order.
- **`pre-push`** → the full read-only gate:
  **`lint:deps → biome:ci → typecheck → test → build → web E2E`** (mirrors CI except native Maestro
  E2E, which requires a built app installed on an emulator/simulator). Blocks the push if anything
  fails.

Don't bypass with `--no-verify` (root §8.6) — CI runs the same checks and will fail the PR anyway.

### CI — GitHub Actions (`.github/workflows/ci.yml`)

Runs on every **pull request** and on **push to `main`** (superseded PR runs are cancelled; main runs
always finish, so each commit is fully verified and populates the cache). The job declares
least-privilege `permissions: contents: read` and a `timeout-minutes` cap, and uses latest-major
action tags (Dependabot, `.github/dependabot.yml`, PRs new majors). One `check` job: install
(`--frozen-lockfile`) → **generated-API drift check** (`pnpm generate`, fail if
`api-client/src/generated` changed) → **`lint:deps`** (sherif dependency hygiene) → **`biome:ci`** →
**`typecheck`** → **`test`** → **expo-doctor**
(native project audit — SDK/dependency alignment, `app.json` schema, Metro config, duplicate native
modules) → **`build`** → **Playwright Chromium install** → **web E2E**. Node version is read from
`engines.node`; pnpm from the `packageManager` field.

**No backend runs in CI.** The job sets `NEXT_PUBLIC_API_URL` to a closed local port
(`http://127.0.0.1:9999`) so SSR requests fail immediately and deterministically instead of
accidentally reaching a service on the web client's same-host development fallback (port `21001`).
The layout then takes its intended graceful-degradation path (both fetches are wrapped in
`try`/`catch`, and React Query runs with `throwOnError: false`), so the shell paints with no menus and
the default language. It's set at **job level** because `NEXT_PUBLIC_*` is inlined at build time —
setting it only on the E2E step would leave the default host baked into `build`. Web E2E therefore
covers app startup and shared-screen rendering, **not** data-backed flows; add a mock/stub backend
before asserting on API-driven content.

### Why `biome:ci` (not `format:check` + `lint`)

`pnpm biome:ci` (`biome ci --error-on-warnings`) runs **format + lint + assist** checks in one
no-write pass, so **warnings also fail** the build (e.g. unused vars, Tailwind class order) and
**import organization is enforced** — an assist action that plain `biome format` and `biome lint`
each miss on their own. The **`web-ui`/`native-ui` import boundary** (§2) is a Biome
`noRestrictedImports` **error** in `biome.json`, relaxed inside `web-ui`/`native-ui` and swapped for a
**`ui`→`router`** restriction inside `ui`, via the config `overrides`. (`pnpm lint:strict` /
`pnpm format:check` remain available for narrower local runs.)

---

## 12. Worktree workflow (feature isolation)

Feature work **may** happen in an isolated git **worktree** — a second working directory backed by
the same repository but with its own checked-out branch. This gives **filesystem isolation between
parallel tasks**: two features can be edited, built, and tested side by side without touching each
other's files, and any **conflicts are deferred to merge time** instead of colliding in a single
working tree.

### The policy — always ask first, never assume

The worktree approach is a **per-task choice, not an automatic default.**

- **Before starting any new feature or task**, the agent **MUST ask the user**:
  > "Work on this in a dedicated worktree, or directly on main?"

  and **wait for the answer** before proceeding — do not begin editing until the user has chosen.
- **If the user chooses the worktree approach**, follow the skill **"Start a feature in a new
  worktree"** (`.agents/skills/worktree-start/SKILL.md`) below.
- **If the user chooses main**, work directly on the `main` branch as normal — **skip the worktree
  steps entirely.**

### Naming convention

- **Branch:** `feat/<feature-name>`
- **Worktree directory:** a **sibling of the repo root** named `../<repo-name>-<feature-name>`
  (`<repo-name>` is the **basename of the repo root directory** — the folder you checked out).
  For this repo, `<repo-name>` is `react-mono-core`, e.g. `../react-mono-core-search-filters`.

### Two hard constraints

1. **Each worktree needs its own branch.** Git will **not** check out the same branch in two
   worktrees at once — the feature worktree must be on `feat/<feature-name>`, never `main`.
2. **Merge into `main` from the main worktree.** The `git merge` must be run from the worktree that
   has `main` checked out (the repo root), **not** from the feature worktree.

### The four worktree skills

Canonical bodies live in `.agents/skills/` (read by every agent tool); `.claude/skills/` holds thin
stubs pointing there. The exact commands:

When a worktree feature is **finished**, the agent **MUST ask the user** how to land it:

> "Merge the worktree commits onto main, soft-merge as staged changes (no commit), or discard?"

- **Merge** → Skill B (`worktree-merge`) — normal merge; feature commits land on `main`.
- **Soft merge** → Skill D (`worktree-soft-merge`) — squash to **staged, uncommitted** changes on
  `main` for manual review / a single commit of the user's choice.
- **Discard** → Skill C (`worktree-discard`) — throw the work away.

Wait for the answer before running any landing skill.

#### Skill A — Start a feature in a new worktree

**Use when:** the user has confirmed they want to use a worktree for a new feature.

```bash
# 1. From the repo root, create the branch + sibling worktree in one step:
git worktree add -b feat/<feature-name> ../<repo-name>-<feature-name>
# 2. Move into it:
cd ../<repo-name>-<feature-name>
# 3. Do all work for this feature here. Commit locally as you go.
#    Do NOT push unless the user explicitly asks.
```

#### Skill B — Merge a worktree into main and delete it

**Use when:** a feature is complete and the user wants to keep it.

```bash
# 1. Move into the main worktree (the directory that has `main` checked out — the repo root):
cd <path-to-main-worktree>
# 2. Merge the feature branch:
git merge feat/<feature-name>
# 3. Run the test suite. If merging MULTIPLE feature branches, do them ONE AT A TIME
#    (merge, then test, then the next) so a failure is traceable to one branch:
pnpm test
# 4. On success, remove the worktree:
git worktree remove ../<repo-name>-<feature-name>
# 5. Delete the merged branch:
git branch -d feat/<feature-name>
```

#### Skill C — Discard a worktree without merging

**Use when:** abandoning a feature; its work should be thrown away.

```bash
# 1. Move into the main worktree:
cd <path-to-main-worktree>
# 2. Force-remove the worktree (force handles uncommitted changes inside it):
git worktree remove --force ../<repo-name>-<feature-name>
# 3. Force-delete the unmerged branch (capital -D forces deletion of unmerged work):
git branch -D feat/<feature-name>
# 4. Optional: clear any stale worktree metadata:
git worktree prune
```

#### Skill D — Soft-merge a worktree onto main (staged, no commit)

**Use when:** the user wants the feature **on `main`** but **not** as the worktree's commits — they
prefer a staged diff to review, edit, test, and commit themselves.

```bash
# 1. Move into the main worktree:
cd <path-to-main-worktree>
# 2. Ensure you are on main (stash or commit any WIP on main first):
git checkout main
# 3. Squash-merge — stages all feature changes, does NOT commit:
git merge --squash feat/<feature-name>
# 4. Run the test suite (one branch at a time if merging several):
pnpm test
# 5. On success, remove the worktree:
git worktree remove ../<repo-name>-<feature-name>
# 6. Delete the feature branch (squash does not mark it merged — use -D):
git branch -D feat/<feature-name>
```

Changes remain **staged** on `main` until the user commits. Use `git reset` to unstage only if the
user asks.

---

## 13. Child repositories — synchronize with core

Child projects inherit two portable Git workflows from `.agents/skills/`. The upstream remote's
alias is not prescribed; the skill identifies the remote whose URL repository name is
`react-mono-core`.

These workflows are **child-only**. If either skill is invoked in `react-mono-core` or
`springboot-core`, it exits successfully before fetching or changing Git state.

### Merge a core ref into a child (`merge-from-upstream`)

Use `.agents/skills/merge-from-upstream/SKILL.md` when a child project needs a core update.

- Require the user to choose the exact ref type (`tag` or `branch`) and ref name; never default to
  `main` or the latest tag.
- Merge the fetched ref into the child's current branch with normal Git merge semantics. Do not
  rebase, squash, or rewrite history.
- Require a clean child worktree, preview incoming commits, run the child's full validation gate,
  and do not push unless separately asked.

### Contribute core commits from a child (`push-to-upstream`)

Use `.agents/skills/push-to-upstream/SKILL.md` when work developed in a child belongs in core.

- Require the user to choose both the child source branch and the `react-mono-core` destination
  branch; never infer either one.
- Transfer every not-yet-upstream commit whose **subject starts exactly with the case-sensitive
  prefix `core:`**. A `core:` string later in the subject or only in the body does not qualify.
- Replay only those commits, in order, on a temporary branch/worktree based on the fetched upstream
  tip. Validate there before pushing.
- Push only to the chosen destination branch and never force-push or bypass branch protection.
- Leave the child source branch untouched and remove only temporary resources after success.

Canonical skill bodies live under `.agents/skills/`; `.claude/skills/` contains thin command stubs.

---

## 14. Core repository — import child core commits

The inverse core-side workflow is `.agents/skills/import-core-commits/SKILL.md`. Use it only from
`react-mono-core` when a child repository contains commits that belong in core. Outside this core
repository, it exits before fetching or changing Git state.

- Require the user to choose the existing child repository/remote, child source branch, and local
  core destination branch; never infer any of them.
- Fetch only the selected child branch and select every not-yet-core commit whose **subject starts
  exactly with the case-sensitive prefix `core:`**.
- Preview the selected commits, omit only patch-equivalent changes already present in core, and
  cherry-pick the remaining commits in chronological/topological order.
- Never bring child-only commits into core merely to satisfy a dependency. Stop on ambiguous merge
  commits or conflicts and ask the user for direction.
- Run `pnpm check:all` after importing. Leave pushing to a separate explicit user request.

The Claude command stub lives at `.claude/skills/import-core-commits/SKILL.md`.
