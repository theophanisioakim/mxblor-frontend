# Login

**Document ID:** RMC-SDD-SCR-002
**Contract version:** 1.1.0
**Screen ID:** SCR-002
**Route:** `/login`
**Platforms:** Web and native
**Status:** Current implementation
**Mockup:** [Desktop login wireframe](../../mockups/login-desktop.svg)

## Purpose

The login screen lets a signed-out user authenticate with credentials or an available external
provider. If the account has access to more than one schema, the same screen asks the user to choose
the schema for the new session.

## Credential sign-in

| Field | Control | Required | Validation/autocomplete |
| --- | --- | --- | --- |
| `username` | text | yes | username or email; no auto-capitalization; username autocomplete |
| `password` | masked password | yes | current-password autocomplete |

- The backend login DTO additionally enforces its current OpenAPI length constraints.
- Submitting valid credentials either completes sign-in or advances to schema selection.
- Authentication errors appear above the form without clearing its fields.
- The forgot-password action is presented below the password field.

The forgot-password action is visual only in the current implementation; no recovery route is
connected.

## External providers

- Twitch appears only when sign-in is available for the current session.
- Google, Apple, and GitHub remain visible as unavailable placeholders until their sign-in flows are
  supported.
- While an authentication request is running, the provider controls cannot start another request.

## Rate-limited state

When the server supplies a retry window after too many sign-in attempts:

- The error message shows the number of seconds remaining.
- The credential submit control displays the same countdown.
- Credential and external-provider sign-in controls remain disabled for the entire retry window.
- Sign-in becomes available automatically when the countdown reaches zero.

## Schema selection

- `schema` is a required single select containing only schemas returned for the pending
  authentication challenge; the first returned value is the initial selection.
- Continuing completes the session in the selected schema.
- Back to sign in cancels the pending challenge and returns to credential entry.

## Screen states

- Initial credential form.
- Credential request in progress.
- Twitch request in progress.
- Authentication error.
- Informational “coming soon” notice for unsupported providers.
- Rate-limited countdown.
- Pending schema selection.
- Schema-selection error.
- Authenticated redirect to `/dashboard`.

## Technical mapping

| Action | Operation/effect |
| --- | --- |
| Credential submit | `POST /authentication/login` |
| Continue schema | `POST /authentication/select-schema` |
| Twitch bootstrap | `GET /twitch/authentication/redirect-url`; flow is client-bound and single-use |
| Twitch exchange | `POST /twitch/authentication/login` |
| Existing-session startup | refresh/restore through the authentication provider |
| Successful authentication | stores the platform-appropriate session and replaces route with `/dashboard` |

## Restrictions and background processing

- An authenticated user shall be redirected to `/dashboard`.
- Credential and provider actions shall be mutually blocked while sign-in is busy.
- Google, Apple, GitHub, forgot-password, and create-account text are non-navigating placeholders.
- Web can receive a Twitch proof from SSR and completes the OAuth callback on `/`; native uses an
  in-app auth session and deep-link result.
- Refresh sessions are maintained/expired by backend session lifecycle processing; schema and
  permission/menu context are loaded after authentication. These processes are related to the
  session but are not user-visible controls on this screen.
- During rate limiting, a client interval recalculates the ceiling of remaining seconds every
  250 ms; at zero it clears the deadline/error and re-enables sign-in. Entering schema selection
  clears the rate-limit state.
- No password or token value shall be written to an SDD, mockup, or user-visible log.

## Acceptance criteria

1. Valid credentials either authenticate directly or display only schemas returned by the pending
   challenge.
2. An invalid login preserves usable form context and shows an error.
3. A rate-limit response disables every sign-in path until its countdown expires.
4. Twitch is hidden when a redirect flow cannot be obtained.
5. Google, Apple, and GitHub do not attempt an API request and instead display a notice.
6. An already authenticated user is redirected away from the login screen.
7. Back from schema selection invalidates/cancels the pending selection state before returning to
   credentials.
