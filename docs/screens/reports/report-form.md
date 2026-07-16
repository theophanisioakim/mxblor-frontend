# Report Forms

Every report form starts with a required building and PDF language. The PDF
language defaults to the active UI language and can be changed independently.
Changing the building clears any selected unit or distribution table.

| Report | Additional required fields |
| --- | --- |
| Building shares | Reference month |
| Apartment shares | Unit and reference month |
| Building financial | Date from and date to |
| Building-unit financial | Unit, date from, date to, and scope |
| Attendance sheet | Distribution table |

Building-unit financial scope can be All, Capital, or Monthly. Date ranges must
start on or before their end date. Unit and distribution choices stay disabled
until a building is selected, and only the choices required by the active report
are loaded.

The screen communicates option loading, option failures, an empty building list,
date validation, and generation failures without clearing completed fields. A
successful generation also keeps the form available for another request.

Web previews the returned PDF in the page and offers a deterministic download
filename. Native stores the PDF in the Expo cache and immediately opens the
operating-system share or preview flow; the result card can reopen it. Sharing
failures appear as an error while preserving the form and generated result.

Reports are generated from current ledger data and are not saved as snapshots.
