// The frame: a top bar with the tool's working title, the case, and the view. The
// working title is descriptive, not a product name (decided 2 October 2026): no
// wordmark and no logo.

import { html, useRef, useState } from '../html.js';
import { STEPS } from '../definitions/index.js';
import { WORKBOOK } from '../definitions/workbook.js';
import { useCase, looksLikeCase } from '../engine/store.js';
import { saveFile } from '../engine/files.js';
import { stepInfo, stepOpens } from '../engine/state.js';
import { useRouter } from './router.js';
import { CaseView } from './CaseView.js';
import { StepScreen } from './StepScreen.js';
import { ReadView } from './ReadView.js';
import { FILE_NOTICES } from './save.js';
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

// Keeping and moving a case. The notices a save or an open can end in are in save.js. The case is kept in the private area of the person's
// claude.ai account, or in this browser (decided 2 October 2026, B02), and in both
// cases it can be saved to a file and read back. Nothing else is sent anywhere.
// A question before the current case is replaced is asked on the page itself: in the
// artifact a browser dialog never shows. While the page is still finding where the
// case is kept, the footer says so and its buttons wait.
function Footer() {
  const { state, act, saveError, keptIn, ready, readError } = useCase();
  const file = useRef(null);
  const [ask, setAsk] = useState(null); // { kind: 'open', next } or { kind: 'new' }
  const [notice, setNotice] = useState(null); // a key of FILE_NOTICES
  const here = keptIn === 'account' ? 'your claude.ai account' : 'this browser';
  const save = async () => {
    setNotice(null);
    setAsk(null);
    const result = await saveFile(`case-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 1));
    if (result !== 'saved') setNotice(result);
  };
  const open = (f) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let next = null;
      try { next = JSON.parse(r.result); } catch (e) { next = null; }
      if (!looksLikeCase(next)) { setNotice('notcase'); setAsk(null); return; }
      setNotice(null);
      setAsk({ kind: 'open', next });
    };
    r.readAsText(f);
  };
  const confirm = () => {
    if (ask && ask.kind === 'open') act.replaceCase(ask.next);
    else if (ask && ask.kind === 'new') act.resetCase();
    setAsk(null);
  };
  return html`<footer class="foot">
    ${saveError && saveError.account && saveError.browser && html`<div class="es-notice foot__error"><${Prov}>The case could not be saved in your claude.ai account or in this browser. Save it to a file.</${Prov}></div>`}
    ${saveError && saveError.account && !saveError.browser && html`<div class="es-notice foot__error"><${Prov}>The case could not be saved in your claude.ai account; it is kept in this browser for now. Save it to a file.</${Prov}></div>`}
    ${saveError && saveError.browser && !saveError.account && keptIn === 'browser' && html`<div class="es-notice foot__error"><${Prov}>The case could not be saved in this browser: its storage is full. Save it to a file.</${Prov}></div>`}
    ${readError && html`<div class="es-notice foot__error foot__notice" role="alert"><${Prov}>The case could not be read from your claude.ai account.</${Prov}>
      <button class="es-btn es-btn--primary es-btn--sm" onClick=${act.readAgain}><${Prov}>Read the case again</${Prov}></button></div>`}
    ${notice && html`<div class="es-notice foot__error foot__notice" role="status"><${Prov}>${FILE_NOTICES[notice]}</${Prov}>
      <button class="es-btn es-btn--quiet es-btn--sm" onClick=${() => setNotice(null)}><${Prov}>Close the notice</${Prov}></button></div>`}
    ${ask && html`<div class="es-notice foot__error foot__ask" role="alertdialog" aria-labelledby="foot-ask">
      <span id="foot-ask">${ask.kind === 'open'
        ? html`<${Prov}>Open this saved case? The saved case replaces the current case, kept in ${here}. To keep the current case, save the current case to a file first.</${Prov}>`
        : html`<${Prov}>Start a new, empty case? The new case replaces the current case, kept in ${here}. To keep the current case, save the current case to a file first.</${Prov}>`}</span>
      <span class="foot__askacts">
        <button class="es-btn es-btn--primary es-btn--sm" onClick=${confirm}>${ask.kind === 'open' ? html`<${Prov}>Open the saved case</${Prov}>` : html`<${Prov}>Start the new case</${Prov}>`}</button>
        <button class="es-btn es-btn--ghost es-btn--sm" onClick=${() => setAsk(null)}><${Prov}>Keep the current case</${Prov}></button>
      </span>
    </div>`}
    <span class="foot__legend"><span class="prov">Dotted underline</span>: the screen's own wording, not printed in the workbook, and provisional.
      <span class="foot__kept">${keptIn === 'account' && !(saveError && saveError.account)
        ? html`<${Prov}>The case is kept in the private area of your claude.ai account.</${Prov}>`
        : keptIn === 'browser' ? html`<${Prov}>The case is kept in this browser only.</${Prov}>`
        : keptIn === 'connecting' && !readError ? html`<${Prov}>The case is being read from claude.ai.</${Prov}>` : null}</span></span>
    <span class="foot__acts">
      <span class="es-hint">Started ${fmtDate(state.meta.started)}</span>
      <button class="es-btn es-btn--quiet es-btn--sm" disabled=${!ready} onClick=${save}><${Prov}>Save the case to a file</${Prov}></button>
      <button class="es-btn es-btn--quiet es-btn--sm" disabled=${!ready} onClick=${() => file.current.click()}><${Prov}>Open a saved case</${Prov}></button>
      <input type="file" accept="application/json,.json" ref=${file} hidden onChange=${(e) => { open(e.target.files[0]); e.target.value = ''; }} />
      <button class="es-btn es-btn--quiet es-btn--sm" disabled=${!ready} onClick=${() => { setNotice(null); setAsk({ kind: 'new' }); }}><${Prov}>Start a new case</${Prov}></button>
    </span>
  </footer>`;
}

// The views are inert until the page knows where the case is kept (in the artifact,
// until the capabilities resolve): nothing typed before then can be lost.
export function App() {
  const { route } = useRouter();
  const { ready } = useCase();
  let view;
  if (route.view === 'step' && STEPS.some((s) => s.number === route.step)) view = html`<${StepScreen} key=${route.step} step=${route.step} />`;
  else if (route.view === 'read') view = html`<${ReadView} />`;
  else if (route.view === 'glossary') view = html`<${Glossary} />`;
  else view = html`<${CaseView} />`;
  return html`<div class="app"><div class="app__body" inert=${ready ? undefined : ''}><${TopBar} />${view}</div><${Footer} /></div>`;
}
