// Step 2, Exercise 10: the second drawing. An arrangement surface, not a drawing
// tool, and not a layout engine (design/platform-phase-a.md, section 7).
//
// - The bands are drawn for the participant, one per layer, widest scope at the
//   top, in the order Exercise 3 set. The order is not a choice made here.
// - The actors arrive in a tray, unplaced. Nothing places itself: placing is the
//   exercise.
// - An actor dropped into a band that is not its recorded layer is allowed, and
//   flagged: either the placement is wrong, or Exercise 3 or Exercise 5 is. The
//   participant decides which, and moves the actor if the placement was wrong.
// - The participant draws the lines. A line where a dependency is recorded shows
//   the resource; a line where none is recorded asks whether it belongs in
//   Exercise 7. Disagreement marks are read against Exercise 8.
// - A recorded dependency with no line is reported when the participant leaves the
//   drawing, never while they work.
// - Positions are kept, each relative to its band, so that a layer reordered in
//   Exercise 3 carries its actors with it. Nothing auto-arranges, routes, or tidies.
// - Each band keeps a strip at its top for its label, and an actor stays inside its
//   band, below the strip, so that no actor covers a band's name. The dot raster is
//   drawn over the band fills, so it shows on the whole sheet. While an element is
//   selected the band labels dim with everything else that is not involved.
//
// What is stored as the answer (sketch_second) is the drawing only: placements,
// lines, and marks. When the participant last left the drawing is kept apart
// (sketch_second_left), so that leaving is never mistaken for a change to the answer.
// The definition of leaving below, and the brown dashed outline with a flag for an
// actor outside its recorded layer, were adopted as working rules for the first
// online version on 2 October 2026.

import { html, useCallback, useEffect, useRef, useState } from '../html.js';
import { LISTS } from '../definitions/lists.js';
import { newId, useCase } from '../engine/store.js';
import { Prov, fmtDateTime } from './text.js';
import { useRouter } from './router.js';

const W = 960;
// A band's height, and where inside it an actor's centre may sit: below the strip
// that holds the band's label, and clear of the band's lower edge. Two rows of
// actors fit in a band.
const BH = 140;
const LABEL_STRIP = 30;
const NW = 150;
const NH = 46;
const DY_MIN = LABEL_STRIP + 4 + NH / 2;
const DY_MAX = BH - 10 - NH / 2;
// Placements kept before 2 October 2026 as a height on the sheet ({ x, y }) were
// made on bands 120 high.
const LEGACY_BH = 120;
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const arr = (x) => (Array.isArray(x) ? x : []);
const pairKey = (a, b) => [a, b].sort().join('|');
const clampDy = (dy) => Math.max(DY_MIN, Math.min(DY_MAX, dy));

export function readCase(state) {
  const v2 = state.values[2] || {};
  const layers = arr(v2.layers);
  const actors = arr(v2.actors);
  const ids = new Set(actors.map((a) => a.id));
  const types = arr(v2.actor_types);
  const deps = arr(v2.dependencies).filter((d) => ids.has(d.actor) && ids.has(d.needed_by));
  const descs = arr(v2.descriptions).filter((d) => ids.has(d.actor));
  const pair = arr(v2.conflicting_pair).map((id) => descs.find((d) => d.id === id)).filter(Boolean);
  return { layers, actors, ids, types, deps, descs, pair };
}

// A placement, read in the current band order, and drawn inside its band below the
// label strip whatever height it was kept at. Placements from before positions were
// kept by band ({ x, y }) are read by the band they fall in.
function placementOf(c, p) {
  if (!p) return null;
  if (p.band) {
    const i = c.layers.findIndex((l) => l.id === p.band);
    if (i < 0) return null;
    return { band: p.band, index: i, x: p.x, y: i * BH + clampDy(Number(p.dy) || 0) };
  }
  if (typeof p.y === 'number') {
    const i = Math.floor(p.y / LEGACY_BH);
    if (i < 0 || i >= c.layers.length) return null;
    return { band: c.layers[i].id, index: i, x: p.x, y: i * BH + clampDy(p.y - i * LEGACY_BH) };
  }
  return null;
}

function depsBetween(deps, a, b) {
  return deps.filter((d) => (d.actor === a && d.needed_by === b) || (d.actor === b && d.needed_by === a));
}

// What leaving the drawing reports, computed from the case as it stands: recorded
// dependencies with no line, and the pair from Exercise 8 with no mark.
export function reportFor(c, v) {
  const placed = (v && v.placed) || {};
  const on = (id) => !!placementOf(c, placed[id]);
  const drawn = new Set(arr(v && v.lines).map((l) => pairKey(l.a, l.b)));
  const marked = new Set(arr(v && v.marks).map((m) => pairKey(m.a, m.b)));
  const undrawn = [];
  const seen = new Set();
  for (const d of c.deps) {
    if (!on(d.actor) || !on(d.needed_by)) continue;
    const k = pairKey(d.actor, d.needed_by);
    if (drawn.has(k)) continue;
    const kk = `${k}|${d.resource}`;
    if (seen.has(kk)) continue;
    seen.add(kk);
    undrawn.push({ holder: d.actor, needer: d.needed_by, resource: d.resource });
  }
  let pairUnmarked = false;
  if (c.pair.length === 2) {
    const [x, y] = c.pair.map((d) => d.actor);
    if (x && y && x !== y && on(x) && on(y) && !marked.has(pairKey(x, y))) pairUnmarked = true;
  }
  return { undrawn, pairUnmarked };
}

const resourceLabel = (k) => ((LISTS.resources.find((r) => r.value === k) || {}).label || k || '').toLowerCase();

// The report, where the participant is when they leave the drawing: under the
// drawing itself, and at the head of Exercise 11.
export function DrawingReport({ state, compact }) {
  const v2 = state.values[2] || {};
  // A bare date and time, as process.yaml lists sketch_second_left.
  const left = v2.sketch_second_left;
  if (!left) return null;
  const c = readCase(state);
  const r = reportFor(c, v2.sketch_second);
  if (!r.undrawn.length && !r.pairUnmarked) return null;
  const name = (id) => (c.actors.find((a) => a.id === id) || {}).name || '___';
  return html`<div class=${`es-notice arr__report ${compact ? 'arr__report--compact' : ''}`} role="status">
    <div class="es-overline"><${Prov}>When you left the drawing, ${fmtDateTime(left)}</${Prov}></div>
    ${r.undrawn.length > 0 && html`<div><${Prov}>Recorded in Exercise 7 and not drawn:</${Prov}>
      <ul>${r.undrawn.map((u, i) => html`<li key=${i}><${Prov}>${name(u.needer)} needs ${resourceLabel(u.resource)} from ${name(u.holder)}</${Prov}></li>`)}</ul></div>`}
    ${r.pairUnmarked && html`<div><${Prov}>The two descriptions from Exercise 8 that cannot both be acted on have no mark between their actors.</${Prov}></div>`}
  </div>`;
}

function NodeShape({ w, h }) {
  const o = 0.0626;
  const pts = [[0, 0], [w * (1 - o), h * o], [w, h * (1 - o)], [w * o, h]];
  return html`<polygon points=${pts.map((p) => p.join(',')).join(' ')} />`;
}

function trim(s, n) {
  const t = String(s || '');
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

export function Arrangement({ value, onChange, state }) {
  const { go } = useRouter();
  const { act } = useCase();
  const onLeave = () => act.setValue(2, 'sketch_second_left', new Date().toISOString());
  const c = readCase(state);
  const v = value || {};
  const placedRaw = v.placed || {};
  const svg = useRef(null);
  const [mode, setMode] = useState('move');
  const [pick, setPick] = useState(null); // an actor picked from the tray
  const [from, setFrom] = useState(null); // first end of a line or mark
  const [sel, setSel] = useState(null); // { kind: 'node'|'line'|'mark', id }
  const [dragPos, setDragPos] = useState(null); // { id, x, y } while dragging
  const [working, setWorking] = useState(false); // touched since this drawing was opened
  const drag = useRef(null);
  const touched = useRef(false);
  const leaveRef = useRef(onLeave);
  leaveRef.current = onLeave;

  const H = Math.max(1, c.layers.length) * BH;
  const pos = (id) => {
    if (dragPos && dragPos.id === id) return dragPos;
    return placementOf(c, placedRaw[id]);
  };
  const lines = arr(v.lines).filter((l) => pos(l.a) && pos(l.b));
  const marks = arr(v.marks).filter((m) => pos(m.a) && pos(m.b));
  const set = (patch) => {
    touched.current = true;
    if (!working) setWorking(true);
    onChange({ placed: placedRaw, lines: arr(v.lines), marks: arr(v.marks), ...patch });
  };

  // Leaving the drawing: scrolling it out of view after working in it, changing
  // step, or saying so.
  const leave = () => {
    if (!touched.current) return;
    touched.current = false;
    setWorking(false);
    if (leaveRef.current) leaveRef.current();
  };
  const io = useRef(null);
  const wrapRef = useCallback((el) => {
    if (io.current) { io.current.disconnect(); io.current = null; }
    if (el && 'IntersectionObserver' in window) {
      io.current = new IntersectionObserver((entries) => { if (entries.every((e) => !e.isIntersecting)) leave(); }, { threshold: 0 });
      io.current.observe(el);
    }
  }, []);
  useEffect(() => () => { if (io.current) io.current.disconnect(); leave(); }, []);

  const toLocal = (e) => {
    const pt = svg.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.current.getScreenCTM().inverse());
  };
  const bandIndexAt = (y) => Math.max(0, Math.min(c.layers.length - 1, Math.floor(y / BH)));
  // An actor is kept inside the band the pointer is in, below the band's label.
  const clampPos = (p) => {
    const i = bandIndexAt(p.y);
    return { x: Math.max(NW / 2 + 6, Math.min(W - NW / 2 - 6, p.x)), y: i * BH + clampDy(p.y - i * BH) };
  };
  const toPlacement = (p) => {
    const q = clampPos(p);
    const i = bandIndexAt(q.y);
    return { band: c.layers[i].id, x: Math.round(q.x), dy: Math.round(q.y - i * BH) };
  };

  const place = (id, p) => set({ placed: { ...placedRaw, [id]: toPlacement(p) } });
  const unplace = (id) => {
    const n = { ...placedRaw };
    delete n[id];
    set({ placed: n, lines: arr(v.lines).filter((l) => l.a !== id && l.b !== id), marks: arr(v.marks).filter((m) => m.a !== id && m.b !== id) });
    setSel(null);
  };

  const onCanvasDown = (e) => {
    if (e.target.closest && e.target.closest('[data-node]')) return;
    if (pick) { place(pick, toLocal(e)); setPick(null); return; }
    setSel(null);
    setFrom(null);
  };

  const onNodeDown = (e, id) => {
    e.stopPropagation();
    if (mode === 'line' || mode === 'mark') {
      if (!from) { setFrom(id); return; }
      if (from === id) { setFrom(null); return; }
      const list = mode === 'line' ? arr(v.lines) : arr(v.marks);
      if (!list.some((x) => pairKey(x.a, x.b) === pairKey(from, id))) {
        const item = { id: newId(mode === 'line' ? 'ln' : 'mk'), a: from, b: id };
        set(mode === 'line' ? { lines: [...list, item] } : { marks: [...list, item] });
        setSel({ kind: mode, id: item.id });
      }
      setFrom(null);
      return;
    }
    setSel({ kind: 'node', id });
    const p = toLocal(e);
    const cur = pos(id);
    drag.current = { id, dx: p.x - cur.x, dy: p.y - cur.y, start: { x: cur.x, y: cur.y } };
    svg.current.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const p = toLocal(e);
    setDragPos({ id: drag.current.id, ...clampPos({ x: p.x - drag.current.dx, y: p.y - drag.current.dy }) });
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && dragPos && (Math.abs(dragPos.x - d.start.x) > 1 || Math.abs(dragPos.y - d.start.y) > 1)) place(dragPos.id, dragPos);
    setDragPos(null);
  };

  const removeSelected = () => {
    if (!sel) return;
    if (sel.kind === 'line') set({ lines: arr(v.lines).filter((l) => l.id !== sel.id) });
    if (sel.kind === 'mark') set({ marks: arr(v.marks).filter((m) => m.id !== sel.id) });
    if (sel.kind === 'node') unplace(sel.id);
    setSel(null);
  };
  const onKey = (e) => {
    if (e.key === 'Escape') { setFrom(null); setPick(null); setSel(null); }
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); removeSelected(); }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id && c.ids.has(id)) place(id, toLocal(e));
  };

  const actor = (id) => c.actors.find((a) => a.id === id);
  const label = (id) => (actor(id) || {}).name || '___';
  const typeOf = (a) => {
    const i = c.types.findIndex((t) => t.id === a.type);
    return i >= 0 ? `${LETTERS[i]} ${c.types[i].label || ''}` : '';
  };
  const unplaced = c.actors.filter((a) => !pos(a.id));
  const onCanvas = c.actors.filter((a) => pos(a.id));

  // Findings the canvas reads against the case. None of them blocks.
  const misplaced = onCanvas.filter((a) => {
    const b = c.layers[bandIndexAt(pos(a.id).y)];
    return b && a.layer && b.id !== a.layer;
  });
  const descsOf = (id) => c.descs.filter((d) => d.actor === id);
  const pairActors = c.pair.length === 2 ? pairKey(c.pair[0].actor, c.pair[1].actor) : null;
  const shareLinked = (a, b) => descsOf(a).some((d) => descsOf(b).some((e) => d.shares_with === e.id || e.shares_with === d.id));
  const lineInfo = (l) => {
    const ds = depsBetween(c.deps, l.a, l.b);
    return { ds, recorded: ds.length > 0 };
  };
  const markInfo = (m) => {
    if (pairActors && pairKey(m.a, m.b) === pairActors) return { pair: true, recorded: true };
    if (shareLinked(m.a, m.b)) return { pair: false, recorded: false, shared: true };
    return { pair: false, recorded: descsOf(m.a).length > 0 && descsOf(m.b).length > 0 };
  };
  const unrecordedLines = lines.filter((l) => !lineInfo(l).recorded);
  const unrecordedMarks = marks.filter((m) => !markInfo(m).recorded);

  const dim = !!sel;
  const isSel = (kind, id) => sel && sel.kind === kind && sel.id === id;
  const involved = (id) => sel && ((sel.kind === 'node' && sel.id === id)
    || (sel.kind === 'line' && lines.some((l) => l.id === sel.id && (l.a === id || l.b === id)))
    || (sel.kind === 'mark' && marks.some((m) => m.id === sel.id && (m.a === id || m.b === id))));

  if (!c.layers.length || !c.actors.length) {
    return html`<div class="arr arr--empty" ref=${wrapRef}><p class="es-hint"><${Prov}>The bands come from the layers in Exercise 3, and the actors from Exercise 5. Both are needed before this drawing can start.</${Prov}></p></div>`;
  }

  const res = (k) => (LISTS.resources.find((r) => r.value === k) || {}).short || k;

  return html`<div class="arr" ref=${wrapRef}>
    ${!working && html`<${DrawingReport} state=${state} />`}

    <div class="arr__tools">
      <div class="es-seg" role="group" aria-label="Tool">
        <button aria-pressed=${mode === 'move'} onClick=${() => { setMode('move'); setFrom(null); }}><${Prov}>Place and move</${Prov}></button>
        <button aria-pressed=${mode === 'line'} onClick=${() => { setMode('line'); setFrom(null); setPick(null); }}><${Prov}>Draw a line</${Prov}></button>
        <button aria-pressed=${mode === 'mark'} onClick=${() => { setMode('mark'); setFrom(null); setPick(null); }}><${Prov}>Mark a disagreement</${Prov}></button>
      </div>
      <span class="es-hint arr__modehint"><${Prov}>${
        pick ? `Click a band to place ${label(pick)}.`
          : mode === 'line' ? (from ? `From ${label(from)}: click the actor at the other end.` : 'Click one actor, then the other: a line where one needs a resource from the other.')
          : mode === 'mark' ? (from ? `From ${label(from)}: click the actor who reads the problem differently.` : 'Click two actors who read the problem differently.')
          : 'Drag an actor from the tray into a band, or click the actor and then the band. Drag to tidy.'
      }</${Prov}></span>
      ${sel && html`<button class="es-btn es-btn--quiet es-btn--sm" onClick=${removeSelected}><${Prov}>${sel.kind === 'node' ? `Put ${label(sel.id)} back in the tray` : sel.kind === 'line' ? 'Remove the line' : 'Remove the mark'}</${Prov}></button>`}
      <button class="es-btn es-btn--ghost es-btn--sm arr__leave" onClick=${() => { touched.current = true; leave(); }}><${Prov}>Leave the drawing</${Prov}></button>
    </div>

    <div class="arr__body">
      <div class="arr__tray" aria-label="Actors not yet placed">
        <div class="es-overline"><${Prov}>Not yet placed</${Prov}> <span class="arr__count">${unplaced.length}</span></div>
        ${unplaced.length === 0 && html`<p class="es-hint"><${Prov}>Every actor is placed.</${Prov}></p>`}
        ${unplaced.map((a) => html`<button key=${a.id} class=${`arr__trayitem ${pick === a.id ? 'is-picked' : ''}`} draggable="true"
            onDragStart=${(e) => { e.dataTransfer.setData('text/plain', a.id); e.dataTransfer.effectAllowed = 'move'; }}
            onClick=${() => { setMode('move'); setPick(pick === a.id ? null : a.id); }}>
          <span class="arr__trayname">${a.name || html`<${Prov}>(no name yet)</${Prov}>`}</span>
          <span class="arr__traytype">${typeOf(a)}</span>
        </button>`)}
      </div>

      <div class="arr__sheet" onDragOver=${(e) => e.preventDefault()} onDrop=${onDrop}>
        <svg ref=${svg} viewBox=${`0 0 ${W} ${H}`} class=${`arr__svg mode-${mode} ${pick ? 'is-picking' : ''}`} tabindex="0"
          onKeyDown=${onKey} onPointerDown=${onCanvasDown} onPointerMove=${onMove} onPointerUp=${onUp} onPointerCancel=${onUp}
          role="application" aria-label="The second drawing">
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" class="arr__dot" /></pattern>
          </defs>
          <rect x="0" y="0" width=${W} height=${H} class="arr__paper" />
          ${c.layers.map((l, i) => html`<rect key=${l.id} x="8" y=${i * BH + 6} width=${W - 16} height=${BH - 12} class="arr__band" />`)}
          <rect x="0" y="0" width=${W} height=${H} fill="url(#dots)" class="arr__raster" />

          ${lines.map((l) => {
            const a = pos(l.a); const b = pos(l.b);
            const info = lineInfo(l);
            const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2;
            const chip = info.recorded ? [...new Set(info.ds.map((d) => res(d.resource)))].join(', ') : '?';
            const cls = `arr__line ${info.recorded ? 'is-recorded' : 'is-unrecorded'} ${isSel('line', l.id) ? 'is-selected' : dim ? 'is-dim' : ''}`;
            return html`<g key=${l.id} class=${cls} onPointerDown=${(e) => { e.stopPropagation(); setSel({ kind: 'line', id: l.id }); }}>
              <line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} class="arr__hit" />
              <line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} />
              <g transform=${`translate(${mx},${my})`}>
                <rect x=${-(chip.length * 3.4 + 8)} y="-10" width=${chip.length * 6.8 + 16} height="20" class="arr__chip" />
                <text text-anchor="middle" y="4" class="arr__chiptext">${chip}</text>
              </g>
            </g>`;
          })}

          ${marks.map((m) => {
            const a = pos(m.a); const b = pos(m.b);
            const info = markInfo(m);
            const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2;
            const cls = `arr__mark ${info.pair ? 'is-pair' : ''} ${info.recorded ? 'is-recorded' : 'is-unrecorded'} ${isSel('mark', m.id) ? 'is-selected' : dim ? 'is-dim' : ''}`;
            return html`<g key=${m.id} class=${cls} onPointerDown=${(e) => { e.stopPropagation(); setSel({ kind: 'mark', id: m.id }); }}>
              <line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} class="arr__hit" />
              <line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} />
              <g transform=${`translate(${mx},${my})`}><polygon points="-9,-9 9,-8 8,9 -8,8" class="arr__markflag" /><text text-anchor="middle" y="4" class="arr__marktext">≠</text></g>
            </g>`;
          })}

          ${c.layers.map((l, i) => html`<text key=${`label-${l.id}`} x="20" y=${i * BH + 24} class=${`arr__bandlabel ${dim ? 'is-dim' : ''}`}>${i + 1} ${l.name || ''}</text>`)}

          ${onCanvas.map((a) => {
            const p = pos(a.id);
            const b = c.layers[bandIndexAt(p.y)];
            const off = b && a.layer && b.id !== a.layer;
            const cls = `arr__node ${off ? 'is-off' : ''} ${from === a.id ? 'is-from' : ''} ${involved(a.id) ? 'is-selected' : dim ? 'is-dim' : ''}`;
            return html`<g key=${a.id} data-node=${a.id} class=${cls} transform=${`translate(${p.x - NW / 2},${p.y - NH / 2})`}
              onPointerDown=${(e) => onNodeDown(e, a.id)}>
              <title>${a.name}</title>
              <${NodeShape} w=${NW} h=${NH} />
              <text x="10" y="19" class="arr__nodename">${trim(a.name, 22)}</text>
              <text x="10" y="35" class="arr__nodetype">${trim(typeOf(a), 26)}</text>
              ${off && html`<polygon points=${`${NW - 16},4 ${NW - 5},5 ${NW - 6},16 ${NW - 17},15`} class="arr__flag" />`}
            </g>`;
          })}
        </svg>
      </div>
    </div>

    ${(misplaced.length > 0 || unrecordedLines.length > 0 || unrecordedMarks.length > 0) && html`<div class="arr__findings">
      ${misplaced.map((a) => {
        const b = c.layers[bandIndexAt(pos(a.id).y)];
        const rec = c.layers.find((l) => l.id === a.layer);
        return html`<div class="arr__finding" key=${`m${a.id}`}>
          <span class="es-flag"><${Prov}>${a.name} is in the band for ${b.name || 'a layer'}, and Exercise 5 records ${rec ? rec.name : 'another layer'}. Either the placement is wrong, or Exercise 3 or Exercise 5 is.</${Prov}></span>
          <span class="arr__findingacts">
            <a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: 2, exercise: 3 }); }}>Exercise 3</a>
            <a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: 2, exercise: 5 }); }}>Exercise 5</a>
          </span>
        </div>`;
      })}
      ${unrecordedLines.map((l) => html`<div class="arr__finding" key=${`l${l.id}`}>
        <span class="es-flag"><${Prov}>No row in Exercise 7 has ${label(l.a)} holding a resource and ${label(l.b)} under "Who needs it", or the other way round. Does the dependency between ${label(l.a)} and ${label(l.b)} belong in Exercise 7?</${Prov}></span>
        <span class="arr__findingacts"><a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: 2, exercise: 7 }); }}>Exercise 7</a></span>
      </div>`)}
      ${unrecordedMarks.map((m) => {
        const info = markInfo(m);
        const missing = [m.a, m.b].filter((id) => !descsOf(id).length).map(label);
        const text = info.shared
          ? `Exercise 8 records ${label(m.a)} and ${label(m.b)} as reading the problem the same way. Does the mark belong, or does Exercise 8 need changing?`
          : `Exercise 8 has no description for ${missing.join(' or ')}. Does a description for ${missing.join(' and ')} belong in Exercise 8?`;
        return html`<div class="arr__finding" key=${`k${m.id}`}>
          <span class="es-flag"><${Prov}>${text}</${Prov}></span>
          <span class="arr__findingacts"><a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: 2, exercise: 8 }); }}>Exercise 8</a></span>
        </div>`;
      })}
    </div>`}
  </div>`;
}
