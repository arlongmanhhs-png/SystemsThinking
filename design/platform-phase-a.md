---
file: design/platform-phase-a.md
updated: 2026-10-02
status: a build prompt, not a settled design. The specification inside it is refinable.
source: Systems Thinking Process (Claude project)
---

# The Phase A prototype

## What this document is

Two things at once, deliberately.

It is a **prompt**: it can be handed whole to a build, and it says what to make,
what to read first, what to obey, and when to stop and ask. It is also the
**specification** of the thing it asks for, so it is the file that gets corrected
as the prototype teaches us what the specification got wrong. Where the prototype
and this document disagree after a build, this document is what gets edited.

The prototype is being built now, before Phase B is written, for one reason: the
screen will force questions back into the workbook, and answering them while
Phase A is the only phase on paper is far cheaper than answering them with five
phases printed. Section 11 lists the questions expected. Finding others is the
point.

**Decided 2 October 2026: Phase A goes online now, as a claude.ai artifact**
built from the prototype and the step specifications, so this document is also
the specification for that artifact. The decisions of 2 October are written into
the sections they change: what the artifact offers at the end of Phase A and who
reads a case (section 1), the screen versions of printed instructions (section 2),
the working title (section 3), where a case is kept (section 4), the case view
(section 5), the instructions (section 6), the first drawing and the second
drawing's working rules (section 7), which steps a revision marks (section 8),
the screen's own wording (section 9), hosting, version control, and the first
reading (section 10), and the questions they settle (section 11).

---

## 1. What is being built

One participant working one case through Phase A, in two views.

**The case view** is the home screen. It shows Phase A as three steps and, beside
them, what the case has produced so far: the problem definition, the desired
change and the position, the boundary, the layers and who holds the decision, the
two descriptions that disagree, the three sentences, and the system problem
definition. The case view fills as the work proceeds. It is the screen equivalent
of page 25 of the workbook, and whether it stays that narrow was one of the
questions this prototype existed to answer: it stays narrow (decided 2 October
2026, section 5).

**The step screens** are where the work happens: Step 1, Step 2, and Step 3, each
one running its exercises in the order the workbook runs them, ending in its
critical check.

Both drawings in Step 2 get a **canvas**, described in section 7. They are two
different canvases. The prototype built the second first, with a placeholder and a
photograph slot for the first, so that the rest of Phase A could be seen working
before the larger piece of drawing work was started; the first was built on
2 October 2026. Either a drawing on the first canvas or a photograph of a drawing
made on a large sheet completes Exercise 1 (section 7).

**At the end of Phase A, a file of the whole phase.** Decided 2 October 2026. The
artifact offers the student a file of the "Read through" view: every exercise of
Steps 1 to 3 in the book's order, with its number and title, each step's state and
the date the step passed, the Step 3 graph, and page 25 at the end. The second
drawing appears in the file as counts and a list of lines, unless the drawing
itself is drawn into the file, which is extra work. The view's heading, "Read
through", is provisional and waits for approval. The file is not laid out page for
page like the book. A page-for-page export is the aim for the hosted version: the
hosted version builds a PDF of the completed workbook in the same style as the
printed book, because the same exercises are completed on paper and online
(Ashley, 2 October). The page-for-page export is not built.

**Built 2 October 2026, in a provisional format.** The format of the artifact's
file is an open question with Ashley (`core/open-questions.md`); the format
recommended to her is built, and her verdict can still change it. The file is one
self-contained HTML document of the read-through, readable offline in any browser
and printable from that browser: inline CSS with A4 print styles, the case's
content as static markup with no script, every piece of participant text escaped,
and the three faces (Outfit, Archivo, Archivo Narrow) embedded from the
repository's own font files, about 96 KB of the file; a plain stack stands in
where the faces cannot be read. It holds the case's name and the date of saving at
the top, every exercise of Steps 1 to 3 in the book's order with its number and
title, each step's state and the date it passed, the Step 3 graphs as inline SVG
from the same geometry as the screen's, the first drawing as inline SVG or the
photograph embedded, the second drawing as counts and a list of lines and, since
the sheet's geometry made it cheap, drawn as well, and page 25 at the end. The
wording is the screen's, read through the same code as the read-through, with the
screen's own words marked in the file as they are on screen. The file is offered
with "Save the read-through to a file" on the read-through at any time, and on the
case view once every step has passed its critical check; in the artifact it goes
through the artifact's own save prompt, locally through the browser's download.
Nothing in the file is a link, and nothing prints from a button: the person prints
from the browser the file is open in.

**A lecturer reads a case only when the student hands the case in.** Decided
2 October 2026. The student decides what to hand in and when (the saved case file
or the end-of-Phase-A file) through the course's own hand-in. A lecturer reads the
end-of-Phase-A file directly, or opens a case file with "Open a saved case" in the
lecturer's own copy of the artifact, which replaces whatever case that copy holds.
A hand-in is not a sign-off: the ticks stay the student's own claim, and the tool
gains no role. There is no lecturer view in the first online version. Ashley wants
one in a later version, to be built then, and nothing built now may make a
lecturer view hard to add.

Nothing else, and no Phases B to E.

**One person, one case, is not a prototype simplification.** It is what the
platform is for. The workbook is the group instrument: a group works a case
together in a room, and the large sheet and the drawing spread are theirs. The
platform is for an individual working a case alone. There are no shared sessions,
no collaborative editing, no group accounts, and nothing that assumes two people
are looking at the same screen, now or later.

**Finished** means a person can work a real case from an empty Step 1 to a
completed Phase A, go back and change an earlier answer, see what that revision
marked for review, and read the whole of Phase A on one screen at the end. It does
not mean polished.

---

## 2. Read these first

The prototype is built from the specification, not invented. In order:

1. `core/principles.md`. Fourteen rules. They override anything in this document.
2. `core/critical-checks.md`. What a critical check is, what it does not do, and
   how returns work.
3. `steps/01-framing/spec.md`, `steps/02-boundary/spec.md`,
   `steps/03-behaviour-over-time/spec.md`. The fields, checks, states, closed
   lists, and returns for each step. These are the build's source of truth for
   every field.
4. `core/glossary.md`. Every term the interface prints.
5. `design/basis.md`. Where the visual language comes from, and what does not
   carry over from it.
6. `print/src/wb-part-a.html`, `wb-part-b.html`, `wb-part-c.html`. The built
   workbook. Read these for the exact participant-facing wording of every
   instruction, prompt, and label. **The printed wording is the wording the screen
   uses**, with the exceptions below. Where a step description and the workbook
   differ, see section 11.
7. `CLAUDE.md`. The writing rules, which apply to interface copy as much as to
   prose.

**The exceptions.** On screen there is no book and no large sheet, and the screen
does not use every row or place a printed page names. So a step definition may
carry a screen variant of an instruction or of a critical check line, and four
do, all in Step 2 (decided 2 October 2026): Exercise 1's instruction, printed "on
a large sheet, not in this book"; Exercise 3's rule on page 13, whose "on row 3"
names a row the screen does not use; Exercise 10's instruction on page 18, whose
"Across both pages" and "on the right" name a spread the screen does not have;
and the seventh Step 2 criterion on page 24, which names a large sheet and this
book, so that a screen user could not tick the criterion honestly. A variant is
added only where the printed words name a physical thing the screen does not
have, or a row or place on the page the screen does not use, never to reword an
instruction someone thought could be clearer. The printed form stays in the
definition beside each variant so the difference is visible rather than lost,
and the wording of the three variants added on 2 October is the screen's own
until Ashley approves it. If a build finds a further instruction that needs a
variant, that is a finding to report under section 12 rather than a licence to
start rewriting.

If the folder is not available, stop and ask for it rather than inventing fields.
Guessed field names become permanent the moment something is built on them.

---

## 3. The rules that override everything

From `core/principles.md`, the ones a build can break without noticing:

**Completeness is enforced. Quality is never judged.** The tool checks that a
field is filled, a choice is made, a count is respected. It never scores an
answer. A participant may pass a critical check with a weak answer, and that is
intended: later steps expose it. Nothing in this build ranks, grades, scores,
rates, or suggests an improvement to what a participant has written.

**Forwards is checked, backwards is free.** A step opens when the one before it
is complete. Going back to any earlier step needs no permission at any point and
destroys no work.

**Recheck, do not redo.** Revising a step marks the steps that depend on it for
review. It does not erase them. The mark says what changed. Reviewing and
deciding that nothing has to change is a valid outcome and is recorded as one,
with the date.

**One thing at a time.** Material appears when it is needed, not laid out in
advance. A step screen does not show its whole contents at once.

**The participant defines the structure; the tool constrains only its form.**
Layers, actor types, and the case's own vocabulary are written by the
participant. The tool requires only that every actor sits in one layer and
carries one type. The tool never fills a field in, and never adds an item to a
participant's list silently.

**Paper and platform are one instrument, in two settings.** The printed page and
the screen use the same zones, the same order, and the same wording, so a
participant who has filled the book recognises the screen. They are not used in
the same place: the book is worked by a group in a room, the screen by one person
alone. Nothing in this build makes the screen a group tool.

**The working title is "Systems Thinking Process", and nothing carries a product
name.** Decided 2 October 2026: the artifact is titled "Systems Thinking Process",
with capitals, until the tool has an official name. A working title is not a
product name: no wordmark, no logo, no programme branding, and no file named after
a product.

**Every criterion that can fail names where it sends the participant.** A dead
end is a design fault.

And from `CLAUDE.md`, for every word the interface prints: British English;
Oxford comma; no em or en dashes, so use parentheses, commas, hyphens, or colons;
"Step" capitalised wherever it carries a number; and the words this project does
not use, which are "gate" and "gated" (the concept is the critical check), "bear"
in the sense of bearing on something, "cashed", and "stakeholder" (everything
inside the system is an actor).

---

## 4. The architecture, which is the part worth getting right

**The step screens are generated from declarative step definitions. They are not
written by hand.**

There are thirteen steps. Three of them are being built now. Every one of the
thirteen has the same shape: a sequence of numbered exercises, each holding
fields of a small number of kinds, ending in a list of self-checked criteria,
declaring what it carries forward and what sends the participant back to it. A
build that hand-codes three screens will hand-code ten more, and each one will
drift from the specification in its own way.

So: one step definition per step, as data. One renderer that turns any step
definition into a screen. The definitions are the executable form of the `spec.md`
files, and where they disagree with those files, the files are corrected or the
definitions are, deliberately, never silently.

A step definition carries: the number, the phase, the title, what the step is
for, which steps it depends on, which steps a revision of it marks for review,
its exercises in order, its critical check criteria, what it carries forward, and
its returns both inward and outward.

An exercise carries: its number as the workbook numbers it, its title, where it
happens (on screen, on a large sheet away from the screen, or across the drawing
spread), the exact printed instruction, and its fields.

A field carries: its key, its kind, its printed label, its hint, whether it is
required and under what condition, its options where it draws on a closed list,
and its counts and caps.

Twelve or so field kinds cover the whole of Phase A, and probably the whole
process: a line of text, a block of text, a year, a single choice from a closed
list, several choices from a closed list, a confirmation, a repeating table with
typed columns, a reference to a row the participant has already created (an
actor, a layer), a derived value assembled from other fields, an image, a series
of points, and a set of tick boxes. Build the kinds, not the screens.

**Closed lists live in one place** and are referenced by key: the seven resources,
the three exclusion marks, the three evidence labels, the six shapes, the three
roles in authority, responsibility, and accountability, the four admission tests,
and the six suggested actor types (suggested, never imposed). Each list carries
the long label, the short column form where the actor table needs one, and the
gloss the workbook prints.

**Validation returns severity, not a verdict.** Two severities only. A blocking
check is mechanical and concerns presence, count, or a value being set. A warning
never blocks and is dismissed with one line, which is stored. The instrument-word
flag in Step 1 and the actor count past twelve are warnings. Nothing is ever a
blocking check on the content of a sentence.

**State.** One case per person. Where the case is kept was decided on 2 October
2026:

- **In the artifact's own database, where the student can save there.** A student
  who is signed in to claude.ai as a member, with more than view-only access, of
  the organisation the artifact belongs to has a private area of the database, and
  the case is kept there and follows the student to any device where the student
  signs in. No rule opens a student's area to anyone else, Ashley included: a
  lecturer reads a case only as a file the student hands in (section 1).
- **In the browser's local storage, for anyone else**, as in the prototype. A
  cleared or different browser starts empty.
- **In a file, in both cases.** "Save the case to a file" and "Open a saved case"
  stay. A saved file is the student's own backup, the way to hand a case in, and
  the way to carry a case into the hosted version later, since neither the
  browser's storage nor the artifact's database carries over to a website of its
  own. In the artifact, saving a file goes through the artifact's own save prompt,
  which the student confirms each time. The footer keeps its three buttons, and its
  provisional wording about "this browser" changes to say where the case is kept.
  The file of the whole phase at the end of Phase A (section 1) is offered the same
  way, and is a reading of the case, not a copy of it: "Open a saved case" reads
  the case file, never the read-through.

Students log in: the hosted version, built once the platform is complete, has its
own way of logging in, chosen when the hosted version is built.

**Built 2 October 2026.** One codebase serves both: `prototype/index.html` runs
locally and keeps the browser and the file only; `prototype/artifact.html` is the
artifact's page, with the same scripts published beside it, and keeps the case in
the account where the person can save there. The two backends sit behind one
interface in `prototype/src/engine/storage.js`, and nothing in the engine or the
views knows which holds the case. The browser holds two kinds of slot: the
browser-only slot, for whoever uses the page without an account, and one slot per
signed-in person, named by the account id, with a record beside it saying whether
the copy holds a change the account has not confirmed and which case of the
account's the copy descends from (reworked 2 October 2026, after review). In the
artifact the page renders empty and read only, with the footer saying the case is
being read, until the capabilities resolve and the account has said who is here:
so one person's copy is never shown to another, nothing typed before then can be
lost, and another person's slot is never read or written over. Then a case held in
the account is the case, unless the own slot's copy is pending and descends from
that very case (the account's write did not finish last time), in which case the
copy is the newer one and is carried into the account; a pending copy that
descends from an older case gives way to the account's, since another device wrote
meanwhile and the later writer wins, as it does while the page is open. An empty
area receives the own slot's copy, or the browser-only copy the first time the
person signs in on that browser, so nothing is lost. Writes are debounced, one at a
time per document, only on change, and the case is split across documents so that
a photograph never pushes one over the limit a document may hold; a document is
never rewritten once written and the head names every document the case is made
of, so a write cut short leaves the previous case whole, and a torn read only ever
means a newer head is on its way: the page reads again, and after four attempts
says the case could not be read, with "Read the case again", staying read only
until a read succeeds. The head document is subscribed once, so a change made on
another device shows without clobbering one being typed here. A person who cannot
write there (view-only access) stays in the browser, in that person's own slot,
with a saving notice. In the artifact a browser dialog never shows, so the
questions before a saved case or a new case replaces the current one, and before
the first attempt is copied over what is written in Step 1, Exercise 6, are asked
on the page itself. The footer says where the case is kept. `prototype/README.md`
describes the database layout.

Store the field values, the critical check ticks with their dates, the revision
log, and the review marks raised on other steps. Derive everything else: a step's
state (empty, in progress, critical check open, passed, reopened) is computed from
those, never stored as a separate flag that can fall out of step with the fields.

---

## 5. The case view

Three step cards and a panel.

**A step card** shows the number, the title, the state, and the one line the step
has produced so far: the problem definition for Step 1, the boundary sentence for
Step 2, the system problem definition for Step 3. An empty step shows what it is
for instead. The boundary sentence is written at the phase close, so the Step 2
card shows the step's purpose until the sentence is written there, as the
prototype already does (decided 2 October 2026). A step marked for review shows
what raised the mark and which step raised it. Clicking the card opens the step.

The states, visually: empty is outlined, in progress carries a green progress
bar, critical check open is cream-filled, passed carries a green rule and the
date, reopened carries a navy mark and the reason. Never a tick that looks like
approval: nobody signs these off.

**The panel** is what carries forward. Page 25 of the workbook has seven zones,
and the prototype starts with those seven so that the screen and the page can be
compared honestly. Two of the seven are not straight copies of anything, and the
build should notice this rather than paper over it: "the boundary, in one
sentence" and "the exclusion most likely to be wrong" are written at the phase
close and exist nowhere in Step 2. **Both stay at the phase close** (decided
2 October 2026): they are written on page 25 and in the panel, neither becomes a
Step 2 field, and the workbook does not change. Page 25's nine keys
(`boundary_sentence`, `exclusion_most_likely_wrong`,
`exclusion_most_likely_wrong_note`, and the six copies `carry_problem`,
`carry_change_position`, `carry_layers_decision`, `carry_disagreement`,
`carry_sentences`, and `carry_spd_shape`) get a specification for page 25 and
entries in `process.yaml`.

The panel shows the agreed version, as the page says: a copy the participant makes
on request, editable here, with the field it was copied from shown beside it so a
divergence is visible rather than silent.

**What the panel does not show**, although the step specifications say all six
carry forward: the actor list, the resource ticks, the dependency table, the
event strip, the evidence labels, and the two futures. On paper they stay in the
step's own pages, because page 25 is one page. **The panel stays narrow, as
built** (decided 2 October 2026): page 25's seven zones, with the six further
things as a list of links to the exercises that hold them. Page 25 and the rest of
the workbook do not change, and no key changes. Page 25 is the only summary, and
Step 2 keeps no carry-forward page of its own.

---

## 6. The step screen

The workbook puts the instruction on the left page and the work on the right, so
a participant reads and writes without turning anything. A screen has no facing
page, and translating that split is the single largest design decision in this
prototype.

**Build it this way.** Each step's instruction pages become a short passage shown
once, before the exercises they belong to, exactly where the book puts them: Step
2 has three such passages, before Exercises 1 to 4, before Exercise 5, and before
Exercises 6 to 9. Having been read, each passage stays available, reachable from
the exercises it governs without leaving the exercise, and closes again. It is
never a modal.

**The online version keeps this arrangement only** (decided 2 October 2026).
The prototype also built the alternative, each instruction collapsed above the
exercises it concerns, with a switch in the top bar between the two. The switch
and its three provisional labels ("Instructions", "Before the exercises", and
"Above each exercise") go, and so does the build's mapping of printed sections to
exercises, with its faults on page 12. Each instruction page appears once, whole,
before the exercises it faces in the book, and stays one click away from each of
those exercises. Where the book prints guidance after the exercise it serves, the
screen does the same: page 22's evidence guidance still comes after Exercise 4.
The screen then inherits the workbook's own page-by-page check against the rule
of 1 October: an instruction page does not point ahead to exercises that are not
on the working page opposite it.

Exercises run down one column in the workbook's order and numbering. An exercise
appears once the one above it has content, and everything already written stays
open for editing. Disclosure here is about not showing a participant an empty
wall; it is not a lock, and nothing is ever locked.

**Both drawings in Step 2 are canvases, and section 7 describes them.** Both are
built: the second on 29 September 2026 and the first on 2 October 2026.

**The critical check sits at the foot of the step**, and opens when the required
fields are present. Its criteria are statements the participant ticks, each
stored with the date. Beside each criterion that can fail, print where a "no"
sends the participant, and make that a link. Passing is confirming. Nothing
congratulates anyone.

---

## 7. The canvases

Step 2 draws the case twice, and the two drawings are different instruments. The
first is a dump and the second is an arrangement, which is the whole reason the
step asks for both. Two canvases, therefore, not one used twice.

**Both are built.** The second was built first, so that the rest of Phase A could
be seen working, with the first as a placeholder beside the photograph slot in the
interim; the first was built on 2 October 2026, and the photograph slot stays
beside it as the alternative.

### Exercise 1, the first drawing: free-form, or a photograph

Everything the participant knows about the case, put down fast. Pictures and
symbols rather than sentences, phrases rather than paragraphs, who is in conflict
with whom, marks for money, for conflict, for a blockage, and a question mark for
what is not known. Nothing on it has to be tidy.

So the canvas for it carries marks, short labels, and connectors, and nothing
else. No bands, no tray, no structure, no validation, and nothing read from the
case data, because at Exercise 1 there is no case data: the layers, the actors,
and the descriptions are all defined later in the step. There is nothing to check
this drawing against and nothing should try.

One thing is lost and worth saying plainly rather than designing around. On paper
this exercise is done standing up, at a wall or a flat table, usually by a group.
For one person at a screen the standing up and the group both go, and what
remains is the speed and the absence of structure. Those two are what the canvas
has to protect.

**A canvas or a photograph, and either one completes Exercise 1** (decided
2 October 2026). A build makes the free-form canvas described above. A
participant who drew on a large sheet adds a photograph instead. Exercise 1 is
complete with the confirmation that the drawing exists and either a drawing on the
canvas or a photograph. The Step 2 specification and `process.yaml` change to
match: `sketch_first_canvas` is required only where no photograph is added.

**Built 2 October 2026** (`prototype/src/views/Sketch.js`). The sheet is white on
the 24px dot raster, as wide as its container and growing past whatever is on it,
scrolling inside its own container at phone width. The marks are the four page 13
names, read from the field's definition in the page's words, each drawn as a small
glyph. A tap or click on the sheet writes a label there; choosing a mark's button
and then tapping or clicking places that mark, and the button stays chosen for the
next; "Draw a connector" joins any two things with two taps or clicks. Anything
drags with mouse, touch, or pen, moves with the arrow keys, and is removed with its
button or the Delete key; the last change can be undone. The sheet and every thing
on it take keyboard focus, with a visible ring. A selected thing recolours while the
rest drops back to grey. Nothing is validated and nothing is read from the case.
The drawing is stored as compact JSON (marks, labels, connectors, with pixel
coordinates) through the ordinary field mechanism, null once empty, and nothing
caps a label or the drawing: a build sets no threshold of its own, the sheet grows
past what is on it, and the account splits the case across documents whatever its
size (two caps set on 2 October 2026 were removed the same day after review). The
read-through draws the drawing from the stored marks, labels, and
connectors, or shows the photograph, and the file of the whole phase (section 1)
draws the same things from the same geometry.

### Exercise 10, the second drawing: structured, and built now

The same case drawn again, arranged by what the step has since defined: the
actors in bands by layer with the widest scope of decision at the top, a line
between two actors where one needs a resource from the other, and a mark where
two actors read the problem differently. On paper it is the double-page spread.
It is not a tidied copy of the first drawing, it is a re-drawing, and the screen
version keeps that.

**It is an arrangement surface, not a drawing tool.** Everything it needs already
exists as data by the time the participant reaches Exercise 10: the layers from
Exercise 3, the actors with their layer and type from Exercise 5, the
dependencies from Exercise 7, and the conflicting descriptions from Exercise 8.
The canvas uses all of that, and it uses it to check the participant rather than
to do the work for them.

- **The bands are drawn for the participant**, one per layer, in order, widest
  scope at the top, each labelled with the layer's name. The ordering is not a
  choice on the canvas: it was made in Exercise 3.
- **The actors arrive in a tray, unplaced.** Each carries its name and its type.
  The participant drags each one into a band. Nothing is placed automatically,
  because the placing is the exercise, and an actor list that arranges itself
  teaches nothing.
- **An actor may be dropped into a band that is not its recorded layer.** Allow
  it, and flag it. That is a finding rather than a mistake: either the placement
  is wrong or Exercise 3 or Exercise 5 is, and deciding which is a return inside
  the step.
- **The participant draws the lines.** Drawing one between two actors where a
  dependency is recorded confirms the line and shows which resource. Drawing one
  where nothing is recorded asks whether the dependency belongs in Exercise 7. A
  recorded dependency with no line drawn is reported when the participant leaves
  the exercise, never while they are working, because a running checklist would
  turn the drawing into a form. Leaving is defined by the build and adopted as a
  working rule for the first online version (2 October 2026): scrolling the
  drawing out of view after working in it, changing step, or pressing the button
  that leaves the drawing. When the participant last left is kept under its own
  key, `sketch_second_left`, apart from the drawing itself, so that leaving is
  never mistaken for a change to the answer; the key goes into the Step 2
  specification and `process.yaml` as a record of leaving.
- **The disagreement marks work the same way**, against the conflicting pair from
  Exercise 8.
- **It can be tidied.** Pieces move until the arrangement reads. Positions are
  kept. This is the whole reason the canvas is worth building.

**What neither canvas is.** Neither is a causal loop diagram: no polarities, no
loops, no delays, no stocks. That canvas belongs to Steps 5 and 6, it is a
different instrument again, and nothing here should be built to anticipate it.
Neither is a layout engine: nothing auto-arranges, auto-routes, or tidies on the
participant's behalf. "Tidied" means the participant can move things until the
picture reads, not that the tool arranges the picture.

**Visual rules** come from the design system's canvas layer: a white sheet on a
24px dot raster, grey lines, no shadows, and a selected element recolouring while
the rest drops back to grey. Bands are cream tint blocks with the layer name set
in Archivo Narrow. Building the second canvas was the first test of the system's
canvas rules against a real screen. What the test found, the working rules adopted
for the first online version on 2 October 2026 (the brown dashed line and the
squangle flag for an actor placed outside its recorded layer and for a
disagreement mark, and the definition of leaving above), and the two display
faults, which the prototype fixed on 2 October 2026, are recorded in
`design/basis.md`. Whether the canvas holds for someone placing a dozen actors by
hand is still open (section 11, question 5).

---

## 8. Going back, and what a revision does

Every working page in the workbook ends with a strip reading "Revised on ______
because ______". The screen keeps that, and does more with it.

When a participant changes an answer in a step that has passed its critical
check, the step goes to reopened, the change is written to the revision log with
the date and the reason, and every step that declares a dependency on it is
marked for review. Revising Step 1 marks Steps 2 and 3 in Phase A, and would mark
every later step except Step 6 once they exist. Revising Step 2 marks Step 3, and
would mark Steps 4 to 8, 10, 12, and 13 (`core/critical-checks.md`). The marks
say what changed.

A marked step is not blocked and nothing in it is erased. The participant opens
it, looks, and either revises or confirms. Confirming without editing is recorded
with the date, because "I looked and it still holds" is a finding.

Named return triggers are in `core/critical-checks.md` and in each step's
`spec.md`. A trigger reopens the fields it names, not the whole step. Step 3's
outward returns are the commonest in the process and should be visible on the
Step 3 screen, not buried: the line that cannot be drawn, the line that is not the
problem, and the period that reaches outside the boundary.

---

## 9. The design

The visual language is the EmpowerSDGs and THUAS design system, taken as a design
structure and not as a brand. It lives outside this folder at
`OneDrive - De Haagse Hogeschool/House Style/THUAS systems/empowersdgs`, with
`styles.css` as its entry point. `design/basis.md` records what it settles.

Copy the stylesheets into the prototype's own folder rather than reaching across
folders at runtime, and leave a note in that folder saying the copies are copies
and where the originals live.

What carries over: navy `#17345E` for structure, which is the top bar, the step
titles, and the current step; THUAS green `#9EA700` for action and progress;
cream `#F3F2EB` for the page; THUAS grey `#223343` for the ink. Each accent has
one job. Small text on green is navy, never white, because white on green is
2.6:1. GT Walsheim Pro for display, headings, and step numbers; Archivo for text
and interface; Archivo Narrow for overlines, tables, and micro-labels. THUAS
squangles at a 6.26% corner offset, radius 0, no shadows except on dialogs.
Hover goes one step darker rather than transparent, focus is a 2px teal ring,
selected is a navy fill or a 4px green bar, 90 to 220ms, no bounce. The `es-*`
component classes carry buttons, tags, segmented controls, checks and radios,
inputs, panels, notices, flags, quotes, title blocks, step lists and tiles,
tables, meters, dialogs, and empty states.

What does not carry over: logos, the EmpowerSDGs wordmark, the SDG wheel motif,
and programme-specific copy. Those sit at the setting level and appear only where
a setting supplies them, and no setting supplies one here.

Two things to carry over from the workbook rather than from the system: the step
tab, which tells a participant where they are without a heading, and the hairline
rule, which separates without shouting.

Tone: THUAS voice. Personal, active, plain. "You" for the participant. Sentence
case for labels, the imperative for instructions, and Title Case for variable
names, which are neutral and positively formulated.

**The screen's own wording**, the words the workbook never printed, is approved in
two tiers (decided 2 October 2026). Strings that say something about the
participant's work (warnings, field labels, findings, return and review messages,
and the canvas reports) are Ashley's to approve one by one. Controls (buttons,
navigation, saving notices, and empty states) are approved as a block under a
short rule in `CLAUDE.md`, "Wording the screen's controls", built on the tone above
and the house rules, so that later builds can word controls without stopping. The
rule is a draft until Ashley approves it. The wording check covers the screen
files as well as the step definitions: every screen string is sorted into one
tier or the other in `prototype/tools/wording-tiers.json`, and the check fails on
a screen string that is not sorted or that is listed and no longer found. Until a
string is approved, the dotted underline that marks the string provisional stays.

**Page references** (decided 2 October 2026). The workbook refers to its pages
("Three other forms, and when each is needed, are on page 10"; page 25's "Decided
on page 11"), and on screen there are no pages. On screen only, a page reference
names the Step and the Exercise, or the screen's own name for the place, and the
printed workbook keeps its page numbers. The whole phrase is replaced, not the
number, so the sentence still reads as English: "on page 10" reads "in the Step 1
instructions, under <the printed heading>", "on pages 13 and 17" reads "in Step 2,
Exercises 3 and 6", "from page 13" reads "from Step 2, Exercise 3", "Step 1, page
11" reads "Step 1, Exercise 6", and a page number in a heading ("Step 1 · page
10") goes. Where the sentence is about one thing, the exact exercise that holds the
thing is named, worked out from the step definitions' fields; where it is about a
page as a whole, the page's range of exercises. The glossary's "p. 12" names the
instructions by heading; a term set out on a page the screen does not show (the
front matter) names nothing. Each place stays a link to where it is on screen. The
mapping is one data table, `prototype/src/definitions/screen-refs.js`, keyed by the
page and the place the reference occurs in, with a fallback to the page's exercise
range so that a reference added to the workbook later never shows a bare page
number; `workbook.js` stays generated from the printed pages and is not edited.
Every wording shown in place of a printed one is the screen's own, marked
provisional and listed in `prototype/tools/wording-tiers.json` under the method
tier. A sentence whose only job is about paper ("the page each item was decided on
is printed beside it") is not reworded by a build: it stays as printed, and the
question of how it reads on screen is Ashley's (`core/open-questions.md`).

---

## 10. Technology

**The prototype**, run locally, has no backend, no database, no accounts, and no
network calls at runtime. Run as the artifact, the same code reaches the
artifact's own database and save prompt through the capabilities the host serves,
and nothing else (section 4, "State").

Plain ES modules, vendored into the prototype folder so nothing is fetched from a
content delivery network. React with htm is a reasonable choice, because it gives
components without a build step. A framework that needs compiling is not worth it
for a prototype that has to be read and argued with.

ES modules do not load from `file://`, so the prototype runs with one command,
`python3 -m http.server`, from its own folder. Say so in its README. If that one
command is a problem, the fallback is a single HTML file with classic scripts and
no modules, which opens by double-clicking, at the cost of an architecture that
cannot grow to thirteen steps.

It lives in `prototype/` inside this folder. It is not part of the print
pipeline and shares nothing with it.

**Online, decided 2 October 2026.** Phase A goes online now as a claude.ai
artifact, built from the prototype and the step specifications. The case is kept
in the artifact's own database where the student can save there, which needs the
student signed in to claude.ai, and in the browser otherwise, with file save and
open in both cases (section 4; built 2 October 2026). The platform is hosted
properly, on a website of its own, once the platform is complete, and students log
in to the hosted version
in a way chosen when the hosted version is built. Neither the browser's storage
nor the artifact's database carries over to that website; a saved case file does.

**Version control, decided 2 October 2026.** The project goes into a private
repository on a hosted git service, with the working copy outside OneDrive, when
the repository is set up later. Nothing changes yet: for now the artifact is
enough, to see what the platform will look like and to try it out (Ashley,
2 October), and the folder stays in OneDrive without version control.

**The first reading, decided 2 October 2026.** Ashley works a real case of
Ashley's own in the artifact, from an empty Step 1 to a completed Phase A, and
writes what was found into `prototype/FINDINGS.md` and into section 11. The
specification for the online version is written after that reading.

If the prototype survives its first reading, it converts to a Vite project
without rewriting components, and the step definitions move unchanged. That is
the reason for the architecture in section 4.

---

## 11. What this prototype exists to settle

### Questions the prototype should answer, all of which touch the workbook

The first build reported on all six in `prototype/FINDINGS.md`, section 2. The
first reading (section 10) is Ashley's, on a real case, and what it finds is
written into `prototype/FINDINGS.md` and here.

1. **Does the instruction-and-work split translate?** If the passage-before-the
   exercises arrangement works, the book's grouping of instructions into three
   pages per step is confirmed as the right grouping. If it does not, the book's
   grouping is an artefact of paper and both forms want rethinking. **Settled by
   decision for now, 2 October 2026:** the online version keeps "Before the
   exercises" only (section 6), the book's grouping of instructions stands, and
   Phase B's instruction pages follow the same pattern.
2. **Is the case view page 25, or more than page 25?** Page 25 carries seven
   zones. The step specifications say six further things carry forward, which page
   25 leaves in the steps' own pages because it is one page. The screen has no such
   limit. If the screen's case view is right and wider, page 25 is under-carrying
   and the workbook wants a second summary page or a different selection.
   **Settled 2 October 2026:** the case view stays narrow, as built (section 5),
   and page 25 is the only summary.
3. **Are the remaining caps rules, or what fitted on the page?** Fifteen actor
   rows is a stated rule and six event cells was settled on 29 September as a soft
   cap. **Settled 1 and 2 October 2026:** the other counts are what the page
   prints, not caps. The workbook prints twelve inside rows, six two-line outside
   entries with a line for each reason, five description rows in Step 2's
   Exercise 8, and twelve dependency rows, and a line under the tables on pages 13
   and 17 sends further rows to the notes pages. On screen the inside, outside,
   and dependency lists have no cap, and the descriptions warn past five
   (`steps/02-boundary/spec.md`).
4. **Should the boundary sentence and the most-likely-wrong exclusion be fields in
   Step 2?** Both are written at the phase close on page 25 and exist nowhere in
   Step 2. Writing them on screen at the close will show whether they are a
   summary or a missing exercise. **Settled 2 October 2026:** both stay at the
   phase close, and neither becomes a Step 2 field (section 5).
5. **Does the second canvas hold?** Section 7 is a design, not a settled one. The
   three things to watch: whether placing a dozen actors by hand is work or
   drudgery; whether flagging an actor dropped outside its recorded layer produces
   findings or noise; and whether reporting the undrawn dependencies at the end
   reads as a check or as a telling-off. The question that used to follow this
   one, whether the paper spread is still doing anything, is settled: it is, the
   spread is where a group draws, and the canvas is what one person uses alone.
   **Still open**, for a reading by someone placing a dozen actors by hand. The
   build's own rules for the canvas (the definition of leaving,
   `sketch_second_left`, and the brown dashed line with a squangle flag) were
   adopted as working rules for the first online version on 2 October 2026
   (section 7).
6. **What does the design system's canvas layer do when it meets a real screen?**
   `design/basis.md` records that the system was chosen against forms, which almost
   any system handles, and has never been tested against a canvas. This is that
   test. Report what it shows even where it has nothing to do with Phase A.
   **Reported** by the first build, and recorded with the adopted working rules in
   `design/basis.md` on 2 October 2026.

### Step 3 is fully settled, and one part of it is easy to build wrongly

The four questions that stood open on Step 3 were all answered on 29 September
2026, so nothing in that step waits on anyone. One of the four changed the design
rather than confirming it, and a build that skims will get it backwards:

**What is measured is fixed. How it is measured is chosen.** The thing the graph
is about is the one the problem definition names, and Step 3 cannot change it:
changing the thing is a return to Step 1. The measure is a separate field and it
belongs to the participant, because one thing can usually be counted several ways
and the one to take is whichever count has a history that can be drawn. So
Exercise 1 has three fields, not one: the thing measured, copied from Step 1 and
not editable here; the measure, written by the participant; and one line saying
why that measure. A named thing for which no measure can be found at all is not a
quantity, and that is the first return out of Step 3.

The other three were confirmations. Six shapes is the closed list. The two
futures are optional. Evidence is labelled rather than ranked, and no measured
series is required, because requiring one would rule out most of the cases this
process is for.

### Decisions the prototype must still not take for itself

- The tool's official name. There is none yet. The working title is "Systems
  Thinking Process" (section 3), and the interface carries no other name.
- Which elements of the Systems Workbook app carry over. That is marked up when
  the mapping screens are written, not now.

### Where the workbook and the step descriptions disagreed

Thirteen places, all resolved on 29 September 2026. Nothing here is a live
question; the table is kept so that a build reading an uncorrected copy of a step
description knows which version stands.

**Seven were wording.** The rule applied was that the workbook was written later
and is what a participant actually reads, so the workbook stands and the step
description was corrected to match.

| Where | What stands, from the workbook |
| --- | --- |
| Step 2, Exercise 11, first sentence | What this system produces, whether or not anyone intends it |
| Step 2, Exercise 11, second sentence | Where the disagreement is |
| Step 2, critical check, descriptions | They differ in a way that matters |
| Step 2, critical check, the sketch | Drawn on a large sheet, drawn again in this book |
| Step 2, critical check, exclusions | Written down, with a reason and a mark of F, O, or I |
| Step 3, critical check, the event strip | What has been tried is on the event strip, with the years |
| Step 3, critical check, the shape | The shape is named, with a line saying why the graph is that shape |

**Six were substance**, and each was decided rather than corrected.

| Where | What was decided |
| --- | --- |
| Step 2, Exercise 8 | The requirement that an inferred line name what would show it wrong is **dropped**. It was not clear enough to ask of a participant, and "read from what?" now carries the whole burden of keeping an inference honest |
| Step 2, Exercise 4 | **Five types is the only hard rule.** Three is advice, not a floor. One type per three actors is a warning, not a block |
| Step 2, Exercise 5 | The four admission tests **go on the printed actor table too**, as four numbered columns between the type and the resources, so the screen and the page ask the same thing |
| Step 3, Exercise 3 | Six event cells is **a soft cap, not a rule**. Over a period reaching back to the last major change or ten years, six is enough for most cases. A seventh event on screen raises a warning asking the participant to keep the six that mattered |
| Step 3, Exercise 5 | The printed prompt **stands as it is**. Asking why this shape rather than the next most likely was deliberate to leave out: it assumes a participant can rank the shapes they did not choose, and ranking them is not part of the work |
| Step 3, Exercise 7 | **Two boxes, one further quantity.** The left box holds the two futures, the right box holds one further quantity. Not two further quantities. The printed wording has been corrected |

**One was terminology.** The Step 3 description said "variable" throughout,
including in its critical check and its sentence template, while the workbook and
the glossary both say "quantity". The same rule applies: **the screen prints
"quantity"**, and the description has been corrected.

## 12. When the build is done
---


Report back three things, and nothing else.

**What the specification got wrong.** Every place the `spec.md` files were
incomplete, contradictory, or impossible to build from. This is the most valuable
output of the exercise and it is the reason the specification and the prompt are
the same document.

**What the screen forced.** Every place where making the thing work on screen
required a decision the paper form had not had to take, listed against the
questions in section 11, including the ones nobody predicted.

**What the screen made easy that paper made hard, and the reverse.** Specifically:
the returns, the revision marks, the derived subset in Exercise 7 of Step 2, the
assembled problem definition, and the assembled system problem definition. Each of
those is mechanical on screen and manual on paper, and the gap between the two is
where the two forms will drift apart first.

Do not report on how the code is structured unless something in the architecture
of section 4 turned out to be wrong.
