// The read-through as a file (decided 2 October 2026, B03; built the same day): one
// self-contained HTML document of the whole of Phase A. Every exercise of Steps 1 to 3
// in the book's order with its number and title, each step's state and the date the
// step passed, the Step 3 graph, both drawings, and page 25 at the end; the case's
// name and the date of saving at the top. It is readable offline in any browser and
// printable from there: inline CSS with A4 print styles, the case's content as static
// markup, no script, and every piece of participant text escaped. The three faces
// (Outfit, Archivo, Archivo Narrow) are embedded from design-system/assets/fonts
// where they can be read, about 96 KB of the file; a plain stack stands in where
// they cannot. GT Walsheim Pro is not in the repository and is never referenced.
//
// The format is provisional: the question of the file's format is open with Ashley
// (core/open-questions.md, 2 October 2026), and this is the format recommended to
// her. The content, the wording, and the geometry of the graph and the drawings are
// the screen's own, shared through readthrough.js, Graph.js, Sketch.js, and
// Arrangement.js, so the file says nothing the screen does not.

import { STEPS } from '../definitions/index.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { LISTS } from '../definitions/lists.js';
import { stepInfo, STATE_LABEL } from '../engine/state.js';
import { fieldValue, filled } from '../engine/ctx.js';
import { sketchHasContent } from '../engine/validate.js';
import { W as GW, H as GH, M as GM, BAND_H, KIND_CLASS, num, scales, pathOf, axisTicks, eventsOf, segmentsOf, stripHeight } from './Graph.js';
import { readDrawing, things, sketchBox, GLYPHS, MARK_R } from './Sketch.js';
import { readCase, placementOf, nodePoints, typeLabel, trim, W as AW, BH, NW, NH } from './Arrangement.js';
import { fmtDate } from './text.js';
import { arr, LETTERS, cellText, exerciseTitle, readFields, fieldLabel, noteOf, listLabel, refLabel, seriesView, arrangementSummary, arrangementCounts, carriesZones } from './readthrough.js';

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
// Every piece of text in the file goes through here: participant text, labels,
// titles, and attribute values alike.
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
// A coordinate written into markup: a number, rounded, or nothing.
const n = (x) => (Number.isFinite(Number(x)) ? +Number(x).toFixed(1) : 0);
// The screen's own wording, marked in the file as it is on screen.
const prov = (s) => `<span class="prov" title="Not printed in the workbook: the screen's own wording, provisional">${esc(s)}</span>`;
const isDataImage = (src) => /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(String(src || ''));

// The faces the file uses, and the files they are read from, beside this module.
const FONTS = [
  ['Outfit', 400, 'outfit-latin-400-normal.woff2'],
  ['Outfit', 600, 'outfit-latin-600-normal.woff2'],
  ['Archivo', 400, 'archivo-latin-400-normal.woff2'],
  ['Archivo Narrow', 500, 'archivo-narrow-latin-500-normal.woff2'],
  ['Archivo Narrow', 600, 'archivo-narrow-latin-600-normal.woff2'],
];

function base64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

let fontsPromise = null;
// The @font-face rules with the faces embedded, read once; an empty string where
// any face cannot be read, so the file falls back to the plain stack whole.
export function embeddedFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all(FONTS.map(async ([family, weight, file]) => {
      const r = await fetch(new URL(`../../design-system/assets/fonts/${file}`, import.meta.url));
      if (!r.ok) throw new Error(file);
      return `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${base64(await r.arrayBuffer())}) format("woff2")}`;
    })).then((rules) => rules.join('\n')).catch(() => { fontsPromise = null; return ''; });
  }
  return fontsPromise;
}

// The file's own stylesheet: the design system's tokens the read-through uses,
// the read-through's rules from app.css, the graph's and the drawings' rules, and
// the A4 print styles. One light look, the printed workbook's.
const CSS = `
:root{color-scheme:light;--navy:#17345E;--navy-40:#A2AEC0;--green:#9EA700;--green-press:#7F8604;--grey:#223343;--grey-80:#4E5C69;--grey-70:#64707B;--grey-60:#7A848E;--grey-50:#9099A1;--grey-40:#A6ADB4;--grey-30:#BDC2C7;--grey-20:#D3D6D9;--grey-10:#E9EAEC;--cream:#F3F2EB;--teal:#2A9CAE;--brown:#765044;--white:#FFFFFF;--font-display:"Outfit",Arial,sans-serif;--font-text:"Archivo","Aktiv Grotesk",Arial,sans-serif;--font-condensed:"Archivo Narrow","Aktiv Grotesk Condensed",Arial,sans-serif}
*{box-sizing:border-box}
html{background:var(--cream)}
body{margin:0;padding:36px 24px 60px;background:var(--cream);color:var(--grey);font:400 15px/1.5 var(--font-text)}
.read{max-width:980px;margin:0 auto}
h1,h2,h3{font-family:var(--font-display);font-weight:400;color:var(--navy);line-height:1.15;letter-spacing:-0.01em}
.read__head{margin-bottom:24px}
.read__head h1{font-size:36px;margin:6px 0}
.read__case{font:400 18px/1.4 var(--font-display);color:var(--navy);margin:0}
.es-overline{font:600 11px/1.3 var(--font-condensed);letter-spacing:.1em;text-transform:uppercase;color:var(--grey-80)}
.es-hint{font-size:13px;color:var(--grey-70);margin:2px 0}
.read__step{padding:18px 0;border-top:3px solid var(--navy);margin-top:18px}
.read__step>h2{font-size:24px;margin:0 0 4px}
.read__ex{padding:12px 0;border-top:1px solid var(--grey-30)}
.read__ex h3{font-size:16px;margin:0 0 6px}
.read__exn{display:inline-grid;place-items:center;width:22px;height:22px;background:var(--green);color:var(--navy);font:400 13px/1 var(--font-display);clip-path:polygon(0% 6.26%,100% 0%,93.74% 100%,6.26% 93.74%);margin-right:6px;vertical-align:-4px}
.read__field{margin:4px 0 8px 28px}
.read__field p{margin:2px 0 4px}
.read__label{font:600 11px/1.3 var(--font-condensed);letter-spacing:.05em;text-transform:uppercase;color:var(--grey-70)}
.read__text{white-space:pre-wrap;max-width:66ch}
.read__scroll{max-width:100%;overflow-x:auto}
.read__table{border-collapse:collapse;font-size:13px;margin-top:4px}
.read__table th{text-align:left;font:600 11px/1.2 var(--font-condensed);text-transform:uppercase;letter-spacing:.05em;color:var(--grey-80);padding:3px 12px 3px 0;border-bottom:1px solid var(--grey-40)}
.read__table td{padding:4px 12px 4px 0;border-bottom:1px solid var(--grey-10);vertical-align:top}
.read__img{max-height:260px;max-width:100%;width:auto}
.read__drawing{margin:6px 0}
.read__graph{margin:6px 0 12px}
.prov{text-decoration:underline dotted var(--grey-50);text-decoration-thickness:1px;text-underline-offset:3px}
svg{display:block;max-width:100%;height:auto}
.graph__svg{width:100%;background:var(--white);outline:1px solid var(--grey-20)}
.graph__plot{fill:var(--white)}
.graph__grid{stroke:var(--grey-10);stroke-width:1}
.graph__grid--x{stroke-dasharray:1 5;stroke:var(--grey-30)}
.graph__axis{stroke:var(--grey-50);stroke-width:1}
.graph__now{stroke:var(--grey-50);stroke-dasharray:3 3}
.graph__tick{font:500 11px/1 var(--font-condensed);fill:var(--grey-70)}
.graph__series path{fill:none;stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}
.graph__series circle{stroke:var(--white);stroke-width:1.5}
.graph__series--main path{stroke:var(--navy)}
.graph__series--main circle{fill:var(--navy)}
.graph__series--unchanged path{stroke:var(--grey-60);stroke-dasharray:2 6}
.graph__series--unchanged circle{fill:var(--grey-60)}
.graph__series--desired path{stroke:var(--green-press);stroke-dasharray:2 6}
.graph__series--desired circle{fill:var(--green-press)}
.graph__series--other path{stroke:var(--teal)}
.graph__series--other circle{fill:var(--teal)}
.graph__estimate{font:italic 500 12px/1 var(--font-condensed);fill:var(--grey-70)}
.graph__event{stroke:var(--brown);stroke-width:1;stroke-dasharray:2 3;opacity:.7}
.graph__eventmark{fill:var(--brown)}
.graph__eventlabel{font:500 11px/1 var(--font-condensed);fill:var(--grey-80)}
.ev rect{stroke:var(--white);stroke-width:1}
.ev text{font:600 11px/1 var(--font-condensed);fill:var(--white)}
.ev--measured rect{fill:var(--navy)}
.ev--documented rect{fill:var(--teal)}
.ev--documented text{fill:var(--navy)}
.ev--estimated rect{fill:var(--grey-40)}
.ev--estimated text{fill:var(--grey)}
.ev--unset rect{fill:var(--grey-20)}
.sk__svg--read{width:100%;max-height:480px;background:var(--white);outline:1px solid var(--grey-20)}
.sk__box{fill:var(--white);stroke:none}
.sk__labelbox{stroke:var(--grey);stroke-width:1.2}
.sk__labeltext{font:500 14px/1 var(--font-text);fill:var(--grey)}
.sk__glyph{fill:var(--white);stroke:var(--grey);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
.sk__q{font:700 28px/1 var(--font-text);fill:var(--grey);stroke:none}
.sk__conn line{stroke:var(--grey);stroke-width:1.6}
.arr__svg--read{width:100%;background:var(--white);outline:1px solid var(--grey-20);margin-top:6px}
.arr__paper{fill:var(--white);stroke:var(--grey-20)}
.arr__band{fill:var(--cream);fill-opacity:.85}
.arr__bandlabel{font:600 13px/1 var(--font-condensed);letter-spacing:.06em;text-transform:uppercase;fill:var(--grey-80);paint-order:stroke;stroke:var(--cream);stroke-width:4px;stroke-linejoin:round}
.arr__node polygon{fill:var(--white);stroke:var(--grey);stroke-width:1.2}
.arr__nodename{font:500 13px/1 var(--font-text);fill:var(--grey)}
.arr__nodetype{font:500 10px/1 var(--font-condensed);letter-spacing:.05em;text-transform:uppercase;fill:var(--grey-70)}
.arr__line line{stroke:var(--grey);stroke-width:1.6}
.arr__mark line{stroke:var(--brown);stroke-width:1.4;stroke-dasharray:2 4}
.arr__markflag{fill:var(--white);stroke:var(--brown);stroke-width:1.2}
.arr__marktext{font:700 12px/1 var(--font-text);fill:var(--brown)}
@page{size:A4;margin:18mm 16mm}
@media print{html,body{background:var(--white)}body{padding:0;font-size:11pt}.read{max-width:none}h2,h3{break-after:avoid}.read__ex{break-inside:avoid}.read__step[data-page="carries"]{break-before:page}.read__scroll{overflow:visible}.read__table{font-size:9.5pt}svg{max-height:none}}
`;

// The Step 3 graph, from the same geometry as the screen's (Graph.js): the axes and
// their ticks, the line as a path with its points, the event strip and the evidence
// band under the plot.
function graphSvg(state, g, name) {
  const { domain: d, layers, events, evidence } = g;
  const { sx, sy } = scales(d);
  const v3 = state.values[3] || {};
  const evs = events ? eventsOf(v3, d) : [];
  const segs = evidence ? segmentsOf(v3) : [];
  const stripH = events ? stripHeight(evs) : 0;
  const bandH = evidence ? BAND_H : 0;
  const { years, ys } = axisTicks(d);
  let s = `<svg viewBox="0 0 ${GW} ${GH + stripH + bandH}" class="graph__svg" role="img" aria-label="${esc(name)}">`;
  s += `<rect x="${GM.l}" y="${GM.t}" width="${GW - GM.l - GM.r}" height="${GH - GM.t - GM.b}" class="graph__plot"/>`;
  s += '<g class="graph__axes">';
  for (const v of ys) s += `<line x1="${GM.l}" x2="${GW - GM.r}" y1="${n(sy(v))}" y2="${n(sy(v))}" class="graph__grid"/><text x="${GM.l - 8}" y="${n(sy(v) + 4)}" class="graph__tick" text-anchor="end">${+v.toFixed(2)}</text>`;
  for (const y of years) s += `<line x1="${n(sx(y))}" x2="${n(sx(y))}" y1="${GM.t}" y2="${GH - GM.b}" class="graph__grid graph__grid--x"/><text x="${n(sx(y))}" y="${GH - GM.b + 18}" class="graph__tick" text-anchor="middle">${y}</text>`;
  if (d.xEnd != null && d.xEnd < d.x1) s += `<line x1="${n(sx(d.xEnd))}" x2="${n(sx(d.xEnd))}" y1="${GM.t}" y2="${GH - GM.b}" class="graph__now"/>`;
  s += `<line x1="${GM.l}" x2="${GM.l}" y1="${GM.t}" y2="${GH - GM.b}" class="graph__axis"/><line x1="${GM.l}" x2="${GW - GM.r}" y1="${GH - GM.b}" y2="${GH - GM.b}" class="graph__axis"/></g>`;
  for (const l of layers) {
    const path = pathOf(l.value && l.value.points, sx, sy);
    s += `<g class="graph__series ${l.className || ''}">${path ? `<path d="${path}"/>` : ''}`;
    for (const p of arr(l.value && l.value.points)) {
      if (num(p.t) == null || num(p.v) == null) continue;
      s += `<circle cx="${n(sx(num(p.t)))}" cy="${n(sy(num(p.v)))}" r="3"/>`;
    }
    s += '</g>';
  }
  for (const seg of segs.filter((x) => x.kind === 'estimated')) {
    const a = Math.max(d.x0, num(seg.range.from));
    const b = Math.min(d.x1, num(seg.range.to));
    s += `<text x="${n((sx(a) + sx(b)) / 2)}" y="${GM.t + 12}" text-anchor="middle" class="graph__estimate">this line is an estimate</text>`;
  }
  for (const ev of evs) s += `<line x1="${n(sx(num(ev.year)))}" x2="${n(sx(num(ev.year)))}" y1="${GM.t}" y2="${GH - GM.b + 4}" class="graph__event"/>`;
  if (events) {
    s += `<g class="graph__strip" transform="translate(0, ${GH})">`;
    evs.forEach((ev, i) => {
      const x = sx(num(ev.year));
      const right = x > GW * 0.7;
      s += `<rect x="${n(x - 3)}" y="2" width="6" height="6" class="graph__eventmark"/><text x="${n(right ? x - 6 : x + 6)}" y="${14 + (i % 4) * 14}" text-anchor="${right ? 'end' : 'start'}" class="graph__eventlabel">${num(ev.year)} ${esc(ev.label || '')}</text>`;
    });
    s += '</g>';
  }
  if (evidence) {
    s += `<g class="graph__evidence" transform="translate(0, ${GH + stripH})">`;
    for (const seg of segs) {
      const a = Math.max(d.x0, num(seg.range.from));
      const b = Math.min(d.x1, num(seg.range.to));
      if (b < a) continue;
      const k = LISTS.evidence_kinds.find((x) => x.value === seg.kind);
      s += `<g class="ev ${KIND_CLASS[seg.kind] || 'ev--unset'}"><rect x="${n(sx(a))}" y="2" width="${n(Math.max(2, sx(b) - sx(a)))}" height="18"/><text x="${n(sx(a) + 5)}" y="15">${esc(k ? k.short : '?')}</text></g>`;
    }
    s += '</g>';
  }
  return `${s}</svg>`;
}

// One of the four marks, from the same shapes as the screen's (Sketch.js).
function glyphSvg(mark) {
  const shapes = GLYPHS[mark] || GLYPHS.other;
  return `<g class="sk__glyph">${shapes.map(([tag, attrs, text]) => `<${tag}${Object.entries(attrs).map(([k, v]) => ` ${k}="${esc(v)}"`).join('')}>${text ? esc(text) : ''}</${tag}>`).join('')}</g>`;
}

// The first drawing, from the same things and the same box as the screen's reading
// of it (Sketch.js): connectors first, then marks and labels over them.
function sketchSvg(v) {
  const d = readDrawing(v);
  const t = things(d);
  if (!t.size) return '';
  const box = sketchBox(t);
  let s = `<svg viewBox="${n(box.x)} ${n(box.y)} ${n(box.w)} ${n(box.h)}" class="sk__svg sk__svg--read" role="img" aria-label="The first drawing">`;
  for (const c of d.connectors) {
    const a = t.get(c.a);
    const b = t.get(c.b);
    if (a && b) s += `<g class="sk__conn"><line x1="${n(a.x)}" y1="${n(a.y)}" x2="${n(b.x)}" y2="${n(b.y)}"/></g>`;
  }
  for (const it of t.values()) {
    s += `<g class="sk__thing sk__thing--${it.kind}" transform="translate(${n(it.x)},${n(it.y)})">`;
    if (it.kind === 'mark') s += `<rect x="${-MARK_R}" y="${-MARK_R}" width="${MARK_R * 2}" height="${MARK_R * 2}" class="sk__box"/>${glyphSvg(it.mark)}`;
    else s += `<rect x="${n(-it.w / 2)}" y="${n(-it.h / 2)}" width="${n(it.w)}" height="${n(it.h)}" class="sk__box sk__labelbox"/><text y="5" text-anchor="middle" class="sk__labeltext">${esc(it.text)}</text>`;
    s += '</g>';
  }
  return `${s}</svg>`;
}

// The second drawing, from the same sheet as the screen's (Arrangement.js): the
// bands by layer, the lines and the disagreement marks, the band labels, and the
// actors placed. The counts and the list of lines above it stay the reading of
// record; the picture is what the sheet looked like.
function arrangementSvg(state, v) {
  const c = readCase(state);
  const placed = (v && v.placed) || {};
  const pos = (id) => placementOf(c, placed[id]);
  const nodes = c.actors.map((a) => ({ a, p: pos(a.id) })).filter((x) => x.p);
  if (!c.layers.length || !nodes.length) return '';
  const H = Math.max(1, c.layers.length) * BH;
  const lines = arr(v && v.lines).filter((l) => pos(l.a) && pos(l.b));
  const marks = arr(v && v.marks).filter((m) => pos(m.a) && pos(m.b));
  let s = `<svg viewBox="0 0 ${AW} ${H}" class="arr__svg arr__svg--read" role="img" aria-label="The second drawing">`;
  s += `<rect x="0" y="0" width="${AW}" height="${H}" class="arr__paper"/>`;
  c.layers.forEach((l, i) => { s += `<rect x="8" y="${i * BH + 6}" width="${AW - 16}" height="${BH - 12}" class="arr__band"/>`; });
  for (const l of lines) {
    const a = pos(l.a);
    const b = pos(l.b);
    s += `<g class="arr__line"><line x1="${n(a.x)}" y1="${n(a.y)}" x2="${n(b.x)}" y2="${n(b.y)}"/></g>`;
  }
  for (const m of marks) {
    const a = pos(m.a);
    const b = pos(m.b);
    s += `<g class="arr__mark"><line x1="${n(a.x)}" y1="${n(a.y)}" x2="${n(b.x)}" y2="${n(b.y)}"/><g transform="translate(${n((a.x + b.x) / 2)},${n((a.y + b.y) / 2)})"><polygon points="-9,-9 9,-8 8,9 -8,8" class="arr__markflag"/><text text-anchor="middle" y="4" class="arr__marktext">≠</text></g></g>`;
  }
  c.layers.forEach((l, i) => { s += `<text x="20" y="${i * BH + 24}" class="arr__bandlabel">${i + 1} ${esc(l.name || '')}</text>`; });
  for (const { a, p } of nodes) {
    s += `<g class="arr__node" transform="translate(${n(p.x - NW / 2)},${n(p.y - NH / 2)})"><polygon points="${nodePoints(NW, NH)}"/><text x="10" y="19" class="arr__nodename">${esc(trim(a.name, 22))}</text><text x="10" y="35" class="arr__nodetype">${esc(trim(typeLabel(c, a), 26))}</text></g>`;
  }
  return `${s}</svg>`;
}

function tableHtml(state, f, v) {
  const rows = arr(v);
  if (!rows.length) return '<p class="read__empty"> </p>';
  const cols = f.columns;
  const numbered = f.numbered || f.lettered;
  const head = cols.some((c) => c.head)
    ? `<thead><tr>${numbered ? '<th></th>' : ''}${cols.map((c) => `<th>${esc(c.head || '')}</th>`).join('')}</tr></thead>`
    : '';
  const body = rows.map((r, i) => `<tr>${numbered ? `<td>${f.numbered ? i + 1 : esc(LETTERS[i] || '')}</td>` : ''}${cols.map((c) => `<td>${esc(cellText(state, c, r[c.key]))}</td>`).join('')}</tr>`).join('');
  return `<div class="read__scroll"><table class="read__table">${head}<tbody>${body}</tbody></table></div>`;
}

// A field's value, as the read-through shows it (ReadView.js, Value).
function valueHtml(state, f, v) {
  switch (f.kind) {
    case 'table': return tableHtml(state, f, v);
    case 'series': {
      const g = seriesView(state, f, v);
      return g ? `<div class="read__graph">${graphSvg(state, g, fieldLabel(f))}</div>` : '';
    }
    case 'arrangement': {
      const s = arrangementSummary(state, v);
      return `<div class="read__drawing"><p>${prov(arrangementCounts(s))}</p>${s.lines.length ? `<p class="es-hint">${esc(s.lines.join('; '))}</p>` : ''}${arrangementSvg(state, v)}</div>`;
    }
    case 'image': return v && isDataImage(v.src) ? `<img class="read__img" src="${esc(v.src)}" alt="">` : '';
    case 'sketch': return sketchHasContent(v) ? `<div class="read__drawing read__drawing--first">${sketchSvg(v)}</div>` : '';
    case 'confirm': return v ? `<p>${esc(f.label)}</p>` : '';
    case 'choice': return filled(v) ? `<p>${esc(listLabel(f.list, v))}</p>` : '';
    case 'ref':
      if (f.count) return `<p>${esc(arr(v).map((x) => refLabel(state, f.of, x)).join(' / '))}</p>`;
      return filled(v) ? `<p>${esc(refLabel(state, f.of, v))}</p>` : '';
    default: return filled(v) ? `<p class="read__text">${esc(v)}</p>` : '';
  }
}

function fieldHtml(state, stepNo, f) {
  const v = fieldValue(state, stepNo, f);
  const label = fieldLabel(f);
  const note = noteOf(state, stepNo, f);
  return `<div class="read__field" data-field="${esc(f.key)}">${label ? `<div class="read__label">${esc(label)}</div>` : ''}${valueHtml(state, f, v)}${note ? `<p class="es-hint">${esc(note)}</p>` : ''}</div>`;
}

function exerciseHtml(state, def, ex) {
  const fields = readFields(state, def, ex).map((f) => fieldHtml(state, def.number, f)).join('');
  return `<div class="read__ex" data-exercise="${ex.number}"><h3><span class="read__exn">${ex.number}</span> ${esc(exerciseTitle(ex))}</h3>${fields}</div>`;
}

function stepHtml(state, def) {
  const info = stepInfo(state, def.number);
  const status = `${STATE_LABEL[info.status]}${info.passedAt ? `, ${fmtDate(info.passedAt)}` : ''}`;
  return `<section class="read__step" data-step="${def.number}">
<h2>Step ${def.number}. ${esc(def.title)}</h2>
<p class="es-hint">${esc(status)}</p>
${def.exercises.map((ex) => exerciseHtml(state, def, ex)).join('\n')}
</section>`;
}

// The whole document, as a string. `fonts` is the @font-face block to embed (or
// nothing), and `at` the date of saving written at the top.
export function readThroughHtml(state, { fonts = '', at = new Date() } = {}) {
  const name = (state.meta && state.meta.case) || '';
  const carries = WORKBOOK.pages.carries;
  const zones = carriesZones(state).map((z) => `<div class="read__ex" data-zone="${z.n}"><h3><span class="read__exn">${z.n}</span> ${esc(z.title)}</h3><p class="read__text">${esc(z.text || ' ')}</p></div>`).join('\n');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name ? `${name}: Phase A` : 'Phase A')}, Systems Thinking Process</title>
<style>
${fonts}
${CSS}
</style>
</head>
<body>
<main class="read">
<header class="read__head">
<div class="es-overline">Phase A</div>
<h1>${prov('Phase A, read through')}</h1>
${name ? `<p class="read__case">${esc(name)}</p>` : ''}
<p class="es-hint">Started ${esc(fmtDate(state.meta && state.meta.started))}</p>
<p class="es-hint">${prov(`Saved to a file on ${fmtDate(at.toISOString())}`)}</p>
</header>
${STEPS.map((def) => stepHtml(state, def)).join('\n')}
<section class="read__step" data-page="carries">
<h2>${esc(carries.title)}</h2>
${zones}
</section>
</main>
</body>
</html>
`;
}

// The file to offer: its name, its text, and its type.
export async function readThroughFile(state) {
  const fonts = await embeddedFonts();
  const at = new Date();
  return { filename: `read-through-${at.toISOString().slice(0, 10)}.html`, text: readThroughHtml(state, { fonts, at }), type: 'text/html' };
}
