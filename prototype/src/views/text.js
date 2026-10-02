// Printed text on screen: the workbook's inline marks, its generated page numbers
// (kept as the printed number, and made a link to the same place on screen), the
// glossary terms (the workbook, page 6: "On the platform every one of these terms is
// a link, so the full definition opens wherever the term appears"), and the marker
// for the screen's own wording where the workbook prints none.

import { html, useState, useRef, useEffect, createContext, useContext } from '../html.js';
import { WORKBOOK } from '../definitions/workbook.js';
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

export function PageRef({ to }) {
  const { goPage } = useRouter();
  return html`<a href="#" class="pgref" onClick=${(e) => { e.preventDefault(); goPage(to); }}>${pageNumber(to)}</a>`;
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
      ${term.ref && html`<span class="term__where">p. <${PageRef} to=${term.ref} /></span>`}
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
// accepted too, with {p:pageId} standing for a page reference.
export function Rich({ c, terms = true }) {
  if (c == null) return null;
  if (typeof c === 'string') {
    const parts = c.split(/(\{p:[a-z0-9]+\})/g);
    return parts.map((p, i) => {
      const m = p.match(/^\{p:([a-z0-9]+)\}$/);
      if (m) return html`<${PageRef} key=${i} to=${m[1]} />`;
      return terms ? html`<${Linked} key=${i} text=${p} />` : p;
    });
  }
  if (Array.isArray(c)) return c.map((x, i) => html`<${Rich} key=${i} c=${x} terms=${terms} />`);
  if (c.ref) return html`<${PageRef} to=${c.ref} />`;
  if (c.b) return html`<b><${Rich} c=${c.b} terms=${terms} /></b>`;
  if (c.i) return html`<i><${Rich} c=${c.i} terms=${terms} /></i>`;
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
