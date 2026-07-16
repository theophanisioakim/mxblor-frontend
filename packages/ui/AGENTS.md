# `@workspace/ui` — cross-platform abstraction layer (the public UI API)

> Layer rules for this package. The root **`AGENTS.md`** (§2, §4) is authoritative; this adds the
> package-specific detail. Read the root guide first.

## What this is

The **single sanctioned UI API** for the whole repo. It is the abstraction over the two vendored
component libraries: it wraps `@workspace/web-ui` (shadcn) on web and `@workspace/native-ui` (rnr) on
native, exposing one consistent component surface to `@workspace/app` and the apps. **This is the
only package allowed to import `web-ui` / `native-ui`.**

Layout:

- `src/components/primitives/<name>.tsx` — **web** variant (wraps `web-ui`)
- `src/components/primitives/<name>.native.tsx` — **native** variant (wraps `native-ui`)
- `src/components/form-components/` — react-hook-form field set (see below)
- `src/components/overlays/` — `RncDialog` + `RncBottomSheet` (web fixed-overlay / native RN `Modal`
  variants + a shared `*-model.ts`), built from primitives (no vendored dialog/sheet)
- `src/components/grid-components/` — the cross-platform data grid (`RncGrid`); see below
- `src/components/pdf-result/` — `PdfResult`, with browser preview/download and native cache/share
  variants backed by one shared props contract
- `src/hooks/` — cross-platform hooks: `use-is-mobile` (web `matchMedia` / native
  `useWindowDimensions`) and `use-container-width` (web `ResizeObserver` / native `onLayout`), each a
  `.ts`/`.native.ts` pair with a shared types file
- `src/index.ts` — re-exports every primitive (consumers do `import { Button } from "@workspace/ui"`)
- `src/lib/utils.ts` — re-exports `cn`; `src/styles/globals.css` — web theme tokens

Current primitives: `Button`, `Text`, `View`, `Pressable`, `Input`, `Label`, `Checkbox`, `Switch`,
`Spinner`, `Icon` (+ the lucide glyphs consumers use), `Popover`/`PopoverTrigger`/`PopoverContent`
(web shadcn / native rnr — native renders into the `@workspace/providers` `PortalHost`), `Separator`,
and `iconFor(name, size?, className?)` — a dynamic lucide resolver that renders a glyph by its
(PascalCase) backend name (web `lucide-react` / native rnr `Icon` + `lucide-react-native`), used by
the navigation chrome in `@workspace/app`. `Input`/`Checkbox`/`Switch` expose a single
**React-Native-flavored** contract (`onChangeText`, `secureTextEntry`, `checked: boolean |
"indeterminate"`, …) that the web variant maps onto the DOM. `Pressable` mirrors RN's `Pressable`
(`onPress`) so shared composite components (the grid's rows/cells/icon-buttons) can be interactive on
both platforms from a single file; on web it renders an accessible `<div role="button">` with
keyboard handling.

### `src/components/pdf-result/` — `PdfResult`

`PdfResult` presents in-memory PDF bytes after a successful API request. The web variant owns a
temporary object URL, previews it in an iframe, downloads it with the supplied filename, and revokes
the URL on cleanup. The native variant writes the bytes to the Expo cache and opens the operating
system share/preview flow, reporting unavailable or failed sharing through `onError`. Keep the
shared props synchronized and keep platform APIs inside the paired implementations/helpers.

### `src/components/grid-components/` — `RncGrid`

A feature-rich, mostly platform-free data grid (sorting, client-side filtering, pagination, selection
+ bulk actions, row actions, modal/inline editing, responsive column collapse with an expandable
detail row, a toolbar, and mobile bottom-sheet filter/sort). It is composed from `@workspace/ui`
primitives + the form fields + the overlays, so the sub-components are single `.tsx` files (the
platform split lives in the primitives/overlays they use). **`ui` must not import
`@workspace/router`** (router depends on `ui`); the grid's `route`-based edit/add actions call an
injected `onNavigate?: (href: string) => void` prop that the consumer wires with
`useRouter().push`. The grid persists its last search to `@workspace/storage`
(`StorageKeys.GRID_LATEST_SEARCH`).

### `src/components/form-components/` — react-hook-form field set

A self-contained module of RHF-powered form fields (`RncInput`, `RncCheckbox`, `RncSwitch`,
`RncSelect`, `RncDateTimeField`, `RncTranslationLabel`, `RncForm`, `RncSubmitButton`). Keep file and
folder names lowercase/kebab-case (`rnc-input/rnc-input.tsx`, `use-rnc-input.tsx`, etc.) while
preserving the exported `Rnc*` / `useRnc*` symbols. Each field follows a 3-layer
pattern: a `Controller` wrapper, a `useX` validation/defaults hook, and a presentational `Render`
that consumes only `@workspace/ui` primitives — so most renders are platform-free. `RncSelect` and
`RncDateTimeField` keep a `.tsx`/`.native.tsx` render split (web dropdown vs. native bottom-sheet;
HTML date input vs. text input). Because these fields live **inside** `packages/ui`, owning the
`react-hook-form` + `@workspace/i18n` dependency here is intentional (it adds a `ui → i18n` edge;
root `AGENTS.md` §2). Validation messages use `common:validations.*` keys.

`RncTranslationLabel` is the field whose **value is a translation-label id**, not text: it edits one
text per tenant language in an `RncDialog`, autocompletes over the labels of its `keyNamespace`, and
lets the backend (`/sbf-translation`) decide reuse-vs-create on save. It is the **first (and
so far only) consumer of the `ui → api-client` edge** already declared in `package.json`. It does
**not** fetch the tenant's languages itself: it reads `useLanguageConfig()` from
`@workspace/api-client`, whose `LanguageConfigProvider` loads them **once for the whole app** (see
`packages/api-client/AGENTS.md`). Don't reintroduce a per-field `useGetLanguageConfig()` — with the
global `staleTime: 0` / `gcTime: 0` query defaults that means one HTTP request per field, per mount.
Its main render is platform-free; the **only** `.tsx`/`.native.tsx` pair is
`rnc-translation-label-suggestions`, the floating autocomplete list. That split exists for a reason
worth remembering: CSS `overflow-y-auto` (the `RncDialog` panel on web) **counts
absolutely-positioned descendants toward its scrollable overflow**, so a list anchored inside the
panel gives the modal a scrollbar — the web variant escapes it by anchoring to the viewport
(`position: fixed`). React Native's `ScrollView` sizes itself from in-flow children only, so the
native variant stays a plain absolute overlay. (`Popover` is **not** usable here: on native it
portals to the app-root `PortalHost`, which renders *behind* the RN `Modal` the dialog uses.) Its
chrome is translated via `common:translationLabel.*`. Behaviour is specced in
`docs/screens/shared/translation-label-field.md`.

## ⛔ The synchronized-pair contract (mandatory)

Every exported primitive **must** ship both variants and stay in sync:

1. **Add/modify both `*.tsx` and `*.native.tsx` together.** A primitive that resolves on only one
   platform is a bug. Register it in `index.ts`.
2. **Identical public API** across the pair — same exported component & helper names (e.g. `Button`,
   `buttonVariants`), same prop names and meaning. Type _sources_ may differ per platform (web:
   `React.ComponentProps<typeof WebUiButton>`; native: the rnr `ButtonProps`) but the contract the
   screen sees must match.
3. **Same business logic wherever the platform allows.** State, event handling, variant selection,
   conditional rendering — write the behavior once per concept; only the irreducibly platform-specific
   bits differ (DOM element vs. `Pressable`, `<span>` vs. rnr `Text`, hover vs. press).
4. **Theme-token Tailwind classes** that are valid in both Tailwind v4 (web) and NativeWind/Tailwind
   v3 (native): `bg-primary`, `text-foreground`, `border-border`, etc.

Canonical examples (all under `src/components/primitives/`): `button.tsx` / `button.native.tsx`,
`text.tsx` / `text.native.tsx`, `view.tsx` / `view.native.tsx`.

### Shared props and shared logic (mandatory)

When a primitive has its own prop type, **define it once** in a shared file so both platform variants
reference the same source of truth:

- **Shared props file:** `src/components/primitives/<name>.shared.ts` (or `.shared.tsx` if it
  imports React). Export the props type (and any helper types/constants that do not touch
  platform-specific APIs) from this file. Both `<name>.tsx` and `<name>.native.tsx` import from it.
- **All component functions must accept props as `Readonly<T>`** — wrap the props parameter type
  with the built-in `Readonly<>` utility, e.g.
  `export function Button(props: Readonly<ButtonProps>)`. This applies to every component function
  in both the web and native variants.
- **Extract shared logic** (state machines, validation helpers, derived values, event handlers that
  do not call platform APIs) into the shared file or a dedicated `use-<name>.shared.ts` hook so the
  behavior is written once and tested once, not duplicated across variants.

If a component genuinely has no custom props beyond what the underlying `web-ui`/`native-ui`
component already exports, a shared file is not required — but the readonly rule still applies to any
type you declare.

## Customizing vendored components

When a shadcn/rnr component needs different behavior or styling, do it **here** (wrap, compose,
override props/classes) — never by editing the vendored `web-ui`/`native-ui` source (which gets
overwritten by the update CLIs; root `AGENTS.md` §4).

## Conventions

- Import vendored components via their `exports` subpaths
  (`@workspace/web-ui/components/...`, `@workspace/native-ui/components/ui/...`).
- Keep wrappers thin — pass props through; add only the cross-platform glue.
- Biome (no semicolons, double quotes) + `pnpm typecheck` for this package after changes — run
  `pnpm format`.
