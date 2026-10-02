---
file: steps/phase-a-carries/spec.md
updated: 2026-10-02
source: Workbook page 25, "What carries forward" (print/src/wb-part-c.html); the case view's panel in prototype/src/definitions/phase-a.js and prototype/src/views/CaseView.js; Ashley's decision of 2 October 2026 that the boundary sentence and the exclusion most likely to be wrong stay at the phase close
---

# Phase A, what carries forward: functional specification

Page 25 of the workbook, and on screen the panel of the case view. Fields, checks,
and what leaves Phase A. Nothing here describes how the screen looks: the case
view is in `design/platform-phase-a.md`, section 5.

Page 25 belongs to Phase A rather than to a step, so its keys are listed in
`process.yaml` under `phase_pages`, not under a step. The nine keys below were
coined by the prototype and adopted on 1 October 2026, and this file gives them a
specification (decided 2 October 2026). **Every key below is settled**, as are
those in Steps 1, 2, and 3.

## The page

Seven zones, in the order page 25 prints them. The page opens "The agreed
version, copied here." and prints beside each zone the page the zone was decided
or written on, generated from the page order.

Six zones are copies, and one is written on page 25 itself.

- **A copy** is made by the participant, on request, from the fields named below,
  and can then be edited. The fields it was copied from are shown beside it, and a
  copy that differs from its source is flagged as differing, never overwritten.
  Nothing is copied until the participant asks.
- **Zone 3 is written here.** The boundary sentence and the exclusion most likely
  to be wrong summarise Exercise 2 of Step 2, and neither exists anywhere in
  Step 2. Both stay at the phase close (decided 2 October 2026): neither becomes a
  Step 2 field, and the workbook does not change.

## Fields

| Zone | Printed heading | Key | Input | Taken from | Required | What the system checks |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | The problem definition, as agreed | `carry_problem` | Free text, a copy | The agreed problem definition, assembled from `agreed_*` (Step 1, Exercise 6) | No | None, beyond flagging a copy that differs from its source |
| 2 | The desired change, and your position | `carry_change_position` | Free text, a copy | `change_long` with `change_long_year` and `change_near` with `change_near_year` (Step 1, Exercise 4), and `position` with `on_behalf_of` (Step 1, Exercise 5) | No | As zone 1 |
| 3 | The boundary, in one sentence, and the exclusion most likely to be wrong | `boundary_sentence` | Free text, two lines | Written here | No | None |
| 3 | | `exclusion_most_likely_wrong` | One row of `outside` (Step 2, Exercise 2) | Chosen here | No | None |
| 3 | | `exclusion_most_likely_wrong_note` | One line: why that exclusion | Written here | No | None |
| 4 | The layers, and who holds the decision | `carry_layers_decision` | Free text, a copy. The page adds "Each layer keeps its row from page 13." | `layers` (Step 2, Exercise 3) and `decisions`, with the layer holding authority, responsibility, and accountability for each (Step 2, Exercise 6) | No | As zone 1 |
| 5 | The two descriptions that disagree | `carry_disagreement` | Free text, a copy. The page adds "Name the actor holding each." | The two rows of `descriptions` named by `conflicting_pair`, with the actor holding each (Step 2, Exercise 8) | No | As zone 1 |
| 6 | The three sentences about the drawing | `carry_sentences` | Free text, a copy | `sentence_produces`, `sentence_disagreement`, and `sentence_surprise` (Step 2, Exercise 11) | No | As zone 1 |
| 7 | The system problem definition, and the shape | `carry_spd_shape` | Free text, a copy | `system_problem_definition` (Step 3, Exercise 6) and `shape` (Step 3, Exercise 5) | No | As zone 1 |

On paper zone 3 is one heading over two writing lines, printed "Decided on page
13.". On screen the prototype splits zone 3 into three labels, "The boundary, in
one sentence", "The exclusion most likely to be wrong", and "why". The three are
the screen's own words, marked provisional, and go for approval with the rest of
the screen's wording.

The Step 2 card in the case view shows `boundary_sentence` once it is written,
and the step's purpose until then (`design/platform-phase-a.md`, section 5).

## When Phase A counts as complete

Page 7 prints "Phase A is complete when the critical checks on page 24 can all be
ticked off, and what carries forward has been written on page 25." On screen, as
built, no field on page 25 is required, page 25 has no critical check of its own,
and nothing waits on page 25. Whether the screen asks for page 25 before Phase A
counts as complete was not part of the decision of 2 October 2026, and is not
settled here.

## Revisions

Page 25 prints the strip "Revised on ... because" at its foot, as every working
page does, but has no `revised_on` or `revised_because` key. On screen, as built,
an edit to page 25 records no revision and marks nothing for review
(`prototype/src/engine/store.js`). Whether page 25's strip gets keys of its own
was not part of the decisions of 2 October 2026, and is not settled here.

## What else carries forward

The step specifications list more outputs than page 25 holds. The panel stays
narrow (decided 2 October 2026): the seven zones, and the six further outputs as
links to the exercises that hold them, with no key of their own on page 25:

| Output | Held in |
| --- | --- |
| The actor list, with layer and type | Step 2, Exercise 5 |
| The resource ticks | Step 2, Exercise 5 |
| The dependency table | Step 2, Exercise 7 |
| The event strip | Step 3, Exercise 3 |
| The evidence labels | Step 3, Exercise 4 |
| The two futures | Step 3, Exercise 7 |

## What is deliberately not built

No copy made without the participant asking, and no edited copy overwritten from
its source. No scoring of a zone. No facilitator or lecturer approval. Page 25 is
the only summary: Step 2 keeps no carry-forward page of its own.
