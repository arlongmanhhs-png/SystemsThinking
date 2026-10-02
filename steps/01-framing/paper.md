---
file: steps/01-framing/paper.md
updated: 2026-10-02
status: superseded
source: Systems Thinking Process (Claude project), Phase A tab, "Step 1, paper format"
---

# Step 1, paper format

> **Superseded in full, 2 October 2026**, and in part since 28 September. The
> paper form is now a workbook: the workbook pages in `print/src/` and the step
> specifications carry the printed wording and the room each field is given.
> Everything below, the content as well as the arrangement (loose sheets, and
> prompt cards for Step 2), is history rather than instruction, and is kept as
> the record of how the paper form began. The workbook's layout is described in
> `design/workbook.md`.

One sheet, filled in the order the fields are printed, with the checks sitting
next to the thing they check rather than on a separate page. Everything else is a
prompt card that stays on the table and is not written on.

## The materials

| Item | Format | Per | Reusable |
| --- | --- | --- | --- |
| Framing sheet | A4, printed both sides | Participant, one per case | No: it carries the agreed version |
| Framing sheet, large | A3, same layout | Group, the working copy | No |
| Prompt card: writing the problem | A5, both sides | Table (one per four or five) | Yes |
| Prompt card: the five positions | A5, one side | Table | Yes |
| Parked ideas slip | A6, gummed pad or a strip at the foot of the sheet | Participant | No, it travels to Step 7 |

The two sizes are one sheet. The A3 is the working copy: it is filled first,
argued over, and crossed out. The A4 is the version agreed afterwards, and it is
what goes in the folder. Same zones, same wording, same order, so the sheet is
taught once and the neat copy is transcription rather than a second exercise.

## The framing sheet, front

Six zones, top to bottom, in the order they are filled. Each zone is sized to
what a good answer needs, which is the quiet way of saying how much to write.

| Zone | What is printed | Space given |
| --- | --- | --- |
| 1. The situation | "In your own words, what is going on?" | Four lines. Deliberately small: this is a warm-up, not the statement |
| 2. The problem | The problem definition form with the five parts as fill-in slots: there is too much (or too little) **[thing]** for **[who]**, since **[when]**, which matters because **[consequence]** | One printed sentence with slots, then three lines beneath for the rationale |
| 3. Size and suitability | Five tick boxes with the questions in full, each with one line for the justification: chronic, has a history, earlier attempts failed, no known procedure, small enough to work on | Five rows, one line each |
| 4. The desired change | "What would be different? Say it in the same terms as the problem, not how to get there." Two boxes: in five years or more, and a nearer point one to five years out | Two lines each |
| 5. How others describe it | "How is this described by those with power over it, and what does that description assume?" plus a source line | Three lines plus a source line |
| 6. Position | Five boxes to tick, with "analysing from outside" printed first but not pre-ticked, and one line: "if not, on whose behalf?" | One row plus a line |

Across the foot of the sheet, a detachable strip for parked ideas, headed "things
to do about it, for later", with a note that it is opened again in Step 7.

## The framing sheet, back

Three things, none of which needs writing space.

1. **The other three problem forms**, for when excess and deficit does not fit:
   mismatch, falling short of a standard, and something that has not happened
   yet, each with what it is for and its problem definition form. Four tick
   boxes for which form was used, and a line for why the default did not fit.
   (This said "the other two forms" until 28 September, which was a slip: the
   Step 1 description has three alternatives, and the typeset sheet carries all
   three.)
2. **The eight rules**, printed as a checklist to read against the finished
   problem definition.
3. **Two worked examples**, weak and rewritten, from different countries.

## The prompt cards

**Writing the problem** carries the material that would clutter the sheet: how to
narrow a problem that is too large (place, population, decision, time), what to
do when too few variables can be foreseen, the note that the statement is not
value neutral and that the standard should be named, and the two questions used
to check it (could someone disagree about the cause and still accept this, and
could they say what would have to change for it to stop being true). For the
rationale it carries Bromell's two questions: what is at stake, and why do we
care? What is driving us to think about this now?

**The five positions** carries the table: who each position is, and what it
switches on later. It exists so that the choice on the sheet is made from a
description rather than from a label.

## How it runs in class

About 45 minutes for a first pass, on the class case, in fixed groups, on the A3
sheet. The lecturer fills nothing in. Two moments are worth structuring: after
zone 2, every group reads its problem definition aloud to one other group, who
answer only the two check questions; and after zone 5, the same pairing again,
this time asking "whose description did you use, and who does it leave out?".
Both take five minutes and both catch the errors that are expensive later.

When the group has settled, one member copies the agreed wording onto an A4
sheet. The A3 stays with the group, corrections visible, because the disagreement
it records is useful in Step 3 and again at the critical check.

Participants then fill their own A4 sheet for their own case in the session set
aside for their own work.

## What is kept

The A4 sheet is the record. The platform version replaces it once it exists, but
the sheet stays the fallback, and it is what a participant brings to a
supervision conversation. The parked strip goes into the folder, unopened, until
Step 7.

## The typeset draft

Drafted on 28 September and rendered to PDF in `print/`, from the source in
`print/src/`. The sheet is built as HTML and rendered with headless Chromium, so
that the type and the colour come from the EmpowerSDGs x THUAS design system
rather than from a word processor. One markup serves both sizes: everything
inside a sheet is measured in `em` and the renderer sets the font size per paper
size, so the A3 is the A4 at the same proportions rather than a second layout.

## Open

Whether the representation answer (zone 5) belongs on the front or on the second
side. The draft settles the arithmetic that the description could not: with all
six zones on the front, the position row and the parked strip reach the foot of
the page with nothing to spare (variant A), while moving zone 5 to the second
side leaves the front comfortable and gives that answer more room than it had
(variant B). The rationale stays on the front in both. See
`core/open-questions.md`.
