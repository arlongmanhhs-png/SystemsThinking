---
file: design/WORK-ORDER-2026-10-01-report.md
updated: 2026-10-02
status: the report back that design/WORK-ORDER-2026-10-01.md asks for. Three things, and nothing else.
---

# Report on the work order of 1 October 2026

Every edit in the work order is made. The workbook is 28 A4 pages and 14 A3
sides, every page reference resolves, and every working page ends where the
others do. The work was then checked by seven independent reviewers, each followed
by a skeptic: 73 findings, 48 confirmed. Every confirmed defect in the build has
been fixed. What remains is below.

## 1. What this work order got wrong

1. **Decision 2 gives the two-layer line no printed place.** Page 13 printed the
   rule "Two only if you write why this case has no third scope of decision" and no
   line for it. I put it on the third row, which is empty when there are two layers
   and is where a third scope would sit. **Settled on 1 October:** the printed rule
   now ends "on row 3".

2. **Decision 2 only half fixes the narrowest layer.** Row 5 keeps "why this is the
   narrowest scope", so in a case with three or four layers the narrowest layer
   sits on a row that asks "why this scope sits here". The screen labels the last
   layer as the narrowest, so paper and screen ask that layer different questions.
   **Settled on 2 October:** page 13 now puts the narrowest layer on row 5 and any
   layers between on rows 2 to 4, so row 5's question is always asked of the
   narrowest layer, as on screen.

3. **Decision 4's paragraph breaks the house rule it is printed under.** It uses
   "it" four times for "something", and "that excess or deficit" has nothing before
   it to refer to. The paragraph was dictated word for word, so it is printed as
   given.
   **Settled on 2 October:** the paragraph now names the candidate each time, and
   "the excess or deficit of that quantity" has something to refer to.

4. **Decision 4 leaves page 12 stating two tests.** The new test asks "would
   including this change what the analysis concludes?". The next paragraph still
   says "Irrelevant means it would not change what you would do", which is the
   phrase the decision removed. **Settled on 1 October:** "Irrelevant means
   including it would not change what the analysis concludes", on page 12, in the
   specification and the description, and on screen.

5. **Decision 4 misses the Step 2 description's "Reach" cut-off.** It still admits
   a layer only if someone in it can move the thing or change a rule, which
   excludes a layer that is only on the receiving end. The description's own three
   tests, and now page 12, say otherwise. **Settled on 1 October:** the cut-off now
   admits a layer by any of the three tests, and is renamed "Layers".

6. **Decision 1 leaves the rewrite conditional on page 8.** Page 8 says the problem
   definition "needs to be rewritten on page 11" if either check question is
   answered no. The description says the same. Yet the five agreed slots are
   required, and they are what every later step reads. A participant whose first
   attempt passes the check is told nothing to write on page 11. **Settled on
   1 October:** page 8 now says the agreed definition is always written on page
   11, copied across as it stands where the check finds nothing to change. Later
   the same day the check moved to page 10, facing Exercise 6, and says so of
   Exercise 6. Page
   11's opening line, the description, and the specification say the same.

7. **Decision 1 leaves page 24's first criterion in the default form.** "Too much
   or too little of something valued" now reads against an agreed definition that
   may be a mismatch, a standard, or not happened yet, and cannot then be ticked
   honestly. **Settled on 1 October:** the criterion now reads "what is wrong with
   something valued", the label Exercise 6 prints for that slot in every form.

8. **Decision 6, item 3 changes the shape of a key the order calls settled as
   proposed.** One printed line under Exercise 9 cannot hold a value per actor, so
   `actors[].spoken_for_by` became one field, `spoken_for_by`. The dictated label,
   "And who speaks for them, including nobody", leaves "them" with two candidates:
   the people missing from the list, and the groups named by their position.
   **Settled on 2 October:** the label reads "Who speaks for each group the system
   acts on, including nobody", as page 16 does, above two full-width lines.

9. **Decision 6, item 2 may still be too few rows.** Twelve is the bottom of the
   order's own estimate ("twelve or more"), and the screen has no cap. A case with
   six actors in the subset, each holding several resources, can fail the Step 2
   criterion on paper with nowhere to go. Either send extra rows to the notes page,
   or narrow the question. Both are your call.
   **Settled on 2 October:** a printed line under the dependency table on page 17
   sends further rows to the notes pages, and the second half of the subset is
   found in Exercise 7 itself.

10. **Decision 6, item 8 also grows the outside list.** The inside and outside lists
    are printed as pairs, so twelve inside rows make twelve outside rows.
    **Settled on 2 October:** the outside list is now six two-line entries, each
    with a "Because" line for its reason, in the height of the twelve single
    lines.

11. **The page budget missed two pages that were already over.** Page 9 was full
    before any edit, with its revised strip under the folio, and page 25's strip
    sat 1mm from the paper edge. Both now end where every other page ends.

12. **"Look at every page as an image" depends on the renderer.** The book's
    writing lines and graph grid were repeating gradients, which Chromium writes
    as a sampled shading. In MuPDF-based viewers the rationale on page 9 showed one
    line of three and Exercise 4 on page 21 showed none, while Chrome's viewer drew
    them all. They are now drawn as real rules, with every page's geometry
    unchanged.

13. **The exemption in the fourth verify item is ambiguous.** "The two design documents" could
    mean several files. I read it as this work order and the reconciliation. On
    that reading, two files still contain the words:
    - `design/platform-phase-a.md` lists the banned words as a rule.
    - `review/phase-a-review-log.md`, a transcript of your review, uses the retired
      name for the problem definition, and "step" in lower case before a number.

    I changed neither.

14. **"The same commit" has no commit to land in.** The folder is not a git
    repository. The three specifications and `process.yaml` were changed in the
    same pass, and a copy of the folder as it was before the edits is kept outside
    the project.
    **Settled on 2 October:** the project goes into a private hosted repository
    outside OneDrive later; until then an artifact is enough, and the folder stays
    as it is.

## 2. What I decided that the work order did not decide

Eight rows in `core/decisions.md`, dated 1 October 2026, each beginning "Mine, not
the work order's":

1. The two step descriptions were corrected to agree with the decisions. Step 1's
   bare "Outcome" row and its "variables" wording were brought to the workbook in
   the passages touched. This is despite `CLAUDE.md` barring a code build from
   editing a description.
2. `spoken_for_by` became one field under Exercise 9, required, with "nobody" an
   answer. Page 14 said where to write it, and sent students ahead to page 17 to
   do so. Page 16, which faces Exercise 9, now says what to write there, by your
   decision.
3. The printed wording the order did not give is mine:
   - "Year" in each desired-change box.
   - "Not happened yet: why the quantity graphed is the nearest" on page 21.

   Also mine:
   - The disqualifier's line sits on the question's row.
   - The two-layer line goes on row 3 (see item 1 of section 1; the printed rule
     now says so, by your decision).
   - On screen, the disqualifier keeps the critical check closed and sends the
     participant to Exercise 1.
   - `no_nearest_quantity` lifts the requirement on `nearest_quantity_because`.
   - `agreed_direction` is free text.
4. The writing lines and the graph grid are drawn as real rules.
5. Pages 9, 13, 17, 21, and 25 are tightened on the page, the first remedy the
   order names.
6. Step 1's specification is rewritten in the workbook's order of eight exercises,
   with its six critical check criteria left alone. **Settled on 1 October:** the
   specification now carries page 24's five word for word (section 3, item 1).
   Settling fields the rewrite touched:
   - `problem_form` is not pre-selected, as on the page.
   - Step 1 gains `revised_on` and `revised_because` for its printed strip.
   - A description that shares another's line is asked for nothing else.
   - Step 2's specification gains the table of what it sends back to Step 1.
7. In the prototype:
   - Saved cases migrate to the new keys, with the disqualifier's answer turned the
     right way round and open returns and marks renamed.
   - `problem_agreed` is kept as stored and shown nowhere.
   - The agreed definition in the three other forms is assembled as its five parts
     in order.
   - The graph reads whole years.
   - The actor table loses a hard stop at fifteen the specification never had.
8. Three clarifications that a review of the settled Step 1 check confirmed:
   - The specification says the check reads the agreed definition, not the first
     attempt. Page 24 now says so too, by your decision (section 3, item 7).
   - The specification shows the parked list in Step 1 (section 3, item 4).
   - The Step 1 description says the position is not pre-selected, as the
     specification does.

## 3. What still disagrees

1. **The Step 1 critical check existed in three versions:** page 24's five
   criteria, the specification's six, and the description's five, which differed
   from both, including a requirement that the problem "pass" the suitability check
   where a "no" now only warns. **Settled on 1 October:** the check is page 24's
   five, and the specification and the description carry them word for word.

2. **The instrument-word warning still says "that sounds like a solution, not an
   outcome",** a bare "outcome" the glossary forbids. It is in the Step 1
   specification and the prototype. Reconciliation section 3 records this as
   corrected, but only the description's field name was.
   **Settled on 2 October:** the warning now names the word found as a potential
   solution, and its button keeps a copy of the whole desired change with the
   potential solutions.

3. **The representation.** The specification allows up to three descriptions, each
   with `rep_omission`. The workbook asks for one, with no omission line. The
   prototype asks for one, with the omission optional.
   **Settled on 2 October:** one description, with "What that description leaves
   out" printed on page 11 and optional on screen.

4. **The parked list.** The specification hid it until Step 7. The workbook
   prints it in Step 1 as Exercise 8, and the prototype shows it there. **Settled
   on 1 October:** the specification shows it in Step 1 too, as page 24's fifth
   criterion needs, and only its count on the other steps before Step 7.

5. **The type ratio.** Pages 12 and 13 print "no more than one type per three
   actors" as a rule, and the Step 2 description says the tool caps it. Since 29
   September it is a warning.
   **Settled on 2 October:** pages 12 and 13 print the ratio "as a guide", and the
   Step 2 description calls the ratio a warning, not a cap.

6. **The "irrelevant" mark had three wordings.** **Settled on 1 October:** all
   four sources now say "Irrelevant means including it would not change what the
   analysis concludes". The Step 2 `paper.md` still quotes the old test, and it is
   not the build's to change.
   **Settled on 2 October:** the Step 2 `paper.md` is now superseded in full and
   kept as history (item 12).

7. **The pages do not say which definition they mean.** Pages 12, 20, and 21 say
   "your problem definition", and the book now prints two. Exercise 7 on page 23
   and the glossary on page 6 say "the problem definition", also without saying
   which. The specifications say it means the agreed one; the pages do not, and
   wording them is yours.
   **Settled for page 24 on 1 October:** its five criteria that name the problem
   definition, three for Step 1 and two for Step 3, now say "the agreed problem
   definition", on paper, on screen, and in the specifications and descriptions.
   **Settled for Exercises 4 and 8 on 1 October:** Exercise 8, which comes after
   the agreed definition, now says "the agreed problem definition" too. Exercise
   4, which comes before the agreed definition, points back to the problem
   definition in Exercise 2, so that it no longer sends anyone forward to page 11
   and back. Page 11 is where the definition is reconfirmed and neatened. On
   screen, with the instructions above each exercise, page 8's check now shows at
   Exercise 6 only, and Exercise 3's size warning no longer links ahead to
   Exercise 6. **Settled the same day:** page 8 points to no exercise beyond
   Exercises 1 to 5. Its check moves to page 10, facing Exercise 6, as "The check
   before Exercise 6", and its third rule keeps a solution for later without
   naming Exercise 8.
   **Settled on 2 October:** pages 6, 12, 20, 21, and 23 now say "the agreed
   problem definition" too.

8. **The outside list's reason has no separate printed line.** The specification
   requires `outside[].reason` as a field of its own, and page 13 gives each
   exclusion one short line for both. This is a tenth "page has no room" item the
   reconciliation missed.
   **Settled on 2 October:** each exclusion now has a printed "Because" line
   beneath it (section 1, item 10).

9. **Page 24 names no return pages.** It promises a return page beside each
   criterion and prints none; the open question on printed instructions covers
   this.
   **Settled on 2 October:** page 24 prints the return page beside each criterion,
   and the three specifications carry the same returns.

10. **The review marking in `process.yaml` is narrower than the carry tables.**
    Its `depends_on` lists, taken from `core/critical-checks.md`, leave out some
    steps that the Step 1 and Step 3 carry-forward tables name. Revising those
    steps does not mark them for review. This widens the existing open question
    about Step 2's dependants.
    **Settled on 2 October:** a revision now marks every step a carry-forward
    table sends an output to, in the dependency table, `process.yaml`, the
    descriptions, and the specifications.

11. **The revision-strip keys have no build behind them.** `revised_on` and
    `revised_because` are settled keys in all three specifications, and the
    prototype keeps a revision log instead.
    **Settled on 2 October:** the revision log is the record on screen, and fills
    the two keys with the latest revision's date and reason.

12. **The `paper.md` files are out of date.** Steps 1 and 2 each say they are
    current on printed wording and room. Both contradict the workbook, now on the
    boundary test, the row counts, and the suitability questions as well, and
    `CLAUDE.md` does not let a build change them.
    **Settled on 2 October:** both files are superseded in full and kept as
    history, and the placeholders for Steps 3 to 13 point to the workbook.

13. **A stray older reconciliation file.** `reconciliation.md` at the top of the
    folder is an older copy of `design/reconciliation.md`, with broken front
    matter and the status "decisions pending".
    **Settled on 2 October:** the copy is retired to `design/_retired/`, with a
    note naming `design/reconciliation.md` as the record.

14. **Instruction pages that point ahead to exercises.** Your rule, set on
    1 October: an instruction page does not point ahead to exercises that are not
    on the working page opposite it, and pointing ahead to instructions is fine.
    Two pages broke the rule, and both were settled on 1 October (see
    `core/decisions.md`). Page 8's check moved to page 10, and its third rule no
    longer names Exercise 8. Page 14's instruction on who speaks for a group moved
    to page 16. A sweep of pages 8 to 25 found no other page that breaks the rule.
    **Checked again on 2 October:** pages 10 and 22 point ahead to no exercise, on
    paper or on screen.
    - Page 10 faces Exercises 6 to 8 on page 11. The exercises it names are
      Exercises 6 and 7, on page 11, and Exercises 2, 3, and 5, on page 9, which
      the student has already done. Its one page number, page 8, is instructions.
      "Every later step reads", "carried through", and "the others come later"
      look ahead but name no exercise.
    - Page 22 faces Exercises 5 to 7 on page 23. Its sections on the shape, the
      system problem definition, and the two futures each describe an exercise on
      page 23. "The problem definition on page 11" and "the desired change from
      Step 1" point back. "The work that follows" and "before anything has been
      chosen" look ahead but name nothing.
    - On screen, each section of both pages is shown at its own exercise or an
      earlier one. The only links in them, to page 8 and in two glossary entries,
      go to instructions, so none of them opens an exercise early.
    **Pages 12 and 20, checked on 2 October,** point ahead to no exercise either.
    - Page 12 faces Step 2's Exercises 1 to 4 on page 13. It prints no page
      number, and every instruction on it serves the exercises opposite or points
      back to the Step 1 problem definition. "How many actors" is about the actors
      listed in Exercise 2, opposite; the screen also shows that section at
      Exercise 5, which points back. "Whose views count", "what the analysis
      concludes", and "why an intervention fails" look ahead but name no exercise.
    - Page 20 faces Step 3's Exercises 1 to 4 on page 21. Its sections on what to
      graph, the measure, and the period describe Exercises 1 and 2, opposite. Its
      returns table points back to page 11 in Step 1 and page 13 in Step 2.
      "Everything that follows", "looks like stability", and "noise you will then
      try to explain" look ahead but name nothing.
    - On screen, no link on either page jumps ahead. Two small faults on screen
      that are not pointers: with the instructions above each exercise, page 12's
      definitions of actor, layer, and actor type are shown above Step 2's
      Exercises 3 to 5 but not above Exercise 2, where actors are first listed;
      and the glossary entry for "system" links to page 5, which has no place on
      screen, so the link does nothing.
    **Settled on 2 October:** the screen keeps "Before the exercises" only, so the
    section-to-exercise mapping behind the page 12 fault is retired.
