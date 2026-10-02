// Where a printed page reference lands on screen, in words. The workbook refers to
// its pages ("Three other forms, and when each is needed, are on page 10"); on
// screen there are no pages, so a reference names the Step and the Exercise, or the
// screen's own name for the place (decided by Ashley, 2 October 2026). The printed
// workbook keeps its page numbers, and workbook.js, generated from the printed
// pages, is not touched: views/text.js reads the page id from the printed reference
// and this table says what the screen shows for it. Every wording here is the
// screen's own, marked provisional on screen and listed in tools/wording-tiers.json.
//
// A reference is keyed by the page it points at and, where the page holds more than
// the sentence is about, by where the reference occurs (`at`): an instruction page's
// id for a sentence in that passage, `carries:<zone>` for a page 25 hint,
// `<page>:<exercise>` for an exercise's hint, and `glossary:<term>` for a glossary
// entry. A context not listed falls back to the page as a whole: every exercise the
// page holds, or the instruction page by its printed title. So a reference added to
// the workbook later never shows a bare page number on screen.

import { STEPS, page, screenTarget } from './index.js';

export const SCREEN_REFS = {
  // Working pages: the exercise, or exercises, the sentence is about, by where the
  // sentence is. Worked out from the step definitions' fields: the agreed problem
  // definition is Step 1, Exercise 6; the desired change and the position are
  // Exercises 4 and 5; the boundary and the exclusions are Step 2, Exercise 2, the
  // layers Exercise 3, the decision Exercise 6, the two descriptions Exercise 8, the
  // three sentences Exercise 11; the shape is Step 3, Exercise 5 and the system
  // problem definition Exercise 6.
  s1work: { exercises: { 'carries:2': [4, 5] } },
  s1work2: { exercises: { 'carries:1': [6], s3instr: [6], s3ref: [6] } },
  s2work1: { exercises: { 'carries:3': [2], 'carries:4': [3], s3instr: [2] } },
  s2work3: { exercises: { 'carries:4': [6], 'carries:5': [8] } },
  s2draw2: { exercises: { 'carries:6': [11] } },
  s3work2: { exercises: { 'carries:7': [5, 6] } },

  // Instruction pages: the printed heading the part referred to is read under, by
  // where the reference is.
  s1instr: { under: { s1ref: 'The problem definition', 'glossary:Problem definition': 'The problem definition' } },
  s1ref: { under: { s1instr: 'When too much and too little does not fit', 'glossary:Position': 'The five positions, and what each one changes' } },
  s2instr1: { under: {
    s2instr2: 'Four words this step uses precisely',
    'glossary:Actor': 'Four words this step uses precisely',
    'glossary:Layer': 'Four words this step uses precisely',
    'glossary:Stakeholder': 'Four words this step uses precisely', // the glossary's entry saying the word is not used in this process
    'glossary:Boundary': 'Drawing the boundary',
  } },
  s2instr2: { under: { 'glossary:Resources': 'The seven resources' } },
  s3instr: { under: { 'glossary:Behaviour': "Behaviour means the system's, not anyone's conduct" } },
  s3ref: { under: { 'glossary:Pattern shape': 'The six shapes', 'glossary:System problem definition': 'The system problem definition' } },

  // Places that are not a step's page: the screen's own name for each. Page 25 is
  // the case view's panel, and the Phase A critical checks sit at the foot of each
  // step screen.
  glossary: { place: 'the glossary' },
  carries: { place: 'What carries forward, on the Phase A view' },
  checks: { place: 'the critical check at the foot of each step' },
};

// The screen's place for a reference to `pageId`, read at `at`: the exercises it
// means (`kind: 'exercises'`, with `step` and `exercises`), the passage it means
// (`kind: 'passage'`, with `step`, `under` or null, and the printed `title`), or a
// place that is not a step's page (`kind: 'place'`, with `name`). Null where the
// screen has no such place (the notes pages, the front matter): the printed number
// then stands, and the sentence is one for Ashley (core/open-questions.md).
export function screenRef(pageId, at) {
  const t = screenTarget(pageId);
  if (!t) return null;
  const r = SCREEN_REFS[pageId] || {};
  if (t.view) return r.place ? { kind: 'place', name: r.place, target: t } : null;
  if (t.passage) return { kind: 'passage', step: t.step, under: (r.under || {})[at] || null, title: (page(pageId) || {}).title || '', target: t };
  const step = STEPS.find((s) => s.number === t.step);
  const whole = ((step && step.pages.find((p) => p.page === pageId)) || {}).exercises || [t.exercise];
  return { kind: 'exercises', step: t.step, exercises: (r.exercises || {})[at] || whole, target: t };
}
