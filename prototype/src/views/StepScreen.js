// The step screen, generated from any step definition.
//
// Instruction passages and working pages come in the book's order: each instruction
// page once, whole, before the exercises it faces in the book, and one click away
// from each of them afterwards (decided 2 October 2026). Exercises run
// down one column, in the workbook's numbering; an exercise appears once the one
// above it has content, and nothing already written is ever hidden or locked. The
// critical check sits at the foot and opens when the required fields are present.

import { html, useEffect, useMemo, useState, Fragment } from '../html.js';
import { BUILT, page, field as fieldDef, fieldName } from '../definitions/index.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { useCase } from '../engine/store.js';
import { stepInfo, stepOpens, STATE_LABEL } from '../engine/state.js';
import { exerciseHasContent } from '../engine/validate.js';
import { makeCtx } from '../engine/ctx.js';
import { useRouter } from './router.js';
import { Exercise, ReturnLink } from './Exercise.js';
import { PassageFull, PassageRail } from './Passage.js';
import { Rich, Prov, PageRef, fmtDate, fmtDateTime } from './text.js';
import { SendsTo } from './Warnings.js';
import { refOptions } from './fields.js';
import { label as listLabel } from '../definitions/lists.js';

const arr = (x) => (Array.isArray(x) ? x : []);

function fieldLabel(step, key) {
  const f = fieldDef(step, key);
  return f ? fieldName(step, f) : key;
}

// A value as the participant wrote it: a choice by its printed label, a reference by
// what it points at, and anything that is not text as a short description in the
// screen's own words.
function show(state, step, key, v) {
  const f = fieldDef(step, key);
  const own = (t) => html`<${Prov}>${t}</${Prov}>`;
  if (v == null || v === '' || (Array.isArray(v) && !v.length)) return own('(empty)');
  if (f && f.kind === 'choice' && f.list) return listLabel(f.list, v) || String(v);
  if (f && f.kind === 'ref') {
    const opts = refOptions(state, f.of);
    const one = (x) => (x === 'nobody' ? 'Nobody' : (opts.find((o) => o.value === x) || {}).label || own('(removed)'));
    return Array.isArray(v) ? v.map(one).join(' / ') : one(v);
  }
  if (typeof v === 'string') return v.length > 140 ? `${v.slice(0, 139)}…` : v;
  if (typeof v === 'boolean') return own(v ? 'ticked' : 'not ticked');
  if (Array.isArray(v)) return own(`${v.length} row${v.length === 1 ? '' : 's'}`);
  if (typeof v === 'object' && v.points) return own(`${arr(v.points).length} points`);
  if (typeof v === 'object' && v.placed) return own('the drawing');
  if (typeof v === 'object' && ('from' in v || 'to' in v)) return `${v.from || '?'} to ${v.to || '?'}`;
  return String(v);
}

function Changes({ step, fields }) {
  const { state } = useCase();
  return html`<ul class="changes">${fields.map((f) => html`<li key=${f.key}>
    <b>${fieldLabel(step, f.key)}</b>${'before' in f ? html`: <span class="changes__before">${show(state, step, f.key, f.before)}</span> <span aria-hidden="true">→</span> <span>${show(state, step, f.key, f.after)}</span>` : ''}
  </li>`)}</ul>`;
}

// Marks raised on this step by a revision of an earlier one, and returns sent here.
function Banners({ step, info }) {
  const { state, act } = useCase();
  const [lines, setLines] = useState({});
  const out = [];
  for (const m of info.marks) {
    const rev = state.revisions.find((r) => r.id === m.revision);
    // Revised means changed after the mark was raised, whether or not the step had passed.
    const editedSince = !!(state.edited && state.edited[step] && state.edited[step] > m.at);
    out.push(html`<div class="banner banner--mark" key=${m.id}>
      <div class="es-overline"><${Prov}>Marked for review</${Prov}></div>
      <p><${Prov}>Step ${m.from} was revised on ${fmtDate(m.at)}</${Prov}>${m.because ? html`, because ${m.because}` : ''}.</p>
      ${rev && html`<${Changes} step=${m.from} fields=${rev.fields} />`}
      <div class="banner__acts">
        <input class="es-input es-input--sm" placeholder="" aria-label="One line, if you want one" value=${lines[m.id] || ''}
          onInput=${(e) => setLines({ ...lines, [m.id]: e.target.value })} />
        <button class="es-btn es-btn--dark es-btn--sm" onClick=${() => act.resolveMark(m.id, 'unchanged', lines[m.id])}>
          <${Prov}>I looked, and it still holds</${Prov}></button>
        <button class="es-btn es-btn--ghost es-btn--sm" disabled=${!editedSince} onClick=${() => act.resolveMark(m.id, 'revised', lines[m.id])}>
          <${Prov}>I have revised this step</${Prov}></button>
      </div>
    </div>`);
  }
  for (const r of info.returns) {
    out.push(html`<div class="banner banner--return" key=${r.id}>
      <div class="es-overline"><${Prov}>Reopened by Step ${r.from}, ${fmtDate(r.at)}</${Prov}></div>
      <p>${r.when}.</p>
      <p class="es-hint"><${Prov}>Reopens</${Prov}> ${arr(r.fields).map((k) => fieldLabel(step, k)).join('; ')}</p>
    </div>`);
  }
  return out.length ? html`<div class="banners">${out}</div>` : null;
}

// A criterion with a screen variant keeps its printed form one click away, as an
// exercise's screen variant does.
function PrintedLine({ text }) {
  const [open, setOpen] = useState(false);
  return html`<div class="check__printed">
    <button class="linkish" aria-expanded=${open} onClick=${() => setOpen(!open)}><${Prov}>${open ? 'Hide the printed form' : 'The printed form'}</${Prov}></button>
    ${open && html`<div class="printed-form">${text}</div>`}
  </div>`;
}

function CriticalCheck({ step, info, visibleUpTo }) {
  const { state, act } = useCase();
  const def = BUILT[step];
  const { go } = useRouter();
  const [line, setLine] = useState('');
  const checksPage = WORKBOOK.pages.checks;
  const group = checksPage.checks[step - 1];
  // Only what the exercises already shown ask for: the rest of the step is not laid
  // out in advance.
  const shownNumbers = new Set(def.exercises.filter((e, i) => i <= visibleUpTo).map((e) => e.number));
  const byEx = {};
  const stops = info.blocking.filter((b) => b.stop);
  for (const b of info.blocking) if (!b.stop && shownNumbers.has(b.exercise)) (byEx[b.exercise] = byEx[b.exercise] || []).push(b);
  const later = info.blocking.some((b) => !shownNumbers.has(b.exercise));
  // Findings the step records for the critical check to show (Step 3, no quantity with a history).
  const findings = [];
  for (const ex of def.exercises) for (const f of ex.fields) if (f.finding && (state.values[step] || {})[f.key] === true) findings.push({ ex: ex.number, f });
  const derivedDetail = (b) => {
    if (b.detail === 'missing_dependencies') {
      const ctx = makeCtx(state, 2);
      const name = (id) => (ctx.row('actors', id) || {}).name || '___';
      return BUILT[2].derive.missing_dependencies(ctx).map((m) => `${name(m.actor)}: ${listLabel('resources', m.resource)}`).join('; ');
    }
    if (b.detail === 'evidence_gaps') {
      return BUILT[3].derive.evidence_gaps(makeCtx(state, 3)).map(([a, z]) => `${a} to ${z}`).join('; ');
    }
    return '';
  };

  return html`<section class=${`check check--${info.status}`} id=${`check-${step}`}>
    <div class="check__head">
      <div class="es-overline">Before you leave Phase A · The critical checks</div>
      <h2>${group ? group.heading : `Step ${step} is complete when`}</h2>
      <p class="es-hint">${checksPage.lead}</p>
    </div>
    ${!info.checkOpen
      ? html`<div class="check__closed">
          ${stops.map((b) => html`<p key=${b.id} class="check__stop"><a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step, exercise: b.exercise }); }}>Exercise ${b.exercise}</a>: ${b.text}</p>`)}
          ${Object.keys(byEx).length > 0 && html`<p><${Prov}>The critical check opens when these are present:</${Prov}></p>`}
          <ul>${Object.entries(byEx).map(([n, bs]) => html`<li key=${n}>
            <a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step, exercise: Number(n) }); }}>Exercise ${n}</a>
            <span>: ${bs.map((b, i) => html`<${Fragment} key=${i}>${i ? '; ' : ''}<${Prov} on=${!!b.provisional}>${b.text}</${Prov}>${b.detail ? html` <span class="es-hint">(${derivedDetail(b)})</span>` : ''}</${Fragment}>`)}</span>
          </li>`)}</ul>
          ${later && html`<p class="es-hint"><${Prov}>The exercises still to come ask for more.</${Prov}></p>`}
        </div>`
      : html`<ul class="check__list">
          ${def.criticalCheck.map((c) => html`<li key=${c.id} class=${info.ticks[c.id] ? 'is-ticked' : ''}>
            <label class="es-check">
              <input type="checkbox" checked=${!!info.ticks[c.id]} onChange=${(e) => act.tick(step, c.id, e.target.checked)} />
              <span>${c.screenVariant ? html`<${Prov}>${c.screenVariant.text}</${Prov}>` : c.text}</span>
            </label>
            ${c.screenVariant && html`<${PrintedLine} text=${c.text} />`}
            <div class="check__meta">
              ${info.ticks[c.id] && html`<span class="check__date">${fmtDate(info.ticks[c.id])}</span>`}
              <span class="check__if"><${Prov}>If not:</${Prov}> <${SendsTo} step=${step} to=${c.sendsTo} withPage=${true} /></span>
            </div>
          </li>`)}
        </ul>`}
    ${findings.map((x) => html`<div class="es-notice check__finding" key=${x.f.key}>
      <div class="es-overline"><${Prov}>A finding, from Exercise ${x.ex}</${Prov}></div>
      <p><${Prov}>${x.f.label}</${Prov}></p>
    </div>`)}
    ${info.status === 'passed' && html`<div class="check__passed"><${Prov}>Passed on ${fmtDate(info.passedAt)}</${Prov}></div>`}
    ${info.status === 'reopened' && html`<div class="check__reopened">
      <div class="es-overline"><${Prov}>Reopened</${Prov}></div>
      ${info.reason && info.reason.kind === 'return' && html`<p><${Prov}>By Step ${info.reason.item.from}:</${Prov}> ${info.reason.item.when}.</p>`}
      ${info.reason && info.reason.kind === 'pending' && html`<p><${Prov}>You changed an answer after Step ${step} passed. Say why in the strip below.</${Prov}></p>`}
      ${info.reason && info.reason.kind === 'blocking' && html`<p><${Prov}>Something Step ${step} needs is missing since it passed: Exercise ${info.reason.item.exercise}, ${info.reason.item.text}. A change in an earlier step can do this.</${Prov}></p>`}
      ${info.reason && info.reason.kind === 'unticked' && html`<p><${Prov}>A line of the critical check is no longer ticked.</${Prov}></p>`}
      ${info.reason && info.reason.kind === 'revision' && html`<p><${Prov}>Revised on ${fmtDate(info.reason.item.at)}</${Prov}>${info.reason.item.because ? `, because ${info.reason.item.because}` : ''}.</p>`}
      ${!info.pending && html`<div class="check__reconfirm">
        ${info.returns.length > 0 && html`<input class="es-input es-input--sm" aria-label="One line, if you want one" value=${line} onInput=${(e) => setLine(e.target.value)} />`}
        <button class="es-btn es-btn--dark es-btn--sm" disabled=${!info.checkOpen || !info.allTicked}
          onClick=${() => { act.reconfirm(step, line.trim() || null); setLine(''); }}>
          <${Prov}>${info.returns.length && !state.revisions.some((r) => r.step === step && r.kind === 'revision' && info.returns.some((x) => r.at > x.at)) ? 'I looked, and it still holds' : 'Reconfirm the critical check'}</${Prov}>
        </button>
      </div>`}
    </div>`}
  </section>`;
}

// "Revised on ______ because ______", at the foot of every working page, kept.
function RevisionStrip({ step, info }) {
  const { state, act } = useCase();
  const [because, setBecause] = useState('');
  const log = state.revisions.filter((r) => r.step === step);
  const p = info.pending;
  const fields = p ? Object.keys(p.before).map((key) => ({ key, before: p.before[key], after: (state.values[step] || {})[key] })) : [];
  return html`<section class="revised">
    ${p && html`<div class="revised__pending">
      <div class="revised__row">
        <span class="revised__k">Revised on</span><span class="revised__v">${fmtDate(new Date().toISOString())}</span>
        <span class="revised__k">because</span>
        <input class="es-input es-input--sm revised__input" value=${because} onInput=${(e) => setBecause(e.target.value)} aria-label="because" />
        <button class="es-btn es-btn--dark es-btn--sm" disabled=${!because.trim()} onClick=${() => { act.recordRevision(step, because.trim()); setBecause(''); }}>
          <${Prov}>Record the revision</${Prov}></button>
      </div>
      <${Changes} step=${step} fields=${fields} />
      <p class="es-hint"><${Prov}>Recording the revision marks the steps that use Step ${step} for review. Nothing in those steps is erased.</${Prov}></p>
    </div>`}
    ${log.length > 0 && html`<ol class="revised__log">${log.map((r) => html`<li key=${r.id}>
      ${r.kind === 'revision' && html`<span class="revised__k">Revised on</span> ${fmtDateTime(r.at)} <span class="revised__k">because</span> ${r.because}`}
      ${r.kind === 'reconfirmed' && html`<${Prov}>Critical check reconfirmed ${fmtDateTime(r.at)}${r.returns && r.returns.length ? ' after a return' : ''}</${Prov}>${r.because ? `: ${r.because}` : ''}`}
      ${r.kind === 'review' && html`<${Prov}>Reviewed ${fmtDateTime(r.at)}: ${r.review_result === 'unchanged' ? 'looked, and it still holds' : 'revised'}</${Prov}>${r.because ? `: ${r.because}` : ''}`}
    </li>`)}</ol>`}
    ${!p && !log.length && html`<div class="revised__row is-empty"><span class="revised__k">Revised on</span><span class="revised__fill"></span><span class="revised__k">because</span><span class="revised__fill"></span></div>`}
  </section>`;
}

// Parked ideas block nothing. Outside Step 1 only the count shows until Step 7.
function Parked({ step }) {
  const { state, act } = useCase();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const n = arr((state.values[1] || {}).parked).length;
  return html`<div class="parked">
    <button class="linkish" aria-expanded=${open} onClick=${() => setOpen(!open)}>Potential solutions, for later: ${n}</button>
    ${open && html`<form class="parked__form" onSubmit=${(e) => { e.preventDefault(); if (text.trim()) { act.park(text.trim()); setText(''); } }}>
      <input class="es-input es-input--sm" value=${text} onInput=${(e) => setText(e.target.value)} aria-label="A potential solution" />
      <button class="es-btn es-btn--ghost es-btn--sm" type="submit" disabled=${!text.trim()}><${Prov}>Park it</${Prov}></button>
    </form>`}
  </div>`;
}

// Where this step sends the participant back to. Step 3's are its printed table
// ("This step tests Step 1"), shown at the top because they are the commonest returns
// in the process; any other step's are shown above its critical check.
function Returns({ step, def }) {
  const { go } = useRouter();
  if (!def.returnsOut.length && !(def.returnsInside || []).length) return null;
  const printed = step === 3;
  const heading = printed ? 'This step tests Step 1' : (def.returnsHeading || {}).text;
  return html`<section class="returns">
    <div class="es-overline">${printed ? heading : html`<${Prov}>${heading}</${Prov}>`}</div>
    <table class="returns__table">
      <thead><tr><th>If this happens</th><th>Go back to</th></tr></thead>
      <tbody>
        ${def.returnsOut.map((r) => html`<tr key=${r.id}>
          <td>${r.when}</td>
          <td><${ReturnLink} step=${step} r=${r} text=${`Step ${r.to.step}`} />${r.to.page ? html`, page <${PageRef} to=${r.to.page} />` : ''}${r.action ? `, ${r.action}` : ''}${r.means ? html`. <span class="es-hint">${r.means}</span>` : ''}</td>
        </tr>`)}
        ${(def.returnsInside || []).map((r) => html`<tr key=${r.id}>
          <td>${r.when}</td>
          <td>${r.to.map((t, i) => html`<${Fragment} key=${i}>${i ? ', ' : ''}<a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step, exercise: t.exercise }); }}>Exercise ${t.exercise}</a></${Fragment}>`)}</td>
        </tr>`)}
      </tbody>
    </table>
  </section>`;
}

function useWide() {
  const q = '(min-width: 1181px)';
  const [wide, setWide] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setWide(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return wide;
}

// The book's order for this step: instruction pages and working pages interleaved.
function sequence(def) {
  const mine = new Set([...def.passages.map((p) => p.page), ...def.pages.map((p) => p.page)]);
  return WORKBOOK.order.filter((id) => mine.has(id)).map((id) => {
    const pass = def.passages.find((p) => p.page === id);
    if (pass) return { kind: 'passage', ...pass };
    return { kind: 'work', ...def.pages.find((p) => p.page === id) };
  });
}

export function StepScreen({ step }) {
  const { state, act } = useCase();
  const { route, go, seq } = useRouter();
  const def = BUILT[step];
  const info = stepInfo(state, step);
  const [rail, setRail] = useState(null);
  const wide = useWide();

  useEffect(() => { setRail(null); }, [step]);

  // Scroll to the exercise or passage named in the address.
  useEffect(() => {
    const id = route.passage ? `passage-${route.passage}` : route.exercise ? `ex-${step}-${route.exercise}` : null;
    if (route.passage && state.read[route.passage]) setRail(route.passage);
    const t = setTimeout(() => {
      const el = id && document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('is-arrived'); setTimeout(() => el.classList.remove('is-arrived'), 1600); } else if (!id) window.scrollTo({ top: 0 });
    }, 60);
    return () => clearTimeout(t);
  }, [seq, step]);

  const highlight = useMemo(() => {
    const s = new Set(route.fields || []);
    for (const r of info.returns) for (const k of arr(r.fields)) s.add(k);
    if (info.pending) for (const k of Object.keys(info.pending.before)) s.add(k);
    return s;
  }, [route.fields, info.returns, info.pending]);

  if (!stepOpens(state, step)) {
    return html`<main class="step step--closed">
      <div class="steptab">Step ${step}</div>
      <header class="step__head">
        <div class="es-overline">Phase A · Step ${step}</div>
        <h1 class="step__title">${def.title}</h1>
        <p class="step__purpose">${def.purpose}</p>
      </header>
      <div class="es-notice"><${Prov}>Step ${step} opens when Step ${step - 1} is complete: when its critical check has been passed.</${Prov}>
        <a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: step - 1 }); }}>Step ${step - 1}</a></div>
    </main>`;
  }

  // Disclosure: every exercise up to the one after the last with content. An
  // exercise the participant cannot fill yet for good reason (Step 2, Exercise 7, when
  // nobody is asked) counts as having content; one filled from elsewhere (the parked
  // list) does not reveal the exercises before it.
  const ctx = makeCtx(state, step);
  const hasContent = (ex) => !ex.ignoreForDisclosure && (exerciseHasContent(state, step, ex) || (ex.contentWhen && ex.contentWhen(ctx)));
  const lastWithContent = def.exercises.reduce((m, ex, i) => (hasContent(ex) ? i : m), -1);
  const target = route.exercise ? def.exercises.findIndex((e) => e.number === route.exercise) : -1;
  const visibleUpTo = Math.max(lastWithContent + 1, target, 0);

  const passageOf = (n) => def.passages.find((p) => p.governs.includes(n)) || null;
  const seqList = sequence(def);

  return html`<main class=${`step ${rail && wide ? 'has-rail' : ''}`}>
    <div class="steptab">Step ${step}</div>
    <div class="step__grid">
      <div class="step__col">
        <header class="step__head">
          <div class="es-overline">Phase A · Step ${step} · <span class=${`state state--${info.status}`}>${STATE_LABEL[info.status]}</span></div>
          <h1 class="step__title">${def.title}</h1>
          <p class="step__purpose">${def.purpose}</p>
          ${step !== 1 && html`<${Parked} step=${step} />`}
        </header>

        <${Banners} step=${step} info=${info} />

        ${step === 3 && html`<${Returns} step=${step} def=${def} />`}

        ${seqList.map((item) => {
          if (item.kind === 'passage') {
            const first = def.exercises.findIndex((e) => e.number === item.governs[0]);
            if (first > visibleUpTo) return null;
            return html`<${PassageFull} key=${item.page} pageId=${item.page} read=${!!state.read[item.page]}
              onRead=${(id) => act.markRead(id)} railOpen=${rail === item.page} onOpenRail=${setRail}
              hideLead=${item.page === def.passages[0].page} />`;
          }
          const p = page(item.page);
          const exs = def.exercises.filter((e) => item.exercises.includes(e.number));
          const shown = exs.filter((e) => def.exercises.indexOf(e) <= visibleUpTo);
          if (!shown.length) return null;
          return html`<div class="workpage" key=${item.page}>
            ${p.title && item.exercises.length > 1 && html`<header class="workpage__head">
              <div class="es-overline">${p.overline || `Step ${step}`} <span class="passage__page">page ${p.page}</span></div>
              <h2 class="workpage__title">${p.title}</h2>
              ${p.lead && html`<p class="workpage__lead"><${Rich} c=${p.lead} /></p>`}
            </header>`}
            ${shown.map((ex) => html`<${Exercise} key=${ex.number} step=${step} ex=${ex} info=${info} highlight=${highlight}
              passageFor=${passageOf(ex.number)}
              onOpenRail=${setRail} railPage=${rail} railInline=${!wide} />`)}
          </div>`;
        })}

        ${visibleUpTo < def.exercises.length - 1 && html`<p class="es-hint step__more"><${Prov}>Exercise ${def.exercises[visibleUpTo + 1].number} appears once Exercise ${def.exercises[visibleUpTo].number} has something in it.</${Prov}></p>`}

        ${step !== 3 && html`<${Returns} step=${step} def=${def} />`}
        <${CriticalCheck} step=${step} info=${info} visibleUpTo=${visibleUpTo} />
        <${RevisionStrip} step=${step} info=${info} />

        <nav class="step__nav">
          ${step > 1 && html`<a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: step - 1 }); }}>Step ${step - 1}</a>`}
          <a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'case' }); }}>The case</a>
          ${BUILT[step + 1] && stepOpens(state, step + 1) && html`<a href="#" onClick=${(e) => { e.preventDefault(); go({ view: 'step', step: step + 1 }); }}>Step ${step + 1}</a>`}
        </nav>
      </div>
      ${rail && wide && html`<div class="step__rail"><${PassageRail} pageId=${rail} onClose=${() => setRail(null)} /></div>`}
    </div>
  </main>`;
}
