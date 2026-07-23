# SCR-407 — Audit-log list

**Document ID:** RMC-SDD-SCR-407
**Contract version:** 1.0.0
**Route:** `/admin/audit-logs`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-audit/search`. The screen is read-only.

| Columns (sortable) |
| --- |
| Event; Table Name; Primary Key Value; Schema; Value; Created At; Created By |

Filters `event`, `tableName`, `schemaName`, and `value` are case-insensitive contains matches. The
UI exposes no `pkValue` filter. Initial sort is Created At descending; pagination is 20/50/100.
Toolbar contains Refresh and Reset; there is no detail, create, edit, delete, restore, compare, or
export.

PostgreSQL audit triggers produce rows for insert/update/delete/truncate on audited main/tenant
tables. High-churn/non-audited tables are excluded by migration callbacks, and updates limited to
audit metadata/version can be skipped. `LogRotateTimer` can remove old audit rows under configured
limits. The screen does not trigger audit capture or poll.

## Background processing

Database triggers are the producer and `LogRotateTimer` is the retention consumer. Both operate
independently of screen navigation.

Serialized Value can contain sensitive record content. Acceptance: the UI makes no claim of auditing
excluded tables, stays read-only, and matches the documented filters/order/page.
