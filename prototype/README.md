# The Phase A prototype

One participant working one case through Phase A, in two views: the case view
(Phase A as three steps, with what carries forward beside them) and the step
screens. Built from `design/platform-phase-a.md`, which is both the prompt it was
built from and the specification it tests.

## Running it

ES modules do not load from `file://`, so the prototype is served. From this folder:

```
python3 -m http.server
```

then open <http://localhost:8000>. On Windows, `python -m http.server` does the same.

Nothing is fetched from the network at runtime. React, htm, and the fonts are in
`vendor/` and `design-system/`. The case is kept in this browser's local storage
only; "Save the case to a file" in the footer writes it out as JSON, and "Open a
saved case" reads it back.

## What is where

| Path | Holds |
| --- | --- |
| `src/definitions/step1.js`, `step2.js`, `step3.js` | One declarative definition per step: the executable form of `steps/NN-name/spec.md`. `SCHEMA.md` says what a definition carries |
| `src/definitions/phase-a.js` | Page 25, what carries forward, as the case view's panel |
| `src/definitions/lists.js` | The closed lists, in one place, referenced by key |
| `src/definitions/workbook.js` | **Generated.** The workbook's wording, read from `print/src/wb-part-*.html` by `tools/extract-workbook.py`. Never edited by hand |
| `src/engine/` | The case in local storage, validation (blocking, stop, or warning, nothing else), and the derived step state |
| `src/views/StepScreen.js` | The one renderer that turns any step definition into a screen |
| `src/views/fields.js` | The field kinds |
| `src/views/Arrangement.js` | Step 2, Exercise 10: the second drawing |
| `src/views/Graph.js` | Step 3's graph: the line, the event strip, the evidence marks, the two futures |
| `design-system/` | Copies of the EmpowerSDGs x THUAS stylesheets and fonts. See `design-system/COPIED.md` |
| `tools/extract-workbook.py` | Regenerates `workbook.js` after any change to the printed pages |
| `tools/check-wording.mjs` | Checks every label in the definitions against the printed pages and the house rules, and every string the screen files mark as their own against `tools/wording-tiers.json` |
| `tools/wording-tiers.json` | The screen's own wording, sorted into method strings and controls, with where each one shows |
| `FINDINGS.md` | What the build reports back (section 12 of the prompt) |

## Three things on screen worth knowing

**The top bar** carries the tool's working title, Systems Thinking Process, as
plain text: a descriptive title rather than a product name, with no wordmark and
no logo (decided 2 October 2026).

**Dotted underlines** mark the screen's own wording: words the workbook does not
print, which the screen needed. They are provisional, and they are marked so that
none of them is mistaken for settled copy. `tools/wording-tiers.json` sorts every
one of them into two tiers: method strings, which say something about the
participant's work and which Ashley approves one at a time, and controls, which a
rule in `CLAUDE.md` covers once Ashley approves that rule.

**The instructions** sit where the book puts them: each instruction page once,
whole, before the exercises it faces, then closed to a bar and one click away from
each exercise it governs. This is the only arrangement (decided 2 October 2026);
the switch to "Above each exercise" is gone.

## Decided, not yet built

Three decisions of 2 October 2026 need a build of their own. The specification
records them; the prototype does not have them yet.

- Where a case is kept: in the artifact's database for a student who can save
  there, in the browser otherwise, with "Save the case to a file" and "Open a saved
  case" kept in both cases.
- The export at the end of Phase A: a file of the read-through, every exercise of
  Steps 1 to 3 in the book's order, then page 25.
- The first drawing: the free-form canvas, with a photograph of a drawing made on
  a large sheet as the alternative. Either one completes Exercise 1. Until the
  canvas is built, the placeholder and the photograph slot stand.

## After a change to the workbook

```
python tools/extract-workbook.py
node tools/check-wording.mjs
```
