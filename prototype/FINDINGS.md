---
file: prototype/FINDINGS.md
updated: 2026-09-29
status: the report owed under section 12 of design/platform-phase-a.md, from the first build
---

# What the first build reports back

Three things, as section 12 asks, and nothing else.

How this was found. The prototype was built from the specification folder and
tested with a sample case (social housing waiting times in The Hague) worked from
an empty Step 1 to a Step 3 with its critical check open, including a revision of a
passed Step 1, the review mark it raised on Step 2, and a return from Step 3 to
Step 1. Six independent reviewers then read the build against the step
specifications, the workbook, the principles, and the code, and a skeptical
verifier re-checked every finding: 144 were raised, 130 confirmed, and every
confirmed defect in the build has been fixed. The findings below are the ones that
are about the specification rather than the build.

Nobody but the builder has used the screen. Every observation about how the screen
feels is one reader's, and is marked as such where it appears.

Keys the build had to coin, all used by the prototype and therefore, by the rule in
`steps/02-boundary/spec.md`, permanent unless changed before anyone relies on them:
`problem_agreed`, `suit_chronic_note`, `suit_history_note`, `suit_attempts_note`,
`suit_size_note` (Step 1); `dependencies[].needed_by` (Step 2);
`no_nearest_quantity` (Step 3); `boundary_sentence`,
`exclusion_most_likely_wrong`, `exclusion_most_likely_wrong_note`, and the copies
`carry_problem`, `carry_change_position`, `carry_layers_decision`,
`carry_disagreement`, `carry_sentences`, `carry_spd_shape` (page 25). The proposed
keys of Steps 2 and 3 are used as proposed. `process.yaml` has not been updated with
any of them: that is left for the decision below.

---

## 1. What the specification got wrong

### Step 1: the specification describes a screen the workbook replaced

`core/open-questions.md` already says the Step 1 specification predates the
workbook. Built against the workbook, the differences are these.

1. **The layout.** The specification has one screen of six zones and a foot, with
   size and suitability opening under the problem definition and the
   representation before the position. The workbook has eight exercises on two
   working pages, with the position as Exercise 5 and the representation as
   Exercise 7, after the rewrite. The build follows the workbook. The
   specification's screen section wants rewriting in the workbook's order.

2. **There are two problem definitions, and the specification has one.** The
   workbook asks for a first attempt in five slots (Exercise 2) and an agreed
   rewrite in free lines (Exercise 6), "so that both are visible", and page 25
   carries the rewrite forward. The specification has only the five slots. The build
   coins `problem_agreed` for the rewrite. The consequence is the most important
   finding of the build: **Step 3's "thing measured" is copied from
   `problem_thing`, the first attempt's slot, but both Step 3 returns send the
   participant to page 11 to rename the thing in the rewrite, which has no slot for
   it.** A thing renamed where the workbook says to rename it never reaches Step 3.
   The build shows the agreed definition beside the thing measured so the difference
   is visible. The specification has to say which definition the thing comes from,
   and send the return there. Giving Exercise 6 the default form's five slots does
   not settle it, because Exercise 6 is where the other three forms are written, and
   their sentences do not fit the default slots.

3. **The problem form moved.** The specification puts `problem_form` beside the
   slots and defaults it to the first form. The workbook asks for it in Exercise 6,
   with none ticked. The build follows the workbook and pre-selects nothing, since
   the tool never fills a field in.

4. **The size verdict does not exist on paper.** `size_verdict` and `size_note`,
   with only "workable" opening the critical check, are in the specification and
   in `process.yaml` (`critical_check_value: workable`), and the Step 4 return
   trigger reopens them. The workbook asks about size as the fourth yes or no
   question in Exercise 3. The build treats them as retired, and the Step 4 return
   reopens `suit_size` and its note instead.

5. **Suitability.** The specification has five yes or no questions, each with a
   note, and gives no keys for the notes (coined). The workbook asks four with a
   "How you know" line, and a separate disqualifier with no line, asked positively:
   "Could a known procedure solve this, if someone chose to?". The key
   `suit_noprocedure` names the opposite, so the build stores the answer in the
   key's own sense and translates on screen. Either the key is renamed or that
   translation stands. The workbook also says "Choose a different topic", which is
   stronger than a warning that can be dismissed with one line: which is meant?
   The specification's one wrong-tool warning has no wording anywhere, and cannot
   serve the size question, because a "no" there means narrowing or widening the
   problem (page 10), not a new topic. The build splits it in two.

6. **The desired change has a year on screen and none on paper.** The specification
   requires a year with the long horizon; the printed boxes have no year line. Kept,
   with the label marked provisional. Either the workbook gains a year line or the
   specification drops it.

7. **The representation.** The specification allows up to three descriptions, each
   with an omission (`rep_omission`), and `process.yaml` says `repeats: 3`. The
   workbook asks for one, prints no omission line, and puts the description and
   what it takes for granted in one box. The build asks for one, splits the box
   across the two keys, and keeps the omission as an optional provisional field.
   Where invisible power is looked for in Step 7 depends on the omission, so its
   place on paper wants deciding.

8. **The critical check.** The specification's six criteria differ from the
   workbook's five in wording and in content. The workbook's are built. Page 24
   has no criterion about the representation, which the specification has.

9. **The instrument-word warning** is quoted in the specification as "that sounds
   like a solution, not an outcome". It uses a bare "outcome" for the desired
   change, which the glossary does not allow, and opens with a "that" that refers to
   nothing on screen. The specification also says the words are moved to the parked
   list; the tool never edits an answer, so the build offers a copy.

10. **The parked list** is hidden until Step 7 with only a count in the
    specification, and printed in full as Exercise 8 in the workbook. The build shows
    it in Step 1 and the count elsewhere.

11. **Returns into Step 1.** The specification's table lacks Step 3's second return
    (the line can be drawn, but it is not the problem). Its state diagram lists
    returns from Steps 3, 4, and 7, while its table also has one from Step 2. The
    workbook sends both Step 3 returns to page 11; the specification and
    `process.yaml` reopen only the Exercise 2 slots.

12. **The situation** is "about 400 characters", checked for length, in the
    specification, and two printed lines in the workbook. No length check is built.

### Step 2

13. **A dropped requirement is still printed.** The 29 September decision dropped
    the requirement that an inferred line name what would show it wrong. Page 16
    still says it: "it names what it is read from, and what would show it wrong". The
    screen prints the page, so it currently tells the participant to do something
    the specification removed, with no field to do it in.

14. **The type ratio is still presented as a cap.** Five types is the only hard
    rule and the ratio is a warning (29 September), but the glossary, the
    description's term, `process.yaml`, and the Exercise 4 line on page 13 all print
    "no more than one type per three actors" with the same weight as the five.

15. **Two layers.** The glossary and the 28 September decision allow two layers
    with a line saying why the case has no third scope of decision. The
    specification and the workbook say three to five. The build blocks at two.

16. **Definitions that differ in substance** between the workbook, the glossary,
    and the description, which "the workbook stands" does not settle because they
    are not wording. The layer is "the same scope of decision-making or
    implementation" (workbook) or "the same scope of decision" (glossary). The
    boundary test is "would including this change what you would do" (workbook) or
    "change what the analysis concludes" (glossary). The workbook's inside test has
    one clause where the description has three, and the missing one, "on the
    receiving end", is the test behind the critical check on affected actors.
    "Fixed" is "during the period being analysed" (workbook, specification) or
    "within the horizon of the desired change" (description). "Irrelevant" is
    "would not change what you would do" or "does not touch the thing named".

17. **The dependency subset cannot be derived as specified.** Its second half,
    "anyone who holds something those actors need", cannot be read off Exercises 5
    and 6, which record what each actor holds but not what anyone needs. The only
    source is Exercise 7 itself. The build reads it from Exercise 7's rows. The
    specification should say how the second half is established.

18. **"Who needs it" is free text, so the canvas has nothing to check a line
    against.** Section 7 has a line confirmed where a dependency is recorded, and
    that needs to know who needs the resource. The build adds `needed_by`, a
    reference to an actor, beside the free text, optional because some who need a
    resource are not on the actor list. Only rows with `needed_by` set can confirm a
    line, feed the report on leaving, or bring a holder into the subset.

19. **Requirements the screen cannot check.** `spoken_for_by` is required "for a
    group named by its position", and nothing records which rows those are. An actor
    "cannot be saved" without an admission test ticked, and a screen row has no
    save: the build enforces the rule at the critical check.

20. **Sharing a reading.** `shares_with` marks an actor as sharing a recorded line
    "rather than given a line of their own", while the row's other columns are
    required. The build asks a sharing row for nothing else and does not count it
    towards the two descriptions. The specification should say so.

21. **Fields the screen asks for that the page does not** (principle 13):
    `spoken_for_by` and `resource_note` on the actor table, the three
    `*_actor` fields in Exercise 6, `shares_with` and `conflicting_pair` in
    Exercise 8, and the six suggested actor types.

22. **The three patterns of authority, responsibility, and accountability** do not
    cover authority or responsibility recorded as nobody.

23. **Warnings without thresholds.** A type holding one actor, a type holding
    "almost everything", and the column 2 read-back have no stated threshold. The
    build's: from three actors, all but one actor from six, and from three actors.

24. **Returns.** Step 2's specification lists no outward return; `process.yaml` has
    one (the actors who matter all sit outside the boundary). And revising Step 2
    marks Steps 3, 4, 7, 8, 12, and 13, while its outputs also go to Steps 5, 6, and
    10, which `core/critical-checks.md` does not list as using Step 2. Either those
    three depend on Step 2 or the carries-forward table is wrong.

25. **Stale records.** `process.yaml` still says Step 2's specification is
    unwritten and lists no keys for Steps 2 and 3, and lacks the returns from
    Step 3. The Step 2 specification says the description words three criteria
    differently, and it no longer does. The description puts the dependencies before
    the allocation (the workbook reverses them), says Exercise 8 starts from the
    Step 1 description (neither specification nor workbook carries it in), and says
    the sketch is "restructured" where section 7 says the second drawing is a
    re-drawing.

26. **The revision strip.** `revised_on` and `revised_because` sit at the foot of
    every working page. On screen one log per step does the work, with the date, the
    reason, and what changed, so the keys are not used.

### Step 3

27. **The thing measured** (see 2 above).

28. **The no-history finding has no field.** A "not happened yet" case with no
    nearest quantity is "surfaced as a finding at the critical check". The build
    coins `no_nearest_quantity` and shows it there.

29. **The description's order** puts the system problem definition ninth, after
    the futures, and says "Items 1 to 6 are the step", which leaves the required
    system problem definition outside the step. The workbook and the specification
    make it Exercise 6, before the futures.

30. **Smaller disagreements.** The event types in the specification include
    "changes of government with a policy attached"; the Exercise 3 hint does not.
    `shape_because` is two lines on paper and "a line" in the description and the
    criterion. The period reason is "which" in the specification and "why that
    period rather than a shorter one" in the description. "The words this line is an
    estimate" are printed by the tool in the specification and written by the
    participant in the workbook (the build does both). The worksheet has no line for
    `nearest_quantity_because` or the interval, both of which the specification
    requires, and the specification's "yearly by default" gives no list of
    intervals.

31. **The "what the system checks" column** lists content (the period reaches back
    to the last major change; a finer interval would not change the shape) beside
    the specification's own statement that the checks are mechanical. The column
    wants splitting into what the system enforces and guidance.

32. **Unworded warnings.** The seventh event raises a warning "asking the
    participant to keep the six that mattered", worded nowhere. So is the build's
    check that the second year of the period comes after the first.

33. **The freehand line** in the specification is not built: points only.

### The prompt itself

34. Section 11, question 3 says to build what the page does with the three open
    caps, while the Step 2 specification says the inside list has no cap. The two
    instructions contradict each other.

35. Section 5 has the Step 2 card show "the boundary sentence", which section 11,
    question 4 says exists nowhere in Step 2.

36. Section 4's architecture held, with three gaps. The field kinds listed missed
    a number, a span of years, and the page's own shapes (the sentence form, the yes
    or no grid, the two boxes), which the definition has to carry. Definitions need
    small functions for conditions and derived values, so "declarative" means data
    with functions in it. And the state section 4 lists (values, ticks, revision log,
    marks) was not enough: the build also stores pending edits on a passed step, the
    returns raised, each dismissed warning with what it was dismissed about, and when
    each step last changed. The step state itself is still derived, never stored.

### Printed words that name paper

Section 2 allows exactly one screen variant. These also name something the screen
does not have. They are printed on screen as they stand, and each is a candidate
for a variant:

- Critical check, Step 2: "drawn on a large sheet, drawn again in this book".
- Exercise 10: "Across both pages" and "Write the three sentences on the right"
  (Exercise 11 is below on screen).
- Page 24: "sends you back to the page named beside it", while page 24 names no page
  beside any criterion. The screen gives each criterion its return address, derived
  by the build.
- Page 11: "rather than crossing out the first one".
- Exercise 3 of Step 3: "Six cells".
- Page 14's "Turn the book sideways", in the "Opposite" line, which the screen drops
  with every other "Opposite" line.

---

## 2. What the screen forced

### Against the questions in section 11

**1. Does the instruction-and-work split translate?** Both arrangements are built,
switchable in the top bar. "Before the exercises": each instruction page shows in
full where the book puts it, closes to a bar once read, and opens beside the
exercise from an Instructions button (in place, on a narrow screen). "Above each
exercise": each exercise carries, collapsed, the sections that concern it. Building
the second arrangement meant saying which section serves which exercise, and that
exposed where the book's grouping is paper's. The eight rules on page 8 serve
Exercise 6 on page 11. "How many actors", printed before Exercises 1 to 4, serves
Exercise 5. Step 3's evidence guidance is printed after Exercise 4, which it serves.
And Exercises 1, 4, and 8 of Step 1 have no instruction section at all; their
instruction is the hint printed on the working page. Tentatively, the three-page
grouping is partly an artefact of paper; a participant has not yet said which
arrangement reads better. The screen also had to decide when a passage has been
read: an "I have read this" button, which collapses the passage and never withholds
the exercises.

**2. Is the case view page 25, or more?** Built narrow: the seven zones, each a
copy the participant makes and can edit, with the source beside it and a flag when
the copy differs. The six further things are listed behind a link. Copying turns
zones 4 and 5 (the layers with who holds the decision; the pair with its actors)
from structured answers into text, and zone 2 joins two answers. Not decided.

**3. Caps.** Built as rules: fifteen actors (with a warning past twelve), three to
five layers, five types, two decisions, and six events as a soft cap. Built as
explicit absences: the inside and outside lists (eight rows printed), the
descriptions (four printed; the warning comes past five, from the specification),
and the dependency rows (six printed). In the sample case four actors in the subset
already produced five dependency rows, so six is unlikely to hold as a rule.

**4. The boundary sentence and the exclusion most likely to be wrong.** Written on
the case view, as page 25 has them. The exclusion can be picked from the Step 2
list, which paper cannot offer. Written at the close, both read as a summary, but
the Step 2 card then has no line of its own until Phase A is nearly over. That
leans towards the boundary sentence being a Step 2 field.

**5. Does the second canvas hold?** Not yet answered: in testing, two actors were
placed by hand and the rest were loaded, so whether placing a dozen is work or
drudgery is untested. Placing one, by dragging or by clicking the actor and then
the band, is quick. The flag for an actor placed outside its recorded layer was
tested by placing the affected group with the municipality on purpose; it fired,
and named the choice between Exercise 3 and Exercise 5, but whether it produces
findings or noise needs someone placing actors for real. The report on
leaving forced a definition of leaving, which the build takes as scrolling the
drawing out of view after working in it, changing step, or pressing "Leave the
drawing". The report shows under the drawing and at the head of Exercise 11, and
reads as a list of what is recorded and not drawn; whether it reads as a check or a
telling-off needs a participant. The line check only works because the build added
a structured "who needs it" (finding 18).

**6. The design system's canvas layer on a real screen.** The system's canvas rules
are written for variables and loops, not actors in bands, and what they did not
cover had to be invented:

- The dot raster disappears under cream bands.
- Band labels collide with the actors placed over them.
- The system has no rule for the tray, the flag on a misplaced actor, or a
  disagreement mark. The build uses a brown dashed line with a squangle flag.
- The squangle node reads well for an actor.
- Selecting an element and dropping the rest to grey 20 works, but the band labels
  do not dim with it.
- The sheet has to be drawn close to its real size: at the first attempt,
  1200 units shrunk to about 930 pixels made the labels unreadable.

### Decisions the paper form never had to take

- **What a revision is.** Any change to a step that has passed. A change undone,
  back to what it was, is no revision. The strip on paper is one act; on screen a
  revision is two, recording the reason and then reconfirming the critical check.
- **What a return is.** On paper, turning back a few pages. On screen, an event that
  is raised by a click, names the fields it reopens, and stays open until the step
  is reconfirmed or the participant records that they looked and it still holds.
- **A change elsewhere can undo a pass.** Choosing "not happened yet" in Step 1 makes
  a Step 3 field required. A passed Step 3 then shows as reopened, with that reason,
  rather than silently falling back.
- **When a step opens.** Once the step before has passed at least once. An earlier
  step reopened later never closes one already opened.
- **What "revised" means on a mark** raised on a step that never passed: changed
  after the mark.
- **Disclosure has exceptions.** An exercise rightly empty (Exercise 7 when nobody
  is asked) must still let the next one appear, and an idea parked from Exercise 4
  must not reveal Exercises 5 to 8.
- **A dismissed warning belongs to the answer it was written about**, and returns
  when the answer changes.
- **Glossary terms are links** (page 6 promises it), linked at their first
  occurrence in each passage or hint.
- **Page numbers** were kept as printed and made links, so that a participant with
  the book recognised them. Since 2 October 2026 a page reference on screen names
  the Step and the Exercise, or the screen's place, in the screen's own words
  (`src/definitions/screen-refs.js`), and the book keeps its numbers.
- **The graph needs a scale**, which the printed grid does not have, and needs
  decimals and an interval. Evidence needs years for each part of the line; the
  build reads them as whole years, so 2012 to 2018 followed by 2019 to 2024 leaves
  no gap.
- **The first drawing** was a placeholder with a photograph slot and a confirmation,
  neither of which is printed. The canvas was built on 2 October 2026, and its
  controls (the tool buttons, the hint beside them, the undo) are further words the
  workbook does not print.
- **The file at the end of Phase A** (built 2 October 2026) needed a button, a
  line saying what the file is, and a date of saving at its top; the workbook has a
  folder instead. The file carries the dotted underlines with it, so a reader of the
  file sees which words are the screen's own.
- **About sixty interface words** the workbook never needed (buttons, messages,
  empty states, the canvas tools). All are marked provisional on screen with a dotted
  underline.

---

## 3. What the screen made easy that paper made hard, and the reverse

**The returns.** Easy on screen: one click raises the return, routes to the right
step, and highlights the fields it reopens. Paper cannot reopen a field, only send
the reader to a page. Harder on screen: the return becomes a record that has to be
closed.

**The revision marks.** The screen knows which steps depend on which, marks them,
and shows what changed with its before and after. Paper cannot tell Step 3 that
Step 1 changed at all; it relies on the reader. This is where the two forms will
drift first: a screen revision says what changed, and a paper strip says only when
and why.

**The derived subset in Exercise 7.** The screen reads the first half off
Exercise 6 exactly. The second half is circular on screen (finding 17), and on paper
it is judged by eye, so the two forms will ask different actors the dependency
question.

**The assembled problem definition.** The screen assembles the Exercise 2 sentence
from its slots and shows it back. Paper prints the sentence with blanks, which comes
to the same thing. Neither can assemble the agreed rewrite, which is free text in
both, and that is where the Step 3 gap comes from (finding 2).

**The assembled system problem definition.** Assembled from its four slots, and
shown beside the agreed problem definition so the participant sees they are
different sentences. The comparison is the screen's advantage; paper has the slots
too, but the Step 1 definition is eleven pages back.

**The reverse.**
- The first drawing is not built.
- Marking evidence along the line is a pen stroke on paper and year ranges on
  screen.
- The actor table's tick columns are dense on screen.
- The two colours of pen for revisions become a log.
- Everything a group does in a room is excluded from the screen by design.
