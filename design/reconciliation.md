---
file: design/reconciliation.md
updated: 2026-09-29
status: closed. The six decisions were taken on 1 October 2026 and are in `design/WORK-ORDER-2026-10-01.md`.
source: a cross-reference of the workbook against the specification, plus prototype/FINDINGS.md
---

# Reconciling the specification with the workbook

> **Closed, 1 October 2026.** All six decisions in section 1 were taken. They are
> written as edits in `design/WORK-ORDER-2026-10-01.md`, which is the file to work
> from; this one is kept as the record of what the questions were and why they
> were asked. Two terminology questions in section 3 are still open and are in
> `core/open-questions.md`.

## What this is

The workbook and the specification have drifted. A cross-reference of the two
found twenty-nine places where they disagree in substance, meaning a builder or a
participant would do something different depending on which one they read. The
first build found the same drift from the other side and reported it in
`prototype/FINDINGS.md`.

This file is not a third findings list. It is the decision list: what has to be
settled, in what order, by whom, with a recommendation on each. Where the
reasoning is already written in `prototype/FINDINGS.md` it is cited rather than
repeated.

The twenty-nine sort into four groups. **Six are decisions that only Ashley can
take**, in section 1. **Eleven are corrections that need no decision**, in section
2, most of them mine. **Seven are terminology**, in section 3. **Five are already
logged** in `core/open-questions.md` or `prototype/FINDINGS.md`, listed in section
5 so that they are not taken twice.

Nothing in section 2 or 3 waits on section 1, except where said.

---

## 1. Six decisions

### 1.1 The two problem definitions, and where a rename goes

**This is the one that matters most, and everything else in Step 1 follows from
it.**

The workbook asks for the problem definition twice. Exercise 2 on page 9 is a
first attempt in five labelled slots, in the default form only: there is too
much or too little of a thing, for someone, since a time, which matters because.
Exercise 6 on page 11 is the agreed rewrite, and it is **three unlabelled lines**
plus the four form tick boxes and a line for why the default form did not fit.
The page's own lead says the rewrite goes there "rather than crossing out the
first one, so that both are visible". Page 25 carries the rewrite forward.

The specification has one problem definition, the five slots, and no rewrite.

The consequence is the break. Step 3 takes the thing it measures from the first
attempt's slot, because that is the only structured field there is. But both of
Step 3's returns send the participant to page 11 to rename the thing, and page 11
has no slot for a thing. **A rename made where the workbook says to make it never
reaches Step 3.** The commonest return in the whole process is the one that does
not connect.

**The options.**

| | What changes | What it costs |
| --- | --- | --- |
| **A. Exercise 6 gains the five slots** | The agreed definition becomes the structured one, and is what every later step reads. Exercise 2 is relabelled a first attempt and keeps its slots as scaffolding | Space on page 11, which has about a third of the page unused, so the space is there |
| B. Exercise 6 stays free lines, Step 3 reads Exercise 2 | Nothing on paper | The agreed version becomes decorative, the rename still goes nowhere, and page 25 carries forward something no step reads |
| C. Slots move to Exercise 6 only, Exercise 2 becomes free prose | One structured definition | Removes the scaffolding at the moment it helps most, which is the first attempt |

**Recommended: A.** The agreed definition is what the rest of the process
depends on, so it is the one that has to be structured, and Exercise 2's slots
earn their place as scaffolding for a first go. Page 11 has the room.

If A is taken, the build's coined key `problem_agreed` becomes five keys rather
than one, and the Step 1 specification's field table is rewritten around two
definitions rather than one. See 1.5.

### 1.2 Layers: two with a reason, or three as the floor

Your decision of 28 September, recorded in `core/decisions.md`, was three to five
layers with five as a cap the tool enforces, and **two allowed only with a line
saying why the case has no third scope of decision**. The glossary carries that.

Everything written since has dropped the two-layer escape. The workbook prints
"Three to five, and five is the limit", and the description, the specification and
`process.yaml` all say the same. The prototype blocks at two.

Related, and part of the same decision: the printed layer sheet carries a reason
line on **rows 1 and 5 only**, labelled "why this is the widest scope" and "why
this is the narrowest scope". A case with three or four layers has its narrowest
layer on row 3 or 4, which has no line, while the line that asks for the reason
sits on row 5, below the last layer named.

**Recommended: keep the two-layer escape, and give every layer row a reason
line.** Some cases genuinely have two scopes of decision and nothing between, and
forcing a third invents one. The printed sheet needs fixing either way, and once
every row has a line the two-layer justification has somewhere to go.

### 1.3 The disqualifier: does a yes end the case, or warn?

Exercise 3's fifth question is printed under the heading "One question
disqualifies a topic": *Could a known procedure solve this, if someone chose to?*
A yes, the page says, means the problem is a decision nobody has taken rather than
a system that keeps producing a result, and the participant should choose a
different topic. The ADVO4 manual says the same.

The specification says any "no" among the five raises a warning that can be
dismissed with one line, and that it never blocks.

**Recommended: the page stands.** Two sources against one, and the specification
is the stale document. Acting on the participant's own answer is not the tool
judging quality, so principle 14 is not in the way.

Note that the specification's single warning cannot serve both questions anyway: a
"no" on the size question means narrow or widen the problem, which page 10 already
explains, and not choose a different topic. The build has already split the two.

### 1.4 The boundary test drops the clause the critical check depends on

Page 12 prints one test for what goes inside: *would including this change what
you would do about the problem?*, with the gloss that something goes inside if
someone in it could plausibly increase or decrease the quantity named, or change a
rule that governs it.

The glossary and the step description carry **three** tests, and the second is the
one the page leaves out: *it is on the receiving end of that excess or deficit: it
is part of who the problem is for.*

Step 2's critical check then requires that "the actors include those affected by
the system but not involved in it". A participant applying only the printed test
can exclude every affected-but-not-involved actor and still tick the check.

The printed phrasing has a second problem. "What you would do about the problem"
does not apply to the default position, analysing from outside, where page 10 says
the participant's own influence is not part of the analysis.

**Recommended: the workbook gains the receiving-end test**, and the first
sentence is rephrased so it does not assume the participant is acting. This is one
clause and one sentence, and without it the step's own critical check cannot be
relied on.

### 1.5 The keys the build coined

The prototype has coined and used these, and by the rule in
`steps/02-boundary/spec.md` a key is permanent once a build relies on it:

`problem_agreed`; `suit_chronic_note`, `suit_history_note`, `suit_attempts_note`,
`suit_size_note`; `dependencies[].needed_by`; `no_nearest_quantity`;
`boundary_sentence`, `exclusion_most_likely_wrong`,
`exclusion_most_likely_wrong_note`; and the page 25 copies `carry_problem`,
`carry_change_position`, `carry_layers_decision`, `carry_disagreement`,
`carry_sentences`, `carry_spd_shape`.

**Recommended: adopt all of them, with two exceptions.**

**`suit_noprocedure` is renamed.** It is not a coined key, it is one of mine, and
it means the opposite of the question the page prints. The page asks "Could a
known procedure solve this?", where a yes disqualifies; the key name says "no
procedure", where a true would mean the opposite. The build currently stores the
answer in the key's own sense and translates on screen, which works and is a trap
for the next person. Rename it to `suit_procedure_would_solve`, matching the
printed question, while only one build relies on it.

**`problem_agreed` waits on 1.1.** Under option A it becomes five keys, not one.

### 1.6 Where the page has no room for what the specification asks

Nine of the twenty-nine are the same shape: the specification requires a field the
printed page gives no space to, or prints fewer rows than the exercise needs. Each
is the same question, so they are put together: **does the page grow, or does the
specification shrink?**

| What | The page | The specification | Recommended |
| --- | --- | --- | --- |
| `size_verdict` (too large, workable, too narrow) | Nothing. Exercise 3's fourth question does the size test as a yes or no | Required, and the critical check opens only on "workable". A Step 4 return reopens it | **Retire it.** The page's yes or no does the work, and the Step 4 return reopens that instead |
| Dependency rows | Six printed | One row per resource, for three to six actors, so twelve or more | **The page grows**, or the exercise asks for the two resources that matter most per actor. Currently the critical check cannot be ticked honestly |
| `spoken_for_by` | Instructed on page 14, with no column or slot anywhere | Required for a group named by its position. Steps 7 and 13 read it | **The page gains it**, as a column on the actor table or a line under Exercise 9 |
| `interval` (Step 3) | Instruction text only | Required | **Retire the field**; the instruction is enough, and the interval is visible in the drawn line |
| `nearest_quantity_because` | Instruction text only | Required where the form is "not happened yet" | **The page gains a line**, since it is the only record of why a proxy was chosen |
| Year on the desired change | Two boxes, no year line | `change_long_year` required | **The page gains the years.** Step 3 draws the desired change against the line, which needs a horizon |
| Description rows (Step 2, Exercise 8) | Four printed | Five stated as the cap | **Print five**, so paper and screen record the same number |
| Inside rows (Step 2, Exercise 2) | Eight printed | No cap, and the step targets about a dozen actors | **The page grows**, or the exercise says the eight are the ones that matter |
| Two decisions (Step 2, Exercise 6) | One decision, one trio | At most two | **One on paper**, with the second decision recorded on screen only, and the specification says so |

These are recommendations on nine small things rather than one decision. Take
them as a block, or mark the ones to argue about.

---

## 2. Corrections that need no decision

These are errors rather than disagreements. **Eight were made on 29 September and
are marked done.** The three that are not wait on something: one has a question
inside it, one waits on decision 1.1, and one waits on section 4.

1. **Done. Page 16 asked for a requirement dropped on 29 September.** The
   instruction reads "An inferred line is not guesswork: it names what it is read
   from, and what would show it wrong." The requirement to name what would show
   the line wrong was dropped, the Exercise 8 table has no column for it, and the
   description and specification were corrected. The page was missed. It was mine:
   I checked the Exercise 8 table and not the instruction prose on the facing page.
2. **Done.** `steps/02-boundary/spec.md` pointed at a list that no longer exists, telling a
   build the description words three of the seven critical check criteria
   differently and to see `design/platform-phase-a.md`. The three sets are now
   word-identical and the list was removed when the divergences were settled.
3. **Done.** `steps/03-behaviour-over-time/spec.md` contradicted itself: the header says
   four decisions are open and a build must stop and ask, and the footer says
   nothing on Step 3 is open. The footer is right.
4. **Waits on you.** The Step 1 critical check has three different contents in the workbook,
   the description and the specification. The workbook's five stand, by the
   standing rule. The two criteria that exist only in the specification, about
   someone who disagrees with the cause, and the criterion about a powerful
   actor's description, are either added to page 24 or dropped. **This one is
   yours if you want the two extra criteria**; otherwise the page stands.
5. **Waits on 1.1.** The Step 1 specification's screen section describes five zones and lists
   six, in an order that is not the workbook's, and omits Exercise 6 entirely.
   Rewritten against the workbook once 1.1 is settled.
6. **Done.** "Where you read it" on page 11 had a label and no line. The label sits
   under Exercise 7's four writing lines with nothing after it, so the field it
   names cannot be filled.
7. **Done.** The actor count: the specification has a hard stop at fifteen; the workbook
   and the description both say "roughly fifteen". A hard stop also makes the
   specification's own return trigger, "past fifteen actors", unreachable.
   Softened to a warning.
8. **Done.** The glossary said two alternative problem forms; the workbook prints three
   and `process.yaml` carries four enum values. Corrected to three.
9. **Done in the glossary; `process.yaml` waits on section 4.** Both carried the
   actor-type ratio as a cap the tool enforces, which your decision of 29
   September made a warning.
10. **Waits on section 4.** `process.yaml` still lists `size_verdict` with
    `critical_check_value: workable`**, which 1.6 retires.
11. **Done.** `core/decisions.md` carried an unmarked superseded row on actor types from 28
    September. Registers are newest first, so this is not wrong, but the older row
    should say it is superseded.

---

## 3. Terminology

1. **"Layer" is defined with an implementation clause in the workbook and without
   it everywhere else.** The workbook says "the same scope of decision-making or
   implementation"; the glossary and the description say "the same scope of
   decision". Under the workbook a delivery body groups with the layer whose
   decisions it implements; under the glossary it belongs in the layer whose scope
   of decision it works to. These produce different layer schemes, different bands
   in the drawing, and a different target in Step 12. **This one is substantive
   enough to be yours**, and the printed version is the looser of the two.
2. **Done. "Quantity" was the central Step 3 term and was not in the glossary.**
   The decision of 29 September named the glossary as where the quantity and
   variable distinction lives, and it had never been written there. It is there
   now, with the reason a quantity is not a variable.
3. **"Outcome"** is reserved by the glossary for Step 9 onwards and never to be
   used bare, and the Step 1 description names a field "Outcome" while the
   specification's warning text reads "that sounds like a solution, not an
   outcome". The workbook uses "the desired change" throughout. Corrected to
   match the workbook.
4. **"Stakeholder"** is a word the process does not use, and my specification
   overstated the rule as "the interface never prints the word", which would
   delete the glossary card that the workbook prints to explain why the word is
   not used. Corrected: the interface never uses the word for an actor, and may
   print the card that retires it.
5. **"Purpose"** is retired in the glossary as a participant field, and the
   workbook prints it as part of Meadows' definition of a system. These are
   different senses and neither is wrong. The glossary gains a line saying so.
6. **The Step 1 size test** is phrased as "about a dozen variables" in the
   description and "about a dozen things that drive it" on the page. The page is
   right, because a variable is a Step 4 term and Step 1 has none yet.
7. **Whether the Step 1 description counts as one of Step 2's two competing
   descriptions.** The description says it does; the workbook says Exercise 8 is
   not the Step 1 question asked twice. It decides whether a participant needs one
   new differing reading or two. **Yours**, and the workbook reads as though the
   answer is two.

---

## 4. `process.yaml`

**Recommended: do not update it yet.**

The file's own header says it is updated in the same commit as the specification
it describes, and that where the two disagree the specification is right. The Step
1 specification is about to be rewritten, and decision 1.1 changes how many
problem definitions Step 1 has. Writing keys into `process.yaml` now would fix the
stale shape in the one file whose job is to be the machine-readable truth.

Once 1.1, 1.5 and 1.6 are settled, `process.yaml` is updated once, covering Steps
1, 2 and 3 together, in the same commit as the three specifications. That is one
pass rather than three, and it is the first time the file will have carried fields
for more than one step.

---

## 5. Already logged elsewhere

Not repeated above, and not to be decided twice:

- The two-layer question, the boundary test, the disqualifier, the eight inside
  rows, the four description rows, and the six dependency rows are all in
  `core/open-questions.md`, which is where they stay until section 1 is answered.
- Everything the screen forced, and everything the screen made easy that paper
  made hard, is in `prototype/FINDINGS.md` sections 2 and 3. That report is the
  build's, it is not repeated here, and its section 1 is the same drift seen from
  the other side.
