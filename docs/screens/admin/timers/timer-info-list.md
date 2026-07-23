# SCR-307 — Timer-info list

**Document ID:** RMC-SDD-SCR-307
**Contract version:** 1.0.0
**Route:** `/admin/timer-info`; also embedded in SCR-306
**Platforms:** Web and native
**Status:** Current implementation

Access/search requires `POST /sbf-timer-info/search`. The screen is read-only.

| Context | Columns |
| --- | --- |
| Standalone | Timer Key; Executed On; Instance ID; Cron; Details |
| Timer form tab | Executed On; Instance ID; Cron; Details; fixed hidden `timerId` scope |

Visible filters are `details` contains, `cron` contains, `executedOnFrom` inclusive, and
`executedOnTo` inclusive. The embedded variant also supplies hidden persistent `timerId`. Initial
sort is Executed On descending; pagination is 20/50/100. Toolbar contains Refresh and Reset. The
standalone UI has no visible Timer Key or Instance ID filter. There is no detail, edit, delete,
replay, or run action.

`AbstractTimer` creates one row after an attempted concrete timer execution, storing failure message
in Details when available. `LogRotateTimer` can remove older Timer Info rows, including its own
execution history according to configured limits. The screen starts neither process and does not
poll.

## Background processing

Concrete `AbstractTimer` subclasses are the producers; `LogRotateTimer` is the retention consumer.

Acceptance: the embedded context cannot display another timer’s rows, standalone/tab columns differ
as documented, date bounds are inclusive, and all content is read-only.
