---
file: steps/03-behaviour-over-time/spec.md
updated: 2026-10-02
source: Derived from steps/03-behaviour-over-time/description.md and the built workbook pages 20 to 23; brought to design/WORK-ORDER-2026-10-01.md and to Ashley's decisions of 2 October 2026
---

# Step 3, functional specification

Fields, checks, states, and what leaves the step. Nothing here describes how the
screen looks: the shape of the screen is in `design/platform-phase-a.md`.

**Every field key below is settled**, as are those in Steps 1 and 2. The keys were
proposed on 29 September, used by the first build, and adopted on 1 October 2026;
see `core/decisions.md`. The four design decisions that once stood open on this
step were all taken on 29 September 2026; see the end of this file. Nothing on
Step 3 waits on anyone.

## The screen

Seven exercises in the order of the workbook, all of them on screen. Step 3 has
nothing that happens on a large sheet, and the graph is the only drawing in the
step.

What is measured in Exercise 1 is fixed by the agreed problem definition in
Step 1, the one written in Exercise 6, and never by the first attempt in
Exercise 2. Throughout this file "the problem definition" means the agreed one.
How the thing is measured is the participant's own choice, recorded with one line
saying why that measure. That distinction was settled on 29 September 2026, and with it the
last of the four questions that stood open on this step.

## Fields

| Exercise | Key | Input | Required | What the system checks |
| --- | --- | --- | --- | --- |
| 1. What you are graphing | `thing_measured` | Text, copied from `agreed_thing`, the thing in the agreed problem definition, and not editable here. Never copied from `problem_thing` | Yes | Present. Changing the thing measured is a return to Step 1, page 11, where renaming `agreed_thing` marks Step 3 for review |
| 1. | `measure` | Free text: how the thing is being counted | Yes | Non-empty. One thing can usually be counted several ways, and the measure to take is whichever count has a history that can be drawn |
| 1. | `measure_because` | Free text, one line | Yes | Non-empty. Critical check: "The quantity graphed measures the thing named in the agreed problem definition, and a line says which measure it is and why that one". A named thing for which no measure can be found at all is not a quantity, which is the return to Step 1 |
| 1. | `form_route` | Derived from the Step 1 problem form: excess or deficit, mismatch, falling short of a standard, not yet happened | System-derived | Decides which measure is suggested, never imposed. Mismatch offers the amount available in the place where the need is. Falling short of a standard offers the measured level of the thing the standard is about. Not yet happened offers the nearest quantity that does have a history |
| 1. | `nearest_quantity_because` | One line, printed on page 21 as "Not happened yet: why the quantity graphed is the nearest", and used only where the form is not happened yet. It is the only record of why a proxy was chosen | Yes where the form is not yet happened, unless `no_nearest_quantity` is set | Says why that is the nearest quantity available |
| 1. | `no_nearest_quantity` | A confirmation that no quantity with a history can be found | No | Where the form is not yet happened. A case that cannot produce even a nearest quantity has no history, which is surfaced as a finding at the critical check rather than left for Step 5. On paper it is written on the nearest-quantity line |
| 1. | `period_start`, `period_start_because` | Year and one line | Yes | Reaches back to the last major change, or roughly ten years, whichever is longer, and the line says which |
| 2. The line | `period_from`, `period_to` | Years | Yes | Non-empty. `period_from` should equal `period_start` |
| 2. | `series[]` | Pairs of time and value | Yes | One quantity, one line, one graph. Not several things compared, not a bar chart, not a picture of a process. A line that cannot be drawn is a return to Step 1 |
| 3. What happened, and when | `events[].year` | Year, aligned to the horizontal axis | At least one | Lined up under the year it happened |
| 3. | `events[].label` | One line | Yes | Non-empty. Reforms, crises, new instruments, court rulings, changes of government with a policy attached, and every previous attempt to fix this. The strip is required, not decoration. Six is a soft cap, settled on 29 September: six cells are printed, and over a period reaching back to the last major change or ten years, six is enough for most cases. On screen a seventh event raises the warning "Keep the six events that mattered, and write how many there were in total in the line below." It never blocks |
| 3. | `events_total` | A number, where there were more than six | No | The printed line reads "Six cells. If there were more, ______ in total, and these are the ones that mattered." The count itself is a finding: a problem with many failed attempts is usually the flat shape, and the number of attempts is part of what Step 5 has to explain |
| 4. Where the line comes from | `evidence[].kind` | One of three: measured, documented, estimated | At least one segment | Exactly one per segment. Labelled, never ranked |
| 4. | `evidence[].range` | The part of the line the segment covers | Yes on screen | The segments tile the line with no unlabelled gap. An unlabelled mixture is the one thing that is not allowed |
| 4. | `evidence[].note` | Free text, and what is written varies by kind | Yes | Measured: the source and the years it covers. Documented: the documents, and what each one establishes about direction or timing. Estimated: what the estimate rests on, and the words "this line is an estimate" printed beside the line |
| 5. The shape of the line | `shape` | One of six: steady rise or fall, accelerating, levelling off, up and down, rise then collapse, flat | Yes | Exactly one |
| 5. | `shape_because` | Free text, two lines | Yes | Non-empty. The printed prompt is "Why your graph is that shape", and it stands. Asking why this shape rather than the next most likely was dropped on 29 September: it assumes the participant can rank the shapes they did not choose, which they cannot, and ranking them is not part of the work |
| 6. The system problem definition | `spd_since`, `spd_quantity`, `spd_shape`, `spd_tried` | Four slots, not one free box | All four | Each slot non-empty |
| 6. | `system_problem_definition` | Derived: "Since [since], [quantity] has [shape], and [tried] has not changed it." | Yes | Assembled and shown back in full, beside the Step 1 problem definition, so the participant can see the two are not the same sentence |
| 7. The two futures | `future_unchanged` | A dotted line on the same axes | **Optional** | Not a prediction |
| 7. | `future_desired` | A second dotted line on the same axes | **Optional** | What the desired change from Step 1 would look like if it happened, drawn before any intervention has been chosen |
| 7. The other quantity | `other_quantity_label`, `other_quantity_series[]` | One further quantity on its own graph | **Optional** | Settled on 29 September: Exercise 7 is two boxes, the left one for the two futures and the right one for **one** further quantity, drawn only where the problem definition rests on it. Not two further quantities. One quantity, one line, one graph |
| Foot of every working page | `revised_on`, `revised_because` | Date and free text | No | Recorded, never erased. On screen both are written from the revision log and never typed separately: they hold the date and the reason of the step's latest revision, and every earlier revision stays in the log (decided 2 October 2026; the log is set out in `steps/01-framing/spec.md`, "The revision log") |

The interval is not a field. It was retired on 1 October 2026: the instruction on
page 20, intervals as coarse as the evidence allows and yearly usually enough, is
enough, and the interval is visible in the drawn line.

Nothing here scores the quality of a graph, a shape, or a system problem
definition. The checks are mechanical: a field is empty, a segment is unlabelled,
a value is set.

## Closed lists

**The six shapes.** A shape chosen from the list is a claim about the system. A
shape described in the participant's own words is a caption. Each shape commits
the mapping in Step 5 to containing something:

| Shape | What the line does | What the mapping will have to contain |
| --- | --- | --- |
| Steady rise or fall | Moves one way at roughly the same rate | Something that keeps adding or draining, with nothing yet pushing back |
| Accelerating | Moves one way, faster and faster | A reinforcing loop |
| Levelling off | Moves one way, then flattens towards a limit | A balancing loop, and a limit worth naming |
| Up and down | Repeatedly overshoots and comes back | A balancing loop with a delay in it |
| Rise then collapse | Grows, turns, and falls below where it started | A reinforcing loop running into something it erodes |
| Flat | Does not move, despite the pressure on it | Something holding it there, which is usually the interesting finding |

Flat is a pattern, not a failure. A quantity that stays put while people push on
it is being held there by something, and naming what holds it is the work that
follows. Most problems that have survived several attempts are this shape.

**The three evidence labels.** A line drawn from documented accounts is a
legitimate graph. What matters is that a reader can tell which kind each part of
the line is, and that the change is marked where the line changes kind.

| Kind | What it is | What the participant writes |
| --- | --- | --- |
| Measured | A published series: a statistics office, Eurostat, an inspectorate's annual figures, an organisation's own records | The source and the years covered |
| Documented | No series, but accounts saying which way the thing moved and roughly when: evaluations, audit reports, parliamentary answers, press coverage, minutes | The documents, and what each one establishes about direction or timing |
| Estimated | Neither, so the line is the participant's own reading | What the estimate rests on, and the words "this line is an estimate" |

**The system problem definition template.** Since [when], [the quantity] has
[shape], and [what has been tried] has not changed it.

## States

The state machine is the one in `steps/01-framing/spec.md`, unchanged.

## The critical check

The workbook's wording, which is the participant-facing version.

Each criterion names where it sends the participant when it cannot be ticked
(decided 2 October 2026). The returns are the prototype's, converted to the pages
the exercises are printed on: page 24 prints the page beside each criterion,
generated from the page order, and the screen names the exercise and its page.

| Criterion | If it cannot be ticked, back to |
| --- | --- |
| The quantity graphed measures the thing named in the agreed problem definition, and a line says which measure it is and why that one. | Exercise 1, page 21 |
| The period reaches back to the last major change in the system, or ten years, and a line says which. | Exercise 1, page 21 |
| The line carries its evidence, with each part marked measured, documented, or estimated. | Exercise 4, page 21 |
| What has been tried is on the event strip, with the years. | Exercise 3, page 21 |
| The shape is named, with a line saying why the graph is that shape. | Exercise 5, page 23 |
| The system problem definition is written, and it is not the agreed problem definition reworded. | Exercise 6, page 23 |

## What carries forward

| Output | Goes to | Used as |
| --- | --- | --- |
| The graph and its shape | Steps 5, 6 | What the mapping has to produce, and what the narrative has to account for |
| The system problem definition | Steps 5, 6, 9, 11 | The pattern Step 9 says will change, and Step 11 measures |
| The event strip | Steps 5, 7, 10 | First candidates for delays, what has already been tried, and what the plan is assuming about timing |
| The evidence and its kind | Steps 10, 11 | How much weight the plan can put on the baseline, and what an indicator can realistically be |
| The two futures, where drawn | Steps 9, 11 | The shape the hypothesis claims, and the gap the early signals read |

Revising Step 3 marks every step the table above sends an output to, and Step 4,
which the dependency table in `core/critical-checks.md` already listed: Steps 4,
5, 6, 7, 9, 10, and 11 (decided 2 October 2026). None of them is in Phase A, so
each is marked once it is built.

## What comes back into Step 3

| Trigger | Raised at | What is reopened |
| --- | --- | --- |
| The mapping cannot produce a structure that would make this shape | Step 5 | The shape and its reason. If the shape stands, the return continues to the exclusions in Step 2, because the boundary is then the suspect |
| The narrative does not explain the pattern | Step 6 | The shape, the line, and the system problem definition |

## What Step 3 sends back

This is the commonest return in the whole process, and going back here costs very
little. Going back from Step 6 for the same fault costs a great deal.

| What happens | What it means | Return to |
| --- | --- | --- |
| The line cannot be drawn, because the quantity does not move | What was named is a condition or a judgement rather than a quantity | Step 1, page 11, to rename the thing in `agreed_thing` |
| The line can be drawn, but it is not the problem | The problem definition named a proxy | Step 1, page 11, to name in `agreed_thing` the quantity the rationale was about |
| The period has to reach outside the boundary | The last major change sits in a layer Step 2 left out | Step 2, to reopen the exclusions |

## Settled, 29 September 2026

The four decisions that stood open on this step are taken. What is measured is
given by Step 1 and how it is measured is the participant's choice, recorded and
justified in one line. Six shapes is the closed list. The two futures are
optional. Evidence stays labelled rather than ranked, and no measured series is
required, because requiring one would rule out most of the cases this process is
for.

Nothing on Step 3 is open.

## What is deliberately not built

No scoring of a graph or a shape. No automatic shape detection from the plotted
points, which would remove the exercise: naming the shape is the participant's
claim. No chart library defaults that turn one line into a dashboard. No lock on
Steps 1 or 2 once Step 3 has been started.
