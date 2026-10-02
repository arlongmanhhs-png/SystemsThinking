// The field kinds. Build the kinds, not the screens: every exercise in Phase A is
// made of these, and so, probably, is every exercise in the process.

import { html, useState, useRef } from '../html.js';
import { LISTS } from '../definitions/lists.js';
import { newId } from '../engine/store.js';
import { Prov } from './text.js';
import { Graph } from './Graph.js';
import { Arrangement } from './Arrangement.js';
import { Sketch } from './Sketch.js';

const arr = (x) => (Array.isArray(x) ? x : []);
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function FieldLabel({ f, htmlFor }) {
  const text = f.label;
  if (!text) return null;
  return html`<label class="es-label field__label" for=${htmlFor}><${Prov} on=${!!f.provisional}>${text}</${Prov}></label>`;
}

function useId(prefix) {
  const r = useRef(null);
  if (!r.current) r.current = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  return r.current;
}

export function Line({ value, onChange, placeholder, id, small, ariaLabel }) {
  return html`<input id=${id} class=${`es-input ${small ? 'es-input--sm' : ''}`} type="text" value=${value || ''}
    aria-label=${ariaLabel} placeholder=${placeholder || ''} onInput=${(e) => onChange(e.target.value)} />`;
}

export function Block({ value, onChange, rows = 3, id, ariaLabel }) {
  return html`<textarea id=${id} class="es-input" rows=${rows} value=${value || ''} aria-label=${ariaLabel}
    onInput=${(e) => onChange(e.target.value)}></textarea>`;
}

export function Year({ value, onChange, id, ariaLabel }) {
  return html`<input id=${id} class="es-input es-input--sm field__year" type="text" inputmode="numeric" maxlength="4"
    aria-label=${ariaLabel} value=${value || ''} onInput=${(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} />`;
}

function NumberInput({ value, onChange, id, ariaLabel }) {
  return html`<input id=${id} class="es-input es-input--sm field__number" type="text" inputmode="numeric" aria-label=${ariaLabel}
    value=${value ?? ''} onInput=${(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))} />`;
}

export function Choice({ list, options, value, onChange, name, inline, gloss, short, allowClear = true }) {
  const opts = options || LISTS[list] || [];
  return html`<div class=${`choice ${inline ? 'choice--inline' : ''} ${gloss ? 'choice--gloss' : ''}`} role="radiogroup">
    ${opts.map((o) => html`<label class="es-radio choice__opt" key=${o.value}>
      <input type="radio" name=${name} checked=${value === o.value}
        onClick=${() => { if (value === o.value && allowClear) onChange(null); }}
        onChange=${() => onChange(o.value)} />
      <span>
        <${Prov} on=${!!o.provisional}>${short && o.short ? o.short : o.label}</${Prov}>
        ${gloss && o.gloss && html`<span class="choice__gloss">${o.gloss}</span>`}
      </span>
    </label>`)}
  </div>`;
}

export function Choices({ list, value, onChange, short }) {
  const opts = LISTS[list] || [];
  const v = arr(value);
  return html`<div class=${`choices ${short ? 'choices--short' : ''}`}>
    ${opts.map((o) => html`<label class="es-check choices__opt" key=${o.value} title=${o.gloss || o.label}>
      <input type="checkbox" checked=${v.includes(o.value)}
        onChange=${(e) => onChange(e.target.checked ? [...v, o.value] : v.filter((x) => x !== o.value))} />
      <span>${short ? (o.short || o.label) : o.label}</span>
    </label>`)}
  </div>`;
}

function Confirm({ f, value, onChange }) {
  return html`<label class="es-check field__confirm">
    <input type="checkbox" checked=${value === true} onChange=${(e) => onChange(e.target.checked)} />
    <span><${Prov} on=${!!f.provisional}>${f.label}</${Prov}></span>
  </label>`;
}

// The rows a reference can point at, labelled the way the printed table labels them.
export function refOptions(state, of, filterLayer) {
  const v2 = state.values[2] || {};
  const rows = arr(v2[of]);
  if (of === 'layers') return rows.map((r, i) => ({ value: r.id, label: `${i + 1} ${r.name || ''}`.trim() }));
  if (of === 'actor_types') return rows.map((r, i) => ({ value: r.id, label: `${LETTERS[i]} ${r.label || ''}`.trim() }));
  if (of === 'actors') {
    return rows.filter((r) => !filterLayer || r.layer === filterLayer).map((r) => ({ value: r.id, label: r.name || '(no name yet)' }));
  }
  if (of === 'descriptions') {
    const actors = arr(v2.actors);
    return rows.map((r, i) => {
      const a = actors.find((x) => x.id === r.actor);
      return { value: r.id, label: `${i + 1}. ${a ? a.name : '___'}: ${r.reading || ''}` };
    });
  }
  if (of === 'outside') return rows.map((r) => ({ value: r.id, label: `${r.label || ''}${r.mark ? ` (${r.mark})` : ''}` }));
  return [];
}

export function RefSelect({ state, of, value, onChange, nobody, filterLayer, exclude, ariaLabel, small = true }) {
  const opts = refOptions(state, of, filterLayer).filter((o) => o.value !== exclude);
  const known = !value || value === 'nobody' || opts.some((o) => o.value === value);
  return html`<select class=${`es-input ${small ? 'es-input--sm' : ''} field__ref`} value=${value || ''} aria-label=${ariaLabel}
    onChange=${(e) => onChange(e.target.value || null)}>
    <option value="">${' '}</option>
    ${nobody && html`<option value="nobody">Nobody</option>`}
    ${opts.map((o) => html`<option key=${o.value} value=${o.value}>${o.label}</option>`)}
    ${!known && html`<option value=${value}>(removed)</option>`}
  </select>`;
}

function Span({ value, onChange }) {
  const v = value || {};
  return html`<span class="field__span">
    <${Year} value=${v.from} ariaLabel="from" onChange=${(x) => onChange({ ...v, from: x })} />
    <span class="field__spanto">to</span>
    <${Year} value=${v.to} ariaLabel="to" onChange=${(x) => onChange({ ...v, to: x })} />
  </span>`;
}

// A photograph, reduced in the browser so that it fits in local storage.
function ImageField({ f, value, onChange }) {
  const [err, setErr] = useState(null);
  const pick = (file) => {
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1400;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      onChange({ src: c.toDataURL('image/jpeg', 0.78), name: file.name, at: new Date().toISOString() });
      setErr(null);
    };
    img.onerror = () => setErr('That file could not be read as an image.');
    img.src = url;
  };
  return html`<div class="field__image">
    ${value && value.src
      ? html`<figure class="field__imagefig"><img src=${value.src} alt=${f.label || ''} />
          <figcaption>${value.name || ''} <button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => onChange(null)}><${Prov}>Remove the photograph</${Prov}></button></figcaption></figure>`
      : html`<label class="es-btn es-btn--ghost es-btn--sm field__imagepick">
          <input type="file" accept="image/*" onChange=${(e) => pick(e.target.files[0])} />
          <${Prov}>Add a photograph</${Prov}>
        </label>`}
    ${err && html`<div class="es-flag"><${Prov}>${err}</${Prov}></div>`}
  </div>`;
}

export function Derived({ value, label }) {
  const empty = value == null || value === '';
  return html`<div class=${`field__derived ${empty ? 'is-empty' : ''}`} aria-label=${label}>${empty ? ' ' : String(value)}</div>`;
}

// One field, by kind. Table columns reuse the same editors through Cell.
export function Field({ f, value, onChange, state, ctx, step, highlight }) {
  const id = useId(f.key);
  const common = { id, value, onChange, ariaLabel: f.label || f.caption || f.key };
  let body;
  switch (f.kind) {
    case 'line': body = html`<${Line} ...${common} />`; break;
    case 'block': body = html`<${Block} ...${common} rows=${f.rows} />`; break;
    case 'year': body = html`<${Year} ...${common} />`; break;
    case 'number': body = html`<${NumberInput} ...${common} />`; break;
    case 'choice': body = html`<${Choice} list=${f.list} value=${value} onChange=${onChange} name=${`${step}-${f.key}`} inline=${f.inline} gloss=${f.gloss} />`; break;
    case 'choices': body = html`<${Choices} list=${f.list} value=${value} onChange=${onChange} />`; break;
    case 'confirm': return html`<div class=${`field ${highlight ? 'is-highlight' : ''}`}><${Confirm} f=${f} value=${value} onChange=${onChange} /></div>`;
    case 'image': body = html`<${ImageField} f=${f} value=${value} onChange=${onChange} />`; break;
    case 'span': body = html`<${Span} value=${value} onChange=${onChange} />`; break;
    // Step 2, Exercise 1: the first drawing, a free-form canvas (Sketch.js).
    case 'sketch': return html`<${Sketch} f=${f} value=${value} onChange=${onChange} />`;
    case 'series': body = html`<${Graph} f=${f} value=${value} onChange=${onChange} state=${state} ctx=${ctx} step=${step} />`; break;
    case 'arrangement': return html`<${Arrangement} value=${value} onChange=${onChange} state=${state} />`;
    case 'ref':
      if (f.count) {
        const v = arr(value);
        body = html`<div class="field__pair">${Array.from({ length: f.count }, (_, i) => html`<${RefSelect} key=${i} state=${state} of=${f.of} value=${v[i]} small=${false}
          ariaLabel=${`${f.label} ${i + 1}`}
          onChange=${(x) => { const n = [...v]; n[i] = x; onChange(n); }} />`)}</div>`;
      } else body = html`<${RefSelect} state=${state} of=${f.of} value=${value} onChange=${onChange} nobody=${f.nobody} small=${false} ariaLabel=${f.label} />`;
      break;
    case 'table': body = html`<${Table} f=${f} value=${value} onChange=${onChange} state=${state} ctx=${ctx} step=${step} />`; break;
    case 'derived': body = html`<${Derived} value=${value} label=${f.label} />`; break;
    default: body = html`<div class="es-flag">Unknown field kind: ${f.kind}</div>`;
  }
  return html`<div class=${`field field--${f.kind} ${f.inline ? 'field--inline' : ''} ${highlight ? 'is-highlight' : ''}`} data-key=${f.key}>
    <${FieldLabel} f=${f} htmlFor=${id} />
    ${body}
    ${f.caption && html`<div class="field__caption">${f.caption}</div>`}
    ${f.hint && html`<div class="es-hint field__hint">${f.hint}</div>`}
  </div>`;
}

// A table cell: one column's editor for one row.
function Cell({ c, row, rows, i, set, state, f }) {
  const v = row[c.key];
  const aria = c.head || c.label || c.key;
  switch (c.kind) {
    case 'line': return html`<${Line} small value=${v} onChange=${set} ariaLabel=${aria} placeholder=${(c.rowLabel && c.rowLabel(i, rows.length)) || ''} />`;
    case 'block': return html`<${Block} rows=${c.rows || 2} value=${v} onChange=${set} ariaLabel=${aria} />`;
    case 'year': return html`<${Year} value=${v} onChange=${set} ariaLabel=${aria} />`;
    case 'span': return html`<${Span} value=${v} onChange=${set} />`;
    case 'choices': return html`<${Choices} list=${c.list} value=${v} onChange=${set} short=${c.short} />`;
    case 'choice': {
      let options = null;
      if (c.fromRow) {
        const src = (state.values[2] || {})[c.fromRow.table] || [];
        const held = (src.find((r) => r.id === row[c.fromRow.ref]) || {})[c.fromRow.key] || [];
        options = (LISTS[c.list] || []).filter((o) => held.includes(o.value) || o.value === v);
      }
      if (options && !options.length) return html`<span class="es-hint"><${Prov}>No resources ticked for this actor in Exercise 5</${Prov}></span>`;
      if (c.short || options) {
        const opts = options || LISTS[c.list] || [];
        return html`<select class="es-input es-input--sm" value=${v || ''} aria-label=${aria} onChange=${(e) => set(e.target.value || null)}>
          <option value="">${' '}</option>
          ${opts.map((o) => html`<option key=${o.value} value=${o.value}>${c.short && o.short ? `${o.short} ${o.label}` : o.label}</option>`)}
        </select>`;
      }
      return html`<${Choice} list=${c.list} value=${v} onChange=${set} name=${`${f.key}-${row.id}-${c.key}`} inline />`;
    }
    case 'ref': {
      const layer = c.within ? row[c.within] : null;
      if (c.within && (!layer || layer === 'nobody')) return html`<span class="es-hint">${' '}</span>`;
      return html`<${RefSelect} state=${state} of=${c.of} value=${v} onChange=${set} nobody=${c.nobody}
        filterLayer=${layer} exclude=${c.self === false ? row.id : null} ariaLabel=${aria} />`;
    }
    default: return html`<span class="es-flag">${c.kind}</span>`;
  }
}

function RemoveButton({ onRemove }) {
  const [sure, setSure] = useState(false);
  if (!sure) return html`<button class="rowbtn" title="Remove this row" aria-label="Remove this row" onClick=${() => setSure(true)}>×</button>`;
  return html`<span class="rowconfirm">
    <button class="es-btn es-btn--quiet es-btn--sm" onClick=${onRemove}><${Prov}>Remove the row</${Prov}></button>
    <button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => setSure(false)}><${Prov}>Keep the row</${Prov}></button>
  </span>`;
}

// A repeating table with typed columns.
export function Table({ f, value, onChange, state }) {
  const rows = arr(value);
  const setRow = (id, key, x) => onChange(rows.map((r) => (r.id === id ? { ...r, [key]: x } : r)));
  const add = (init = {}) => onChange([...rows, { id: newId(f.key.slice(0, 3)), ...init }]);
  const remove = (id) => onChange(rows.filter((r) => r.id !== id));
  const move = (i, d) => {
    const n = [...rows];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  const full = f.max && rows.length >= f.max;
  const single = f.columns.length === 1;
  const suggestions = f.suggestions ? (LISTS[f.suggestions] || []).filter((s) => !rows.some((r) => (r.label || '').trim().toLowerCase() === s.value)) : [];

  const setRows = (id, patch) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  if (f.layout === 'decision') return html`<${DecisionTable} f=${f} rows=${rows} setRow=${setRow} setRows=${setRows} add=${add} remove=${remove} full=${full} state=${state} />`;

  const heads = f.columns.some((c) => c.head);
  return html`<div class=${`table ${single ? 'table--single' : ''}`}>
    <table class="table__grid">
      ${heads && html`<thead><tr>
        ${(f.numbered || f.lettered) && html`<th class="table__n"></th>`}
        ${f.columns.map((c) => html`<th key=${c.key} class=${`table__h table__h--${c.kind}`}>
          ${c.head && html`<${Prov} on=${!!c.provisional}>${c.head}</${Prov}>`}
          ${c.hint && html`<div class="table__headhint">${c.hint}</div>`}
          ${c.kind === 'choices' && c.short && html`<div class="table__subheads">${(LISTS[c.list] || []).map((o) => html`<span key=${o.value} title=${o.label}>${o.short}</span>`)}</div>`}
        </th>`)}
        <th class="table__ctl"></th>
      </tr></thead>`}
      <tbody>
        ${rows.map((row, i) => html`<tr key=${row.id} data-row=${row.id}>
          ${(f.numbered || f.lettered) && html`<td class="table__n">${f.numbered ? i + 1 : LETTERS[i]}</td>`}
          ${f.columns.map((c) => {
            const rl = c.rowLabel ? c.rowLabel(i, rows.length) : null;
            if (c.rowLabel && !rl) return html`<td key=${c.key} class="table__c"></td>`;
            if (c.hideIf && c.hideIf(row)) return html`<td key=${c.key} class="table__c is-shared"><span class="es-hint"><${Prov}>shared</${Prov}></span></td>`;
            return html`<td key=${c.key} class=${`table__c table__c--${c.kind}`}>
              ${rl && html`<div class="table__rowlabel">${rl}</div>`}
              <${Cell} c=${c} row=${row} rows=${rows} i=${i} f=${f} state=${state} set=${(x) => setRow(row.id, c.key, x)} />
              ${c.hintFrom && row[c.hintFrom.by] && html`<div class="es-hint">${((LISTS[c.hintFrom.list] || []).find((o) => o.value === row[c.hintFrom.by]) || {})[c.hintFrom.field]}</div>`}
            </td>`;
          })}
          <td class="table__ctl">
            ${f.ordered && html`<button class="rowbtn" title="Move up" aria-label="Move up" disabled=${i === 0} onClick=${() => move(i, -1)}>↑</button>
              <button class="rowbtn" title="Move down" aria-label="Move down" disabled=${i === rows.length - 1} onClick=${() => move(i, 1)}>↓</button>`}
            <${RemoveButton} onRemove=${() => remove(row.id)} />
          </td>
        </tr>`)}
      </tbody>
    </table>
    <div class="table__foot">
      <button class="es-btn es-btn--ghost es-btn--sm" disabled=${full} onClick=${() => add()}>
        <${Prov} on=${!!f.addProvisional}>${f.addLabel || 'Add a row'}</${Prov}>
      </button>
      ${f.maxText && html`<span class=${`es-hint table__max ${full ? 'is-full' : ''}`}>${f.maxText}</span>`}
    </div>
    ${suggestions.length > 0 && !full && html`<div class="table__suggest">
      <span class="es-hint"><${Prov}>Suggested types. Use any of them, or none:</${Prov}></span>
      ${suggestions.map((s) => html`<button key=${s.value} class="es-tag es-tag--outline table__chip" onClick=${() => add({ label: s.value })}>+ ${s.label}</button>`)}
    </div>`}
  </div>`;
}

// Step 2, Exercise 6: a decision, then the three roles, each a layer or nobody, each
// narrowed to an actor where the participant can.
function DecisionTable({ f, rows, setRow, setRows, add, remove, full, state }) {
  const col = (k) => f.columns.find((c) => c.key === k);
  return html`<div class="decisions">
    ${rows.map((row, i) => html`<div class="decision" key=${row.id}>
      <div class="decision__head">
        <label class="es-label">${col('statement').head}${rows.length > 1 ? ` (${i + 1})` : ''}</label>
        <${RemoveButton} onRemove=${() => remove(row.id)} />
      </div>
      <${Line} value=${row.statement} onChange=${(x) => setRow(row.id, 'statement', x)} ariaLabel=${col('statement').head} />
      <div class="decision__roles">
        ${['authority', 'responsibility', 'accountability'].map((k) => {
          const g = (LISTS.roles.find((r) => r.value === k) || {}).gloss;
          return html`<div class="decision__role" key=${k}>
            <div class="decision__rolename" title=${g}>${col(k).head}</div>
            <${RefSelect} state=${state} of="layers" nobody value=${row[k]} onChange=${(x) => setRows(row.id, { [k]: x, [`${k}_actor`]: null })} ariaLabel=${col(k).head} />
            ${row[k] && row[k] !== 'nobody' && html`<${RefSelect} state=${state} of="actors" filterLayer=${row[k]} value=${row[`${k}_actor`]}
              onChange=${(x) => setRow(row.id, `${k}_actor`, x)} ariaLabel=${`${col(k).head}: which actor`} />`}
            ${row[k] && row[k] !== 'nobody' && html`<span class="es-hint"><${Prov}>which actor, where you can say</${Prov}></span>`}
          </div>`;
        })}
      </div>
    </div>`)}
    <div class="table__foot">
      <button class="es-btn es-btn--ghost es-btn--sm" disabled=${full} onClick=${() => add()}>
        <${Prov}>${rows.length ? f.addLabel : 'Add the decision'}</${Prov}>
      </button>
      ${f.maxText && html`<span class="es-hint table__max">${f.maxText}</span>`}
    </div>
  </div>`;
}
