# SCR-304 — Timer list

**Document ID:** RMC-SDD-SCR-304
**Contract version:** 1.0.0
**Route:** `/admin/timer`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-timer/search`.

| Columns (sortable/read-only) |
| --- |
| Key; Active; Last Execution; Cron; Failed Count; Description; Created At; Updated At; Created By; Updated By |

Filters are `description` contains, `cron` contains, and `active` true/false/all. Initial sort is
Key ascending; pagination is 20/50/100.

The only row mutation control is Edit, which navigates to `/admin/timer/{id}` and is enabled with
`PUT /sbf-timer/{id}`. Toolbar contains Refresh and Reset. **There is no Add, Delete, selection, run
now, pause/resume shortcut, or bulk action on the current list**, although a direct create route
exists as SCR-305.

Every concrete backend timer adapter is checked once per minute for every tenant. It runs only when
its database row exists, is active, and its cron is due. Timer execution can change Last Execution
and Failed Count while this screen is open; the grid shows changes only after refresh. Opening the
screen does not schedule or run a timer.

Acceptance: list/order/filters match this contract, only authorized Edit is exposed, and background
execution is never represented as a list action.
