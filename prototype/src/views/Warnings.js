// A warning never blocks. It is dismissed with one line, which is stored with its
// date, and a dismissed warning stays visible as that line so the dismissal is part
// of the record rather than a disappearance.

import { html, useState, Fragment } from '../html.js';
import { useCase } from '../engine/store.js';
import { Prov, fmtDate } from './text.js';
import { useRouter } from './router.js';

const arr = (x) => (Array.isArray(x) ? x : [x]);

// Where a "no" sends the participant: a link to each exercise, by its number. Page 24
// prints the page beside each line of the critical check; on screen the exercise is
// the place, so no page is named (decided 2 October 2026). With `list`, as under each
// criterion, the links are separated with semicolons.
export function SendsTo({ step, to, list = false }) {
  const { go } = useRouter();
  if (!to) return null;
  return arr(to).map((t, i) => {
    const s = t.step || step;
    return html`<${Fragment} key=${i}>${list && i ? '; ' : ''}<a href="#" class=${list ? 'sendsto sendsto--list' : 'sendsto'} onClick=${(e) => {
      e.preventDefault();
      go({ view: 'step', step: s, exercise: t.exercise });
    }}>${t.step && t.step !== step ? `Step ${t.step}, ` : ''}Exercise ${t.exercise}</a></${Fragment}>`;
  });
}

function Offer({ step, w }) {
  const { state, act } = useCase();
  const o = w.check.offer;
  if (!o) return null;
  const text = (state.values[step] || {})[o.from];
  const parked = ((state.values[1] || {}).parked || []).some((p) => p.idea === text);
  if (parked) return html`<span class="es-hint"><${Prov} on=${!!o.provisional}>${o.done}</${Prov}></span>`;
  return html`<button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => act.park(text)}><${Prov} on=${!!o.provisional}>${o.label}</${Prov}></button>`;
}

function One({ step, w }) {
  const { act } = useCase();
  const [writing, setWriting] = useState(false);
  const [line, setLine] = useState('');
  if (w.dismissed) {
    return html`<div class="warning is-dismissed">
      <span class="warning__text">${w.text}</span>
      <span class="warning__dismissed"><${Prov}>Dismissed ${fmtDate(w.dismissed.at)}:</${Prov}> ${w.dismissed.line}</span>
      <button class="linkish" onClick=${() => act.restoreWarning(step, w.id)}><${Prov}>Show again</${Prov}></button>
    </div>`;
  }
  return html`<div class="warning" role="status">
    <div class="warning__text"><${Prov} on=${!!w.check.provisional}>${w.text}</${Prov}></div>
    <div class="warning__acts">
      <${SendsTo} step=${step} to=${w.sendsTo} />
      <${Offer} step=${step} w=${w} />
      ${!writing
        ? html`<button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => setWriting(true)}><${Prov}>Dismiss, with one line</${Prov}></button>`
        : html`<form class="warning__form" onSubmit=${(e) => { e.preventDefault(); if (line.trim()) act.dismissWarning(step, w.id, line.trim(), w.signature); }}>
            <input class="es-input es-input--sm" autofocus value=${line} onInput=${(e) => setLine(e.target.value)} aria-label="One line on why" />
            <button class="es-btn es-btn--dark es-btn--sm" disabled=${!line.trim()} type="submit"><${Prov}>Dismiss</${Prov}></button>
            <button class="es-btn es-btn--quiet es-btn--sm" type="button" onClick=${() => setWriting(false)}><${Prov}>Cancel</${Prov}></button>
          </form>`}
    </div>
  </div>`;
}

// A stop is not a warning: it cannot be dismissed, and it keeps the critical check
// closed while the answer that raised it stands. It says where it sends the participant.
export function Stops({ step, list }) {
  if (!list || !list.length) return null;
  return html`<div class="warnings">${list.map((b) => html`<div key=${b.id} class="warning is-stop" role="alert">
    <div class="warning__text">${b.text}</div>
    <div class="warning__acts"><${SendsTo} step=${step} to=${b.sendsTo} /></div>
  </div>`)}</div>`;
}

export function Warnings({ step, list }) {
  if (!list || !list.length) return null;
  return html`<div class="warnings">${list.map((w) => html`<${One} key=${w.id} step=${step} w=${w} />`)}</div>`;
}
