// Step 3's graph. One quantity, one line, one graph: not several things compared,
// not a bar chart, and no chart-library defaults that turn one line into a
// dashboard (steps/03-behaviour-over-time/spec.md). Nothing here detects a shape.
//
// The participant places points by clicking the grid, drags them into place, or
// types values below. The event strip, the evidence marks, and the two futures are
// drawn on the same axes as the line, as the page asks.

import { html, useEffect, useRef, useState } from '../html.js';
import { LISTS } from '../definitions/lists.js';
import { Prov } from './text.js';

// The geometry is exported so that the read-through's file (ReadFile.js) draws the
// same graph from the same numbers, as static markup.
export const W = 880;
export const H = 300;
export const M = { l: 52, r: 18, t: 16, b: 30 };
const arr = (x) => (Array.isArray(x) ? x : []);
export const num = (x) => (x === '' || x == null || Number.isNaN(Number(x)) ? null : Number(x));

function niceCeil(x) {
  if (x <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= x) return m * p;
  return 10 * p;
}

// The interval was retired as a field on 1 October 2026: the line is read yearly, which
// page 20 says is usually enough, and the interval is visible in the line as drawn.
function stepOf() {
  return 1;
}

function fmtT(t, step) {
  if (step >= 1) return String(Math.round(t));
  const y = Math.floor(t + 1e-9);
  const frac = t - y;
  if (Math.abs(step - 0.25) < 1e-6) return `${y} Q${Math.round(frac * 4) + 1}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Math.round(frac * 12) % 12]} ${y}`;
}

const snap = (t, x0, step) => +(x0 + Math.round((t - x0) / step) * step).toFixed(6);
const eq = (a, b) => Math.abs(a - b) < 1e-6;

// The axes a graph is drawn on, from the years in Exercise 2 and the values of the
// series drawn. Not a hook, whatever its older name says: pure, and usable anywhere.
export function domainOf(state, { futures = false, series = [] } = {}) {
  const v3 = state.values[3] || {};
  const x0 = num(v3.period_from);
  let x1 = num(v3.period_to);
  if (x0 == null || x1 == null || x1 <= x0) return null;
  const step = stepOf(state);
  if (futures) {
    const target = num((state.values[1] || {}).change_long_year);
    x1 = Math.max(x1 + 5, target && target > x1 ? target : x1);
  }
  const vals = series.flatMap((s) => arr(s && s.points).map((p) => num(p.v))).filter((v) => v != null);
  const lo = Math.min(0, ...vals);
  const hi = vals.length ? Math.max(...vals) : 0;
  const y1 = hi > 0 ? niceCeil(hi * 1.25) : 100;
  const y0 = lo < 0 ? -niceCeil(-lo * 1.25) : 0;
  return { x0, x1, y0, y1, step, xEnd: num(v3.period_to) };
}
export const useDomain = domainOf;

export function scales(d) {
  const sx = (t) => M.l + ((t - d.x0) / (d.x1 - d.x0)) * (W - M.l - M.r);
  const sy = (v) => M.t + (1 - (v - d.y0) / (d.y1 - d.y0)) * (H - M.t - M.b);
  const ix = (px) => d.x0 + ((px - M.l) / (W - M.l - M.r)) * (d.x1 - d.x0);
  const iy = (py) => d.y0 + (1 - (py - M.t) / (H - M.t - M.b)) * (d.y1 - d.y0);
  return { sx, sy, ix, iy };
}

export function pathOf(points, sx, sy) {
  const pts = arr(points).filter((p) => num(p.t) != null && num(p.v) != null).sort((a, b) => a.t - b.t);
  return pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.t).toFixed(1)},${sy(p.v).toFixed(1)}`).join(' ');
}

// Which years and values the axes are ticked at.
export function axisTicks(d) {
  const years = [];
  const span = d.x1 - d.x0;
  const every = span > 40 ? 10 : span > 20 ? 5 : span > 10 ? 2 : 1;
  for (let y = Math.ceil(d.x0); y <= d.x1; y += 1) if ((y - Math.ceil(d.x0)) % every === 0 || y === d.x1) years.push(y);
  const ys = [0, 0.25, 0.5, 0.75, 1].map((k) => d.y0 + k * (d.y1 - d.y0));
  return { years, ys };
}

// The events inside the years of the line, oldest first (an event outside them is
// not drawn off the plot; Exercise 3 says so), the evidence segments with both years,
// and the height of the event strip under the plot.
export const eventsOf = (v3, domain) => arr(v3.events)
  .filter((e) => num(e.year) != null && num(e.year) >= domain.x0 && num(e.year) <= domain.x1)
  .sort((a, b) => num(a.year) - num(b.year));
export const segmentsOf = (v3) => arr(v3.evidence).filter((s) => s.range && num(s.range.from) != null && num(s.range.to) != null);
export const stripHeight = (evs) => 18 + Math.min(4, evs.length) * 14;
export const BAND_H = 26;

function Axes({ d, sx, sy }) {
  const { years, ys } = axisTicks(d);
  return html`<g class="graph__axes">
    ${ys.map((v, i) => html`<g key=${`y${i}`}>
      <line x1=${M.l} x2=${W - M.r} y1=${sy(v)} y2=${sy(v)} class="graph__grid" />
      <text x=${M.l - 8} y=${sy(v) + 4} class="graph__tick" text-anchor="end">${+v.toFixed(2)}</text>
    </g>`)}
    ${years.map((y) => html`<g key=${`x${y}`}>
      <line x1=${sx(y)} x2=${sx(y)} y1=${M.t} y2=${H - M.b} class="graph__grid graph__grid--x" />
      <text x=${sx(y)} y=${H - M.b + 18} class="graph__tick" text-anchor="middle">${y}</text>
    </g>`)}
    ${d.xEnd != null && d.xEnd < d.x1 && html`<line x1=${sx(d.xEnd)} x2=${sx(d.xEnd)} y1=${M.t} y2=${H - M.b} class="graph__now" />`}
    <line x1=${M.l} x2=${M.l} y1=${M.t} y2=${H - M.b} class="graph__axis" />
    <line x1=${M.l} x2=${W - M.r} y1=${H - M.b} y2=${H - M.b} class="graph__axis" />
  </g>`;
}

export const KIND_CLASS = { measured: 'ev--measured', documented: 'ev--documented', estimated: 'ev--estimated' };

// The graph. `edit` names the series being drawn; everything else is read only.
export function GraphView({ state, domain: liveDomain, layers = [], edit = null, onEdit, events = false, evidence = false, gaps = [], caption }) {
  const svg = useRef(null);
  const drag = useRef(null);
  const [sel, setSel] = useState(null);
  // The axes hold still while a point is dragged, and rescale once, on release.
  const [frozen, setFrozen] = useState(null);
  useEffect(() => { setSel(null); }, [edit]);
  const domain = frozen || liveDomain;
  if (!domain) return null;
  const { sx, sy, ix, iy } = scales(domain);
  const v3 = state.values[3] || {};

  const toLocal = (e) => {
    const pt = svg.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.current.getScreenCTM().inverse());
    return p;
  };
  const editing = edit ? layers.find((l) => l.key === edit) : null;
  const pts = editing ? arr(editing.value && editing.value.points) : [];
  const minT = editing && editing.from != null ? editing.from : domain.x0;
  const maxT = editing && editing.to != null ? editing.to : domain.x1;
  const setPts = (next) => onEdit(edit, { ...(editing.value || {}), points: next.sort((a, b) => a.t - b.t) });

  // Dragging moves one point. The other points are taken as they were when the drag
  // began, and a point never moves onto a time another point already holds.
  const down = (e) => {
    if (!editing) return;
    const p = toLocal(e);
    if (p.x < M.l - 6 || p.x > W - M.r + 6 || p.y < M.t - 6 || p.y > H - M.b + 6) return;
    let t = snap(ix(p.x), domain.x0, domain.step);
    t = Math.max(minT, Math.min(maxT, t));
    const v = +Math.max(domain.y0, Math.min(domain.y1, iy(p.y))).toPrecision(4);
    const near = pts.find((q) => Math.hypot(sx(q.t) - p.x, sy(q.v) - p.y) < 14);
    if (near) {
      drag.current = { t: near.t, base: pts.filter((q) => !eq(q.t, near.t)) };
      setSel(near.t);
    } else {
      const base = pts.filter((q) => !eq(q.t, t));
      setPts([...base, { t, v }]);
      drag.current = { t, base };
      setSel(t);
    }
    setFrozen(domain);
    svg.current.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    const d = drag.current;
    if (!d || !editing) return;
    const p = toLocal(e);
    let t = snap(ix(p.x), domain.x0, domain.step);
    t = Math.max(minT, Math.min(maxT, t));
    if (d.base.some((q) => eq(q.t, t))) t = d.t;
    const v = +Math.max(domain.y0, Math.min(domain.y1, iy(p.y))).toPrecision(4);
    setPts([...d.base, { t, v }]);
    d.t = t;
    setSel(t);
  };
  const up = () => { drag.current = null; setFrozen(null); };
  const key = (e) => {
    if (!editing || sel == null) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      setPts(pts.filter((q) => !eq(q.t, sel)));
      setSel(null);
      e.preventDefault();
    }
  };

  const evs = events ? eventsOf(v3, domain) : [];
  const segs = evidence ? segmentsOf(v3) : [];
  const stripH = events ? stripHeight(evs) : 0;
  const bandH = evidence ? BAND_H : 0;
  const totalH = H + stripH + bandH;

  return html`<figure class="graph">
    <svg ref=${svg} viewBox=${`0 0 ${W} ${totalH}`} class=${`graph__svg ${editing ? 'is-editing' : ''}`}
      tabindex=${editing ? 0 : -1} onKeyDown=${key}
      onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up}
      role="img" aria-label=${caption || 'Graph'}>
      <rect x=${M.l} y=${M.t} width=${W - M.l - M.r} height=${H - M.t - M.b} class="graph__plot" />
      <${Axes} d=${domain} sx=${sx} sy=${sy} />
      ${layers.map((l) => {
        const d = pathOf(l.value && l.value.points, sx, sy);
        return html`<g key=${l.key} class=${`graph__series ${l.className || ''} ${edit === l.key ? 'is-active' : edit ? 'is-dim' : ''}`}>
          ${d && html`<path d=${d} />`}
          ${arr(l.value && l.value.points).map((p) => html`<circle key=${p.t} cx=${sx(p.t)} cy=${sy(p.v)} r=${edit === l.key ? (eq(sel ?? -1, p.t) ? 6.5 : 5) : 3}
            class=${eq(sel ?? -1, p.t) && edit === l.key ? 'is-selected' : ''} />`)}
        </g>`;
      })}
      ${segs.filter((s) => s.kind === 'estimated').map((s, i) => {
        const a = Math.max(domain.x0, num(s.range.from));
        const b = Math.min(domain.x1, num(s.range.to));
        return html`<text key=${`est${i}`} x=${(sx(a) + sx(b)) / 2} y=${M.t + 12} text-anchor="middle" class="graph__estimate">this line is an estimate</text>`;
      })}
      ${evs.map((ev, i) => html`<line key=${`evl${i}`} x1=${sx(num(ev.year))} x2=${sx(num(ev.year))} y1=${M.t} y2=${H - M.b + 4} class="graph__event" />`)}
      ${events && html`<g class="graph__strip" transform=${`translate(0, ${H})`}>
        ${evs.map((ev, i) => html`<g key=${`ev${i}`}>
          <rect x=${sx(num(ev.year)) - 3} y=${2} width="6" height="6" class="graph__eventmark" />
          <text x=${sx(num(ev.year)) > W * 0.7 ? sx(num(ev.year)) - 6 : sx(num(ev.year)) + 6} y=${14 + (i % 4) * 14}
            text-anchor=${sx(num(ev.year)) > W * 0.7 ? 'end' : 'start'} class="graph__eventlabel">${num(ev.year)} ${ev.label || ''}</text>
        </g>`)}
      </g>`}
      ${evidence && html`<g class="graph__evidence" transform=${`translate(0, ${H + stripH})`}>
        ${segs.map((s, i) => {
          const a = Math.max(domain.x0, num(s.range.from));
          const b = Math.min(domain.x1, num(s.range.to));
          if (b < a) return null;
          const k = LISTS.evidence_kinds.find((x) => x.value === s.kind);
          return html`<g key=${`seg${i}`} class=${`ev ${KIND_CLASS[s.kind] || 'ev--unset'}`}>
            <rect x=${sx(a)} y="2" width=${Math.max(2, sx(b) - sx(a))} height="18" />
            <text x=${sx(a) + 5} y="15">${k ? k.short : '?'}</text>
          </g>`;
        })}
        ${gaps.map(([a, b], i) => html`<g key=${`gap${i}`} class="ev ev--gap">
          <rect x=${sx(a)} y="2" width=${Math.max(2, sx(b) - sx(a))} height="18" />
        </g>`)}
      </g>`}
    </svg>
    ${caption && html`<figcaption class="graph__caption">${caption}</figcaption>`}
    ${editing && html`<${PointTable} pts=${pts} domain=${domain} minT=${minT} maxT=${maxT} setPts=${setPts} sel=${sel} setSel=${setSel} />`}
  </figure>`;
}

// The values behind the line, for a measured series typed rather than drawn.
function PointTable({ pts, domain, minT, maxT, setPts, sel, setSel }) {
  const [open, setOpen] = useState(false);
  // What is being typed stays as typed ("2.", "-") until the field is left.
  const [drafts, setDrafts] = useState({});
  const times = [];
  const first = snap(minT, domain.x0, domain.step);
  for (let t = first < minT - 1e-6 ? first + domain.step : first; t <= maxT + 1e-6; t += domain.step) times.push(+t.toFixed(6));
  const valueAt = (t) => { const p = pts.find((q) => eq(q.t, t)); return p ? String(p.v) : ''; };
  const commit = (t) => {
    if (!(t in drafts)) return;
    const v = num(String(drafts[t]).replace(',', '.'));
    const rest = pts.filter((q) => !eq(q.t, t));
    setPts(v == null ? rest : [...rest, { t, v }]);
    const next = { ...drafts };
    delete next[t];
    setDrafts(next);
  };
  return html`<div class="graph__points">
    <div class="graph__pointsbar">
      <span class="es-hint"><${Prov}>Click the grid to place a point, drag it to move it, select it and press Delete to remove it.</${Prov}></span>
      <button class="es-btn es-btn--quiet es-btn--sm" aria-expanded=${open} onClick=${() => setOpen(!open)}><${Prov}>${open ? 'Hide the values' : 'Type the values'}</${Prov}></button>
      ${sel != null && html`<button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => { setPts(pts.filter((q) => !eq(q.t, sel))); setSel(null); }}><${Prov}>Remove the selected point</${Prov}></button>`}
    </div>
    ${open && html`<div class="graph__valuegrid">
      ${times.slice(0, 400).map((t) => html`<label key=${t} class="graph__value">
        <span>${fmtT(t, domain.step)}</span>
        <input class="es-input es-input--sm" type="text" inputmode="decimal" value=${t in drafts ? drafts[t] : valueAt(t)}
          onInput=${(e) => setDrafts({ ...drafts, [t]: e.target.value })}
          onBlur=${() => commit(t)} onKeyDown=${(e) => { if (e.key === 'Enter') commit(t); }} />
      </label>`)}
    </div>`}
  </div>`;
}

// A series field: the line in Exercise 2, the two futures and the other quantity in
// Exercise 7.
export function Graph({ f, value, onChange, state, step }) {
  const v3 = state.values[3] || {};
  const role = (f.graph && f.graph.role) || 'main';
  const [which, setWhich] = useState('future_unchanged');

  if (role === 'futures') {
    const domain = domainOf(state, { futures: true, series: [v3.series, v3.future_unchanged, v3.future_desired] });
    if (!domain) return html`<p class="es-hint"><${Prov}>The years go in Exercise 2 first.</${Prov}></p>`;
    const end = domain.xEnd;
    const layers = [
      { key: 'series', value: v3.series, className: 'graph__series--main' },
      { key: 'future_unchanged', value: v3.future_unchanged, className: 'graph__series--unchanged', from: end, to: domain.x1 },
      { key: 'future_desired', value: v3.future_desired, className: 'graph__series--desired', from: end, to: domain.x1 },
    ];
    return html`<div class="graph-futures">
      <div class="es-seg" role="group">
        <button aria-pressed=${which === 'future_unchanged'} onClick=${() => setWhich('future_unchanged')}><${Prov}>If nothing changes</${Prov}></button>
        <button aria-pressed=${which === 'future_desired'} onClick=${() => setWhich('future_desired')}><${Prov}>The desired change</${Prov}></button>
      </div>
      <${GraphView} key=${which} state=${state} domain=${domain} layers=${layers} edit=${which}
        onEdit=${(k, v) => onChange(v, k)} />
    </div>`;
  }

  if (role === 'other') {
    const domain = domainOf(state, { series: [value] });
    if (!domain) return html`<p class="es-hint"><${Prov}>The years go in Exercise 2 first.</${Prov}></p>`;
    return html`<${GraphView} state=${state} domain=${domain} layers=${[{ key: f.key, value, className: 'graph__series--other' }]}
      edit=${f.key} onEdit=${(k, v) => onChange(v)} />`;
  }

  const domain = domainOf(state, { series: [value] });
  if (!domain) return html`<p class="es-hint"><${Prov}>Write the years above, and the grid appears.</${Prov}></p>`;
  return html`<${GraphView} state=${state} domain=${domain} layers=${[{ key: f.key, value, className: 'graph__series--main' }]}
    edit=${f.key} onEdit=${(k, v) => onChange(v)} events=${arr(v3.events).length > 0} />`;
}
