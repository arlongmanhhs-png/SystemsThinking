---
file: design/WORK-ORDER-2026-10-01.md
updated: 2026-10-01
status: a work order. It is complete when every edit below is made and the report at the end is written.
source: the six decisions in design/reconciliation.md, answered by Ashley on 1 October 2026
---

# Work order: the six decisions

## How to use this

`design/reconciliation.md` set out twenty-nine places where the workbook and the
specification disagree, and sorted them into six decisions. The six are now
answered. This file is the answers written as edits, and it is the only
instruction you need: where it and `design/reconciliation.md` differ, this file
is right, because it carries the decisions and that file carries the question.

Work in order. Decision 1 changes Step 1's fields, and decisions 5 and 6 and
`process.yaml` all depend on it.

## Read first

- `CLAUDE.md`. The writing rules apply to every printed word you change: British
  English, the Oxford comma, no em or en dashes, "Step" capitalised wherever it
  carries a number, and the words this project does not use.
- `core/principles.md`. Fourteen rules, and they override this file.
- `design/reconciliation.md`, for the reasoning behind each decision.
- `prototype/FINDINGS.md`, which is the first build's report and the source of
  the coined keys.
- `print/src/README.md`, for how the workbook is built and rebuilt.

## What is already done. Do not redo any of it

These were made on 29 September and 1 October, and they are on disk:

- `core/decisions.md` carries all six decisions below, dated 1 October 2026. **Do
  not add rows for them.** Add a row only for something you decide yourself that
  this file did not tell you to decide, and say in the row that it was yours.
- `core/open-questions.md` has had the settled rows removed. **Do not remove or
  add rows** unless an edit below creates a new question, which it should not.
- `design/reconciliation.md` is marked settled and points here. **Leave it
  alone**; it is the record of what the questions were.
- Nine corrections listed in section 2 of `design/reconciliation.md`, including
  the page 16 requirement, the Step 2 pointer, the Step 3 header, the actor hard
  stop, two glossary entries, the missing glossary entry for "quantity", and
  three writing lines on pages 9 and 11 that were not printing at all.

Everything else below is yours.

---

## Decision 1. Exercise 6 gains the five slots

**Why.** The workbook asks for the problem definition twice: a first attempt in
five labelled slots (Exercise 2, page 9) and an agreed rewrite in three unlabelled
lines (Exercise 6, page 11). Everything downstream needs the agreed one and can
only read the first attempt, because that is the only structured field there is.
Both of Step 3's returns send the participant to page 11 to rename the thing, and
page 11 has no slot for a thing, so the rename never reaches Step 3.

### The workbook

**Exercise 6, page 11** (`print/src/wb-part-b.html`, section `s1work2`). Rebuild
it in this order:

1. The four form tick boxes, **first**, because the form governs what the slots
   mean. They are already there and their wording does not change.
2. The line "If not the default form, why it did not fit". Already there.
3. **New: the five slots**, using the same `.stmt` block that Exercise 2 uses, so
   the two look like the same instrument. The labels are deliberately more
   neutral than Exercise 2's, because Exercise 6 may be written in any of the four
   forms:

   | Slot | Printed label |
   | --- | --- |
   | 1 | the thing |
   | 2 | what is wrong with it |
   | 3 | who it affects |
   | 4 | since when |
   | 5 | which matters because |

4. Remove the three unlabelled lines (`<div class="lines l3"></div>`), which the
   slots replace.

The rationale is **not** repeated on page 11. It stays in Exercise 2, where it is
written once against the first attempt.

**Exercise 2, page 9.** Change its heading from "The problem definition" to **"The
problem definition, first attempt"**, so the pair reads as a pair. Nothing else
on page 9 changes.

Page 11 has roughly a third of its height unused, so the slots fit without moving
anything to another page. Check the render rather than assuming.

### The specification

`steps/01-framing/spec.md` gains a second problem definition. Keys:

| Field | Key | Where |
| --- | --- | --- |
| The thing | `agreed_thing` | Exercise 6 |
| What is wrong with it | `agreed_direction` | Exercise 6 |
| Who it affects | `agreed_who` | Exercise 6 |
| Since when | `agreed_since` | Exercise 6 |
| Which matters because | `agreed_consequence` | Exercise 6 |

`problem_agreed`, which the first build coined for the three free lines, is
retired and replaced by those five. It is the one coined key that does not
survive, and it is retired because decision 1 changed the thing it named.

`problem_form` and `form_reason` stay where the specification already has them,
and belong to Exercise 6.

**The rule that matters, and it goes in the specification in as many words:
every later step reads the `agreed_*` set. The `problem_*` set is the first
attempt and is read by nothing downstream.** Write that explicitly so that nobody
wires the first attempt to a later step by accident.

Specifically:
- Step 3's `thing_measured` copies `agreed_thing`, not `problem_thing`.
- Page 25, zone 1, carries the assembled agreed definition.
- Every reference in Steps 2 and 3 to "the quantity named in your problem
  definition" means the agreed one.
- Renaming the thing means editing `agreed_thing`, which marks Step 3 for review
  through the ordinary dependency machinery. That is what closes the break.

---

## Decision 2. Two layers are allowed with a line, and every layer row gets one

### The workbook

**Exercise 3, page 13** (`print/src/wb-part-b.html`, section `s2work1`).

Rows 2, 3 and 4 carry `<span class="fill j2" style="border:0">`, which cancels the
rule and leaves those rows with no reason line. Remove the inline `border:0` from
all three so every row has a line, and give them the label **"why this scope sits
here"**. Rows 1 and 5 keep "why this is the widest scope" and "why this is the
narrowest scope".

Change the printed rule from:

> Ordered by how far a decision reaches, widest scope of decision first. Three to
> five, and five is the limit.

to:

> Ordered by how far a decision reaches, widest scope of decision first. Three to
> five, and five is the limit. Two only if you write why this case has no third
> scope of decision.

### The specification

`steps/02-boundary/spec.md`: `layers` takes two to five, not three to five. Five
stays a hard cap. A new field `two_layers_because` is required when the count is
exactly two, and is absent otherwise.

This restores the decision of 28 September, which the glossary kept and everything
written since dropped. The glossary already says it and needs no change.

---

## Decision 3. The disqualifier gets its justification line

**Read this before you start: the disqualifier is already a separate block.**
Exercise 3 on page 9 prints four yes-or-no rows under the exercise heading, then a
tinted callout headed "One question disqualifies a topic" holding the fifth
question and its explanation. The separation Ashley asked about is already there,
so do not build it again and do not renumber anything.

### The workbook

One thing is missing. The four questions above each have a "How you know" line;
the disqualifier has none, so a participant cannot say how they know. **Give the
disqualifier a "How you know" line** matching the four above it, inside the
callout.

Do not split Exercise 3 into two exercises. Renumbering would move every Step 1
exercise number and every reference to them, including the critical check on page
24, for no gain.

### The specification

In `steps/01-framing/spec.md`, the disqualifier is a field of its own, not the
fifth of five suitability questions, and the two behave differently:

- **The four suitability questions.** A "no" raises a warning that asks for one
  line and can be dismissed. It never blocks.
- **The disqualifier.** A "yes" means this is not a case for this process. On
  paper the page says "Choose a different topic"; on screen it is a stop with that
  explanation, not a dismissable warning. The tool is acting on the participant's
  own answer, so principle 14 is not in the way.

The specification's single wrong-tool warning is replaced by those two. It could
never have served both: a "no" on the size question means narrow or widen the
problem, which page 10 explains, and not choose a different topic.

---

## Decision 4. The boundary test regains the clause its critical check depends on

### The workbook

**Page 12** (`print/src/wb-part-b.html`, section `s2instr1`). Replace:

> The test is **would including this change what you would do about the problem?**
> Something goes inside if someone in it could plausibly increase or decrease the
> quantity named in your problem definition, or change a rule that governs that
> quantity.

with:

> The test is difference, not relevance: would including this change what the
> analysis concludes? Something goes inside if any one of three things is true. It
> can increase or decrease the quantity named in your problem definition. It is on
> the receiving end of that excess or deficit, meaning it is part of who the
> problem is for. Or it sets the rules the first two work under.

**Why both halves change.** The printed version left out the receiving-end test,
which is the one Step 2's own critical check depends on: "The actors include those
affected by the system but not involved in it." A participant applying only the
printed test could exclude every affected-but-not-involved actor and still tick
the check. And "what you would do about the problem" assumes the participant is
acting, which the default position, analysing from outside, says they are not.

The glossary and `steps/02-boundary/description.md` already carry the three tests
and need no change. Check the wording matches after your edit.

---

## Decision 5. The coined keys are adopted, with two exceptions

Adopt, unchanged: `suit_chronic_note`, `suit_history_note`, `suit_attempts_note`,
`suit_size_note`, `dependencies[].needed_by`, `no_nearest_quantity`,
`boundary_sentence`, `exclusion_most_likely_wrong`,
`exclusion_most_likely_wrong_note`, `carry_problem`, `carry_change_position`,
`carry_layers_decision`, `carry_disagreement`, `carry_sentences`,
`carry_spd_shape`. The proposed keys of Steps 2 and 3 stand as proposed and lose
their asterisks: they are settled by this work order.

**Two exceptions.**

1. **`suit_noprocedure` is renamed `suit_procedure_would_solve`.** It stores the
   answer to "Could a known procedure solve this, if someone chose to?", where a
   yes disqualifies, under a name meaning the opposite. The first build stored the
   answer in the key's own sense and translated on screen, which works and is a
   trap for the next person. Rename it everywhere, including in the prototype, and
   remove the translation. Add `suit_procedure_note` for the new line from
   decision 3.
2. **`problem_agreed` is retired** and replaced by the five `agreed_*` keys from
   decision 1.

After this work order, **every field key in Steps 1, 2 and 3 is settled.** Say so
in each specification, and remove the sentences in the Step 2 and Step 3
specifications that mark their keys as proposed.

---

## Decision 6. Nine calls on where the page has no room

Ashley's condition: **none of these may radically alter the ability to complete
the exercise.** One of the nine was changed to respect that, and it is marked.

| # | What | The change |
| --- | --- | --- |
| 1 | `size_verdict`, `size_note` | **Retired.** They have no slot on paper and never had. Exercise 3's fourth question does the size test as a yes or no. Remove them from the specification and from `process.yaml`, and point the Step 4 return at `suit_size` and its note instead |
| 2 | Dependency rows, Exercise 7, page 17 | **Grow the table from six rows to twelve.** One row per resource for three to six actors needs twelve or more, and at six the critical check cannot be ticked honestly. If twelve will not fit on page 17 beside Exercises 6, 8 and 9, report it rather than shrinking something else |
| 3 | `spoken_for_by` | **A line under Exercise 9, not a column on the actor table.** The actor table already carries fourteen columns and a fifteenth would crowd it, which is the condition Ashley set. Exercise 9 already asks who is missing, so "and who speaks for them, including nobody" belongs with it |
| 4 | `interval` (Step 3) | **Retired as a field.** The instruction on page 20 is enough and the interval is visible in the drawn line |
| 5 | `nearest_quantity_because` | **The page gains a line**, in Exercise 1 on page 21, used only where the form is "not happened yet". It is the only record of why a proxy was chosen |
| 6 | Years on the desired change | **The page gains them**, as a short year field on each of the two boxes in Exercise 4, page 9. Step 3 draws the desired change against the line, which needs a horizon |
| 7 | Description rows, Exercise 8, page 17 | **Print five instead of four**, so paper and screen record the same number |
| 8 | Inside rows, Exercise 2, page 13 | **Grow from eight to twelve**, matching the dozen actors the step targets |
| 9 | Two decisions, Exercise 6, page 17 | **One on paper**, unchanged. The second decision is recorded on screen only, and the specification says so in as many words |

Items 2, 5, 6, 7 and 8 add printed space. Pages 9, 13, 17 and 21 are the ones at
risk. **See the page budget below before you start cutting anything.**

---

## The page budget

The workbook is 28 pages. The booklet imposition needs a multiple of four, so the
next size up is 32 pages, not 29.

Work to 28. If a page overflows, try in this order: tighten the leading on that
page, move an instruction paragraph to the facing instruction page, which has room
on several spreads, and only then report that the page needs to split.

**Do not split a page without reporting it first.** A split changes the page
count, the recto and verso sides of everything after it, the imposition, and every
page reference in the book. The page map in `design/workbook.md` is the reference
and would need rewriting with it.

---

## Then: `process.yaml`

Only after everything above is done, and in the same commit as the three
specifications.

The file has carried fields for Step 1 only, and its header says it is written in
the same commit as the specification it describes. Update it once, covering Steps
1, 2 and 3 together. That means:

- Step 1's field list rewritten: both problem definitions, `size_verdict` and
  `size_note` removed, `suit_noprocedure` renamed, `suit_procedure_note` and the
  four `suit_*_note` keys added, the desired-change years added.
- Step 2's field list written for the first time, from `steps/02-boundary/spec.md`.
- Step 3's field list written for the first time, from
  `steps/03-behaviour-over-time/spec.md`.
- `updated:` set to the date you do it.

Where `process.yaml` and a specification disagree after your edit, the
specification is right and you have made a mistake: the file's own header says so.

---

## Then: the prototype

`prototype/` holds the first build. Bring it to this work order: the two problem
definitions, the renamed key with its translation removed, the retired fields, the
two-layer case, the disqualifier as a stop rather than a warning, and the three
tests on the boundary.

If a change is too large to make now, leave the prototype as it is and say so in
your report rather than leaving it half-migrated.

---

## Verify before you report

1. **Rebuild the workbook.** `cat wb-part-a.html wb-part-b.html wb-part-c.html >
   workbook-phase-a.html`, render, then impose. The A4 file must be 28 pages and
   the booklet 14 A3 sides.
2. **Every internal page reference resolves.** Each `data-to` must name a section
   that exists, and no page may print "page ?".
3. **Look at every page you changed**, as an image, not as extracted text. Three
   writing lines were invisible for days because nobody looked: an empty span
   carrying the rule collapses inside a baseline-aligned flex container. If you add
   a labelled line, use the `decisionline` pattern, which works.
4. **The words.** No file outside `CLAUDE.md`, `core/decisions.md` and the two
   design documents may contain: "gate" or "gated", "bear" or "bearing" in the
   sense of bearing on something, "cashed", "problem statement", "Step 1
   statement", a lower-case "step" followed by a digit, or an em or en dash.
5. **The three sources agree.** For every field you touched, the workbook, the
   step description and the specification must say the same thing. That agreement
   is the whole point of this work order, so check it rather than assuming it.
6. **The critical checks are satisfiable.** Every criterion on page 24 must have a
   field or a printed slot that can produce it. That test is what found the
   dependency rows and `spoken_for_by`.

## Report back

Three things, and nothing else:

- **What this work order got wrong.** Anywhere an edit was impossible, ambiguous,
  or made something else worse.
- **What you decided that this file did not decide for you**, with a row added to
  `core/decisions.md` for each, marked as yours.
- **Anything that still disagrees** after all the edits, including anything new
  the edits created.

Do not summarise what you did. The diff says that.
