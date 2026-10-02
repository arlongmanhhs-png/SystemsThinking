---
file: design/basis.md
updated: 2026-10-02
status: decided, with one follow-on question open
source: Systems Thinking Process (Claude project), decision D1
---

# The design basis

**Decided 28 September 2026.** The design basis is derived from the work already
done rather than adopted from an open design system or from the plain THUAS house
style. The tokens, components, and visual rules come from the design system built
for EmpowerSDGs and THUAS.

**It is taken as a design structure, not as a brand.** The tool is not an
EmpowerSDGs product and is not a THUAS product; it draws on those visual
languages. What carries over is the visual structure: colour with meaning, the
systems semantics, type, shape, the canvas rules, states and motion, and the
component layer. What does not carry over is the branding: logos, the EMPOWERSDGs
wordmark, the SDG wheel motif, and programme-specific copy, all of which sit at the
setting level and appear only where a setting supplies them. The tool's own name
is not decided yet; its working title is "Systems Thinking Process".

The system lives outside this folder, at
`OneDrive - De Haagse Hogeschool/House Style/THUAS systems/empowersdgs`, with
`styles.css` as its entry point and `readme.md` as its statement of rules. It is
self-contained and can be moved into a project unchanged.

## What the system already settles

| Question a design basis has to answer | Settled by the system |
| --- | --- |
| Colour as meaning | Navy `#17345E` carries structure (top bar, step titles, outcomes, current step), THUAS green `#9EA700` carries action and progress, cream `#F3F2EB` is the page, THUAS grey `#223343` is the ink. Each accent has one job. Small text on green is navy, because white on green is 2.6:1 |
| Systems semantics, which is the hard part here | Already tokenised: driver and outcome node colours, reinforcing loops brown, balancing loops teal, leverage high, medium, and low, and a five-step navy to green scale for a results chain |
| Typography | Outfit for display, headings, step numbers, and quotes (in place of the system's GT Walsheim Pro since 2 October 2026, for a licence that allows the web; bold is its 600 cut); Archivo for text and UI; Archivo Narrow for overlines, tables, and canvas micro-labels |
| Shape and the canvas | THUAS squangles at a 6.26% corner offset, radius 0, no shadows except dialogs; a white sheet on a 24px dot raster, grey arrows, plus and minus chips shape-coded rather than colour-coded, and a selected loop recolouring its own arrows while the rest drops back to grey |
| States and motion | Hover goes one step darker rather than transparent, focus is a 2px teal ring, selected is a navy fill or a 4px green bar, 90 to 220ms, no bounce |
| The component set | `css/components.css` carries the `es-*` classes: buttons, tags, segmented controls, checks and radios, inputs, panels, notices, flags, quotes, title blocks, step lists and tiles, loop badges, sign chips, tables, meters, dialogs, and empty states |
| Tone of voice | THUAS voice: personal, active, plain, "you" for the participant and "we" for the programme; sentence case labels; imperative method instructions; Title Case, neutral, positively formulated variable names |

The system also ships a working app, the Systems Workbook, which implements the
Empower SDGs session 4 method end to end with a diagram canvas.

## What it does not settle

- **Print parity.** The A3 and A4 working sheets are ours to design. The system
  is a screen system and says nothing about them.
- **The tool's name.** Not decided. Since 2 October 2026 the working title is
  "Systems Thinking Process", with capitals, until there is an official name. A
  working title is not a product name, and until there is an official name,
  nothing in the interface should carry a product name, and no file should be
  named after one.

**The Systems Workbook app is a reference, not the starting point.** Decided
28 September 2026. The build starts from these specifications; the app is read for
the parts that already work. Candidates to carry over, to be confirmed when the
screens are written: the canvas behaviour (dot raster, arrow drawing, sign chips,
loop selection), the step list and step tiles, the inline nudges on variable
naming, and the loop badges.

Settled on 28 September: the system is taken as a design structure rather than a
brand, so the question of which of the three levels it sits at does not arise in
the form it was asked. The visual structure is core; the branding is setting.

## Flagged substitutions, carried from the system's own caveats

- GT Walsheim Pro is **replaced by Outfit** (SIL Open Font License) since
  2 October 2026, in print and on screen: the licence of GT Walsheim Pro for
  web use is not recorded, and its upright bold was missing, so bold was
  synthesised. Outfit's 600 cut is the bold.
- **Lucide** icons (CDN, pinned) stand in for an icon set that does not exist in
  the sources. Step and session numbers are type, not icons.
- The **Hague Humanity Hub logo** is a 300px raster. A vector is wanted.

## Still to be tested

The basis has been chosen against forms, which almost any system handles. It has
not been tested against the screens that break a weak one: the mapping in Steps 5
and 6, and the loop reading in Step 9. The system's canvas rules are promising
precisely there, and testing them is a task in the queue rather than an
assumption to carry. The first test, on the second drawing in Step 2, is recorded
below; the mapping and the loop reading are still to be tested.

## What the first canvas test found

The second drawing in Step 2 (Exercise 10), built in the prototype on
29 September 2026, was the first time the system's canvas rules met a real screen
(`prototype/FINDINGS.md`, section 2, question 6). The rules are written for
variables and loops, not for actors in bands, and what they did not cover had to
be invented. Recorded here on 2 October 2026 for whoever maintains the design
system, which lives outside this folder.

- The squangle node reads well for an actor.
- Selecting an element and dropping the rest to grey works.
- The dot raster disappears under the cream bands.
- Band labels collide with the actors placed over them, and do not dim with the
  rest when an element is selected.
- The system has no rule for the tray of unplaced actors, the flag on an actor
  placed outside its recorded layer, or the mark where two actors read the
  problem differently.
- The sheet has to be drawn close to its real size: at the first attempt, 1200
  units shrunk to about 930 pixels made the labels unreadable.

**Adopted as working rules for the first online version** (Ashley's decision of
2 October 2026), until someone placing a dozen actors by hand has used the
canvas:

- **Brown marks what the canvas flags.** An actor placed outside its recorded
  layer has a brown dashed outline and a small brown squangle flag. A
  disagreement mark is a brown dashed line between the two actors, with a
  squangle flag at its middle.
- **Leaving the drawing** is scrolling the drawing out of view after working in
  it, changing step, or pressing the button that leaves the drawing. The report
  of recorded dependencies with no line drawn comes then, never while the
  participant works. When the participant last left is kept under its own key,
  `sketch_second_left`, apart from the drawing itself.

The tray has no rule yet and stays as built. Two of the findings were faults of
the build, not rules, and the prototype fixed them on 2 October 2026. The dot
raster is now drawn over the band fills, so the raster shows on the whole sheet.
Each band keeps a strip at its top for its label, which no actor can enter, and
the band labels dim with the rest while an element is selected. To make room for
the strip, a band is now 140 units high instead of 120.
