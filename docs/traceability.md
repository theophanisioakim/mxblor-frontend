# Frontend traceability matrix

**Snapshot date:** 2026-07-23
**Status:** Current implementation

Every screen ID below resolves to a versioned field/filter/action/background contract through the
[SDD index](screens/README.md). Backend producers, scheduled jobs, retention, and limitations are
cross-checked in the sibling backend’s `docs/client/screen-support-contract.md`.

| Feature | Flow | Screens | Primary backend contract | Main verification surface |
| --- | --- | --- | --- | --- |
| FTR-001 Application shell | FLOW-004 | All | `GET /sbf-menu/my-menus`, language config | Shell/provider unit tests, web/native build |
| FTR-002 Authentication | FLOW-001, FLOW-002, FLOW-003 | SCR-002 | `/authentication/*`, `/twitch/authentication/*` | Auth provider/login/Twitch tests |
| FTR-003 Schema selection | FLOW-001, FLOW-003 | SCR-002 | select/switch schema | Auth provider and API client tests |
| FTR-004 Dynamic navigation | FLOW-004 | All shell routes | `GET /sbf-menu/my-menus` | Menu provider/navigation tests |
| FTR-005 Permissions | FLOW-004 | SCR-101–409, SCR-501–705 | `GET /sbf-permission/my-permissions` | API permission gating audit |
| FTR-006 Users | FLOW-005, FLOW-006, FLOW-007 | SCR-101–103 | user, email, phone, role, schema, configuration, block-permission APIs | Admin screen tests, generated types |
| FTR-007 Roles/permissions | FLOW-005, FLOW-006, FLOW-007 | SCR-104–108 | role, role-permission, permission, OTP APIs | Admin screen tests, gating audit |
| FTR-008 Schemas/properties | FLOW-005, FLOW-007 | SCR-201–205 | schema and properties APIs | Admin screen tests |
| FTR-009 Integrations | FLOW-005 | SCR-301–303, SCR-404 | integration and integration-log APIs | Admin screen tests |
| FTR-010 Timers | FLOW-005 | SCR-304–307 | timer and timer-info APIs | Admin screen tests |
| FTR-011 Observability | FLOW-008 | SCR-401–409 | log, audit, outbox, OTP search/detail APIs | Grid/detail tests |
| FTR-012 Form/grid library | Direct showcase | SCR-003–004 | Local demonstration data | UI/form/grid unit tests |
| FTR-013 Building portfolio | Domain list/form flows | SCR-501–582, SCR-620–622 | building, unit, contact, distribution, budget, note, communication, bank APIs | Generated types, permission audit, screen/type tests |
| FTR-014 Catalogs and ledgers | Domain list/form/posting flows | SCR-590–662 | expense/revenue catalog, expense, payment, collection, receipt APIs | Generated types, permission audit, screen/type tests |
| FTR-015 Reports | Direct report flow | SCR-700–705 | `/reports/*` | Generated types and report screen tests |

## Coverage notes

- This matrix maps current functional implementation, not every operation in the backend OpenAPI
  document.
- CRUD endpoints not exposed by a current screen remain backend capabilities and are documented in
  `mxblor-backend`.
- Google, Apple, GitHub, and password recovery are not mapped as completed features.
- Stored schedule/retry fields in outbox screens are not evidence of an implemented worker; the
  individual SDD and backend support contract state current processing.
