---
file: steps/02-boundary/spec.md
updated: 2026-10-02
source: Derived from steps/02-boundary/description.md and the built workbook pages 12 to 19; brought to design/WORK-ORDER-2026-10-01.md and to Ashley's decisions of 2 October 2026
---

# Step 2, functional specification

Fields, checks, states, and what leaves the step. Nothing here describes how the
screen looks: the shape of the screen is in `design/platform-phase-a.md`.

**Every field key below is settled**, as are those in Steps 1 and 3. The keys were
proposed on 29 September, used by the first build, and adopted on 1 October 2026;
see `core/decisions.md`. A key is permanent from here on.

## The screen

Eleven exercises in the order of the workbook, in three groups that match the
three instruction pages. Both drawings are canvases on screen, and they are two
different instruments: Exercise 1 is free-form and unchecked, Exercise 10 is a
structured arrangement built from what the step has since defined. Both are set
out in `design/platform-phase-a.md`, which also records that Exercise 1's canvas
is a placeholder in the first prototype. Decided 2 October 2026: the free-form
canvas is built for the online version, a participant who drew on a large sheet
adds a photograph instead, and either one completes Exercise 1. The canvas is
still to be built; until it is, the placeholder and the photograph slot stand.

On paper the two drawings keep their settings: Exercise 1 is a large sheet worked
standing up, usually by a group, and Exercise 10 is the double-page spread. The
screen versions are for one person working a case alone, which is what the
platform is for.

An exercise appears once the exercise above it has content. Everything already
written stays open for editing.

## Fields

| Exercise | Key | Input | Required | What the system checks |
| --- | --- | --- | --- | --- |
| 1. The first drawing | `sketch_first_done` | Confirmation that the drawing exists | Yes | Present before the critical check opens |
| 1. The first drawing | `sketch_first_canvas` | A free-form canvas: marks, short labels, connectors, and the four symbols the page names (money, conflict, a blockage, and a question mark for what is not known). No bands and no structure | Yes on screen, unless `sketch_first_image` holds a photograph | Present where no photograph is added, and nothing else: nothing about what is drawn. There is no case data at Exercise 1 to check a drawing against, because the layers, the actors, and the descriptions are all defined later in the step. Exercise 1 is complete with `sketch_first_done` and either a drawing on the canvas or a photograph (decided 2 October 2026). **A placeholder in the first prototype**, with the photograph slot beside it, until the canvas is built |
| 1. The first drawing | `sketch_first_image` | Photograph, where the drawing was made on a large sheet instead | No. A photograph takes the place of the canvas | Nothing. On paper the sheet is its own record |
| 2. Inside | `inside[]` | Repeating rows, no cap. Twelve printed on paper, matching the dozen actors the step targets | At least one | Each row non-empty |
| 2. Outside | `outside[].label` | One line, no cap on screen. On paper six entries are printed beside the twelve inside rows, each on two lines: the item with its F, O, and I boxes on the first, and its reason on the line beneath (decided 2 October 2026) | At least one | Non-empty |
| 2. Outside | `outside[].mark` | One of three: fixed, out of reach, irrelevant | Yes | Exactly one per row |
| 2. Outside | `outside[].reason` | One line, labelled "Because" on paper and on screen. On paper the reason has a line of its own beneath each exclusion (decided 2 October 2026) | Yes | Non-empty |
| 3. The layers | `layers[].name` | One line, ordered widest scope of decision first | Two to five | Count is two to five. Five is a hard cap. Two is allowed only with `two_layers_because` |
| 3. The layers | `layers[].reason` | One line on every row, printed "why this is the widest scope" on the first, "why this is the narrowest scope" on the fifth, and "why this scope sits here" on the rows between. On paper the narrowest layer always goes on row 5 and any layers between on rows 2 to 4, in the words page 13 prints: "The narrowest layer goes on row 5, and any layers between on rows 2 to 4." So the fifth row's question is always asked of the narrowest layer, and a two-layer case uses rows 1 and 5 and leaves row 3 for `two_layers_because`. On screen the layers are numbered from 1 as they are added, and the last is asked why it is the narrowest scope, so a row number can differ between book and screen: in a three-layer case the narrowest layer is row 5 on paper and row 3 on screen, and the layer's name links the two (decided 2 October 2026) | Every layer | Non-empty. The widest answers why it is the widest scope, the narrowest why it is the narrowest, and the rest why that scope sits where it does |
| 3. The layers | `two_layers_because` | One line: why this case has no third scope of decision | Where there are exactly two layers, and absent otherwise | Non-empty when required. On paper the rule is printed above the rows, "Two only if you write why this case has no third scope of decision, on row 3", so the line is written on the third row, which is empty when there are two layers and is where a third scope would sit |
| 4. The actor types | `actor_types[].label` | One line, the participant's own wording | At least one | **Five is the only hard rule.** Three is advice, not a floor, and nothing blocks on it. No more than one type per three actors is a warning, not a block, because a ratio is a judgement about granularity rather than a question of completeness. A type holding one actor is flagged as a name rather than a type, once there are at least three actors. A type holding almost everything, meaning all the actors but one or all of them, is flagged as doing no work, once there are at least six actors. Each of these warnings is dismissed with one line and never blocks (thresholds adopted from the prototype on 2 October 2026) |
| 5. The actors | `actors[].name` | One line | At least one | Non-empty, and nameable: something the participant could write to, sit across from, or point at in a room |
| 5. The actors | `actors[].layer` | One of `layers` | Yes | Exactly one |
| 5. The actors | `actors[].type` | One of `actor_types` | Yes | Exactly one |
| 5. The actors | `actors[].admits` | Four tick boxes: affects the problem, is affected by what the system produces, holds something others need, can start or stop a change | At least one | At least one ticked before the actor can be saved. Since 29 September the four tests are four numbered columns on the printed actor table as well, so the screen and the page ask the same thing. Column 2 is the one the critical check reads: nothing ticked down it means the list holds only the actors who act, and not those the system acts on. Nothing ticked down column 2 is flagged once there are at least three actors, as a warning that is dismissed with one line and never blocks (threshold adopted from the prototype on 2 October 2026) |
| 5. The actors | `actors[].resources` | Seven tick boxes: formal authority, money, delivery capacity, information and expertise, access, legitimacy, public attention | No | Recorded for every actor |
| 5. The actors | `actors[].resource_note` | One line | No | Written where a tick is not obvious |
| 5. The actors | (count) | | | Warn past twelve. Warn again past fifteen, with the message that the participant should check the granularity first and then the boundary. Neither blocks: the page and the description both say "roughly fifteen", and a hard stop would make this step's own return trigger, past fifteen actors, unreachable |
| 6. Authority, responsibility, and accountability | `decisions[].statement` | One line. At most two decisions | At least one | Non-empty. Where a case turns on more than one decision, at most two are recorded and the participant says which. **The page has room for one decision, and the second is recorded on screen only** |
| 6. | `decisions[].authority` | One of `layers`, or nobody | Yes | Named or recorded as nobody |
| 6. | `decisions[].responsibility` | One of `layers`, or nobody | Yes | As above |
| 6. | `decisions[].accountability` | One of `layers`, or nobody | Yes | As above |
| 6. | `decisions[].authority_actor`, `decisions[].responsibility_actor`, `decisions[].accountability_actor` | One of `actors` inside the named layer | No | Offered where the participant can narrow the layer to an actor |
| 6. | `ara_pattern` | Derived: all three in one layer; authority in one layer and responsibility in another; accountability elsewhere or nowhere | System-derived | Not entered. Read by Steps 5, 7, 8, and 12 |
| 7. Who needs what from whom | `dependencies[].actor` | One of `actors`, drawn from the qualifying subset | For every actor in the subset | The subset is derived, not chosen: any actor in a layer holding authority, responsibility, or accountability for the decision, plus anyone holding something those actors need. The second half is found in Exercise 7 itself (decided 2 October 2026): an actor whose row names a first-half actor in `needed_by` joins the subset, and the actor column offers every actor. The second half adds no missing-row check: one row per resource held is checked for the first half only, and for a holder brought in, only `who_needs_it` on the rows already written is required. On paper, which has no `needed_by` column, the second half is judged by eye. Step 7's narrow second pass catches a holder missed here |
| 7. | `dependencies[].resource` | One of the seven resources | Yes | One row per resource held |
| 7. | `dependencies[].who_needs_it` | Free text: who needs it, and for what. Twelve rows printed on paper, because one row per resource for three to six actors needs twelve or more | Yes | Non-empty. A blank row for an actor outside the subset is a state, not an omission, and the screen says so |
| 7. | `dependencies[].needed_by` | One of `actors`, where the one who needs the resource is on the actor list | No | None on its own. It is what lets the second drawing confirm a line between two actors, and report a recorded dependency that has no line. The page has no column for it: on paper the free text carries who needs the resource |
| 8. How the actors see the problem | `descriptions[].actor` | One of `actors`. Five rows printed on paper, the same number the screen warns past | At least two | Non-empty |
| 8. | `descriptions[].reading` | One line, in that actor's own terms | Yes, unless `shares_with` is set | Non-empty when required |
| 8. | `descriptions[].status` | One of two: evidenced, inferred | Yes, unless `shares_with` is set | Exactly one when required. Evidenced means a document, a quoted statement, a meeting, or an interview |
| 8. | `descriptions[].read_from` | Free text | Yes, unless `shares_with` is set | The source where evidenced. Where inferred, what the line is read from. This is the only thing keeping an inference honest, since the requirement to name what would show the line wrong was dropped on 29 September, so a vague answer here is a vague exercise |
| 8. | `descriptions[].shares_with` | Reference to another row | No | An actor who reads the problem the way one already recorded does is marked as sharing that line rather than given a line of their own |
| 8. | `conflicting_pair` | Two references into `descriptions` | Yes | Two that cannot both be acted on. Two wordings of the same reading do not count. Five descriptions is plenty; past five the exercise becomes a survey rather than an analysis |
| 9. Who is missing | `who_is_missing` | Free text | Yes | Non-empty. Partial answers are accepted |
| 9. Who is missing | `spoken_for_by` | Two full-width lines under Exercise 9, with the label printed above them: "Who speaks for each group the system acts on, including nobody" (decided 2 October 2026, matching page 16) | Yes | Non-empty. "Nobody" is an answer, and usually the important one. The answer sits under Exercise 9 rather than in a column on the actor table, which already carries fourteen columns. The instruction on page 16, which faces Exercise 9, says what to write there. Steps 7 and 13 read `spoken_for_by` |
| 10. The second drawing | `sketch_second` | A structured canvas: layer bands drawn from Exercise 3, an actor tray the participant places from, participant-drawn lines and disagreement marks. Nothing places or arranges itself | Yes | Actors in bands by layer, widest scope at the top; a line where one actor needs a resource from another; a mark where two actors read the problem differently. An actor dropped outside its recorded layer is allowed and flagged, because deciding whether the placement or Exercise 3 is wrong is a return inside the step. A recorded dependency with no line drawn is reported when the participant leaves the exercise, never while they work. Leaving is scrolling the drawing out of view after working in it, changing step, or pressing the button that leaves the drawing, a working rule adopted on 2 October 2026 for the first online version |
| 10. | `sketch_second_left` | The date and time the participant last left the drawing, written by the screen | System-written | Not entered. A record of leaving, kept apart from `sketch_second` so that leaving is never mistaken for a change to the answer: leaving records no revision. The report of recorded dependencies with no line is shown only once the participant has left the drawing (adopted 2 October 2026) |
| 11. Three sentences | `sentence_produces`, `sentence_disagreement`, `sentence_surprise` | Free text, two lines each | All three | Non-empty. The second is drawn from the conflicting pair in Exercise 8 |
| Foot of every working page | `revised_on`, `revised_because` | Date and free text | No | Recorded, never erased. On screen both are written from the revision log and never typed separately: they hold the date and the reason of the step's latest revision, and every earlier revision stays in the log (decided 2 October 2026; the log is set out in `steps/01-framing/spec.md`, "The revision log") |

On paper, rows beyond those printed go on the notes pages, from page 26: under
Exercise 2, twelve inside rows and six outside entries, and under Exercise 7,
twelve dependency rows. A line printed under each of the two exercises says so,
"More rows than these go on the notes pages, from page 26." On screen the inside
and outside lists and the dependency table have no cap, so that line is not
shown (decided 2 October 2026).

The checks in the last column are mechanical: a field is empty, a count is
exceeded, a value is set. Nothing in Step 2 scores the quality of a boundary or
an actor list, and nothing should be built that pretends to.

## Closed lists

**The three exclusion marks.** Fixed means it will not change during the period
being analysed. Out of reach means it could change but nobody in this case can
affect it. Irrelevant means including it would not change what the analysis
concludes, which is the boundary test read the other way. Irrelevant is the one to
distrust: it is where a boundary usually goes wrong, and it is the only one of the
three that never comes back.

**The seven resources**, with the long label and the short column head the actor
table uses:

| Resource | Column | What it means |
| --- | --- | --- |
| Formal authority | Authority | Can decide, or change a rule |
| Money | Money | Holds or can redirect the funding |
| Delivery capacity | Delivery | Does the work on the ground |
| Information and expertise | Information | Knows something the others need to know |
| Access | Access | Can get to whoever decides |
| Legitimacy | Legitimacy | Can credibly speak for others |
| Public attention | Attention | Can make an issue visible, or keep it quiet |

**The four admission tests.** Any one admits an actor. They are numbered, because
the printed actor table heads four columns with the numbers: 1, they do something
that affects the problem; 2, they are affected by what the system produces; 3,
they hold something others in the system need; 4, they can start or stop a
change.

**Two things are not actors.** A category with no agency, such as the weather,
the market, or society, which is a condition rather than an actor. And a named
individual, unless the thing held belongs to that person rather than to their
organisation.

**Actor types are not a closed list.** The participant writes the list. Six are
offered and none is imposed: public authority, delivery body, representative
organisation, firm, affected group, knowledge body. The tool never adds a type
silently and never fills one in.

**Authority, responsibility, and accountability.** Authority answers who can take
the decision or change the rule the decision is made under. Responsibility
answers who is tasked with carrying the decision out. Accountability answers who
is called to answer when what was decided goes wrong. Each takes a layer, or
nobody.

**Evidence status for a description.** Evidenced, meaning a document, a quoted
statement, a meeting, or an interview. Or inferred.

**Stakeholder is not a word this process uses.** Everything inside the system is
an actor. The interface never uses the word for an actor, and may print the
glossary card that explains why the word is not used.

## States

The state machine is the one in `steps/01-framing/spec.md`, unchanged: empty, in
progress, critical check open, passed, reopened. Passed is never removed by the
system. Reconfirming without editing is an allowed answer, recorded with the
date.

## The critical check

The wording below is the workbook's, which is the participant-facing version. The
step description and this file now carry the same seven criteria word for word;
the three that once differed were settled on 29 September 2026.

Each criterion names where it sends the participant when it cannot be ticked
(decided 2 October 2026). The returns are the prototype's, converted to the pages
the exercises are printed on: page 24 prints the pages beside each criterion,
generated from the page order, with the large sheet named before the pages of
the last, and the screen names the exercise and its page.

| Criterion | If it cannot be ticked, back to |
| --- | --- |
| What is excluded is written down, with a reason and a mark of F, O, or I. | Exercise 2, page 13 |
| The actors include those affected by the system but not involved in it. | Exercise 5, page 15 |
| Every actor sits in one layer and carries one type. | Exercises 3 and 4, page 13, and Exercise 5, page 15 |
| For every actor, the resources held are recorded. For the actors the dependency question applies to, who needs each resource from them is recorded as well. | Exercise 5, page 15, and Exercise 7, page 17 |
| Which layer can take the decision, which is tasked with carrying the decision out, and which answers for the result, are each named or recorded as nobody. | Exercise 6, page 17 |
| At least two descriptions of the problem are recorded, and they differ in a way that matters. | Exercise 8, page 17 |
| The system has been drawn on a large sheet, drawn again in this book, and its three sentences written. | Exercise 1, on the large sheet (headed on page 13); Exercise 10, page 18; and Exercise 11, page 19 |

## What carries forward

| Output | Goes to | Used as |
| --- | --- | --- |
| The boundary | Steps 4, 5 | What may be named as a variable at all |
| The layers | Steps 7, 12 | Which scope of decision a lever sits in, and which the ask is addressed to |
| The actors, with layer and type | Steps 5, 7, 8, 12, 13 | Who the control markers belong to, and who is affected by a choice |
| The resources and the dependencies | Steps 5, 7, 8 | Relations the mapping can carry, and what would have to move for a lever to move |
| Authority, responsibility, and accountability | Steps 7, 12 | Where a lever can actually be pulled, and by whom |
| The competing descriptions | Steps 6, 13 | The mental models the narrative has to account for |
| The three sentences | Steps 3, 4 | The pattern to look for, and the first candidate factors |
| Exclusions marked fixed or out of reach | Step 10 | The assumptions the theory of change rests on |
| Who is missing, and who speaks for whom | Steps 7, 13 | Where power is invisible, and whose message has to be carried by someone else |

Revising Step 2 marks every step the table above sends an output to: Steps 3, 4,
5, 6, 7, 8, 10, 12, and 13 (decided 2 October 2026). Within Phase A that is
Step 3; the others are marked once they are built.

## What comes back into Step 2

| Trigger | Raised at | What is reopened |
| --- | --- | --- |
| The period has to reach outside the boundary | Step 3 | The exclusions, and any layer the reopened exclusion adds |
| The mapping cannot explain the pattern | Step 5 | The exclusions. Something that moves the level of the thing named in the problem definition was left outside |
| A candidate lever is chosen | Step 7 | The dependencies, as a narrow second pass. The actors around that lever get the dependency question whether or not they were in the first set |
| All three of authority, responsibility, and accountability sit in one layer and the problem persists anyway | Inside Step 2 | The exclusions, and the decision. The decision that matters may be outside the boundary |
| An actor will not fit any type | Inside Step 2 | The type list, and the type of each actor. Nothing else |
| An actor seems to need two layers, or an affected group splits into halves wanting different things | Inside Step 2 | That actor, which becomes two rows |
| Past fifteen actors | Inside Step 2 | The actor list first, then the exclusions and the layers |

Each trigger reopens the fields it names, not the whole step.

## What Step 2 sends back

| What happens | Return to |
| --- | --- |
| The actors who matter all sit outside the boundary | Step 1, page 11: `agreed_thing`, `agreed_who`, and `change_long` |

## What is deliberately not built

No scoring of a boundary, an actor list, or a description. No starter list of
actors or layers for a case, which would remove the step. No automatic typing of
an actor. No facilitator or lecturer approval anywhere in the flow. No lock on
Step 1 once Step 2 has been started.
