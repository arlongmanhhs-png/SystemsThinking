# Tools

Build and check tools for the printed workbook and the Phase A prototype. None of
this is the method; it is how the method's paper and screen forms are built and
checked.

## Setting up

```
cd tools
npm install
npx playwright install chromium
pip install pypdf pymupdf pillow
```

## Building the workbook

```
tools/print/build.sh <label>
INSTALL=1 tools/print/build.sh <label>
```

The first builds `print/src` into `tools/print/out/<label>/`: the A4 PDF, the A3
booklet, `measure.txt` (each page's free space and any overflow), and an image of
every page at 110 dpi. The second also copies the two PDFs to `print/` and the
joined `workbook-phase-a.html` to `print/src/`.

The book must stay at 28 A4 pages and 14 A3 sides, with no `OVERFLOW`, no missing
page references, and no dead lines. Where a page overflows, tighten that page in
`print/src/workbook.css` (its page-budget section) rather than moving content.
Look at every changed page as an image before installing.

## Checking the prototype

Run these from the `prototype` folder:

```
py -3 tools/extract-workbook.py
node tools/check-wording.mjs
node ../tools/tests/engine-test.mjs
NODE_PATH=../tools/node_modules node ../tools/tests/noforward-test.js "$(pwd)"
NODE_PATH=../tools/node_modules node ../tools/tests/p14-test.js "$(pwd)"
NODE_PATH=../tools/node_modules node ../tools/tests/fx-test.js "$(pwd)" ../tools/tests/out/fx
```

- `extract-workbook.py` regenerates the screen's wording from `print/src`. Run it
  after any change to the workbook sources.
- `check-wording.mjs` checks that every label on screen is printed, quoted, or
  marked provisional, and that the house rules hold. It expects 0 unaccounted and
  0 faults.
- `engine-test.mjs` runs the engine checks of 1 and 2 October.
- The three screen tests serve the prototype themselves and drive it in headless
  Chromium:
  - `noforward-test.js` checks that Step 1 never links ahead.
  - `p14-test.js` checks that page 16's section shows at Step 2, Exercise 9.
  - `fx-test.js` checks the fixes of 2 October.

  On Windows, pass the folder as `"$(pwd -W)"`.

## The banned-word scan

```
py -3 tools/tests/words.py .
```

Run it from the repository root. Hits are expected only in
`design/platform-phase-a.md` and `review/phase-a-review-log.md`.
