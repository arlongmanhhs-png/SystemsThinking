# Printing the workbook and the large sheets

The pages are built as HTML and rendered to exact-size PDFs with headless
Chromium, so that the layout, the type, and the colours come from the
EmpowerSDGs x THUAS design system rather than from a word processor.

## Files

- `sheet.css`: the shared print stylesheet. Tokens (navy `#17345E`, THUAS green
  `#9EA700`, cream `#F3F2EB`, grey `#223343`) and type (Outfit for
  display, Archivo for text, Archivo Narrow for labels) follow the design
  system's `tokens/` files, except that Outfit replaced the system's GT Walsheim
  Pro on 2 October 2026. Everything inside a sheet is sized in `em`, so
  one markup serves A4, A3, A2, and A1: `render.js` sets the sheet's font size
  per paper size, and the layout scales exactly.
- `workbook-phase-a.html`: the Phase A workbook, 28 pages. It is built by
  concatenating `wb-part-a.html`, `wb-part-b.html`, and `wb-part-c.html`, in that
  order, and the parts exist only to keep each file editable. A script at the end
  of the concatenated file numbers the pages from the order of the sections and
  fills every page reference in the book from the same numbering, so no page
  number is typed by hand. The page map is in the workbook design note.
- `workbook.css`: the workbook stylesheet, carrying symmetric 20mm side margins, folios,
  step tabs, the landscape wrapper for the actor table, and the graph grid.
- `step2-sketch.html`: the situation sketch, printed A1 for a group or A2 alone.
  It stays outside the book, so it keeps `sheet.css` rather than `workbook.css`.
- `render.js`: renders one HTML to one PDF at one paper size.
- `impose.py`: rearranges the A4 workbook onto A3 sheets for saddle stitching.
- `md-docx.js`, `overview-docx.js`, `phasea-docx.js`: the Word review documents.

The loose-sheet sources that the workbook replaced (`step1-framing.html`,
`step2-carry.html`, `step2-structured.html`) are in `../_superseded/src/`, beside
the PDFs built from them. They are history, not instruction: the current wording
of every field is in the step description files.

## Fonts

`sheet.css` expects a `fonts/` folder beside it holding the display face,
`outfit-latin-400-normal.woff2` and `outfit-latin-600-normal.woff2`
(`@fontsource/outfit`, SIL Open Font License), plus Archivo and Archivo Narrow
as `.woff2` (`@fontsource/archivo`, `@fontsource/archivo-narrow`). All of them
are in `prototype/design-system/assets/fonts/`, which the build copies.

Outfit replaced GT Walsheim Pro on 2 October 2026 (Ashley's decision), so that
print and screen use one face whose licence allows the web, and the exported
workbook matches the printed one. Bold headings use the 600 cut, which also
answers requests for 700, so nothing is synthesised.

## Rendering

```
npm install playwright @fontsource/archivo @fontsource/archivo-narrow
cat wb-part-a.html wb-part-b.html wb-part-c.html > workbook-phase-a.html
node render.js workbook-phase-a.html a4wb out/Workbook_PhaseA.pdf wb
node render.js step2-sketch.html a1 out/Step2_A1_sketch-sheet.pdf
```

Sizes: `a1 a2 a3 a4 a4wb a5` and the landscape forms `a1l a2l a3l a5l`. `a4wb` is
A4 at the workbook's slightly larger base size. The last argument is a body class:
`wb` for the workbook, and it is omitted for the large sheets.

The workbook is always rebuilt from the three parts. Editing
`workbook-phase-a.html` directly is lost at the next build.

## Colour and ink

The sheets are white paper with navy structure, a thin green accent, and cream
tint blocks. The design system's cream page colour is not printed as a full
bleed, because a classroom printer would make that expensive and grey. Writing
rules are hairlines in `#BDC2C7`, which photocopies without filling in.

## Printing it as a booklet

`impose.py` rearranges the A4 workbook onto A3 sheets, two pages per side, in
saddle-stitch order, so the stack can be folded in half and stapled on the fold.
A4 is exactly half of A3, so nothing is scaled and nothing is cropped.

```
python3 impose.py out/Workbook_PhaseA.pdf out/Workbook_PhaseA_booklet-A3.pdf
```

The page count is padded up to a multiple of four with blanks, which land on the
inside and outside of the back cover.

At the printer: **A3, double sided, flip on the SHORT edge, 100% (actual size,
not "fit to page")**. Landscape sheets flip on the short edge; the long-edge
setting turns every second side upside down. Then fold the stack in half and
staple twice on the fold.

This is for reading and handling, not for every revision. The A4 file is the one
that gets updated; the booklet is re-imposed when a printed copy is wanted.
