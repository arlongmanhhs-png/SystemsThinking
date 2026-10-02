// Validation returns severity, not a verdict. Three severities only:
// - blocking: mechanical, about presence, count, or a value being set. It keeps the
//   critical check closed and says what is missing.
// - stop: a blocking check raised by the participant's own answer (Step 1's
//   disqualifier). It is also shown at its exercise, and it cannot be dismissed.
// - warning: never blocks, and is dismissed with one stored line.
// Nothing here reads the content of a sentence, apart from the instrument-word flag
// in Step 1, which is a warning.

import { BUILT, fieldName as nameOf } from '../definitions/index.js';
import { filled, fieldValue, makeCtx } from './ctx.js';

const arr = (x) => (Array.isArray(x) ? x : []);

function isRequired(f, ctx) {
  if (typeof f.required === 'function') return !!f.required(ctx);
  return !!f.required;
}

function isShown(f, ctx) {
  if (f.showIf && !f.showIf(ctx)) return false;
  return true;
}

let currentStep = null;
function fieldName(f) {
  return nameOf(currentStep, f);
}

// A reference counts only while the row it points at still exists: a layer, type,
// actor, or description deleted after being chosen leaves the choice unset.
function refOk(ctx, of, id) {
  if (!filled(id)) return false;
  if (id === 'nobody') return true;
  return !!ctx.row(of, id);
}

// A check's text with what the check found put in its place: {word} in the text is
// filled from the check's fill(ctx), as the instrument-word warning names the word.
function checkText(c, ctx) {
  if (!c.fill) return c.text;
  let found = {};
  try { found = c.fill(ctx) || {}; } catch (e) { found = {}; }
  return String(c.text).replace(/\{(\w+)\}/g, (m, k) => (found[k] != null ? String(found[k]) : m));
}

function periodOf(state) {
  const v3 = state.values[3] || {};
  const a = Number(v3.period_from);
  const b = Number(v3.period_to);
  return a && b && b > a ? [a, b] : null;
}

// The missing pieces of one field, as short messages. Messages are the screen's own
// wording and are marked provisional where they print.
export function fieldProblems(state, stepNo, f, ctx) {
  currentStep = stepNo;
  if (!isShown(f, ctx)) return [];
  const out = [];
  const v = fieldValue(state, stepNo, f);
  const req = isRequired(f, ctx);
  switch (f.kind) {
    case 'table': {
      const rows = arr(v);
      if ((f.min || 0) > rows.length) out.push({ key: f.key, text: `${f.label ? `${f.label}: ` : ''}at least ${f.min} ${f.min === 1 ? 'row' : 'rows'}` });
      rows.forEach((row, i) => {
        for (const c of f.columns) {
          const creq = typeof c.required === 'function' ? c.required(ctx, row, i, rows.length) : c.required;
          if (!creq) continue;
          const cv = row[c.key];
          const ok = c.kind === 'choices' ? arr(cv).length >= (c.min || 1)
            : c.kind === 'ref' ? refOk(ctx, c.of, cv)
              : filled(cv);
          if (!ok) {
            const lab = (c.rowLabel && c.rowLabel(i, rows.length)) || c.head || c.label || fieldName(f);
            out.push({ key: f.key, row: row.id, text: `${f.label ? `${f.label}, row` : 'row'} ${i + 1}: ${lab}` });
          }
        }
      });
      break;
    }
    case 'choices':
      if (req && arr(v).length < (f.min || 1)) out.push({ key: f.key, text: fieldName(f) });
      break;
    case 'ref':
      if (f.count) {
        const xs = arr(v);
        if (req && (xs.length < f.count || !xs.every((x) => refOk(ctx, f.of, x)))) out.push({ key: f.key, text: fieldName(f) });
      } else if (req && !refOk(ctx, f.of, v)) out.push({ key: f.key, text: fieldName(f) });
      break;
    case 'confirm':
      if (req && v !== true) out.push({ key: f.key, text: fieldName(f) });
      break;
    case 'series': {
      // Only points inside the period count: a narrowed period leaves the rest off the graph.
      const per = periodOf(state);
      const pts = arr(v && v.points).filter((p) => !per || (p.t >= per[0] - 1e-6 && p.t <= per[1] + 1e-6) || f.graph && f.graph.role !== 'main');
      if (req && pts.length < (f.min || 2)) out.push({ key: f.key, text: `${fieldName(f)}: at least ${f.min || 2} points` });
      break;
    }
    case 'arrangement': {
      const actors = arr((state.values[2] || {}).actors);
      const layerList = arr((state.values[2] || {}).layers);
      const layers = new Set(layerList.map((l) => l.id));
      const placed = (v && v.placed) || {};
      // A placement counts while its band still exists (older placements kept a height
      // on the sheet instead of a band, 120 to a band, as Arrangement.js reads them).
      const onSheet = (p) => !!p && (p.band ? layers.has(p.band) : typeof p.y === 'number' && Math.floor(p.y / 120) < layerList.length);
      const unplaced = actors.filter((a) => !onSheet(placed[a.id]));
      if (req && actors.length && unplaced.length) out.push({ key: f.key, text: `${unplaced.length} actor${unplaced.length > 1 ? 's' : ''} still in the tray` });
      if (req && !actors.length) out.push({ key: f.key, text: 'the actors from Exercise 5' });
      break;
    }
    case 'sketch':
      break;
    default:
      if (req && !filled(v)) out.push({ key: f.key, text: fieldName(f) });
  }
  return out;
}

export function validateStep(state, stepNo) {
  const def = BUILT[stepNo];
  const ctx = makeCtx(state, stepNo);
  const blocking = [];
  const warnings = [];
  for (const ex of def.exercises) {
    for (const f of ex.fields) {
      for (const p of fieldProblems(state, stepNo, f, ctx)) blocking.push({ exercise: ex.number, provisional: true, ...p });
    }
    for (const c of ex.checks || []) {
      let hit = false;
      try { hit = !!c.test(ctx); } catch (e) { console.error('check', stepNo, c.id, e); }
      if (!hit) continue;
      // A stop is a blocking check that is also shown at its exercise, and that cannot be
      // dismissed: the participant's own answer has ruled the case out.
      // Where a check sends the participant can depend on the case (a function of ctx).
      let sendsTo = c.sendsTo;
      try { if (typeof sendsTo === 'function') sendsTo = sendsTo(ctx); } catch (e) { sendsTo = null; }
      const text = checkText(c, ctx);
      if (c.severity === 'block' || c.severity === 'stop') blocking.push({ exercise: ex.number, id: c.id, text, detail: c.detail, check: c, sendsTo, stop: c.severity === 'stop' });
      else {
        // A dismissal holds for the answer it was written about. Where a check says
        // what it read (a signature), a changed answer raises the warning again.
        let sig = null;
        try { sig = c.signature ? String(c.signature(ctx)) : null; } catch (e) { sig = null; }
        const d = (state.dismissed || {})[`${stepNo}:${c.id}`];
        const holds = d && (!sig || !d.signature || d.signature === sig);
        warnings.push({ exercise: ex.number, id: c.id, text, check: c, sendsTo, signature: sig, dismissed: holds ? d : null });
      }
    }
  }
  return { blocking, warnings };
}

// How far through its required fields a step is, for the progress bar.
export function progress(state, stepNo) {
  const def = BUILT[stepNo];
  const ctx = makeCtx(state, stepNo);
  let total = 0;
  let done = 0;
  for (const ex of def.exercises) {
    for (const f of ex.fields) {
      if (!isShown(f, ctx)) continue;
      if (!(isRequired(f, ctx) || (f.kind === 'table' && f.min))) continue;
      total += 1;
      if (fieldProblems(state, stepNo, f, ctx).length === 0) done += 1;
    }
  }
  return total ? done / total : 0;
}

export function exerciseHasContent(state, stepNo, ex) {
  const vals = state.values[stepNo] || {};
  return ex.fields.some((f) => {
    if (f.kind === 'derived') return false;
    const v = vals[f.key];
    if (f.kind === 'series') return arr(v && v.points).length > 0;
    if (f.kind === 'arrangement') return !!(v && v.placed && Object.keys(v.placed).length);
    if (f.kind === 'table') return arr(v).some((r) => Object.entries(r).some(([k, x]) => k !== 'id' && filled(x)));
    return filled(v);
  });
}

export function stepHasContent(state, stepNo) {
  const def = BUILT[stepNo];
  return def.exercises.some((ex) => exerciseHasContent(state, stepNo, ex));
}
