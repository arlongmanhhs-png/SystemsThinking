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
`vendor/` and `design-system/`. Run this way, the case is kept in this browser's
local storage only; "Save the case to a file" in the footer writes it out as JSON,
and "Open a saved case" reads it back. "Save the read-through to a file", on the
read-through and on the case view once every step has passed, writes the whole of
Phase A as one HTML file (see "The file at the end of Phase A" below); run this way
the browser downloads it.

## Running it as an artifact

The same code is the claude.ai artifact (decided 2 October 2026). `artifact.html`
is the artifact's page: page content only, no document skeleton, since the host
wraps it in one. It is published with `src/`, `vendor/`, and `design-system/`
beside it at the same relative paths, declaring the capabilities `db`, `user`, and
`downloads` and no database rules. `index.html` and `artifact.html` load the same
`src/main.js`; nothing in `src/` knows which page loaded it.

In the artifact the case is kept where decision B02 says (built 2 October 2026):

- in the private area of the signed-in person's claude.ai account, through the
  artifact's database, for a member of the organisation with more than view-only
  access. The case follows the person to any device where the person signs in. No
  rule opens that area to anyone else, Ashley included;
- in this browser only, for anyone else, or when the capabilities resolve null.

The browser holds two kinds of slot: the browser-only slot, for whoever uses the
page without an account, and one slot per signed-in person, named by the account
id, with a record beside it saying whether the copy holds a change the account has
not confirmed and which case of the account's the copy descends from (reworked 2
October 2026, after review). In the artifact the page renders empty and read only,
with the footer saying the case is being read, until the capabilities resolve and
the account has said who is here: one person's copy is never shown to another,
nothing typed before then can be lost, and another person's slot is never read or
written over, signed in or out. Then a case held in the account is the case, unless
the own slot's copy is pending and descends from that very case (the account's
write did not finish last time), in which case the copy is carried into the account;
a pending copy that descends from an older case gives way to the account's, since
another device wrote meanwhile. An empty area receives the own slot's copy, or the
browser-only copy the first time the person signs in on that browser. When the
account cannot be read, the footer says so, with "Read the case again", and the
page stays read only until a read succeeds. "Save the case to a file" and "Save
the read-through to a file" go through the artifact's own save
prompt, which the person confirms each time; "Open a saved case" keeps its file
input. In the artifact a browser dialog never shows, so every question before a
case is replaced is asked on the page itself. The footer says where the case is
kept.

`src/engine/storage.js` holds the two backends behind one interface. The database
layout under `data/users/<id>/` is a head document (`case`) naming the documents
the case is made of, the case as JSON text in parts (`case-part-<stamp>-<k>`), and
every long string (a photograph) in parts of its own (`case-blob-<stamp>-<i>-<k>`),
each part under the 256 KiB a document may hold. A part is never rewritten once
written: a write puts new parts first and the head last, then deletes the parts the
new head no longer names, so a write cut short leaves the previous case whole and a
part the head names but which is missing only ever means a newer head is on its
way. Writes are debounced, one at a time per document, only on change, and a part
whose text has not changed keeps its name; the head is subscribed once, so a change
made on another device shows without clobbering one being typed here.

## What is where

| Path | Holds |
| --- | --- |
| `src/definitions/step1.js`, `step2.js`, `step3.js` | One declarative definition per step: the executable form of `steps/NN-name/spec.md`. `SCHEMA.md` says what a definition carries |
| `src/definitions/phase-a.js` | Page 25, what carries forward, as the case view's panel |
| `src/definitions/lists.js` | The closed lists, in one place, referenced by key |
| `src/definitions/workbook.js` | **Generated.** The workbook's wording, read from `print/src/wb-part-*.html` by `tools/extract-workbook.py`. Never edited by hand |
| `artifact.html` | The artifact's page: the same scripts and stylesheets as `index.html`, without a document skeleton |
| `src/engine/` | The case and its two backends (`store.js`, `storage.js`), saving a file through the artifact's save prompt or the browser's download (`files.js`), validation (blocking, stop, or warning, nothing else), and the derived step state |
| `src/views/StepScreen.js` | The one renderer that turns any step definition into a screen |
| `src/views/fields.js` | The field kinds |
| `src/views/ReadView.js`, `readthrough.js`, `ReadFile.js` | The read-through on screen; what it reads and how, shared with the file; and the file of the whole of Phase A, built as one HTML document from the same code and the same geometry |
| `src/views/save.js` | "Save ... to a file": the button that builds a file and offers it, and the notices a save can end in |
| `src/views/Sketch.js` | Step 2, Exercise 1: the first drawing, a free-form canvas of marks, short labels, and connectors, and its read-only rendering for the read-through |
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

**The first drawing** (Step 2, Exercise 1) is a free-form canvas beside the
photograph slot (decided and built 2 October 2026, B12). The canvas carries marks,
short labels, and connectors, and nothing else: no bands, no tray, no structure,
nothing checked, and nothing read from the case. The marks are the four page 13 names,
read from the field's definition. A tap or click on the sheet writes a label there;
a mark's button, then a tap or click, places the mark; a connector joins any two
things; anything drags, moves with the arrow keys, and is removed with its button
or the Delete key; the last change can be undone. The drawing is stored as compact
JSON under `sketch_first_canvas` (marks, labels, connectors, with pixel
coordinates), null when empty, with no cap on a label or on the drawing (two caps
set on 2 October 2026 were removed the same day after review: a build sets no
threshold of its own). Either the drawing or a photograph, with the confirmation,
completes Exercise 1, and the read-through draws the drawing.

## The file at the end of Phase A

"Save the read-through to a file" (decided and built 2 October 2026, B03) writes
the whole of Phase A as one self-contained HTML file, `read-through-<date>.html`,
readable offline in any browser and printable from that browser. It holds the
case's name and the date of saving at the top, every exercise of Steps 1 to 3 in
the book's order with its number and title, each step's state and the date it
passed, the Step 3 graphs as inline SVG, the first drawing as inline SVG or the
photograph embedded, the second drawing as counts, a list of lines, and the sheet
drawn, and page 25 last. Inline CSS with A4 print styles, no script, every piece of
participant text escaped. Outfit, Archivo, and Archivo Narrow are embedded as
base64 (five faces, about 96 KB, from `design-system/assets/fonts`), with a plain
stack where the files cannot be read; GT Walsheim Pro is never referenced. The
screen and the file read the case through the same code (`readthrough.js`) and
draw from the same geometry, exported by `Graph.js`, `Sketch.js`, and
`Arrangement.js`, so the file says nothing the screen does not, and the screen's
own words carry their dotted underlines into the file. Nothing calls
`window.print()`: the person prints from the browser the file is open in.

## Decided, built, and still provisional

Nothing decided on 2 October 2026 waits for a build: where a case is kept (B02),
the first drawing (B12), and the file at the end of Phase A (B03) are all built.
Two things about the file stay provisional:

- its format. The question is open with Ashley (`core/open-questions.md`); the
  format recommended to her is built, and her verdict can still change it. The
  page-for-page PDF in the printed workbook's style is the aim for the hosted
  version and is not built;
- its words. "Read through", "Save the read-through to a file", the line on the
  case view saying what the file is, and the date of saving at the top are the
  screen's own wording, marked provisional until Ashley approves the controls rule
  in `CLAUDE.md`.

## Publishing the artifact

`artifact.html` is the page. It is published declaring the capabilities
`{db:{}, user:{}, downloads:true}` and no database rules, with these files beside
it at the same relative paths (nothing from `tools/`, and neither `index.html`,
`README.md`, `FINDINGS.md`, nor `design-system/COPIED.md`, which the page never
loads):

- `src/app.css`, `src/html.js`, `src/main.js`
- `src/definitions/index.js`, `lists.js`, `phase-a.js`, `step1.js`, `step2.js`,
  `step3.js`, `workbook.js` (and `SCHEMA.md`, documentation the page never
  fetches, so it may be left out)
- `src/engine/ctx.js`, `files.js`, `state.js`, `storage.js`, `store.js`,
  `validate.js`
- `src/views/App.js`, `Arrangement.js`, `CaseView.js`, `Exercise.js`, `Graph.js`,
  `Passage.js`, `ReadFile.js`, `ReadView.js`, `Sketch.js`, `StepScreen.js`,
  `Warnings.js`, `fields.js`, `readthrough.js`, `router.js`, `save.js`, `text.js`
- `vendor/react.production.min.js`, `vendor/react-dom.production.min.js`,
  `vendor/htm.module.js`, with `vendor/LICENSE-react` and `vendor/LICENSE-htm`
- `design-system/styles.css`, `design-system/css/components.css`,
  `design-system/tokens/base.css`, `colors.css`, `fonts.css`, `layout.css`,
  `type.css`
- `design-system/assets/fonts/archivo-latin-400-italic.woff2`,
  `archivo-latin-400-normal.woff2`, `archivo-latin-500-normal.woff2`,
  `archivo-latin-600-normal.woff2`, `archivo-latin-700-normal.woff2`,
  `archivo-narrow-latin-400-normal.woff2`, `archivo-narrow-latin-500-normal.woff2`,
  `archivo-narrow-latin-600-normal.woff2`, `archivo-narrow-latin-700-normal.woff2`,
  `outfit-latin-400-normal.woff2`, `outfit-latin-600-normal.woff2`, with
  `LICENSE-archivo-OFL` and `LICENSE-outfit-OFL`

The file at the end of Phase A reads five of those font files at the moment of
saving, relative to `src/views/ReadFile.js`, so the fonts have to be published at
that path for the file to carry them; without them the file still saves, with the
plain stack.

## After a change to the workbook

```
python tools/extract-workbook.py
node tools/check-wording.mjs
```

## The checks

From this folder, with `CHROMIUM_PATH` pointing at a Chromium for the screen tests:

```
node tools/check-wording.mjs
node ../tools/tests/engine-test.mjs
NODE_PATH=../tools/node_modules node ../tools/tests/noforward-test.js "$(pwd)"
NODE_PATH=../tools/node_modules node ../tools/tests/p14-test.js "$(pwd)"
NODE_PATH=../tools/node_modules node ../tools/tests/fx-test.js "$(pwd)" ../tools/tests/out/fx
NODE_PATH=../tools/node_modules node ../tools/tests/artifact-test.js "$(pwd)"
NODE_PATH=../tools/node_modules node ../tools/tests/canvas-test.js "$(pwd)"
NODE_PATH=../tools/node_modules node ../tools/tests/export-test.js "$(pwd)"
```

`artifact-test.js` serves `artifact.html` inside a skeleton like the host's, with a
fake `window.claude` whose `use()` resolves to in-memory `db`, `user`, and
`downloads` namespaces shaped as the capability type definitions describe them,
or to null: that is how the account (the two kinds of slot, a pending copy, a torn
read, another person's slot, the read-only state while the capabilities resolve),
the file save, a damaged file, and the phone width are tested here, since the real
host cannot be driven from a test. `canvas-test.js` drives the
first drawing: placing, connecting, moving, and removing with the mouse, the
keyboard, and a touch tap, the hit targets, persistence across a reload, what
completes Exercise 1, and the sheet scrolling inside its own container at 400px.
`export-test.js` builds the file at the end of Phase A for `tools/tests/sample-case.json`
(a case that has passed all three critical checks) and for a partly done case,
opens the file in a browser of its own, and checks what it holds and how it is
offered: no script, the print styles and the embedded faces, every exercise in
order with the states and dates, the graphs and both drawings as SVG, the
photograph, page 25 last, text with markup in it read as text, the browser
download locally, `downloads.save` with a name ending `.html` in the artifact, the
notices for a declined save and for no downloads, the case view offering the file
only once Phase A is complete, and nothing scrolling sideways at 400px.
