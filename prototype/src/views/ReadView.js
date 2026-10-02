// The whole of Phase A on one screen, read only: every exercise's answers in the
// book's order, then what carries forward. Finished, for this prototype, means a
// participant can read Phase A here at the end (design/platform-phase-a.md, section 1).

import { html } from '../html.js';
import { STEPS, zone } from '../definitions/index.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { PHASE_A } from '../definitions/phase-a.js';
import { LISTS } from '../definitions/lists.js';
import { useCase } from '../engine/store.js';
import { stepInfo, STATE_LABEL } from '../engine/state.js';
import { fieldValue, filled, makeCtx } from '../engine/ctx.js';
import { refOptions } from './fields.js';
import { GraphView, useDomain } from './Graph.js';
import { useRouter } from './router.js';
import { Prov, fmtDate } from './text.js';

const arr = (x) => (Array.isArray(x) ? x : []);
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function listLabel(list, v, short) {
  const o = (LISTS[list] || []).find((x) => x.value === v);
  return o ? (short && o.short ? o.short : o.label) : '';
}

function refLabel(state, of, v) {
  if (v === 'nobody') return 'Nobody';
  const o = refOptions(state, of).find((x) => x.value === v);
  return o ? o.label : '';
}

function cell(state, c, v) {
  if (!filled(v)) return '';
  switch (c.kind) {
    case 'choice': return listLabel(c.list, v, c.short);
    case 'choices': return arr(v).map((x) => listLabel(c.list, x, c.short)).join(', ');
    case 'ref': return refLabel(state, c.of, v);
    case 'span': return `${v.from || '?'} to ${v.to || '?'}`;
    default: return String(v);
  }
}

function Value({ f, v, state }) {
  if (f.kind === 'table') {
    const rows = arr(v);
    if (!rows.length) return html`<p class="read__empty"> </p>`;
    const cols = f.columns;
    return html`<table class="read__table">
      ${cols.some((c) => c.head) && html`<thead><tr>${(f.numbered || f.lettered) && html`<th></th>`}${cols.map((c) => html`<th key=${c.key}>${c.head || ''}</th>`)}</tr></thead>`}
      <tbody>${rows.map((r, i) => html`<tr key=${r.id}>
        ${(f.numbered || f.lettered) && html`<td>${f.numbered ? i + 1 : LETTERS[i]}</td>`}
        ${cols.map((c) => html`<td key=${c.key}>${cell(state, c, r[c.key])}</td>`)}
      </tr>`)}</tbody>
    </table>`;
  }
  if (f.kind === 'series') {
    const v3 = state.values[3] || {};
    const role = (f.graph && f.graph.role) || 'main';
    if (role === 'futures-pair') return null; // drawn with the other future, on the same axes
    const futures = role === 'futures';
    const has = (x) => arr(x && x.points).length > 0;
    if (futures ? !(has(v3.future_unchanged) || has(v3.future_desired)) : !has(v)) return null;
    const series = futures ? [v3.series, v3.future_unchanged, v3.future_desired] : [v];
    const domain = useDomain(state, { futures, series });
    if (!domain) return null;
    const layers = futures
      ? [{ key: 'series', value: v3.series, className: 'graph__series--main' }, { key: 'u', value: v3.future_unchanged, className: 'graph__series--unchanged' }, { key: 'd', value: v3.future_desired, className: 'graph__series--desired' }]
      : [{ key: f.key, value: v, className: f.key === 'series' ? 'graph__series--main' : 'graph__series--other' }];
    return html`<div class="read__graph"><${GraphView} state=${state} domain=${domain} layers=${layers} events=${f.key === 'series'} evidence=${f.key === 'series'} /></div>`;
  }
  if (f.kind === 'arrangement') {
    const placed = Object.keys((v && v.placed) || {}).length;
    const actors = arr((state.values[2] || {}).actors);
    const name = (id) => (actors.find((a) => a.id === id) || {}).name || '___';
    return html`<div class="read__drawing">
      <p><${Prov}>${placed} of ${actors.length} actors placed; ${arr(v && v.lines).length} lines; ${arr(v && v.marks).length} disagreement marks.</${Prov}></p>
      ${arr(v && v.lines).length > 0 && html`<p class="es-hint">${arr(v.lines).map((l) => `${name(l.a)} to ${name(l.b)}`).join('; ')}</p>`}
    </div>`;
  }
  if (f.kind === 'image') return v && v.src ? html`<img class="read__img" src=${v.src} alt="" />` : null;
  if (f.kind === 'sketch') return null;
  if (f.kind === 'confirm') return v ? html`<p>${f.label}</p>` : null;
  if (f.kind === 'choice') return filled(v) ? html`<p>${listLabel(f.list, v)}</p>` : null;
  if (f.kind === 'ref') {
    if (f.count) return html`<p>${arr(v).map((x) => refLabel(state, f.of, x)).join(' / ')}</p>`;
    return filled(v) ? html`<p>${refLabel(state, f.of, v)}</p>` : null;
  }
  if (!filled(v)) return null;
  return html`<p class="read__text">${String(v)}</p>`;
}

export function ReadView() {
  const { state } = useCase();
  const { go } = useRouter();
  const carries = WORKBOOK.pages.carries;
  return html`<main class="read">
    <header class="read__head">
      <div class="es-overline">Phase A</div>
      <h1><${Prov}>Phase A, read through</${Prov}></h1>
      ${state.meta.case && html`<p class="read__case">${state.meta.case}</p>`}
      <p class="es-hint">Started ${fmtDate(state.meta.started)}</p>
    </header>
    ${STEPS.map((def) => {
      const info = stepInfo(state, def.number);
      return html`<section class="read__step" key=${def.number}>
        <h2><a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: def.number }); }}>Step ${def.number}</a>. ${def.title}</h2>
        <p class="es-hint">${STATE_LABEL[info.status]}${info.passedAt ? `, ${fmtDate(info.passedAt)}` : ''}</p>
        ${def.exercises.map((ex) => {
          const z = zone(ex.page, ex.number) || {};
          const ctx = makeCtx(state, def.number);
          const fields = ex.fields
            .filter((f) => !(typeof f.hidden === 'function' ? f.hidden(ctx) : f.hidden) || f.kind === 'series')
            .filter((f) => !f.showIf || f.showIf(ctx));
          return html`<div class="read__ex" key=${ex.number}>
            <h3><span class="read__exn">${ex.number}</span> ${ex.title || z.title}</h3>
            ${fields.map((f) => {
              const v = fieldValue(state, def.number, f);
              if (f.kind === 'derived' && !f.label) return null;
              const label = f.label || f.caption || '';
              const body = html`<${Value} f=${f} v=${v} state=${state} />`;
              return html`<div class="read__field" key=${f.key}>${label && html`<div class="read__label">${label}</div>`}${body}
                ${f.note && filled((state.values[def.number] || {})[f.note]) && html`<p class="es-hint">${(state.values[def.number] || {})[f.note]}</p>`}</div>`;
            })}
          </div>`;
        })}
      </section>`;
    })}
    <section class="read__step">
      <h2>${carries.title}</h2>
      ${PHASE_A.zones.map((z) => {
        const zn = carries.zones.find((x) => String(x.number) === String(z.n));
        const A = state.values.A || {};
        const text = z.written
          ? [A.boundary_sentence, refLabel(state, 'outside', A.exclusion_most_likely_wrong), A.exclusion_most_likely_wrong_note].filter(Boolean).join('\n')
          : A[z.key];
        return html`<div class="read__ex" key=${z.n}><h3><span class="read__exn">${z.n}</span> ${zn.title}</h3><p class="read__text">${text || ' '}</p></div>`;
      })}
    </section>
  </main>`;
}
