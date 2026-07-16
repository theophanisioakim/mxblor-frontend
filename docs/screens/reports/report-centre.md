# Report Centre

The shared `/reports` screen exposes five live PDF reports on web and native:
Building shares, Apartment shares, Building financial, Building-unit financial,
and Attendance sheet.

- The page shows a title, description, and one card for every report.
- Each card explains the report and opens its dedicated form.
- Cards wrap responsively while retaining readable minimum widths.
- The page uses the full content width supplied by the application shell.

The centre does not generate, store, or display report data itself.

Web previews the returned bytes in an iframe and offers a deterministic download
filename. Native stores the PDF in the Expo cache and opens the operating-system
share or preview flow. Reports are generated live and are not saved as snapshots.
