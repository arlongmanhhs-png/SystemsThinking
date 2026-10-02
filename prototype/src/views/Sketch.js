// Step 2, Exercise 1: the first drawing. A free-form canvas, not an arrangement
// and not a drawing tool with a palette of its own (design/platform-phase-a.md,
// section 7; decided 2 October 2026, B12; built the same day).
//
// - The canvas carries marks, short labels, and connectors, and nothing else. The
//   marks are the ones the printed instruction names (page 13): money, conflict, a
//   blockage, and a question mark for what you do not know. The list is read from
//   the field's definition, never written here.
// - No bands, no tray, no structure, no validation, and nothing read from the case
//   data: at Exercise 1 there is no case data, and nothing checks the drawing.
// - Speed and the absence of structure are what the canvas protects. A label is one
//   tap or click on the sheet plus typing. A mark is one tap or click on the sheet
//   once its button is chosen, and the button stays chosen for the next mark. A
//   connector joins any two things. Anything moves by dragging or with the arrow
//   keys, and is removed with its button or the Delete key. The last change can be
//   undone.
// - Mouse, touch, and pen, through pointer events. A finger on an empty part of the
//   sheet pans the sheet's own scrolling container; a finger on a thing drags it.
// - Keyboard: the sheet and every thing on it take focus, with a visible ring.
//   Enter on the sheet adds a label (or the chosen mark) in the middle of what is in
//   view; Enter on a label opens its text; in connector mode Enter on a thing picks
//   it as an end; the arrow keys move a thing by 8px, or by 32px with Shift.
//
// What is stored (sketch_first_canvas) is compact JSON:
//   { marks: [{ id, mark, x, y }], labels: [{ id, text, x, y }], connectors: [{ id, a, b }] }
// with x and y in pixels of the sheet, and null once the drawing is empty. No cap on
// a label's length or on what a drawing holds: a build sets no threshold of its own
// (CLAUDE.md), the sheet grows past the things on it, and the account splits the
// case across documents whatever its size (the caps of 2 October 2026 were removed
// the same day after review).

import { html, useEffect, useLayoutEffect, useRef, useState } from '../html.js';
import { newId } from '../engine/store.js';
import { sketchHasContent } from '../engine/validate.js';
import { Prov } from './text.js';

// The sheet is at least this big, and grows past the things on it so there is
// always room to add more.
const MIN_W = 640;
const MIN_H = 560;
const ROOM_RIGHT = 160;
const ROOM_BELOW = 120;
// The least a touch target measures, and the box a mark is drawn in.
const HIT = 44;
export const MARK_R = 22;
const LABEL_H = 30;
const EDIT_W = 200;
const HISTORY = 30;
const arr = (x) => (Array.isArray(x) ? x : []);

export function readDrawing(v) {
  return { marks: arr(v && v.marks), labels: arr(v && v.labels), connectors: arr(v && v.connectors) };
}

const labelWidth = (text) => Math.max(HIT, Math.round(String(text || '').length * 7.4) + 18);

// A coordinate as stored, read as a number; anything else sits at the origin.
const coord = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);

// Every thing on the drawing by id, with its centre and the box it is drawn in.
// Exported so that the read-through's file (ReadFile.js) draws the same things.
export function things(d) {
  const out = new Map();
  for (const m of d.marks) out.set(m.id, { kind: 'mark', id: m.id, x: coord(m.x), y: coord(m.y), w: MARK_R * 2, h: MARK_R * 2, mark: m.mark });
  for (const l of d.labels) out.set(l.id, { kind: 'label', id: l.id, x: coord(l.x), y: coord(l.y), w: labelWidth(l.text), h: LABEL_H, text: l.text });
  return out;
}

// The four marks, drawn in a 44px box about the origin: a banknote, a bolt, a bar
// across a circle, and the question mark itself. Each is a list of SVG elements
// (tag, attributes, text), so that the screen and the file draw the same picture.
export const GLYPHS = {
  money: [['rect', { x: -17, y: -11, width: 34, height: 22 }], ['circle', { r: 5.5 }], ['line', { x1: -11, y1: -5, x2: -11, y2: 5 }], ['line', { x1: 11, y1: -5, x2: 11, y2: 5 }]],
  conflict: [['polygon', { points: '5,-18 -10,3 -1,3 -5,18 10,-3 1,-3' }]],
  blockage: [['circle', { r: 15 }], ['line', { x1: -9.5, y1: -9.5, x2: 9.5, y2: 9.5 }]],
  question: [['text', { y: 10, 'text-anchor': 'middle', class: 'sk__q' }, '?']],
  other: [['circle', { r: 12 }]],
};

function Glyph({ mark }) {
  const shapes = GLYPHS[mark] || GLYPHS.other;
  return html`<g class="sk__glyph">${shapes.map(([tag, attrs, text], i) => html`<${tag} key=${i} ...${attrs}>${text || null}</${tag}>`)}</g>`;
}

function ThingShape({ it }) {
  if (it.kind === 'mark') return html`<rect x=${-MARK_R} y=${-MARK_R} width=${MARK_R * 2} height=${MARK_R * 2} class="sk__box" /><${Glyph} mark=${it.mark} />`;
  return html`<rect x=${-it.w / 2} y=${-it.h / 2} width=${it.w} height=${it.h} class="sk__box sk__labelbox" /><text y="5" text-anchor="middle" class="sk__labeltext">${it.text}</text>`;
}

// The box the things of a drawing are fitted into when the drawing is read rather
// than drawn: the view box of the read-only picture.
export function sketchBox(t) {
  let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity;
  for (const it of t.values()) {
    x0 = Math.min(x0, it.x - it.w / 2); y0 = Math.min(y0, it.y - it.h / 2);
    x1 = Math.max(x1, it.x + it.w / 2); y1 = Math.max(y1, it.y + it.h / 2);
  }
  const pad = 24;
  return { x: x0 - pad, y: y0 - pad, w: Math.max(x1 - x0 + 2 * pad, 240), h: Math.max(y1 - y0 + 2 * pad, 120) };
}

// The drawing, read only, as the read-through shows it: the things fitted into
// the width available.
export function SketchView({ value }) {
  const d = readDrawing(value);
  const t = things(d);
  if (!t.size) return null;
  const box = sketchBox(t);
  return html`<svg viewBox=${`${box.x} ${box.y} ${box.w} ${box.h}`} class="sk__svg sk__svg--read" role="img" aria-label="The first drawing">
    ${d.connectors.map((c) => { const a = t.get(c.a); const b = t.get(c.b); return a && b ? html`<g key=${c.id} class="sk__conn"><line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} /></g>` : null; })}
    ${[...t.values()].map((it) => html`<g key=${it.id} class=${`sk__thing sk__thing--${it.kind}`} transform=${`translate(${it.x},${it.y})`}><${ThingShape} it=${it} /></g>`)}
  </svg>`;
}

export function Sketch({ f, value, onChange }) {
  const marksDef = arr(f.marks);
  const d = readDrawing(value);
  const t = things(d);
  const wrap = useRef(null);
  const svg = useRef(null);
  const edit = useRef(null);
  const history = useRef([]);
  const drag = useRef(null);
  const skipClick = useRef(false);
  const closing = useRef(false);
  const [wrapW, setWrapW] = useState(MIN_W);
  const [tool, setTool] = useState({ kind: 'label' }); // label, mark (with its key), or connect
  const [from, setFrom] = useState(null); // the first end of a connector
  const [sel, setSel] = useState(null); // { kind: 'thing' | 'connector', id }
  const [dragPos, setDragPos] = useState(null); // { id, x, y } while dragging
  const [editing, setEditing] = useState(null); // { id or null for a new label, x, y, text }
  const [focusId, setFocusId] = useState(null); // what takes focus after the next render

  // The sheet is as wide as its container, at least MIN_W, and grows past the things.
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const measure = () => setWrapW(el.clientWidth || MIN_W);
    measure();
    if (!('ResizeObserver' in window)) return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  let maxX = 0; let maxY = 0;
  for (const it of t.values()) { maxX = Math.max(maxX, it.x + it.w / 2); maxY = Math.max(maxY, it.y + it.h / 2); }
  const W = Math.max(MIN_W, wrapW, Math.round(maxX + ROOM_RIGHT));
  const H = Math.max(MIN_H, Math.round(maxY + ROOM_BELOW));

  useEffect(() => {
    if (!focusId) return;
    const el = focusId === 'sheet' ? svg.current : svg.current && svg.current.querySelector(`[data-thing="${focusId}"],[data-connector="${focusId}"]`);
    if (el && el.focus) el.focus();
    setFocusId(null);
  }, [focusId]);
  useEffect(() => {
    if (editing && edit.current) { edit.current.focus(); edit.current.select(); }
  }, [!!editing, editing && editing.id]);

  const pos = (id) => (dragPos && dragPos.id === id ? dragPos : t.get(id) || null);
  const clampPt = (p) => ({ x: Math.round(Math.max(HIT / 2, p.x)), y: Math.round(Math.max(HIT / 2, p.y)) });
  const toLocal = (e) => { const r = svg.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const markLabel = (key) => (marksDef.find((m) => m.key === key) || {}).label || key;
  const thingName = (it) => (it.kind === 'label' ? it.text : it.mark === 'question' ? 'A question mark for what you do not know' : `A mark for ${markLabel(it.mark)}`);
  const describe = (id) => {
    const it = t.get(id);
    if (!it) return 'the first end';
    return it.kind === 'label' ? `"${it.text}"` : it.mark === 'question' ? 'the question mark' : `the mark for ${markLabel(it.mark)}`;
  };

  // Every change goes through here, so the last one can be undone. An empty
  // drawing is stored as nothing.
  const commit = (next) => {
    history.current.push(value || null);
    if (history.current.length > HISTORY) history.current.shift();
    onChange(sketchHasContent(next) ? next : null);
  };
  const undo = () => {
    if (!history.current.length) return;
    const prev = history.current.pop();
    setSel(null); setFrom(null); setEditing(null);
    onChange(prev);
  };

  // Where a thing added from the keyboard goes: the middle of what is in view, moved
  // along where another thing already sits.
  const freeSpot = (p) => {
    let q = clampPt(p);
    const taken = (x, y) => [...t.values()].some((it) => Math.abs(it.x - x) < 24 && Math.abs(it.y - y) < 24);
    for (let n = 0; n < 40 && taken(q.x, q.y); n++) q = { x: q.x + 28, y: q.y + 28 };
    return q;
  };
  const centreInView = () => {
    const el = wrap.current;
    const r = svg.current ? svg.current.getBoundingClientRect() : { top: 0 };
    const x = el ? el.scrollLeft + el.clientWidth / 2 : W / 2;
    const y = Math.max(60, Math.min(H - 60, window.innerHeight / 2 - r.top));
    return freeSpot({ x, y });
  };
  const addMark = (mark, p) => {
    const id = newId('mk');
    commit({ ...d, marks: [...d.marks, { id, mark, ...clampPt(p) }] });
    setSel({ kind: 'thing', id });
    setFocusId(id);
  };
  const openEdit = (e) => { closing.current = false; setSel(e.id ? { kind: 'thing', id: e.id } : null); setEditing(e); };
  const startLabel = (p) => openEdit({ id: null, ...clampPt(p), text: '' });
  const remove = (s) => {
    if (!s) return;
    if (s.kind === 'connector') commit({ ...d, connectors: d.connectors.filter((c) => c.id !== s.id) });
    else commit({ marks: d.marks.filter((m) => m.id !== s.id), labels: d.labels.filter((l) => l.id !== s.id), connectors: d.connectors.filter((c) => c.a !== s.id && c.b !== s.id) });
    setSel(null); setFrom(null);
  };
  const move = (id, p) => {
    const q = clampPt(p);
    commit({ ...d, marks: d.marks.map((m) => (m.id === id ? { ...m, ...q } : m)), labels: d.labels.map((l) => (l.id === id ? { ...l, ...q } : l)) });
  };
  const connect = (a, b) => {
    if (a === b) return;
    if (d.connectors.some((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a))) return;
    const id = newId('cn');
    commit({ ...d, connectors: [...d.connectors, { id, a, b }] });
    setSel({ kind: 'connector', id });
    setFocusId(id);
  };
  // Enter or a blur ends the editing of a label; Escape leaves the text as it was. A
  // new label with nothing typed is not kept, and a label emptied is removed.
  const finishEdit = (cancel) => {
    const e = editing;
    if (!e || closing.current) return;
    closing.current = true;
    setEditing(null);
    const text = cancel ? null : String(e.text || '').trim();
    if (e.id == null) {
      if (!text) { setFocusId('sheet'); return; }
      const id = newId('lb');
      commit({ ...d, labels: [...d.labels, { id, text, x: e.x, y: e.y }] });
      setSel({ kind: 'thing', id });
      setFocusId(id);
      return;
    }
    if (cancel) { setFocusId(e.id); return; }
    if (!text) { remove({ kind: 'thing', id: e.id }); setFocusId('sheet'); return; }
    commit({ ...d, labels: d.labels.map((l) => (l.id === e.id ? { ...l, text } : l)) });
    setFocusId(e.id);
  };
  const pickEnd = (id) => {
    if (!from) { setFrom(id); return; }
    connect(from, id);
    setFrom(null);
  };

  // A tap or click on the empty sheet: a label there, or the chosen mark there. A
  // finger that pans the container sends no click.
  const onSheetClick = (e) => {
    if (skipClick.current) { skipClick.current = false; return; }
    if (e.target.closest && e.target.closest('[data-thing],[data-connector]')) return;
    setSel(null);
    if (tool.kind === 'connect') { setFrom(null); return; }
    const p = toLocal(e);
    if (tool.kind === 'mark') addMark(tool.mark, p);
    else startLabel(p);
  };
  const onThingDown = (e, id) => {
    e.stopPropagation();
    if (tool.kind === 'connect') { pickEnd(id); return; }
    const wasSelected = !!sel && sel.kind === 'thing' && sel.id === id;
    setSel({ kind: 'thing', id });
    const p = toLocal(e);
    const cur = pos(id);
    drag.current = { id, dx: p.x - cur.x, dy: p.y - cur.y, start: { x: cur.x, y: cur.y }, moved: false, wasSelected };
    // The click that follows is the end of this press, not a tap on the sheet.
    skipClick.current = true;
    try { svg.current.setPointerCapture(e.pointerId); } catch (err) { /* the drag still follows the pointer while it stays over the sheet */ }
  };
  const onMove = (e) => {
    const g = drag.current;
    if (!g) return;
    const p = toLocal(e);
    const q = clampPt({ x: p.x - g.dx, y: p.y - g.dy });
    if (!g.moved && Math.abs(q.x - g.start.x) < 3 && Math.abs(q.y - g.start.y) < 3) return;
    g.moved = true;
    setDragPos({ id: g.id, x: q.x, y: q.y });
  };
  const onUp = () => {
    const g = drag.current;
    drag.current = null;
    if (g && g.moved && dragPos) move(g.id, dragPos);
    else if (g && g.wasSelected) {
      // A second tap on a label that is already selected opens its text.
      const it = t.get(g.id);
      if (it && it.kind === 'label') openEdit({ id: it.id, x: it.x, y: it.y, text: it.text });
    }
    setDragPos(null);
  };
  const onCancel = () => { drag.current = null; skipClick.current = false; setDragPos(null); };

  const isUndo = (e) => (e.ctrlKey || e.metaKey) && String(e.key).toLowerCase() === 'z';
  const onThingKey = (e, id) => {
    const it = t.get(id);
    if (!it) return;
    const step = e.shiftKey ? 32 : 8;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault(); e.stopPropagation();
      move(id, { x: it.x + moves[e.key][0], y: it.y + moves[e.key][1] });
      setSel({ kind: 'thing', id });
      setFocusId(id);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault(); e.stopPropagation();
      remove({ kind: 'thing', id });
      setFocusId('sheet');
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); e.stopPropagation();
      if (tool.kind === 'connect') { pickEnd(id); return; }
      setSel({ kind: 'thing', id });
      if (it.kind === 'label') openEdit({ id: it.id, x: it.x, y: it.y, text: it.text });
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setSel(null); setFrom(null);
    } else if (isUndo(e)) {
      e.preventDefault(); e.stopPropagation();
      undo();
    }
  };
  const onConnectorKey = (e, id) => {
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); e.stopPropagation(); remove({ kind: 'connector', id }); setFocusId('sheet'); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setSel({ kind: 'connector', id }); }
    else if (e.key === 'Escape') { e.stopPropagation(); setSel(null); }
    else if (isUndo(e)) { e.preventDefault(); e.stopPropagation(); undo(); }
  };
  const onSheetKey = (e) => {
    if (e.target !== svg.current) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      const p = centreInView();
      if (tool.kind === 'mark') addMark(tool.mark, p);
      else if (tool.kind === 'label') startLabel(p);
    } else if (e.key === 'Escape') { setSel(null); setFrom(null); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sel) { e.preventDefault(); remove(sel); }
    else if (isUndo(e)) { e.preventDefault(); undo(); }
  };

  const selThing = sel && sel.kind === 'thing' ? t.get(sel.id) : null;
  const selConn = sel && sel.kind === 'connector' ? d.connectors.find((c) => c.id === sel.id) : null;
  const dim = !!(selThing || selConn);
  const involved = (id) => (selThing && selThing.id === id) || (selConn && (selConn.a === id || selConn.b === id));
  const editW = editing ? Math.max(EDIT_W, labelWidth(editing.text) + 20) : 0;

  return html`<div class="sk">
    <div class="sk__tools">
      <div class="es-seg" role="group" aria-label="Tool">
        <button aria-pressed=${tool.kind === 'label'} onClick=${() => { setTool({ kind: 'label' }); setFrom(null); }}><${Prov}>Write a label</${Prov}></button>
        ${marksDef.map((m) => html`<button key=${m.key} class="sk__markbtn" aria-pressed=${tool.kind === 'mark' && tool.mark === m.key}
            onClick=${() => { setTool({ kind: 'mark', mark: m.key }); setFrom(null); }}>
          <svg viewBox="-22 -22 44 44" aria-hidden="true" class="sk__markicon"><${Glyph} mark=${m.key} /></svg>
          <${Prov}>${m.key === 'question' ? 'A question mark for what you do not know' : `A mark for ${m.label}`}</${Prov}>
        </button>`)}
        <button aria-pressed=${tool.kind === 'connect'} onClick=${() => { setTool({ kind: 'connect' }); setFrom(null); }}><${Prov}>Draw a connector</${Prov}></button>
      </div>
      <span class="es-hint sk__modehint"><${Prov}>${
        tool.kind === 'connect' ? (from ? `From ${describe(from)}: tap or click the other end.` : 'Tap or click one thing, then the other.')
          : tool.kind === 'mark' ? 'Tap or click the sheet where the mark goes.'
          : 'Tap or click the sheet to write a label there. Drag anything to move it.'
      }</${Prov}></span>
      ${(selThing || selConn) && html`<button class="es-btn es-btn--quiet es-btn--sm sk__remove" onClick=${() => remove(sel)}><${Prov}>${selConn ? 'Remove the connector' : selThing.kind === 'mark' ? 'Remove the mark' : 'Remove the label'}</${Prov}></button>`}
      ${selThing && selThing.kind === 'label' && html`<button class="es-btn es-btn--quiet es-btn--sm sk__retext" onClick=${() => openEdit({ id: selThing.id, x: selThing.x, y: selThing.y, text: selThing.text })}><${Prov}>Change the text</${Prov}></button>`}
      <button class="es-btn es-btn--ghost es-btn--sm sk__undo" disabled=${!history.current.length} onClick=${undo}><${Prov}>Undo the last change</${Prov}></button>
    </div>

    <div class="sk__sheet" ref=${wrap}>
      <svg ref=${svg} width=${W} height=${H} class=${`sk__svg tool-${tool.kind}`} tabindex="0" role="application" aria-label="The first drawing"
        onClick=${onSheetClick} onKeyDown=${onSheetKey} onPointerMove=${onMove} onPointerUp=${onUp} onPointerCancel=${onCancel}>
        <defs>
          <pattern id="sk-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" class="sk__dot" /></pattern>
        </defs>
        <rect x="0" y="0" width=${W} height=${H} class="sk__paper" />
        <rect x="0" y="0" width=${W} height=${H} fill="url(#sk-dots)" class="sk__raster" />

        ${d.connectors.map((c) => {
          const a = pos(c.a); const b = pos(c.b);
          if (!a || !b) return null;
          const cls = `sk__conn ${selConn && selConn.id === c.id ? 'is-selected' : dim ? 'is-dim' : ''}`;
          return html`<g key=${c.id} data-connector=${c.id} class=${cls} tabindex="0" aria-label=${`A connector from ${describe(c.a)} to ${describe(c.b)}`}
              onPointerDown=${(e) => { e.stopPropagation(); setSel({ kind: 'connector', id: c.id }); setFrom(null); }} onKeyDown=${(e) => onConnectorKey(e, c.id)}>
            <line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} class="sk__connhit" />
            <line x1=${a.x} y1=${a.y} x2=${b.x} y2=${b.y} />
          </g>`;
        })}

        ${[...t.values()].map((it) => {
          const p = pos(it.id);
          const w = Math.max(HIT, it.w); const h = Math.max(HIT, it.h);
          const cls = `sk__thing sk__thing--${it.kind} ${from === it.id ? 'is-from' : ''} ${involved(it.id) ? 'is-selected' : dim ? 'is-dim' : ''}`;
          return html`<g key=${it.id} data-thing=${it.id} class=${cls} transform=${`translate(${p.x},${p.y})`} tabindex="0" aria-label=${thingName(it)}
              onPointerDown=${(e) => onThingDown(e, it.id)} onKeyDown=${(e) => onThingKey(e, it.id)}
              onDblClick=${() => { if (it.kind === 'label') openEdit({ id: it.id, x: it.x, y: it.y, text: it.text }); }}>
            <rect x=${-w / 2} y=${-h / 2} width=${w} height=${h} class="sk__hit" />
            <${ThingShape} it=${it} />
          </g>`;
        })}
      </svg>
      ${editing && html`<input ref=${edit} class="sk__edit" type="text" aria-label="The label" value=${editing.text}
        style=${{ left: `${editing.x - editW / 2}px`, top: `${editing.y - LABEL_H / 2}px`, width: `${editW}px` }}
        onInput=${(e) => setEditing({ ...editing, text: e.target.value })}
        onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); finishEdit(false); } else if (e.key === 'Escape') { e.preventDefault(); finishEdit(true); } }}
        onBlur=${() => finishEdit(false)} />`}
    </div>
  </div>`;
}
