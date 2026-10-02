# Instructions for a code build

This folder is the specification. Read it before writing code, and treat it as
the authority on what the process is.

## Read in this order

1. `core/principles.md` - the rules the whole process obeys.
2. `core/process-overview.md` - the thirteen steps, their outputs and phases.
3. `core/critical-checks.md` - how critical checks, backward movement and return
   triggers work.
4. `core/glossary.md` - the terms, which are used precisely and not as synonyms.
5. `design/workbook.md` - the paper form, and the order the work is done in.
6. The step you are building: `steps/NN-name/`.

## process.yaml

`process.yaml` holds step ids, field keys, dependencies, and return triggers. It is
updated in the SAME COMMIT as any `steps/*/spec.md` it describes: a change to one
without the other is a broken commit. Where the two disagree, the specification is
right and `process.yaml` is out of date.

## What you may change

- Anything in `steps/*/spec.md`, when implementation forces it.
- Anything you add: new files, tests, code.

Record the change and the reason in the same commit, and add a line to
`core/decisions.md` with the date.

## What you may not change

- `core/principles.md`, `core/critical-checks.md`, and any `description.md` or
  `paper.md`.
- Participant-facing wording anywhere: prompts, critical check criteria,
  warnings, the problem definition form, the suitability questions. Copy it
  exactly. Do not paraphrase it, shorten it, or make it friendlier.
- Step numbers and field keys. They appear in critical check criteria, return
  triggers, and assessment. A removed step retires its number rather than
  freeing it.

If the implementation cannot honour one of those, stop and ask.

## When something is missing

Stop. Add the question to `core/open-questions.md` with the date and what you
need in order to proceed. Do not invent a critical check criterion, a field, a
prompt, a threshold, or a source.

## Wording the screen's controls

**Draft of 2 October 2026, awaiting Ashley's approval.** Until Ashley approves
this rule, words written under it stay marked as provisional on screen.

The workbook prints no words for a screen's own controls: buttons, navigation,
saving notices, and empty states. A build may word those itself under this rule,
without stopping to ask, in the tone of section 9 of `design/platform-phase-a.md`:

- Sentence case, "you" for the participant, active and plain. A button says what
  it does to what, with the thing named: "Remove the line", not "Remove" or "OK".
- The workbook's and the glossary's terms only, never a synonym for one.
- A saving notice says where the case is kept, or what failed and what to do
  next, and nothing more.
- Nothing that praises, congratulates, approves, or judges an answer.
- The house rules below apply in full.

Anything that says something about the participant's work is not a control:
warnings, field labels, findings, return and review messages, and the canvas
reports. Ashley approves those one string at a time.

## House rules

- British English. No em or en dashes: use parentheses, commas, hyphens, or
  colons.
- Name the thing rather than writing "it", "this", or "that" whenever the
  reference is more than a few words back, or two candidates are in play. In
  participant-facing text, name it every time. The same goes for vague nouns:
  "would it change the answer" says less than "would it change what the analysis
  concludes".
- No fabricated citations. Every source is real and verifiable, and anything
  unverified says so in the text.
- Nothing is scored automatically. The tool checks that fields are filled, never
  whether an answer is good.
- No approval role anywhere. Critical checks are self-checked by the participant.
- Forwards is checked, backwards is free.

### Words this project does not use

These apply to participant-facing text and to the specification alike.

- **"bear"**, as in "bears on" or "who bears what". Name what is carried and who
  carries it.
- **"cashed"**.
- **"gate"** and **"gated"**. The concept is the critical check, and what was
  gated is checked.
- **"it"**, **"this"**, and **"that"** where the reference is more than a few
  words back, and vague nouns in the same position. See the house rule above:
  name the thing.
