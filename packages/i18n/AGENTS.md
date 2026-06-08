# `@workspace/i18n` - internationalization (i18next)

> Layer rules for this package. The root **`AGENTS.md`** (section 2, section 6) is authoritative.

## What this is

i18next + react-i18next setup with a **type-safe** `useTranslation`. Depends on `@workspace/storage`
(persists the chosen language) and exposes initialization, language switching, and locale resources.

Layout:

- `src/core.ts` - server-safe i18next setup shared by the React and server entrypoints.
- `src/index.ts` - React-facing entrypoint: `ensureI18nInitialized`, `useTranslation`,
  `changeLanguage`, `getCurrentLanguage`, `supportedLanguages`, the `i18n` instance, and
  re-exported types.
- `src/server.ts` - server-safe entrypoint for Server Components; do not import
  `react-i18next` here.
- `src/detect-language.ts` / `src/detect-language.native.ts` - platform-split language detection.
- `src/resources.ts` + `src/locales/<lang>/<namespace>.json` - translations
  (langs: `en`, `el`; namespaces: `common`, `screens`, `errors`).
- `src/types.ts` - `TranslationKey` and per-namespace key types for autocomplete.

## Conventions

- **Add a translation key to every locale** (`en` and `el`) and the right namespace; keep the JSON
  shapes in sync so the generated key types stay valid.
- Keep `useTranslation` type-safe - don't widen to plain `string`.
- Follow the `.native.ts` split for any platform-specific behavior (root `AGENTS.md` section 6); `index.ts`
  is marked `sideEffects` (it initializes at import) - preserve that.
- Persist via `@workspace/storage` (`StorageKeys.LANGUAGE`), not raw storage access.
