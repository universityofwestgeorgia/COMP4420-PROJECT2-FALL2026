# Product backlog

Items are ordered by priority. **MVP** items are required for the first complete demonstration; later items can be added only after the MVP is working and tested.

| ID | Priority | User story | Acceptance criteria |
| --- | --- | --- | --- |
| PB-01 | MVP | As a user, I can add a project with a name and base URL. | Invalid or duplicate entries are rejected with a useful message; valid entries appear on the projects page and persist after restart. |
| PB-02 | MVP | As a user, I can see and open saved projects. | The projects page lists each project; selecting one opens its own route table. |
| PB-03 | MVP | As a user, I can add a GET route to a project with an expected HTTP status and maximum response time. | The route is saved under the selected project, validated, and visible after restart. |
| PB-04 | MVP | As a user, I can run a check for a saved route. | The app requests the configured URL and records HTTP status, elapsed time, check time, and any error. |
| PB-05 | MVP | As a user, I can tell whether a route passed. | The result clearly distinguishes success, wrong status, slow response, timeout, and network error. |
| PB-06 | MVP | As a user, I can remove an obsolete route or project. | A confirmation prevents accidental removal; the deleted item stays gone after restart. |
| PB-07 | Later | As a user, I can run all checks for one project at once. | Every route receives a fresh result, and one failure does not stop the other checks. |
| PB-08 | Later | As a user, I can schedule checks at intervals. | Checks continue while the server is running and show the latest check time. |
| PB-09 | Later | As a user, I can inspect result history. | Past checks remain available after restart. |
