# Administration screen specification

**Document ID:** RMC-SCR-ADMIN-001
**Snapshot date:** 2026-07-23
**Status:** Current implementation

This document summarizes shared administration behavior. The versioned
[SDD index](../README.md) and individual screen SDDs are the client contract.

## Page authorization

Each page is wrapped in `PermissionGuard` using the resource’s primary read endpoint. Until grants
resolve, a loading state is shown. A missing grant renders access denied. Failed permission fetches
resolve to an empty grant set so the UI fails closed.

## List lifecycle

1. The screen creates a typed search request from grid pagination, sorting, and filters.
2. The generated API client calls the corresponding `POST /resource/search`.
3. Results and pagination metadata are adapted to `RncGrid`.
4. The grid renders high-priority columns first and collapses lower-priority columns on small
   screens.
5. Add, update, delete, and bulk controls are independently permission-gated.
6. Successful mutations refresh or navigate to the canonical saved entity.

## Form lifecycle

- `/new` uses create mode and starts with defaults.
- `/{id}` may receive server-rendered initial data on web; otherwise it fetches client-side.
- Save invokes the generated create or update mutation.
- After create, the route changes to `/{saved-id}`.
- API error bodies are normalized into a visible form-level error.
- Tabs that need an existing parent ID are hidden in create mode.

## Entity-specific tabs

| Parent | Tab | Function | Save model |
| --- | --- | --- | --- |
| User | Emails | Add, edit, remove email contacts; primary, verified, communication, active flags | Per-row CRUD |
| User | Phones | Add, edit, remove phone contacts; primary, verified, communication, active flags | Per-row CRUD |
| User | Roles | Assign roles from the complete role catalog | Desired-state bulk |
| User | Schemas | Assign schemas from the complete schema catalog | Desired-state bulk |
| User | Configuration | Edit Value; Key and Description are read-only | Per-row or bulk |
| User | Block Permissions | Explicitly block permissions for the user | Desired-state bulk |
| Role | Permissions | Assign permissions to the role | Desired-state bulk |
| Schema | Properties | Edit active schema properties | Per-row or bulk |
| Integration | Integration Logs | Inspect calls associated with the implementation | Read-only search |
| Timer | Timer Info | Inspect execution records filtered by timer | Read-only search |
| Request Log | Log IP | Inspect the associated IP enrichment record | Read-only detail |

## Destructive behavior

Delete actions require explicit confirmation. The list remains unchanged until the delete request
succeeds. Bulk deletion is available only on screens that implement it and only when the grant is
present.

## Error and empty states

- Search failures render through the grid error path and allow retry.
- Detail/form failures render a visible error without fabricating data.
- An empty search returns a usable grid with filters and authorized add action.
- A missing related record shows a contextual empty message, such as “No Log IP associated.”
- Authentication failures are handled by the shared transport and auth provider.
