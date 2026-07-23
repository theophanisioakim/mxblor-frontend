# react-mono-core

A cross-platform React monorepo that renders shared screens and application chrome in:

- a Next.js web application;
- an Expo/React Native application.

The client consumes the sibling `springboot-core` OpenAPI contract through a generated API package.
Menus and endpoint grants are supplied by the backend; business screens do not hardcode roles or
navigation.

## Repository map

| Location | Purpose |
| --- | --- |
| `apps/web` | Next.js App Router runtime |
| `apps/native` | Expo Router native runtime |
| `packages/app` | Shared screens and application shell |
| `packages/ui` | Cross-platform UI abstraction |
| `packages/providers` | Authentication, permissions, menus, language, theme, and shell state |
| `packages/api-client` | OpenAPI-generated transport, DTOs, hooks, and typed permission keys |
| `packages/storage`, `i18n`, `router` | Platform-adapted infrastructure |
| `packages/web-ui`, `native-ui` | Vendored platform UI libraries, private to `packages/ui` |

## Documentation

- [Documentation index](docs/README.md)
- [Client functional specification](docs/client/functional-specification.md)
- [Screen catalog](docs/client/screen-catalog.md)
- [User flows](docs/client/user-flows.md)
- [Mockups](docs/mockups/README.md)
- [Technical architecture](docs/technical/architecture.md)
- [Documentation strategy](docs/DOCUMENTATION_STRATEGY.md)
- [Agent instructions](AGENTS.md)

## Toolchain

- Node.js 26.2.0
- pnpm 11.9.0
- React 19
- Next.js 16
- Expo SDK 55 / React Native 0.83
- Turborepo, TypeScript, Biome, Playwright

Install dependencies with `pnpm install`. Use `pnpm check:all` for the full non-E2E quality gate and
`pnpm test:e2e` for the E2E harness. Agents must follow the stricter execution policy in
[AGENTS.md](AGENTS.md), including the prohibition on manually starting application processes.
