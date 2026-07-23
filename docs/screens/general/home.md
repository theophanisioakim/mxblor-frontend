# SCR-001 — Home

**Document ID:** RMC-SDD-SCR-001
**Contract version:** 1.0.0
**Route:** `/`
**Platforms:** Web and native
**Status:** Current implementation

## Purpose and visible contract

The screen shall show localized title, cross-platform explanatory copy, a localized demonstration
button, and links to `/forms` and `/grid`. The button has no bound action in the current
implementation. No form fields, filters, server data, or permission gate exist.

## Actions and states

| Action/state | Contract |
| --- | --- |
| Form link | navigates to SCR-003 |
| Grid link | navigates to SCR-004 |
| Demonstration button | visual only; shall not imply a persisted action |
| Translation | labels come from the `screens` namespace |
| Loading/error | inherited shell/framework boundaries |

## Related processing

On web, the route also hosts the Twitch callback completion component. A valid Twitch `code/state`
callback may exchange the proof, establish/pause the session for schema selection, and clean up or
redirect; ordinary home visits do not start Twitch authentication. Global session/menu/permission
work follows the shared conventions.

## Acceptance criteria

1. Both links navigate to the stated routes on web and native.
2. The demonstration button causes no backend mutation.
3. Localized copy changes with the active language.
4. A Twitch callback is processed only when callback parameters and stored proof are valid.
