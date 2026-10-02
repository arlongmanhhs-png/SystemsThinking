// Printed text on screen: the workbook's inline marks, its page references (on
// screen, the Step and the Exercise, or the screen's place, in the screen's own
// words; decided 2 October 2026), the glossary terms (the workbook, page 6: "On the
// platform every one of these terms is a link, so the full definition opens wherever
// the term appears"), and the marker for the screen's own wording where the workbook
// prints none.

import { html, useState, useRef, useEffect, createContext, useContext, Fragment } from '../html.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { screenTarget } from '../definitions/index.js';
import { screenRef } from '../definitions/screen-refs.js';
import { useRouter } from './router.js';

const TERMS = WORKBOOK.pages.glossary.terms;

// Longest first, so "System problem definition" wins over "System" and "Problem
// definition". Plurals are matched for single-word terms.
const TERM_RE = new RegExp(
  '\\b(' + TERMS
    .map((t) => t.term)
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (t.includes(' ') ? '' : 's?'))
    .join('|') + ')\\b',
  'gi',
);

function termFor(word) {
  const w = word.toLowerCase();
  return TERMS.find((t) => t.term.toLowerCase() === w || t.term.toLowerCase() + 's' === w) || null;
}

// One glossary link per term per block of text, so a passage is not a wall of links.
const Used = createContext(null);

export function TermScope({ children }) {
  // A fresh set on every render, so the first occurrence is linked again each time.
  const used = new Set();
  return html`<${Used.Provider} value=${used}>${children}</${Used.Provider}>`;
}

export function pageNumber(id) {
  const p = WORKBOOK.pages[id];
  return p ? p.page : '';
}

// The printed page number, for a reference the screen has no place for (the notes
// pages, the front matter): the sentence stays as printed until Ashley says how it
// reads on screen (core/open-questions.md, 2 October 2026). A link where the page
// lands somewhere on screen, plain text where it does not.
export function PageRef({ to }) {
  const { goPage } = useRouter();
  if (!screenTarget(to)) return html`<span class="pgref">${pageNumber(to)}</span>`;
  return html`<a href="#" class="pgref" onClick=${(e) => { e.preventDefault(); goPage(to); }}>${pageNumber(to)}</a>`;
}

// The screen's wording for a place, in place of a printed page number. Every line
// here is the screen's own, provisional (tools/wording-tiers.json, method tier).
const WORDS = {
  exercise: (step, n) => `Step ${step}, Exercise ${n}`,
  exercises: (step) => `Step ${step}, Exercises `,
  only: (n) => `Exercise ${n}`,
  onlyMany: 'Exercises ',
  under: (step, heading) => `the Step ${step} instructions, under "${heading}"`,
  titled: (step, title) => `the Step ${step} instructions, "${title}"`,
  lead: { in: 'in ', from: 'from ', where: 'In ', bare: '', exercise: '' },
};

// "1 to 4" for a run, "3 and 6" for two, "3, 6 and 8" otherwise.
function range(ns) {
  if (ns.length > 2 && ns.every((n, i) => !i || n === ns[i - 1] + 1)) return `${ns[0]} to ${ns[ns.length - 1]}`;
  return ns.map((n, i) => `${i ? (i === ns.length - 1 ? ' and ' : ', ') : ''}${n}`).join('');
}

const placeName = (p) => (p.kind === 'passage' ? (p.under ? WORDS.under(p.step, p.under) : WORDS.titled(p.step, p.title)) : p.name);

// A page reference, in the screen's words, with the phrase around it: "on page 11"
// becomes "in Step 1, Exercise 6", "on pages 13 and 17" becomes "in Step 2,
// Exercises 3 and 6", "from page 13" becomes "from Step 2, Exercise 3", and "Step 1,
// page 11" becomes "Step 1, Exercise 6" (`form` is the lead the printed phrase had:
// in, from, where, exercise for a step already named, or bare). Each place stays a
// link to where it is on screen: the whole name for one place, and each number for
// two exercises named together. The whole phrase is marked as the screen's own.
export function ScreenRef({ refs, form = 'bare', step = null, at = null, close = false }) {
  const { go } = useRouter();
  const places = refs.map((id) => screenRef(id, at)).filter(Boolean);
  if (!places.length) return null;
  const goTo = (t) => (t.view ? go({ view: t.view }) : go({ view: 'step', step: t.step, exercise: t.passage ? null : t.exercise, passage: t.passage || null }));
  const link = (text, t) => html`<a href="#" class="pgref" onClick=${(e) => { e.preventDefault(); goTo(t); }}>${text}</a>`;
  let body;
  if (places.every((p) => p.kind === 'exercises' && p.step === places[0].step)) {
    const st = places[0].step;
    const ns = [...new Set(places.flatMap((p) => p.exercises))].sort((a, b) => a - b);
    const exLink = (n, text) => link(text, { step: st, exercise: n });
    const named = form === 'exercise' && step === st;
    if (ns.length === 1) body = exLink(ns[0], named ? WORDS.only(ns[0]) : WORDS.exercise(st, ns[0]));
    else if (places.length > 1) {
      body = html`${named ? WORDS.onlyMany : WORDS.exercises(st)}${ns.map((n, i) => html`<${Fragment} key=${n}>${i ? (i === ns.length - 1 ? ' and ' : ', ') : ''}${exLink(n, String(n))}</${Fragment}>`)}`;
    } else body = exLink(ns[0], `${named ? WORDS.onlyMany : WORDS.exercises(st)}${range(ns)}`);
  } else {
    body = places.map((p, i) => html`<${Fragment} key=${i}>${i ? ' and ' : ''}${link(placeName(p), p.target)}</${Fragment}>`);
  }
  const tail = close && places.every((p) => p.kind === 'passage') ? ',' : '';
  return html`<${Prov}>${WORDS.lead[form]}${body}${tail}</${Prov}>`;
}

// The inline content of workbook.js as a list: strings, {ref}, {b}, {i}. A plain
// string carries {p:pageId} for a reference.
function tokens(c) {
  if (c == null) return [];
  if (typeof c === 'string') {
    return c.split(/(\{p:[a-z0-9]+\})/g).filter(Boolean).map((p) => {
      const m = p.match(/^\{p:([a-z0-9]+)\}$/);
      return m ? { ref: m[1] } : p;
    });
  }
  return Array.isArray(c) ? c.flatMap(tokens) : [c];
}

// The printed phrase around a reference, read as a whole so that the sentence still
// reads as English once the reference is in the screen's words: the lead ("on",
// "from", or "Step 1, " before "page") is taken into the reference, and two pages
// named together ("pages 13 and 17") become one reference. A reference the screen
// has no place for is left as printed.
const LEAD = /(?:\b(on|from) )?\bpages? ?$/;
const STEP_LEAD = /\bStep (\d+), (page ?)$/;
function phrased(list, at) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const x = list[i];
    if (!x || !x.ref || !screenRef(x.ref, at)) { out.push(x); continue; }
    const refs = [x.ref];
    if (list[i + 1] === ' and ' && list[i + 2] && list[i + 2].ref && screenRef(list[i + 2].ref, at)) { refs.push(list[i + 2].ref); i += 2; }
    let form = 'bare';
    let step = null;
    const prev = out[out.length - 1];
    if (typeof prev === 'string') {
      const s = prev.match(STEP_LEAD);
      const m = s ? null : prev.match(LEAD);
      if (s) { form = 'exercise'; step = Number(s[1]); out[out.length - 1] = prev.slice(0, prev.length - s[2].length); }
      else if (m) { form = m[1] === 'on' ? 'in' : m[1] || 'bare'; out[out.length - 1] = prev.slice(0, m.index); }
    }
    // A heading phrase dropped into the middle of a clause ("in the Step 1
    // instructions, under "The problem definition", is the default") closes with a
    // comma where the sentence goes on; before a full stop or a colon it does not.
    const close = typeof list[i + 1] === 'string' && /^\s*[A-Za-z]/.test(list[i + 1]);
    out.push({ sref: { refs, form, step, at, close } });
  }
  return out;
}

function Term({ word, term }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return html`<span class="term" ref=${box}>
    <button type="button" class="term__word" aria-expanded=${open} onClick=${() => setOpen(!open)}>${word}</button>
    ${open && html`<span class="term__pop" role="note">
      <b>${term.term}</b>
      <span>${term.definition}.</span>
      ${term.ref && screenRef(term.ref, `glossary:${term.term}`) && html`<span class="term__where"><${ScreenRef} refs=${[term.ref]} form="where" at=${`glossary:${term.term}`} /></span>`}
    </span>`}
  </span>`;
}

function Linked({ text }) {
  const used = useContext(Used);
  if (!used) return text;
  const out = [];
  let lastIndex = 0;
  let m;
  TERM_RE.lastIndex = 0;
  while ((m = TERM_RE.exec(text))) {
    const term = termFor(m[0]);
    if (!term || used.has(term.term)) continue;
    used.add(term.term);
    out.push(text.slice(lastIndex, m.index));
    out.push(html`<${Term} key=${m.index} word=${m[0]} term=${term} />`);
    lastIndex = m.index + m[0].length;
  }
  out.push(text.slice(lastIndex));
  return out;
}

// Inline content from workbook.js: strings, {b}, {i}, {ref}. A plain string is
// accepted too, with {p:pageId} standing for a page reference. `at` says where the
// text is shown (an instruction page's id, `carries:<zone>`, `<page>:<exercise>`),
// which decides what a page reference names on screen (definitions/screen-refs.js).
export function Rich({ c, terms = true, at = null }) {
  if (c == null) return null;
  if (typeof c === 'string' || Array.isArray(c)) {
    return phrased(tokens(c), at).map((x, i) => {
      if (typeof x === 'string') return terms ? html`<${Linked} key=${i} text=${x} />` : x;
      if (x && x.sref) return html`<${ScreenRef} key=${i} ...${x.sref} />`;
      return html`<${Rich} key=${i} c=${x} terms=${terms} at=${at} />`;
    });
  }
  if (c.ref) return html`<${PageRef} to=${c.ref} />`;
  if (c.b) return html`<b><${Rich} c=${c.b} terms=${terms} at=${at} /></b>`;
  if (c.i) return html`<i><${Rich} c=${c.i} terms=${terms} at=${at} /></i>`;
  return null;
}

// The screen's own wording, where the workbook prints nothing. Marked so that it is
// never read as settled copy.
export function Prov({ children, on = true }) {
  if (!on) return children;
  return html`<span class="prov" title="Not printed in the workbook: the screen's own wording, provisional">${children}</span>`;
}

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const DATETIME = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function fmtDate(iso) {
  if (!iso) return '';
  try { return DATE.format(new Date(iso)); } catch (e) { return ''; }
}

export function fmtDateTime(iso) {
  if (!iso) return '';
  try { return DATETIME.format(new Date(iso)); } catch (e) { return ''; }
}
