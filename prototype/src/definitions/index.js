// The step registry. Thirteen steps exist in the process; three are built. A step
// that is not built is known by number and title only, so a revision can say which
// later steps it would mark once they exist.

import step1 from './step1.js';
import step2 from './step2.js';
import step3 from './step3.js';
import { WORKBOOK } from './workbook.js';

export const STEPS = [step1, step2, step3];
export const BUILT = Object.fromEntries(STEPS.map((s) => [s.number, s]));

// core/process-overview.md
export const ALL_STEPS = [
  [1, 'A', 'Define the problem, the desired change, and your position'],
  [2, 'A', 'Set the boundary and the perspectives'],
  [3, 'A', 'Describe behaviour over time'],
  [4, 'B', 'Identify enablers and inhibitors'],
  [5, 'B', 'Map the causal structure'],
  [6, 'B', 'Analyse the mapping and write its narrative'],
  [7, 'C', 'Identify leverage'],
  [8, 'C', 'Weigh consequences and interests'],
  [9, 'C', 'State the intervention hypothesis'],
  [10, 'D', 'Test the hypothesis'],
  [11, 'D', 'Plan monitoring and learning'],
  [12, 'E', 'Apply the analysis'],
  [13, 'E', 'Communicate to audiences'],
].map(([number, phase, title]) => ({ number, phase, title }));

export function page(id) {
  return WORKBOOK.pages[id] || null;
}

export function zone(pageId, number) {
  const p = page(pageId);
  if (!p || !p.zones) return null;
  return p.zones.find((z) => String(z.number) === String(number)) || null;
}

export function exercise(stepNo, n) {
  const s = BUILT[stepNo];
  return s ? s.exercises.find((e) => e.number === n) || null : null;
}

export function field(stepNo, key) {
  const s = BUILT[stepNo];
  if (!s) return null;
  for (const e of s.exercises) {
    for (const f of e.fields) if (f.key === key) return { ...f, exercise: e.number };
  }
  return null;
}

// Which page a workbook page reference ({p:s1ref}) points at on screen.
export function screenTarget(pageId) {
  for (const s of STEPS) {
    const pass = s.passages.find((p) => p.page === pageId);
    if (pass) return { step: s.number, passage: pageId, exercise: pass.governs[0] };
    const work = s.pages.find((p) => p.page === pageId);
    if (work) return { step: s.number, exercise: work.exercises[0] };
  }
  if (pageId === 'carries') return { view: 'case' };
  if (pageId === 'checks') return { view: 'case' };
  if (pageId === 'glossary') return { view: 'glossary' };
  return null;
}

// What a field is called in a message: its printed label, or, where the page prints
// none, the printed title of its exercise.
export function fieldName(stepNo, f) {
  if (!f) return '';
  const own = f.label || f.caption || f.head;
  if (own) return own;
  const s = BUILT[stepNo];
  const ex = s && s.exercises.find((e) => e.fields.some((x) => x.key === f.key));
  if (!ex) return f.key;
  const z = zone(ex.page, ex.number);
  return (ex.title || (z && z.title)) || `Exercise ${ex.number}`;
}
