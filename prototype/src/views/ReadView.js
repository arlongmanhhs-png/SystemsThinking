// The whole of Phase A on one screen, read only: every exercise's answers in the
// book's order, then what carries forward. Finished, for this prototype, means a
// participant can read Phase A here at the end (design/platform-phase-a.md, section 1).
// What is read, and how, is shared with the file the read-through is saved as
// (readthrough.js, ReadFile.js), so the file never says anything the screen does not.

import { html } from '../html.js';
import { STEPS } from '../definitions/index.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { useCase } from '../engine/store.js';
import { stepInfo, STATE_LABEL } from '../engine/state.js';
import { fieldValue, filled } from '../engine/ctx.js';
import { GraphView } from './Graph.js';
import { SketchView } from './Sketch.js';
import { sketchHasContent } from '../engine/validate.js';
import { useRouter } from './router.js';
import { Prov, fmtDate } from './text.js';
import { SaveButton } from './save.js';
import { readThroughFile } from './ReadFile.js';
import { arr, LETTERS, cellText, exerciseTitle, readFields, fieldLabel, noteOf, listLabel, refLabel, seriesView, arrangementSummary, arrangementCounts, carriesZones } from './readthrough.js';

function Value({ f, v, state }) {
  if (f.kind === 'table') {
    const rows = arr(v);
    if (!rows.length) return html`<p class="read__empty"> </p>`;
    const cols = f.columns;
    // A wide table scrolls inside its own container at phone width, never the page.
    return html`<div class="read__scroll"><table class="read__table">
      ${cols.some((c) => c.head) && html`<thead><tr>${(f.numbered || f.lettered) && html`<th></th>`}${cols.map((c) => html`<th key=${c.key}>${c.head || ''}</th>`)}</tr></thead>`}
      <tbody>${rows.map((r, i) => html`<tr key=${r.id}>
        ${(f.numbered || f.lettered) && html`<td>${f.numbered ? i + 1 : LETTERS[i]}</td>`}
        ${cols.map((c) => html`<td key=${c.key}>${cellText(state, c, r[c.key])}</td>`)}
      </tr>`)}</tbody>
    </table></div>`;
  }
  if (f.kind === 'series') {
    const g = seriesView(state, f, v);
    if (!g) return null;
    return html`<div class="read__graph"><${GraphView} state=${state} domain=${g.domain} layers=${g.layers} events=${g.events} evidence=${g.evidence} /></div>`;
  }
  if (f.kind === 'arrangement') {
    const s = arrangementSummary(state, v);
    return html`<div class="read__drawing">
      <p><${Prov}>${arrangementCounts(s)}</${Prov}></p>
      ${s.lines.length > 0 && html`<p class="es-hint">${s.lines.join('; ')}</p>`}
    </div>`;
  }
  if (f.kind === 'image') return v && v.src ? html`<img class="read__img" src=${v.src} alt="" />` : null;
  // The first drawing, drawn: its marks, labels, and connectors as stored.
  if (f.kind === 'sketch') return sketchHasContent(v) ? html`<div class="read__drawing read__drawing--first"><${SketchView} value=${v} /></div>` : null;
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
      <div class="read__acts">
        <${SaveButton} build=${() => readThroughFile(state)}><${Prov}>Save the read-through to a file</${Prov}></${SaveButton}>
      </div>
    </header>
    ${STEPS.map((def) => {
      const info = stepInfo(state, def.number);
      return html`<section class="read__step" key=${def.number}>
        <h2><a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: def.number }); }}>Step ${def.number}</a>. ${def.title}</h2>
        <p class="es-hint">${STATE_LABEL[info.status]}${info.passedAt ? `, ${fmtDate(info.passedAt)}` : ''}</p>
        ${def.exercises.map((ex) => html`<div class="read__ex" key=${ex.number}>
          <h3><span class="read__exn">${ex.number}</span> ${exerciseTitle(ex)}</h3>
          ${readFields(state, def, ex).map((f) => {
            const v = fieldValue(state, def.number, f);
            const label = fieldLabel(f);
            const note = noteOf(state, def.number, f);
            return html`<div class="read__field" key=${f.key}>${label && html`<div class="read__label">${label}</div>`}<${Value} f=${f} v=${v} state=${state} />
              ${note && html`<p class="es-hint">${note}</p>`}</div>`;
          })}
        </div>`)}
      </section>`;
    })}
    <section class="read__step">
      <h2>${carries.title}</h2>
      ${carriesZones(state).map((z) => html`<div class="read__ex" key=${z.n}><h3><span class="read__exn">${z.n}</span> ${z.title}</h3><p class="read__text">${z.text || ' '}</p></div>`)}
    </section>
  </main>`;
}
