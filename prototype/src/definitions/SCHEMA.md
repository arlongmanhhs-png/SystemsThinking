# Step definitions

One definition per step, as data. One renderer (`src/views/StepScreen.js`) turns any
definition into a screen. The definitions are the executable form of
`steps/NN-name/spec.md`, and the wording in them is the workbook's: long
instruction text is read from `workbook.js`, which is generated from the printed
pages, and every short label written here is checked against the printed pages by
`tools/check-wording.mjs`.

Where a definition departs from its `spec.md`, the departure is recorded in the
definition with a `// SPEC:` comment and reported in `FINDINGS.md`. Never silently.

## A step

| Key | Holds |
| --- | --- |
| `number`, `phase`, `slug`, `title` | As `core/process-overview.md` and `process.yaml` |
| `purpose` | What the step is for: the lead on its first instruction page |
| `dependsOn` | Steps whose output this one uses (`core/critical-checks.md`) |
| `marksForReview` | Steps a revision of this one marks for review: every step the step's carry-forward table sends an output to (the step's `spec.md`, decided 2 October 2026). Only built steps with something in them are marked |
| `passages` | The instruction pages, in order: `{ page, governs: [exercise numbers] }`. Each is shown once, whole, before the exercises it faces in the book, and stays one click away from each exercise it governs. The screen has this one arrangement (decided 2 October 2026) |
| `pages` | The working pages, in order: `{ page, exercises: [numbers] }`. Title and lead come from the workbook |
| `exercises` | In workbook order. See below |
| `criticalCheck` | `[{ id, text, sendsTo, screenVariant }]`. `text` is the workbook's (page 24); `sendsTo` is the return the step's `spec.md` gives beside the criterion, and the screen names each exercise with its page. `screenVariant` is `{ text }`, only where the printed line names a physical thing the screen does not have (Step 2's seventh criterion); the printed form stays beside it |
| `carriesForward` | `[{ output, goesTo, usedAs }]`, from the step's `spec.md` |
| `returnsIn` | Triggers raised elsewhere that reopen fields here: `{ id, raisedAt, when, fields }` |
| `returnsOut` | Returns this step can send: `{ id, when, means, to: { step, fields, exercise } }` |
| `derive` | Named values computed from fields, never stored: `{ name: (ctx) => value }` |

## An exercise

| Key | Holds |
| --- | --- |
| `number` | As the workbook numbers it |
| `page` | The workbook page it is printed on. Label, title, and hint are read from that page's zone |
| `where` | `screen`, `sheet` (a large sheet away from the screen), or `spread` (the drawing spread) |
| `label`, `title`, `hint` | Only where the page has no zone to read them from (Step 2, Exercises 5, 10, 11) |
| `screenVariant` | `{ label, hint }`, `label` only where it differs from the printed one. Only where the printed words name a physical thing the screen does not have, or a row or place on the page the screen does not use. Three exist on exercises: Step 2, Exercises 1, 3, and 10. With Step 2's seventh critical check criterion that makes four (decided 2 October 2026). The printed form stays beside each, and a variant's wording stays marked as the screen's own until Ashley approves it |
| `fields` | See below |
| `checks` | `[{ id, severity: 'block', 'stop', or 'warn', test: (ctx) => true when the problem is present, text, sendsTo, provisional }]`. Optional: `fill: (ctx) => ({ name: value })` puts what the check found into `{name}` in the text; `offer: { action, from, label, done }` is a button on a warning and the note shown once it has been used; `signature: (ctx) => string` raises a dismissed warning again when the answer it read changes |

## A field

| Key | Holds |
| --- | --- |
| `key` | As the step's `spec.md` gives it. Permanent once a build uses it |
| `kind` | One of the kinds below |
| `label`, `hint` | Printed wording. `provisional: true` where the workbook prints nothing and the screen needs words: the screen marks such text so it is never mistaken for settled copy |
| `required` | `true`, `false`, or `(ctx) => boolean` |
| `list` | A closed list from `lists.js`, by key |
| `of`, `nobody` | For `ref`: the table whose rows it points at, and whether "nobody" is allowed |
| `columns` | For `table`: fields, each a column |
| `min`, `max`, `warnAbove` | Counts and caps. `max` blocks adding; `warnAbove` warns; `min` blocks the critical check |
| `showIf` | `(ctx) => boolean` |
| `derive` | For `derived`: `(ctx) => value` |

## The kinds

`line`, `block`, `year`, `number`, `choice`, `choices`, `confirm`, `table`, `ref`,
`derived`, `image`, `series`, `span`, and two canvases: `sketch` (Step 2,
Exercise 1: a placeholder in this prototype) and `arrangement` (Step 2,
Exercise 10).

## The strip at the foot of every working page

`revised_on` and `revised_because` are not fields in a definition. They are written
from the step's revision log (`engine/store.js`), never typed: the date and the
reason of the step's latest revision. Every earlier revision stays in the log.

## Validation

Three severities. A **blocking** check is mechanical and concerns presence, count,
or a value being set: it keeps the critical check closed and says what is missing. A
**stop** is a blocking check raised by the participant's own answer, as Step 1's
disqualifier is: it is also shown at its exercise, and it cannot be dismissed. A
**warning** never blocks; it is dismissed with one line, which is stored. Nothing
is ever a blocking check on the content of a sentence.
