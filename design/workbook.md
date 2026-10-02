---
file: design/workbook.md
updated: 2026-10-02
source: Systems Thinking Process (Claude project), session of 28 September
---

# The workbook

Decided 28 September 2026. The paper form of the process is a printed workbook,
not a set of loose sheets and prompt cards.

## The shape

A4 portrait, printed double sided. Every step has an **instruction page on the
left and a working page on the right**, so everything needed to fill a page is on
the page facing it. Nothing has to be remembered from an earlier step or looked
up in a separate object. This is why the prompt cards are gone: the prompts are
the left-hand page.

A spread of two facing A4 pages is A3 landscape, so a worksheet too wide for one
page uses either the spread or a single page turned sideways. The actor table in
Step 2 is a sideways A4 page, and the instruction page facing it says to turn the
book.

## The large sheets

Two things stay outside the book, printed large and separately.

The **situation sketch** is drawn on A1 for a group, or A2 alone. It is meant to
be chaotic, and a bound page would stop that. What goes in the book is the
translated version: the same case arranged by the layers, actors, and views the
step has since defined, drawn across the spread on pages 18 and 19, with the three
sentences beside it.

The **working copies** are the main worksheets printed large, stripped of the
explanation, for a group to argue over. The group fills the large sheet, crosses
things out, and then one person copies what the group agreed into each book. This
is the same A3-then-A4 discipline settled for Step 1, with the A4 now living in
the book.

## The page map

Phase A runs to 28 pages, which is seven A3 sheets printed duplex and folded. Page
numbers are generated at build time from the order of the sections in
`print/src/workbook-phase-a.html`, and every page reference printed inside the
book is generated from the same source, so adding or moving a page renumbers the
folios and the cross-references together. Nothing is typed by hand, and nothing
outside the book should quote a page number without checking it against this map.

| Page | What is on it |
| --- | --- |
| 1 | Cover |
| 2 | How this workbook works |
| 3 | The thirteen steps |
| 4 | What systems thinking is |
| 5 | What a system is |
| 6 | Glossary |
| 7 | Phase A opener |
| 8 | Step 1, before you write |
| 9 | Step 1, exercises 1 to 5 |
| 10 | Step 1, before exercises 6 to 8 |
| 11 | Step 1, the agreed problem definition |
| 12 | Step 2, before you begin |
| 13 | Step 2, exercises 1 to 4 |
| 14 | Step 2, before exercise 5 |
| 15 | Step 2, exercise 5, the actor table (sideways) |
| 16 | Step 2, before exercises 6 to 9 |
| 17 | Step 2, exercises 6 to 9 |
| 18 | Step 2, exercise 10, the drawing spread, left |
| 19 | Step 2, exercise 11, the drawing spread, right |
| 20 | Step 3, before you draw |
| 21 | Step 3, exercises 1 to 4 |
| 22 | Step 3, before exercises 5 to 7 |
| 23 | Step 3, exercises 5 to 7 |
| 24 | The Phase A critical checks |
| 25 | Phase A, what carries forward |
| 26 | Notes |
| 27 | Notes |
| 28 | Back cover |

Odd pages are right-hand pages and even pages are left-hand pages, which is what
the instruction-left, work-right arrangement in `## The shape` depends on. Any
page added to Phase A has to be added in pairs, or every page after it changes
side.

## Margins and binding

Side margins are **symmetric, 20mm on both edges**, rather than mirrored. That is
deliberate for a self-printed first run: one PDF then works however it is bound
and whether it is printed duplex or single sided. Nothing important comes within
20mm of either edge, and no ruled line crosses the gutter.

20mm clears every binding likely to be used:

| Binding | What it needs | Clear at 20mm |
| --- | --- | --- |
| Two-hole or four-hole punch, ring binder | about 20mm, holes 6mm at 12mm from the edge | Yes |
| Wire-o | about 12mm | Yes |
| Comb | about 18mm | Yes |
| Saddle-stitch | nothing at the fold, but creep on a thick book | Yes |
| Perfect binding | about 20mm, because pages curve into the spine | Yes, just |

`workbook.css` carries `--inner` and `--outer` so the margins can be made
mirrored later, for professional binding, without touching any page.

## Going back

A book shows one spread at a time, and this process sends people backwards. Two
things answer that. Every working page ends with a **"revised on, and why"**
strip, so a return is written rather than erased, which is what the rule about
revision marking dependent steps asks for. And each phase ends with a **summary
page** on which everything the later steps need is copied, so that is the only
page anyone has to turn back to. Tear-outs were considered and rejected: too
fragile, and impractical to produce on an office printer.

## The platform

The platform should be able to export a workbook-shaped PDF at the end of a case,
so that the screen track and the paper track stay the same artefact. Cheap to
design in now, awkward to retrofit.

Decided 2 October 2026: the same exercises are completed on paper and online, so
a participant can export a completed workbook of the case as a PDF in the same
style as the printed book. The hosted version builds that export. The Phase A
artifact, which goes online first, offers a file of the whole of Phase A in the
book's order at the end of the phase, not yet laid out page for page
(`design/platform-phase-a.md`, section 1).

The screen form of Phase A is specified in `design/platform-phase-a.md`, which is
both the build prompt for a prototype and the specification that prototype is
built from. The prototype was built on 29 September, before Phase B was written,
because the screen raises questions the paper form did not have to answer, and
answering them while Phase A is the only phase in print is cheap. That document's
section 11 lists the questions expected to come back into this one.

## Building it

The book is built step by step, and pages are added as each step is specified. It
does not have to be finished to be usable: Phase A can be printed and taught while
Phase B is being written. The name on the cover waits until the tool has an
official one. The working title, "Systems Thinking Process", is not that name, and
the covers stay as printed.

The workbook comes first and runs to the end of the process before anything else
is built. The large classroom versions follow, once the finished book can be read
phase by phase and it is clear which worksheets are worth printing large. The
digital version is last. The reason for that order is that the workbook is the
only artefact that holds the whole process in one place, so it is the cheapest
place to find out that a step is wrong. Phase A is the exception, decided
2 October 2026: it goes online now, as a claude.ai artifact. The order still holds
for Phases B to E.
