# Login

## Purpose

The login screen lets a signed-out user authenticate with credentials or an available external
provider. If the account has access to more than one schema, the same screen asks the user to choose
the schema for the new session.

## Credential sign-in

- The form requires a username or email and a password.
- Submitting valid credentials either completes sign-in or advances to schema selection.
- Authentication errors appear above the form without clearing its fields.
- The forgot-password action is presented below the password field.

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

- The user chooses one of the schemas returned for the pending authentication challenge.
- Continuing completes the session in the selected schema.
- Back to sign in cancels the pending challenge and returns to credential entry.
