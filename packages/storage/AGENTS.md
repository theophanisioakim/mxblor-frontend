# `@workspace/storage` — typed cross-platform storage

> Layer rules for this package. The root **`AGENTS.md`** (§2, §6) is authoritative.

## What this is

The **leaf** data package (no workspace deps). A typed `ITypedStorage` API (`getItem`/`setItem`/
`getJSON`/`setJSON`/…) with platform-split implementations:

- `src/storage.ts` — **web**: Web Storage (`localStorage`/`sessionStorage`) + SSR cookie fallback
  (`cookies.ts`) for SSR-critical keys.
- `src/storage.native.ts` — **native**: MMKV (`react-native-mmkv`); session store is cleared on cold
  start to mimic web `sessionStorage`.
- `src/keys.ts` — the `StorageKey` union and `SSR_COOKIE_KEYS` set; `src/types.ts` — the interfaces.

## Conventions

- **All keys go through `keys.ts`** (`StorageKeys` / `StorageKey`) — don't use raw string keys.
- Keep the **web and native implementations API-compatible** (same `ITypedStorage` surface) so
  consumers (`i18n`, `api-client`) work unchanged on both platforms — this is the same synchronized
  split discipline as the `ui` layer (root `AGENTS.md` §6).
- Export via `src/index.ts`; consumers import from `@workspace/storage`.
- This is the bottom of the graph — never add a workspace dependency here.
