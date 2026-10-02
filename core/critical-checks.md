---
file: core/critical-checks.md
updated: 2026-10-02
source: Systems Thinking Process (Claude project), Overview tab
---

# Critical checks, dependencies, and returns

## What a critical check is

A critical check is the last part of a step, not a stage between steps. It
states in plain words what the step had to produce, and the participant ticks
each criterion themselves. There is no peer review, no facilitator, and no
lecturer approval anywhere in the process.

## What a critical check does and does not do

- It opens when the step's required fields are present. Completeness is
  mechanical and is enforced.
- The criteria themselves are self-checked. Each tick is the participant's claim
  and is stored with the date.
- Quality is never judged by the tool. A participant can pass a critical check
  with a weak answer. That is intended: the criteria make the standard visible,
  and later steps expose an answer that does not hold.

## Moving back and forth

Forwards is checked. Backwards is free, from any step to any earlier step, without
permission and without losing work.

Revising a step marks every step that depends on it for review. The marks say
what changed and which answers should be looked at again. Reviewing and deciding
that nothing has to change is a valid outcome and is recorded as one. This is the
rule "recheck, do not redo".

## Which steps depend on which

A step uses the output of every earlier step whose carry-forward table, in that
earlier step's `spec.md`, sends it an output. The table was widened to match the
carry-forward tables on 2 October 2026, keeping every dependency already listed,
so a revision marks every step that an output of the revised step reaches.

| Step | Uses the output of |
| --- | --- |
| 1. Problem, desired change, position | - |
| 2. Boundary, perspectives, power | 1 |
| 3. Behaviour over time | 1, 2 |
| 4. Enablers and inhibitors | 1, 2, 3 |
| 5. Causal structure | 1, 2, 3, 4 |
| 6. Analysis and narrative | 2, 3, 5 |
| 7. Leverage | 1, 2, 3, 5, 6 |
| 8. Consequences and interests | 1, 2, 6, 7 |
| 9. Hypothesis | 1, 3, 6, 8 |
| 10. Test | 1, 2, 3, 5, 9 |
| 11. Monitoring | 1, 3, 10 |
| 12. Target and ask | 1, 2, 7, 8 |
| 13. Communication | 1, 2, 6, 9, 12 |

## Named return triggers

Every criterion that can fail names where it sends the participant. These are the
cross-step triggers; triggers that reopen named fields inside a single step are
listed in that step's `spec.md`.

| Trigger | Sends the participant back to |
| --- | --- |
| The narrative in Step 6 does not explain the pattern from Step 3 | Step 5, or Step 3 if the pattern itself was wrong |
| No leverage candidate in Step 7 reaches beyond parameters | Step 5 or 6 |
| The consequences in Step 8 are judged unacceptable for every candidate | Step 7 |
| An assumption in Step 10 is rated weak | Step 5 or 7 |
| No indicator can be found in Step 11 for an outcome | Step 10 |

A return trigger reopens the fields it names, not the whole step.
