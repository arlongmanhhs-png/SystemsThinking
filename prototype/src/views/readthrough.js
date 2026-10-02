// What the read-through shows, shared by the screen (ReadView.js) and the file the
// read-through is saved as (ReadFile.js), so that the two never drift: which fields
// of an exercise are read, how a cell, a choice, or a reference is worded, how a
// series is graphed, what the second drawing is summarised as, and the lines page 25
// holds. Nothing here renders.

import { zone } from '../definitions/index.js';
import { PHASE_A } from '../definitions/phase-a.js';
import { LISTS } from '../definitions/lists.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { filled, makeCtx } from '../engine/ctx.js';
import { refOptions } from './fields.js';
import { domainOf } from './Graph.js';

export const arr = (x) => (Array.isArray(x) ? x : []);
export const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function listLabel(list, v, short) {
  const o = (LISTS[list] || []).find((x) => x.value === v);
  return o ? (short && o.short ? o.short : o.label) : '';
}

export function refLabel(state, of, v) {
  if (v === 'nobody') return 'Nobody';
  const o = refOptions(state, of).find((x) => x.value === v);
  return o ? o.label : '';
}

// A table cell, as words.
export function cellText(state, c, v) {
  if (!filled(v)) return '';
  switch (c.kind) {
    case 'choice': return listLabel(c.list, v, c.short);
    case 'choices': return arr(v).map((x) => listLabel(c.list, x, c.short)).join(', ');
    case 'ref': return refLabel(state, c.of, v);
    case 'span': return `${v.from || '?'} to ${v.to || '?'}`;
    default: return String(v);
  }
}

// The title an exercise is read under: its own, or the printed zone's.
export function exerciseTitle(ex) {
  const z = zone(ex.page, ex.number) || {};
  return ex.title || z.title || '';
}

// The fields of an exercise the read-through reads: the ones shown, in the
// definition's order. A hidden series is kept, because the graph draws it with its
// pair; a derived value with no label of its own is not read.
export function readFields(state, def, ex) {
  const ctx = makeCtx(state, def.number);
  return ex.fields
    .filter((f) => !(typeof f.hidden === 'function' ? f.hidden(ctx) : f.hidden) || f.kind === 'series')
    .filter((f) => !f.showIf || f.showIf(ctx))
    .filter((f) => !(f.kind === 'derived' && !f.label));
}

// The label a field is read under, where the definition prints one.
export const fieldLabel = (f) => f.label || f.caption || '';

// The note written beside a field, where the definition names one.
export function noteOf(state, stepNo, f) {
  if (!f.note) return '';
  const v = (state.values[stepNo] || {})[f.note];
  return filled(v) ? String(v) : '';
}

// A series field as the read-through graphs it: the axes and the layers drawn, or
// null where there is nothing to draw. The two futures are drawn together with the
// line, on the same axes, under the first of the pair; the second of the pair is
// drawn with the first and not again.
export function seriesView(state, f, v) {
  const v3 = state.values[3] || {};
  const role = (f.graph && f.graph.role) || 'main';
  if (role === 'futures-pair') return null;
  const futures = role === 'futures';
  const has = (x) => arr(x && x.points).length > 0;
  if (futures ? !(has(v3.future_unchanged) || has(v3.future_desired)) : !has(v)) return null;
  const series = futures ? [v3.series, v3.future_unchanged, v3.future_desired] : [v];
  const domain = domainOf(state, { futures, series });
  if (!domain) return null;
  const layers = futures
    ? [{ key: 'series', value: v3.series, className: 'graph__series--main' }, { key: 'u', value: v3.future_unchanged, className: 'graph__series--unchanged' }, { key: 'd', value: v3.future_desired, className: 'graph__series--desired' }]
    : [{ key: f.key, value: v, className: f.key === 'series' ? 'graph__series--main' : 'graph__series--other' }];
  return { domain, layers, events: f.key === 'series', evidence: f.key === 'series' };
}

// The second drawing, as counts and the lines drawn, actor to actor.
export function arrangementSummary(state, v) {
  const actors = arr((state.values[2] || {}).actors);
  const name = (id) => (actors.find((a) => a.id === id) || {}).name || '___';
  return {
    placed: Object.keys((v && v.placed) || {}).length,
    total: actors.length,
    lines: arr(v && v.lines).map((l) => `${name(l.a)} to ${name(l.b)}`),
    marks: arr(v && v.marks).length,
  };
}

// The one line of counts the second drawing is read as: the screen's own wording,
// provisional (tools/wording-tiers.json).
export const arrangementCounts = (s) => `${s.placed} of ${s.total} actors placed; ${s.lines.length} lines; ${s.marks} disagreement marks.`;

// Page 25, what carries forward: each zone's title as printed, and the text the case
// holds for the zone.
export function carriesZones(state) {
  const carries = WORKBOOK.pages.carries;
  const A = state.values.A || {};
  return PHASE_A.zones.map((z) => {
    const zn = carries.zones.find((x) => String(x.number) === String(z.n)) || {};
    const text = z.written
      ? [A.boundary_sentence, refLabel(state, 'outside', A.exclusion_most_likely_wrong), A.exclusion_most_likely_wrong_note].filter(Boolean).join('\n')
      : A[z.key];
    return { n: z.n, title: zn.title || '', text: text || '' };
  });
}
