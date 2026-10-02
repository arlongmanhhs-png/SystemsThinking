// The frame: a top bar with the tool's working title, the case, and the view. The
// working title is descriptive, not a product name (decided 2 October 2026): no
// wordmark and no logo.

import { html, useRef } from '../html.js';
import { STEPS } from '../definitions/index.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { useCase, looksLikeCase } from '../engine/store.js';
import { stepInfo, stepOpens } from '../engine/state.js';
import { useRouter } from './router.js';
import { CaseView } from './CaseView.js';
import { StepScreen } from './StepScreen.js';
import { ReadView } from './ReadView.js';
import { Prov, PageRef, fmtDate } from './text.js';

const TOOL_TITLE = 'Systems Thinking Process';

function TopBar() {
  const { state, act } = useCase();
  const { route, go } = useRouter();
  const tab = (label, r, on, extra = '') => html`<a href="#" class=${`topbar__tab ${on ? 'is-on' : ''} ${extra}`} aria-current=${on ? 'page' : undefined}
    onClick=${(e) => { e.preventDefault(); go(r); }}>${label}</a>`;
  return html`<header class="topbar">
    <div class="topbar__title">${TOOL_TITLE}</div>
    <div class="topbar__case">
      <span class="topbar__over">The case</span>
      <input class="topbar__caseinput" value=${state.meta.case || ''} aria-label="The case" onInput=${(e) => act.setMeta('case', e.target.value)} />
    </div>
    <nav class="topbar__nav" aria-label="Phase A">
      ${tab('Phase A', { view: 'case' }, route.view === 'case')}
      ${STEPS.map((s) => {
        const info = stepInfo(state, s.number);
        const open = stepOpens(state, s.number);
        return html`<${'span'} key=${s.number}>${tab(html`Step ${s.number}<i class=${`dot dot--${open ? info.status : 'closed'}`}></i>`,
          { view: 'step', step: s.number }, route.view === 'step' && route.step === s.number, open ? '' : 'is-closed')}</${'span'}>`;
      })}
      ${tab(html`<${Prov}>Read through</${Prov}>`, { view: 'read' }, route.view === 'read')}
      ${tab('Glossary', { view: 'glossary' }, route.view === 'glossary')}
    </nav>
  </header>`;
}

function Glossary() {
  const g = WORKBOOK.pages.glossary;
  return html`<main class="glossary">
    <div class="steptab steptab--phase">Glossary</div>
    <header><div class="es-overline">${g.tab}</div><h1>${g.title}</h1><p class="es-intro">${g.lead}</p></header>
    <dl class="glossary__list">${g.terms.map((t) => html`<div key=${t.term} class="glossary__item">
      <dt>${t.term}</dt><dd>${t.definition}.</dd>${t.ref && html`<dd class="glossary__where">p. <${PageRef} to=${t.ref} /></dd>`}
    </div>`)}</dl>
  </main>`;
}

// Keeping and moving a case: the case lives in this browser only, so it can be saved
// to a file and read back. Nothing is sent anywhere.
function Footer() {
  const { state, act, saveError } = useCase();
  const file = useRef(null);
  const save = () => {
    const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `case-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const open = (f) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let next = null;
      try { next = JSON.parse(r.result); } catch (e) { next = null; }
      if (!looksLikeCase(next)) { window.alert('That file is not a saved case.'); return; }
      if (window.confirm('Open this saved case? The case in this browser is replaced. Save it to a file first if you want to keep it.')) act.replaceCase(next);
    };
    r.readAsText(f);
  };
  return html`<footer class="foot">
    ${saveError && html`<div class="es-notice foot__error"><${Prov}>The case could not be saved in this browser: its storage is full. Save it to a file.</${Prov}></div>`}
    <span class="foot__legend"><span class="prov">Dotted underline</span>: the screen's own wording, not printed in the workbook, and provisional.</span>
    <span class="foot__acts">
      <span class="es-hint">Started ${fmtDate(state.meta.started)}</span>
      <button class="es-btn es-btn--quiet es-btn--sm" onClick=${save}><${Prov}>Save the case to a file</${Prov}></button>
      <button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => file.current.click()}><${Prov}>Open a saved case</${Prov}></button>
      <input type="file" accept="application/json,.json" ref=${file} hidden onChange=${(e) => { open(e.target.files[0]); e.target.value = ''; }} />
      <button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => { if (window.confirm('Start a new, empty case? The case in this browser is replaced. Save it to a file first if you want to keep it.')) act.resetCase(); }}><${Prov}>Start a new case</${Prov}></button>
    </span>
  </footer>`;
}

export function App() {
  const { route } = useRouter();
  let view;
  if (route.view === 'step' && STEPS.some((s) => s.number === route.step)) view = html`<${StepScreen} key=${route.step} step=${route.step} />`;
  else if (route.view === 'read') view = html`<${ReadView} />`;
  else if (route.view === 'glossary') view = html`<${Glossary} />`;
  else view = html`<${CaseView} />`;
  return html`<div class="app"><${TopBar} />${view}<${Footer} /></div>`;
}
