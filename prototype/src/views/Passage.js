// An instruction page of the workbook, as a passage on screen.
//
// The book puts the instruction on the left page and the work on the right. The
// screen has no facing page, so the passage is shown once, whole, before the
// exercises it faces in the book, where the book puts it; once read it closes to a
// bar, and stays reachable from every exercise it governs, opening beside the
// exercise, never as a modal (design/platform-phase-a.md, section 6). The screen
// keeps this one arrangement (decided 2 October 2026): "Above each exercise", which
// needed a mapping of every printed section to an exercise, is gone.

import { html, useState } from '../html.js';
import { page } from '../definitions/index.js';
import { Rich, TermScope, Prov } from './text.js';

export function sections(pageId) {
  const p = page(pageId);
  const out = [];
  let cur = { heading: null, blocks: [] };
  for (const b of p.blocks || []) {
    if (b.opposite) continue; // "Opposite: Exercises 1 to 5" names the facing page, which the screen does not have
    if (b.h) {
      if (cur.heading || cur.blocks.length) out.push(cur);
      cur = { heading: b.h, blocks: [] };
    } else cur.blocks.push(b);
  }
  if (cur.heading || cur.blocks.length) out.push(cur);
  return out;
}

// A page reference in a passage names the Step and the Exercise, or the screen's
// place, read for this passage (`at`): definitions/screen-refs.js.
function Block({ b, at }) {
  if (b.p) return html`<p><${Rich} c=${b.p} at=${at} /></p>`;
  if (b.template) return html`<blockquote class="passage__template"><${Rich} c=${b.template} terms=${false} at=${at} /></blockquote>`;
  if (b.callout) return html`<div class="passage__callout"><${Rich} c=${b.callout} at=${at} /></div>`;
  if (b.list) {
    const items = b.list.map((li, i) => html`<li key=${i}><${Rich} c=${li} at=${at} /></li>`);
    return b.ordered ? html`<ol>${items}</ol>` : html`<ul>${items}</ul>`;
  }
  if (b.table) {
    const t = b.table;
    return html`<div class="passage__tablewrap"><table class="passage__table">
      ${t.head && html`<thead><tr>${t.head.map((c, i) => html`<th key=${i}><${Rich} c=${c} terms=${false} at=${at} /></th>`)}</tr></thead>`}
      <tbody>${t.rows.map((r, i) => html`<tr key=${i}>${r.map((c, j) => html`<td key=${j}><${Rich} c=${c} at=${at} /></td>`)}</tr>`)}</tbody>
    </table></div>`;
  }
  return null;
}

function Sections({ list, at }) {
  return list.map((s, i) => html`<section class="passage__section" key=${i}>
    ${s.heading && html`<h3><${Rich} c=${s.heading} terms=${false} at=${at} /></h3>`}
    ${s.blocks.map((b, j) => html`<${Block} key=${j} b=${b} at=${at} />`)}
  </section>`);
}

// The printed overline and title. The printed page number is not shown: on screen
// there are no pages (decided 2 October 2026).
function Head({ p, compact, hideLead }) {
  return html`<header class="passage__head">
    <div class="es-overline">${p.overline}</div>
    <h2 class=${compact ? 'passage__title passage__title--sm' : 'passage__title'}>${p.title}</h2>
    ${!compact && !hideLead && p.lead && html`<p class="passage__lead"><${Rich} c=${p.lead} at=${p.id} /></p>`}
  </header>`;
}

// The passage in full, then as a bar once read.
export function PassageFull({ pageId, read, onRead, onOpenRail, railOpen, hideLead }) {
  const p = page(pageId);
  const [open, setOpen] = useState(false);
  if (!p) return null;
  if (!read || open) {
    return html`<article class="passage passage--full" id=${`passage-${pageId}`}>
      <${TermScope}>
        <${Head} p=${p} hideLead=${hideLead} />
        <${Sections} list=${sections(pageId)} at=${pageId} />
      </${TermScope}>
      <div class="passage__foot">
        ${!read
          ? html`<button class="es-btn es-btn--dark es-btn--sm" onClick=${() => onRead(pageId)}><${Prov}>I have read this</${Prov}></button>`
          : html`<button class="es-btn es-btn--ghost es-btn--sm" onClick=${() => setOpen(false)}><${Prov}>Close the instructions</${Prov}></button>`}
      </div>
    </article>`;
  }
  return html`<div class="passage passage--bar" id=${`passage-${pageId}`}>
    <span class="es-overline">${p.overline}</span>
    <span class="passage__bartitle">${p.title}</span>
    <button class="es-btn es-btn--quiet es-btn--sm" aria-pressed=${railOpen} onClick=${() => (railOpen ? onOpenRail(null) : setOpen(true))}><${Prov}>Open the instructions</${Prov}></button>
  </div>`;
}

// The same passage, opened beside the exercise the participant is in.
export function PassageRail({ pageId, onClose }) {
  const p = page(pageId);
  if (!p) return null;
  return html`<aside class="passage passage--rail" aria-label=${p.title}>
    <div class="passage__railbar">
      <span class="es-overline"><${Prov}>Instructions</${Prov}></span>
      <button class="es-btn es-btn--quiet es-btn--sm" onClick=${onClose}><${Prov}>Close the instructions</${Prov}></button>
    </div>
    <${TermScope}>
      <${Head} p=${p} compact=${true} />
      <${Sections} list=${sections(pageId)} at=${pageId} />
    </${TermScope}>
  </aside>`;
}
