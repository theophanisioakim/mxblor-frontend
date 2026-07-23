# SCR-202/203 — Schema create and edit

**Document ID:** RMC-SDD-SCR-202-203
**Contract version:** 1.0.0
**Routes:** `/admin/schema/new`, `/admin/schema/{id}`
**Platforms:** Web and native
**Status:** Current implementation

## Details contract

| Field | Type | Required | Rule/default |
| --- | --- | --- | --- |
| `name` | text | yes | maximum 255 |
| `description` | text | yes | maximum 255 |
| `active` | checkbox | no | default true on create |

Create page requires and saves through `POST /sbf-schema`. Edit page requires
`GET /sbf-schema/{id}`, loads by ID or SSR seed, and saves through `PUT /sbf-schema/{id}` when the
update grant exists. Successful create replaces the route with the new edit URL; update resets the
form from the returned record.

## Properties tab (edit only)

The tab renders the same property grid contract as [SCR-204](schema-properties.md) and requires its
API permissions for successful reads/edits.

**Important scope restriction:** the current tab does not pass the edited schema ID to the property
search. It shows and updates schema properties for the current authenticated tenant context. A
client shall not interpret the tab as editing properties of the schema registry row solely because
it appears on that row’s form.

## Related processing and acceptance

Schema registry changes can affect future schema selection and permission context. Property changes
can affect cached runtime configuration after backend cache invalidation. Audit triggers may record
mutations. There is no screen polling or physical tenant provisioning action.

1. Required/max-length rules block invalid Details submission.
2. Properties is hidden until an ID exists.
3. Page-read, update, and property-inline-edit grants remain separate.
4. The current-context restriction is visible in client review and testing.
