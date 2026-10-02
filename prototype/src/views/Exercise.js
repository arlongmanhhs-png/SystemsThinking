// One exercise, rendered from its definition. Label, title, and instruction are the
// workbook's, read from the printed page; the fields are laid out as the page lays
// them out where the page has a shape of its own (the sentence form, the yes or no
// grid, the two boxes, the position ticks).

import { html, useState } from '../html.js';
import { zone, BUILT } from '../definitions/index.js';
import { LISTS, label as listLabel } from '../definitions/lists.js';
import { fieldValue, makeCtx } from '../engine/ctx.js';
import { useCase } from '../engine/store.js';
import { Field, Line, Choice, Derived } from './fields.js';
import { GraphView, useDomain } from './Graph.js';
import { Rich, Prov, TermScope, fmtDate } from './text.js';
import { PassageRail } from './Passage.js';
import { DrawingReport } from './Arrangement.js';
import { useRouter } from './router.js';
import { Warnings, Stops } from './Warnings.js';

const arr = (x) => (Array.isArray(x) ? x : []);

// The printed instruction of an exercise: its zone's hints, less those the fields
// print themselves.
function exerciseText(ex) {
  if (ex.hint !== undefined) return ex.hint ? [ex.hint] : [];
  const z = zone(ex.page, ex.number);
  if (!z) return [];
  const own = new Set();
  for (const f of ex.fields) {
    for (const k of ['hint', 'label', 'caption']) if (typeof f[k] === 'string') own.add(f[k]);
  }
  if (ex.layout && ex.layout.between) own.add(ex.layout.between);
  return (z.hintsInline || []).filter((h, i) => !own.has(z.hints[i]));
}

function head(ex) {
  const z = zone(ex.page, ex.number) || {};
  return { label: ex.label || z.label || `Exercise ${ex.number}`, title: ex.title || z.title || '' };
}

const FORM_ROUTE = {
  mismatch: 'For a mismatch, graph the amount available in the place where the need is.',
  standard: 'For falling short of a standard, graph the measured level of the thing the standard is about.',
  not_yet: 'For not happened yet, there is no series to draw, so graph the nearest quantity that does have a history: the pressure that would produce the risk, or the capacity that would absorb it, and say why that is the nearest one available.',
};

function Beside({ spec, state, step }) {
  const { act } = useCase();
  let text = '';
  const from = spec.step || step;
  if (spec.derived) text = (BUILT[from].derive[spec.derived] || (() => ''))(makeCtx(state, from));
  else if (spec.step) text = (state.values[spec.step] || {})[spec.key] || '';
  return html`<aside class="beside">
    <div class="es-overline"><${Prov} on=${!!spec.provisional}>${spec.label}</${Prov}></div>
    <div class=${`beside__text ${text ? '' : 'is-empty'}`}>${text || ' '}</div>
    ${spec.copy && html`<${CopyAcross} copy=${spec.copy} state=${state} step=${step} act=${act} />`}
  </aside>`;
}

// Copies what is shown beside an exercise into its fields, on request only. Offered once
// every source value is written; replaces what is already written only after asking.
function CopyAcross({ copy, state, step, act }) {
  const src = state.values[copy.fromStep || step] || {};
  const cur = state.values[step] || {};
  const vals = Object.entries(copy.map).map(([key, get]) => [key, (get(src) || '').toString().trim()]);
  const ready = vals.every(([, v]) => v !== '');
  const same = vals.every(([key, v]) => String(cur[key] || '').trim() === v);
  if (ready && same) return html`<p class="es-hint beside__copied"><${Prov}>${copy.done}</${Prov}></p>`;
  const written = vals.some(([key]) => String(cur[key] || '').trim() !== '');
  const onCopy = () => {
    if (written && !window.confirm(copy.replace)) return;
    for (const [key, v] of vals) act.setValue(step, key, v);
  };
  return html`<button class="es-btn es-btn--ghost es-btn--sm beside__copy" disabled=${!ready} onClick=${onCopy}>${copy.label}</button>`;
}

export function Exercise({ step, ex, info, highlight, passageFor, onOpenRail, railPage, railInline }) {
  const { state, act } = useCase();
  const { go } = useRouter();
  const def = BUILT[step];
  const ctx = makeCtx(state, step);
  const h = head(ex);
  const texts = exerciseText(ex);
  const [showPrinted, setShowPrinted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const set = (key) => (v, k) => act.setValue(step, k || key, v);
  const val = (f) => fieldValue(state, step, f);
  const hl = (key) => highlight && highlight.has(key);
  const fieldByKey = (k) => ex.fields.find((f) => f.key === k);
  const visible = (f) => !(typeof f.hidden === 'function' ? f.hidden(ctx) : f.hidden);
  const shown = (f) => (!f.showIf || f.showIf(ctx)) && visible(f);

  const collapsed = ex.collapseWhen && ex.collapseWhen(ctx) && !expanded;
  const variant = ex.screenVariant;

  const renderField = (f, extra = {}) => html`<${Field} key=${f.key} f=${{ ...f, ...extra }} value=${val(f)} onChange=${set(f.key)}
    state=${state} ctx=${ctx} step=${step} highlight=${hl(f.key)} />`;

  let body;
  const L = ex.layout || {};
  if (collapsed) {
    const f = ex.fields[0];
    body = html`<button class="collapsed-line" onClick=${() => setExpanded(true)} title="Open">
      <span class="collapsed-line__text">${val(f)}</span><span class="es-hint"><${Prov}>open</${Prov}></span>
    </button>`;
  } else if (L.type === 'statement') {
    const assembled = BUILT[step].derive[L.assembled](ctx);
    const before = (L.before || []).map(fieldByKey).filter((f) => f && shown(f));
    body = html`<div class="statement">
      ${before.length > 0 && html`<div class="statement__before">${before.map((f) => renderField(f))}</div>`}
      <div class="statement__form">
        ${L.parts.map((p, i) => {
          if (p === '\n') return html`<div key=${i} class="statement__break"></div>`;
          if (typeof p === 'string') return html`<span key=${i} class=${`statement__word ${/^[,.]$/.test(p) ? 'is-punct' : ''}`}>${p}</span>`;
          const f = fieldByKey(p.key);
          if (f.kind === 'choice') {
            return html`<span key=${i} class=${`statement__pick ${hl(f.key) ? 'is-highlight' : ''}`}>
              <${Choice} list=${f.list} value=${val(f)} onChange=${set(f.key)} name=${`${step}-${f.key}`} inline />
            </span>`;
          }
          return html`<span key=${i} class=${`statement__slot ${hl(f.key) ? 'is-highlight' : ''}`}>
            <${Line} value=${val(f)} onChange=${set(f.key)} ariaLabel=${f.caption} />
            <span class="field__caption">${f.caption}</span>
          </span>`;
        })}
      </div>
      <div class="statement__assembled">
        <div class="es-overline"><${Prov}>As you have written it</${Prov}></div>
        <p class=${assembled ? '' : 'is-empty'}>${assembled || ' '}</p>
      </div>
      ${ex.fields.filter((f) => !L.parts.some((p) => p && p.key === f.key) && !(L.before || []).includes(f.key) && shown(f)).map((f) => renderField(f))}
    </div>`;
  } else if (L.type === 'yesno-grid') {
    const rows = ex.fields.filter((f) => f.list === 'yes_no');
    const normal = rows.filter((f) => !f.callout);
    const callout = rows.filter((f) => f.callout);
    const row = (f) => html`<div class=${`yn__row ${hl(f.key) ? 'is-highlight' : ''}`} key=${f.key}>
      <div class="yn__ticks">${LISTS.yes_no.map((o) => {
        const stored = o.value;
        return html`<label key=${o.value} class="es-radio yn__tick" title=${o.label}>
        <input type="radio" name=${`${step}-${f.key}`} checked=${val(f) === stored} aria-label=${`${o.label}: ${f.label}`}
          onClick=${() => { if (val(f) === stored) act.setValue(step, f.key, null); }}
          onChange=${() => act.setValue(step, f.key, stored)} /></label>`;
      })}</div>
      <div class="yn__q">${f.label}</div>
      ${f.note ? html`<div class="yn__note"><${Line} small value=${(state.values[step] || {})[f.note]} ariaLabel=${`${L.noteHead}: ${f.label}`}
        onChange=${(x) => act.setValue(step, f.note, x)} /></div>` : html`<div></div>`}
    </div>`;
    body = html`<div class="yn">
      <div class="yn__head"><div class="yn__ticks">${L.head.map((x) => html`<span key=${x}>${x}</span>`)}</div><div></div><div class="es-overline">${L.noteHead}</div></div>
      ${normal.map(row)}
      ${callout.map((f) => html`<div class="yn__callout" key=${`c${f.key}`}>
        <b>${f.callout}</b>
        ${row(f)}
        <p class="es-hint">${f.hint}</p>
      </div>`)}
    </div>`;
  } else if (L.type === 'two-boxes') {
    // The page's two boxes, side by side, each holding the fields the definition puts in it.
    body = html`<div class="twoboxes">
      ${L.boxes.map((keys, i) => html`<div class="twoboxes__box" key=${i}>
        ${keys.map(fieldByKey).filter((f) => f && shown(f)).map((f) => renderField(f))}
      </div>`)}
    </div>`;
  } else if (L.type === 'position') {
    const f = fieldByKey('position');
    const opts = LISTS.positions;
    const v = val(f);
    const radio = (o) => html`<label class="es-radio choice__opt" key=${o.value}>
      <input type="radio" name=${`${step}-position`} checked=${v === o.value}
        onClick=${() => { if (v === o.value) act.setValue(step, 'position', null); }}
        onChange=${() => act.setValue(step, 'position', o.value)} />
      <span>${o.label}</span></label>`;
    body = html`<div class=${`position ${hl('position') ? 'is-highlight' : ''}`}>
      <div class="choice">${radio(opts[0])}</div>
      <p class="es-hint">${L.between}</p>
      <div class="choice choice--inline">${opts.slice(1).map(radio)}</div>
      ${renderField(fieldByKey('on_behalf_of'))}
    </div>`;
  } else if (L.type === 'columns') {
    body = html`<div class="columns">${ex.fields.filter(shown).map((f) => html`<div class="columns__col" key=${f.key}>${renderField(f)}</div>`)}</div>`;
  } else {
    // Consecutive inline fields share a line, as "From ___ to ___" does on the page.
    const groups = [];
    for (const f of ex.fields.filter(shown)) {
      const lastGroup = groups[groups.length - 1];
      if (f.inline && Array.isArray(lastGroup)) lastGroup.push(f);
      else groups.push(f.inline ? [f] : f);
    }
    body = html`<div class="fields">
      ${groups.map((f) => {
        if (Array.isArray(f)) return html`<div class="inline-row" key=${f[0].key}>${f.map((g) => renderField(g))}</div>`;
        if (f.kind === 'derived' && f.display === 'form_route') {
          const r = val(f);
          return r ? html`<p class="es-hint form-route" key=${f.key}>${FORM_ROUTE[r]}</p>` : null;
        }
        if (f.kind === 'derived' && f.display === 'ara') return html`<${AraPattern} key=${f.key} state=${state} />`;
        if (f.kind === 'number' && f.layout) {
          return html`<p class="inline-sentence" key=${f.key}>${f.layout.before}
            <input class="es-input es-input--sm field__number" type="text" inputmode="numeric" value=${val(f) || ''} aria-label="in total"
              onInput=${(e) => act.setValue(step, f.key, e.target.value.replace(/[^0-9]/g, ''))} />
            ${f.layout.after}</p>`;
        }
        if (f.kind === 'table' && f.graph) return html`<div key=${f.key}><${TableGraph} f=${f} state=${state} />${renderField(f)}</div>`;
        if (f.kind === 'derived' && f.returnLink) {
          const r = def.returnsOut.find((x) => x.id === f.returnLink);
          return html`<div key=${f.key} class="field">
            <div class="es-label">${f.label}</div>
            <${Derived} value=${val(f)} label=${f.label} />
            ${r && html`<div class="es-hint"><${Prov}>Fixed by Step 1 and not changed here.</${Prov}> ${r.when}: <${ReturnLink} step=${step} r=${r} text=${html`<${Prov}>go back to Step ${r.to.step}</${Prov}>`} /></div>`}
          </div>`;
        }
        if (f.kind === 'choice' && f.graph && f.graph.role === 'thumb') {
          return html`<div key=${f.key} class="shape-pick"><div>${renderField(f)}</div><${LineThumb} state=${state} /></div>`;
        }
        return renderField(f);
      })}
    </div>`;
  }

  const warnings = arr(info.warnings).filter((w) => w.exercise === ex.number);

  return html`<section class=${`exercise ${ex.wide ? 'exercise--wide' : ''} ${ex.where !== 'screen' ? `exercise--${ex.where}` : ''}`}
    id=${`ex-${step}-${ex.number}`} data-exercise=${ex.number}>
    <header class="exercise__head">
      <div class="exercise__num es-sq-2a">${ex.number}</div>
      <div class="exercise__titles">
        <div class="es-overline exercise__label">${variant && variant.label ? variant.label : h.label}</div>
        <h3 class="exercise__title">${h.title}</h3>
      </div>
      ${passageFor && html`<button class="es-btn es-btn--quiet es-btn--sm exercise__instr"
        aria-pressed=${railPage === passageFor.page} onClick=${() => onOpenRail(railPage === passageFor.page ? null : passageFor.page)}>
        <${Prov}>Instructions</${Prov}>
      </button>`}
    </header>
    ${railInline && passageFor && railPage === passageFor.page && html`<div class="exercise__railinline"><${PassageRail} pageId=${passageFor.page} onClose=${() => onOpenRail(null)} /></div>`}
    ${step === 2 && ex.number === 11 && html`<${DrawingReport} state=${state} compact=${true} />`}
    <${TermScope}>
      ${variant
        ? html`<div class="exercise__hint">
            <p><${Prov}>${variant.hint}</${Prov}></p>
            <button class="linkish" aria-expanded=${showPrinted} onClick=${() => setShowPrinted(!showPrinted)}><${Prov}>${showPrinted ? 'Hide the printed form' : 'The printed form'}</${Prov}></button>
            ${showPrinted && html`<div class="printed-form"><div class="es-overline">${h.label}</div>${texts.map((t, i) => html`<p key=${i}><${Rich} c=${t} terms=${false} /></p>`)}</div>`}
          </div>`
        : texts.length > 0 && html`<div class="exercise__hint">${texts.map((t, i) => html`<p key=${i}><${Rich} c=${t} /></p>`)}</div>`}
    </${TermScope}>
    ${ex.subset && html`<${Subset} state=${state} />`}
    <div class=${`exercise__body ${ex.showBeside ? 'has-beside' : ''}`}>
      <div class="exercise__main">${body}</div>
      ${ex.showBeside && html`<${Beside} spec=${ex.showBeside} state=${state} step=${step} />`}
    </div>
    <${Stops} step=${step} list=${arr(info.blocking).filter((b) => b.exercise === ex.number && b.stop)} />
    <${Warnings} step=${step} list=${warnings} />
  </section>`;
}

// Step 2, Exercise 6: which of the three patterns each decision shows.
function AraPattern({ state }) {
  const ctx = makeCtx(state, 2);
  const list = BUILT[2].derive.ara_pattern(ctx).filter((p) => p.patterns.length);
  if (!list.length) return null;
  const TEXT = {
    all_one: 'All three in one layer.',
    authority_responsibility_apart: 'Authority in one layer, responsibility in another.',
    accountability_elsewhere: 'Accountability somewhere else, or nowhere.',
  };
  return html`<div class="ara">
    <div class="es-overline"><${Prov}>The pattern this allocation shows</${Prov}></div>
    ${list.map((p, i) => html`<p key=${p.id}>${list.length > 1 ? `${i + 1}. ` : ''}${p.patterns.map((k) => TEXT[k]).join(' ')}</p>`)}
  </div>`;
}

// Step 2, Exercise 7: who the dependency question is asked for, read off Exercise 6.
function Subset({ state }) {
  const ctx = makeCtx(state, 2);
  const { core, holders } = BUILT[2].derive.dependency_subset(ctx);
  const actors = ctx.rows('actors');
  const deps = ctx.rows('dependencies');
  const missing = BUILT[2].derive.missing_dependencies(ctx);
  const name = (id) => (actors.find((a) => a.id === id) || {}).name || '___';
  const others = actors.filter((a) => !core.includes(a.id) && !holders.includes(a.id));
  return html`<div class="subset">
    <div class="subset__col">
      <div class="es-overline"><${Prov}>Asked for, read off Exercise 6</${Prov}></div>
      ${core.length === 0 && html`<p class="es-hint"><${Prov}>No layer holds authority, responsibility, or accountability yet in Exercise 6.</${Prov}></p>`}
      <ul>${core.map((id) => {
        const n = missing.filter((m) => m.actor === id).length;
        return html`<li key=${id}>${name(id)} <span class="es-hint"><${Prov}>${n ? `${n} resource${n > 1 ? 's' : ''} still to answer` : 'answered'}</${Prov}></span></li>`;
      })}</ul>
      ${holders.length > 0 && html`<div class="es-overline"><${Prov}>And those they need something from</${Prov}></div>
        <ul>${holders.map((id) => html`<li key=${id}>${name(id)}</li>`)}</ul>`}
    </div>
    <div class="subset__col">
      <div class="es-overline"><${Prov}>Not asked</${Prov}></div>
      <p class="es-hint">Every other actor keeps the ticks in Exercise 5 and nothing more, and that blank is a state rather than an omission.</p>
      <ul>${others.map((a) => html`<li key=${a.id}>${a.name || '___'}${deps.some((d) => d.actor === a.id) ? '' : ''}</li>`)}</ul>
    </div>
  </div>`;
}

// Step 3: the line, read only, above the event strip and the evidence marks.
function TableGraph({ f, state }) {
  const v3 = state.values[3] || {};
  const domain = useDomain(state, { series: [v3.series] });
  if (!domain) return null;
  const events = f.graph.role === 'events';
  const evidence = f.graph.role === 'evidence';
  const gaps = evidence ? BUILT[3].derive.evidence_gaps(makeCtx(state, 3)) : [];
  return html`<${GraphView} state=${state} domain=${domain} layers=${[{ key: 'series', value: v3.series, className: 'graph__series--main' }]}
    events=${events || evidence} evidence=${evidence} gaps=${gaps} />`;
}

function LineThumb({ state }) {
  const v3 = state.values[3] || {};
  const domain = useDomain(state, { series: [v3.series] });
  if (!domain) return null;
  return html`<div class="shape-pick__thumb"><${GraphView} state=${state} domain=${domain} layers=${[{ key: 'series', value: v3.series, className: 'graph__series--main' }]} /></div>`;
}

export function ReturnLink({ step, r, text }) {
  const { act } = useCase();
  const { go } = useRouter();
  return html`<a href="#" class="returnlink" onClick=${(e) => {
    e.preventDefault();
    act.raiseReturn(step, r.to.step, r);
    go({ view: 'step', step: r.to.step, exercise: r.to.exercise, fields: r.to.fields });
  }}>${text || `Step ${r.to.step}`}</a>`;
}
