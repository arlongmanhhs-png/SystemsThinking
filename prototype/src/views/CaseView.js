// The case view: the home screen. Phase A as three step cards, and beside them the
// panel of what carries forward, which is page 25 of the workbook on screen.

import { html, useState } from '../html.js';
import { BUILT, STEPS } from '../definitions/index.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { PHASE_A } from '../definitions/phase-a.js';
import { useCase } from '../engine/store.js';
import { stepInfo, stepOpens, STATE_LABEL } from '../engine/state.js';
import { makeCtx, derivedAt } from '../engine/ctx.js';
import { useRouter } from './router.js';
import { Rich, Prov, fmtDate } from './text.js';
import { Block, Line, RefSelect } from './fields.js';
import { SaveButton } from './save.js';
import { readThroughFile } from './ReadFile.js';

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

// The one line each step has produced so far (design/platform-phase-a.md, section 5).
function produced(state, n) {
  if (n === 1) return derivedAt(state, 1, 'agreed_sentence') || derivedAt(state, 1, 'problem_sentence') || '';
  if (n === 2) return (state.values.A || {}).boundary_sentence || '';
  if (n === 3) return derivedAt(state, 3, 'system_problem_definition') || '';
  return '';
}

function StepCard({ n }) {
  const { state } = useCase();
  const { go } = useRouter();
  const def = BUILT[n];
  const info = stepInfo(state, n);
  const opens = stepOpens(state, n);
  const line = produced(state, n);
  const status = opens ? info.status : 'closed';
  return html`<button class=${`card card--${status}`} onClick=${() => go({ view: 'step', step: n })}>
    <div class="card__num es-sq-1a">${n}</div>
    <div class="card__body">
      <div class="card__top">
        <span class="es-overline">Step ${n}</span>
        <span class=${`state state--${status}`}>${opens ? STATE_LABEL[info.status] : html`<${Prov}>Opens when Step ${n - 1} is complete</${Prov}>`}</span>
      </div>
      <h3 class="card__title">${def.title}</h3>
      ${line
        ? html`<p class="card__line">${line}</p>`
        : html`<p class="card__purpose">${def.purpose}${n === 2 && info.status !== 'empty' ? html` <span class="es-hint"><${Prov}>(The boundary sentence is written with what carries forward.)</${Prov}></span>` : ''}</p>`}
      ${status === 'progress' && html`<div class="es-bar card__bar" aria-label="Progress"><i style=${{ width: `${Math.round(info.progress * 100)}%` }}></i></div>`}
      ${status === 'passed' && html`<div class="card__passed"><${Prov}>Passed ${fmtDate(info.passedAt)}</${Prov}></div>`}
      ${status === 'reopened' && info.reason && html`<div class="card__reopened"><${Prov}>${
        info.reason.kind === 'return' ? `Reopened by Step ${info.reason.item.from}: ${info.reason.item.when}`
          : info.reason.kind === 'pending' ? `You changed an answer after Step ${n} passed`
            : info.reason.kind === 'blocking' ? `Something Step ${n} needs is missing: Exercise ${info.reason.item.exercise}`
              : info.reason.kind === 'unticked' ? 'A line of the critical check is no longer ticked'
                : `Revised ${fmtDate(info.reason.item.at)}${info.reason.item.because ? `, because ${info.reason.item.because}` : ''}`
      }</${Prov}></div>`}
      ${info.marks.map((m) => html`<div class="card__mark" key=${m.id}><${Prov}>Marked for review: Step ${m.from} revised ${fmtDate(m.at)}${m.because ? `, because ${m.because}` : ''}</${Prov}></div>`)}
    </div>
  </button>`;
}

// At the end of Phase A, a file of the whole phase (decided 2 October 2026, B03):
// offered here once every step has passed its critical check, and on the
// read-through at any time.
function PhaseFile() {
  const { state } = useCase();
  const complete = STEPS.every((s) => stepInfo(state, s.number).status === 'passed');
  if (!complete) return null;
  return html`<div class="caseview__file">
    <p class="es-hint"><${Prov}>The whole of Phase A, as one file to read in any browser and print from there.</${Prov}></p>
    <${SaveButton} build=${() => readThroughFile(state)} className="es-btn es-btn--primary es-btn--sm"><${Prov}>Save the read-through to a file</${Prov}></${SaveButton}>
  </div>`;
}

function CopyZone({ z, zone }) {
  const { state, act } = useCase();
  const { go } = useRouter();
  const ctx = makeCtx(state, 'A');
  const source = z.source(ctx);
  const copy = (state.values.A || {})[z.key] || '';
  const differs = copy && source && norm(copy) !== norm(source);
  const from = z.from.map((f) => `Step ${f.step}, Exercise ${f.exercise}`).join(' and ');
  return html`<div class="carry__work">
    <${Block} rows=${Math.max(2, Math.min(8, (copy || source || '').split('\n').length + 1))} value=${copy} onChange=${(v) => act.setValue('A', z.key, v)} ariaLabel=${zone.title} />
    <div class=${`carry__source ${differs ? 'is-diverged' : ''}`}>
      <div class="carry__sourcehead">
        <span class="es-overline"><${Prov}>Copied from</${Prov}> ${z.from.map((f, i) => html`<a key=${i} href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: f.step, exercise: f.exercise }); }}>${i ? ' and ' : ''}Step ${f.step}, Exercise ${f.exercise}</a>`)}</span>
        ${source && norm(copy) !== norm(source) && html`<button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => act.setValue('A', z.key, source)}><${Prov}>${copy ? 'Copy the text again' : 'Copy the text here'}</${Prov}></button>`}
      </div>
      <div class=${`carry__sourcetext ${source ? '' : 'is-empty'}`}>${source || html`<${Prov}>Nothing written there yet.</${Prov}>`}</div>
      ${differs && html`<div class="es-flag"><${Prov}>The copy here differs from ${from}.</${Prov}></div>`}
    </div>
  </div>`;
}

function WrittenZone({ z }) {
  const { state, act } = useCase();
  const A = state.values.A || {};
  const [b, ex, note] = z.fields;
  return html`<div class="carry__written">
    <label class="es-label"><${Prov}>${b.label}</${Prov}></label>
    <${Block} rows=${2} value=${A[b.key]} onChange=${(v) => act.setValue('A', b.key, v)} ariaLabel=${b.label} />
    <label class="es-label"><${Prov}>${ex.label}</${Prov}></label>
    <div class="carry__exclusion">
      <${RefSelect} state=${state} of="outside" value=${A[ex.key]} onChange=${(v) => act.setValue('A', ex.key, v)} ariaLabel=${ex.label} small=${false} />
      <${Line} value=${A[note.key]} onChange=${(v) => act.setValue('A', note.key, v)} ariaLabel=${note.label} placeholder="" />
    </div>
    <p class="es-hint"><${Prov}>Written here: neither half exists anywhere in Step 2.</${Prov}></p>
  </div>`;
}

function Panel() {
  const { go } = useRouter();
  const [wide, setWide] = useState(false);
  const p = WORKBOOK.pages.carries;
  return html`<section class="carry" aria-labelledby="carry-title">
    <header class="carry__head">
      <div class="es-overline">${p.overline} <span class="passage__page">page ${p.page}</span></div>
      <h2 id="carry-title">${p.title}</h2>
      <p class="carry__lead"><${Rich} c=${p.lead} /></p>
    </header>
    ${PHASE_A.zones.map((z) => {
      const zone = p.zones.find((x) => String(x.number) === String(z.n));
      return html`<div class="carry__zone" key=${z.n}>
        <div class="carry__num es-sq-2a">${z.n}</div>
        <div class="carry__content">
          <h3 class="carry__title">${zone.title}</h3>
          <p class="es-hint"><${Rich} c=${zone.hintsInline[0]} terms=${false} /></p>
          ${z.written ? html`<${WrittenZone} z=${z} />` : html`<${CopyZone} z=${z} zone=${zone} />`}
        </div>
      </div>`;
    })}
    <div class="carry__also">
      <button class="linkish" aria-expanded=${wide} onClick=${() => setWide(!wide)}><${Prov}>Also carried forward, by the step specifications, and not on page 25</${Prov}></button>
      ${wide && html`<ul>${PHASE_A.alsoCarried.map((a, i) => html`<li key=${i}>
        <a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: a.step, exercise: a.exercise }); }}>${a.what}</a>
        <span class="es-hint">Step ${a.step}, Exercise ${a.exercise}</span>
      </li>`)}</ul>`}
    </div>
  </section>`;
}

export function CaseView() {
  const opener = WORKBOOK.pages.phasea;
  return html`<main class="caseview">
    <div class="steptab steptab--phase">Phase A</div>
    <header class="caseview__head">
      <div class="es-overline">Phase A</div>
      <h1 class="caseview__title">${opener.title}</h1>
      <p class="caseview__lead">Three steps that turn a topic into a system with edges: what the problem is, what is inside the system and whose views count, and how the situation has behaved over time.</p>
    </header>
    <div class="caseview__grid">
      <div class="caseview__steps">
        ${STEPS.map((s) => html`<${StepCard} key=${s.number} n=${s.number} />`)}
        <${PhaseFile} />
      </div>
      <${Panel} />
    </div>
  </main>`;
}
