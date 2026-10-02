// The accessor a step definition reads the case through. Definitions never touch the
// stored case directly, so that what they can see is the same everywhere.

import { BUILT } from '../definitions/index.js';

export function filled(v) {
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (typeof v === 'number') return !Number.isNaN(v);
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') {
    if ('from' in v || 'to' in v) return filled(v.from) && filled(v.to);
    return Object.keys(v).length > 0;
  }
  return true;
}

const arr = (x) => (Array.isArray(x) ? x : []);

export function makeCtx(state, stepNo) {
  const vals = (s) => (state.values && state.values[s]) || {};
  const ctx = {
    step: stepNo,
    v: (key) => vals(stepNo)[key],
    at: (s, key) => vals(s)[key],
    rows: (key) => arr(vals(stepNo)[key]),
    rowsAt: (s, key) => arr(vals(s)[key]),
    // A row by id. Tables named in Step 2 are read from Step 2 wherever the call is
    // made from, because actors, layers, and descriptions exist only there.
    row: (table, id) => {
      const s = ['actors', 'layers', 'actor_types', 'descriptions', 'outside', 'inside', 'decisions', 'dependencies'].includes(table) ? 2 : stepNo;
      return arr(vals(s)[table]).find((r) => r.id === id) || null;
    },
    derived: (name) => derivedAt(state, stepNo, name),
    derivedAt: (s, name) => derivedAt(state, s, name),
    complete: (keys) => keys.every((k) => filled(vals(stepNo)[k])),
    filled,
  };
  return ctx;
}

export function derivedAt(state, stepNo, name) {
  const def = BUILT[stepNo];
  if (!def || !def.derive || !def.derive[name]) return undefined;
  try {
    return def.derive[name](makeCtx(state, stepNo));
  } catch (e) {
    console.error('derive', stepNo, name, e);
    return undefined;
  }
}

// A field's value, resolving derived fields and copies from another step.
export function fieldValue(state, stepNo, f) {
  if (f.kind === 'derived') {
    if (f.from) return (state.values[f.from.step] || {})[f.from.key];
    if (f.derive) return derivedAt(state, stepNo, f.derive);
  }
  return (state.values[stepNo] || {})[f.key];
}
