# SCR-108 — OTP list

**Document ID:** RMC-SDD-SCR-108
**Contract version:** 1.0.0
**Route:** `/admin/otp`
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-otp/search`. The screen is read-only.

| Columns (sortable response keys) |
| --- |
| Created At (`createdAt`); User ID (`userId`); Value (`value`); Request Hash (`requestHash`); Failed Attempts (`failedAttempts`); Expired (`expired`); Updated At (`updatedAt`) |

| Filter (request key) | Match |
| --- | --- |
| User ID (`userId`) | exact UUID relationship |
| Value (`value`) | case-insensitive contains |
| Request Hash (`requestHash`) | case-insensitive contains |
| Expired (`expired`) | exact true/false/all |

Initial sort is Created At descending; pagination is 20/50/100. Toolbar actions are Refresh and
Reset. There is no row detail, create, edit, delete, reveal/hide toggle, or export.

## Background and security contract

The backend OTP interceptor/service creates and validates OTP challenges, increments failed
attempts, and marks challenges expired according to request lifecycle. `LogRotateTimer` can remove
old OTP rows under configured table-size retention. Opening this screen starts neither process.
OTP values and request hashes are sensitive authentication data; grants, screen sharing, logs, and
retention must be restricted by the deployment owner.

## Acceptance criteria

1. The page cannot render without its search grant.
2. No displayed field is editable and no mutation action exists.
3. Filters/order/page behavior matches this contract.
4. Retention-driven disappearance is not represented as a user deletion.
