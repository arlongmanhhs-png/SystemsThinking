// One case, in the browser's local storage. No backend, no network.
//
// Stored: field values, critical check ticks with their dates, confirmations (the
// dates a step passed or was reconfirmed), pending edits on a passed step, the
// revision log, review marks raised on other steps, returns, dismissed warnings
// with their one line, and which instruction passages have been read. Everything
// else is derived.

import { html, createContext, useContext, useEffect, useMemo, useRef, useState } from '../html.js';
import { BUILT } from '../definitions/index.js';
import { stepHasContent } from './validate.js';

const KEY = 'systems-process.case.v1';
// Keys that never open a revision: parked ideas block nothing, the record of
// leaving the drawing is not part of the drawing, and the strip is written from the
// log.
const NO_REVISION = new Set(['parked', 'sketch_second_left', 'revised_on', 'revised_because']);

// "Revised on ______ because ______", the strip at the foot of every working page:
// revised_on and revised_because are written from the revision log and never typed
// separately. They hold the date and the reason of the step's latest entry of kind
// revision; every earlier revision stays in the log, so nothing is erased (decided 2
// October 2026; steps/01-framing/spec.md, "The revision log").
function localDate(iso) {
  const d = new Date(iso);
  const two = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

export function writeStrip(s, step) {
  let latest = null;
  for (const r of Array.isArray(s.revisions) ? s.revisions : []) {
    if (r.step === step && r.kind === 'revision' && (!latest || r.at >= latest.at)) latest = r;
  }
  if (!latest) return;
  s.values = s.values || {};
  s.values[step] = s.values[step] || {};
  s.values[step].revised_on = localDate(latest.at);
  s.values[step].revised_because = latest.because || '';
}

export function emptyCase() {
  return {
    version: 1,
    meta: { case: '', started: new Date().toISOString() },
    values: { 1: {}, 2: {}, 3: {}, A: {} },
    ticks: {},
    confirmations: {},
    pending: {},
    revisions: [],
    marks: [],
    returns: [],
    dismissed: {},
    read: {},
    edited: {},
  };
}

// A file is a saved case if it has the shape one.
export function looksLikeCase(x) {
  return !!x && typeof x === 'object' && x.version === 1 && x.values && typeof x.values === 'object';
}

// A case saved before 1 October 2026 used keys the work order of that day renamed or
// moved. The values are carried across rather than lost. problem_agreed, the free
// rewrite the five agreed_* slots replaced, cannot be split into them, so it is kept
// as stored and shown nowhere; the participant writes the five slots.
export function migrate(s) {
  const v1 = (s.values && s.values[1]) || {};
  if ('suit_noprocedure' in v1 && !('suit_procedure_would_solve' in v1)) {
    // The old key stored the answer in its own sense: "yes" meant no procedure would solve it.
    const old = v1.suit_noprocedure;
    v1.suit_procedure_would_solve = old === 'yes' ? 'no' : old === 'no' ? 'yes' : old;
    delete v1.suit_noprocedure;
  }
  const v2 = (s.values && s.values[2]) || {};
  const speakers = (Array.isArray(v2.actors) ? v2.actors : []).filter((a) => a && a.spoken_for_by);
  if (speakers.length && !v2.spoken_for_by) {
    v2.spoken_for_by = speakers.map((a) => `${a.name || '___'}: ${a.spoken_for_by}`).join('; ');
  }
  for (const a of speakers) delete a.spoken_for_by;
  if (s.values && s.values[3]) delete s.values[3].interval;
  // Returns into Step 1 reopen the agreed definition, never the first attempt.
  const TO_AGREED = { problem_thing: 'agreed_thing', problem_direction: 'agreed_direction', problem_who: 'agreed_who' };
  for (const r of Array.isArray(s.returns) ? s.returns : []) {
    if (r.resolved || r.to !== 1 || !Array.isArray(r.fields)) continue;
    r.fields = [...new Set(r.fields.filter((k) => k !== 'problem_agreed').map((k) => TO_AGREED[k] || k))];
  }
  // Marks and pending revisions name the fields that changed in Step 1: rename the
  // disqualifier, and drop the retired free rewrite.
  const renameFields = (xs) => xs.filter((k) => k !== 'problem_agreed').map((k) => (k === 'suit_noprocedure' ? 'suit_procedure_would_solve' : k));
  for (const m of Array.isArray(s.marks) ? s.marks : []) {
    if (!m.resolved && m.from === 1 && Array.isArray(m.fields)) m.fields = renameFields(m.fields);
  }
  const p1 = s.pending && s.pending[1];
  if (p1 && p1.before) {
    if ('suit_noprocedure' in p1.before) {
      const old = p1.before.suit_noprocedure;
      p1.before.suit_procedure_would_solve = old === 'yes' ? 'no' : old === 'no' ? 'yes' : old;
      delete p1.before.suit_noprocedure;
    }
    delete p1.before.problem_agreed;
    if (!Object.keys(p1.before).length) delete s.pending[1];
  }
  // 2 October 2026: the instruction arrangement switch is gone, so its preference is
  // dropped, and the strip is written from the log for a case saved before then.
  delete s.prefs;
  const revised = new Set((Array.isArray(s.revisions) ? s.revisions : []).filter((r) => r.kind === 'revision').map((r) => r.step));
  for (const step of revised) writeStrip(s, step);
  // 2 October 2026: whether a review left a step unchanged or revised is kept as
  // review_result, because the glossary keeps "outcome" for Steps 9 onwards; and
  // sketch_second_left is a bare date and time, as process.yaml lists it.
  const toReviewResult = (x) => {
    if (x && typeof x === 'object' && 'outcome' in x) {
      if (!('review_result' in x)) x.review_result = x.outcome;
      delete x.outcome;
    }
  };
  for (const r of Array.isArray(s.revisions) ? s.revisions : []) toReviewResult(r);
  for (const m of Array.isArray(s.marks) ? s.marks : []) toReviewResult(m.resolved);
  for (const r of Array.isArray(s.returns) ? s.returns : []) toReviewResult(r.resolved);
  const leftAt = v2.sketch_second_left;
  if (leftAt && typeof leftAt === 'object') v2.sketch_second_left = leftAt.at || null;
  return s;
}

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyCase();
    const s = migrate(JSON.parse(raw));
    return { ...emptyCase(), ...s, values: { ...emptyCase().values, ...(s.values || {}) } };
  } catch (e) {
    console.error('load', e);
    return emptyCase();
  }
}

export const now = () => new Date().toISOString();
export const newId = (p = 'r') => `${p}_${Math.random().toString(36).slice(2, 9)}`;
// Empty is empty, however the editor wrote it: an answer typed and deleted, a row
// added and removed, or a box ticked and unticked leaves nothing to revise.
function normal(x) {
  if (x === undefined || x === null || x === '' || x === false) return null;
  if (Array.isArray(x)) { const a = x.map(normal); return a.length ? a : null; }
  if (typeof x === 'object') {
    const o = {};
    for (const k of Object.keys(x).sort()) {
      const v = normal(x[k]);
      if (v !== null) o[k] = v;
    }
    return Object.keys(o).length ? o : null;
  }
  if (typeof x === 'string') return x.trim() === '' ? null : x;
  return x;
}
const same = (a, b) => JSON.stringify(normal(a)) === JSON.stringify(normal(b));
const clone = (x) => (typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x)));

const Store = createContext(null);

export function CaseProvider({ children }) {
  const [state, setState] = useState(load);
  const [saveError, setSaveError] = useState(null);
  const timer = useRef(null);

  const latest = useRef(state);
  latest.current = state;
  const write = () => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(latest.current));
      setSaveError(null);
    } catch (e) {
      setSaveError(e);
    }
  };

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { timer.current = null; write(); }, 150);
  }, [state]);

  // An edit made just before the page closes is written at once, not lost.
  useEffect(() => {
    const flush = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null; write(); } };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, []);

  const act = useMemo(() => {
    const update = (fn) => setState((prev) => {
      const next = clone(prev);
      fn(next);
      return next;
    });

    return {
      update,

      setMeta: (k, v) => update((s) => { s.meta[k] = v; }),
      markRead: (pageId) => update((s) => { if (!s.read[pageId]) s.read[pageId] = now(); }),

      // Editing an answer in a step that has passed opens a pending revision: the
      // step goes to reopened, and what the answer was is kept so the review marks
      // can say what changed.
      setValue: (step, key, value) => update((s) => {
        s.values[step] = s.values[step] || {};
        const before = s.values[step][key];
        if (same(before, value)) { s.values[step][key] = value; return; }
        s.values[step][key] = value;
        // The summary page has no critical check, and parked ideas block nothing.
        if (typeof step !== 'number' || NO_REVISION.has(key)) return;
        // When the step was last changed, so that a review mark can tell whether the
        // step was revised after the mark, whether or not it had passed.
        s.edited = s.edited || {};
        s.edited[step] = now();
        const passed = (s.confirmations[step] || []).length > 0;
        if (!passed) return;
        const p = s.pending[step] || { since: now(), before: {} };
        if (!(key in p.before)) p.before[key] = before === undefined ? null : clone(before);
        for (const k of Object.keys(p.before)) {
          if (same(p.before[k], s.values[step][k])) delete p.before[k];
        }
        if (Object.keys(p.before).length) s.pending[step] = p;
        else delete s.pending[step];
      }),

      tick: (step, id, on) => update((s) => {
        s.ticks[step] = s.ticks[step] || {};
        if (on) s.ticks[step][id] = now();
        else delete s.ticks[step][id];
        const def = BUILT[step];
        const all = def.criticalCheck.every((c) => s.ticks[step][c.id]);
        const confirmations = s.confirmations[step] || [];
        // The first pass is confirming: ticking the last criterion passes the step.
        // Once a step has passed, going back to passed is an explicit reconfirmation.
        if (all && confirmations.length === 0) s.confirmations[step] = [now()];
      }),

      // Writes the pending revision to the log with its reason, and marks every
      // built step that depends on this one, and has anything in it, for review.
      recordRevision: (step, because) => update((s) => {
        const p = s.pending[step];
        if (!p) return;
        const at = now();
        const fields = Object.keys(p.before).map((key) => ({ key, before: p.before[key], after: clone(s.values[step][key] ?? null) }));
        const rev = { id: newId('rev'), step, at, since: p.since, kind: 'revision', because, fields };
        s.revisions.push(rev);
        writeStrip(s, step);
        delete s.pending[step];
        for (const on of BUILT[step].marksForReview) {
          if (!BUILT[on] || !stepHasContent(s, on)) continue;
          s.marks.push({ id: newId('mark'), on, from: step, at, revision: rev.id, fields: fields.map((f) => f.key), because, resolved: null });
        }
      }),

      // Back to passed, after a revision or a return. Reconfirming without editing is
      // an allowed answer and is recorded with its date.
      reconfirm: (step, line) => update((s) => {
        const at = now();
        s.confirmations[step] = [...(s.confirmations[step] || []), at];
        const def = BUILT[step];
        s.ticks[step] = s.ticks[step] || {};
        for (const c of def.criticalCheck) if (s.ticks[step][c.id]) s.ticks[step][c.id] = at;
        const edited = (since) => s.revisions.some((r) => r.step === step && r.kind === 'revision' && r.at > since);
        const resolvedReturns = [];
        for (const r of s.returns) {
          if (r.to !== step || r.resolved) continue;
          r.resolved = { at, review_result: edited(r.at) ? 'revised' : 'unchanged', line: line || null };
          resolvedReturns.push(r.id);
        }
        s.revisions.push({ id: newId('rev'), step, at, kind: 'reconfirmed', because: line || null, returns: resolvedReturns });
      }),

      resolveMark: (id, result, line) => update((s) => {
        const m = s.marks.find((x) => x.id === id);
        if (!m || m.resolved) return;
        const at = now();
        m.resolved = { at, review_result: result, line: line || null };
        s.revisions.push({ id: newId('rev'), step: m.on, at, kind: 'review', mark: id, review_result: result, because: line || null });
      }),

      // A named return trigger, raised from the step the participant is in. It
      // reopens the fields it names in the step it sends to, not the whole step.
      raiseReturn: (from, to, trigger) => update((s) => {
        const open = s.returns.find((r) => r.from === from && r.to === to && r.trigger === trigger.id && !r.resolved);
        if (open) return;
        s.returns.push({ id: newId('ret'), from, to, trigger: trigger.id, when: trigger.when, fields: trigger.to.fields, at: now(), resolved: null });
      }),

      resolveReturn: (id, result, line) => update((s) => {
        const r = s.returns.find((x) => x.id === id);
        if (!r || r.resolved) return;
        r.resolved = { at: now(), review_result: result, line: line || null };
      }),

      dismissWarning: (step, id, line, signature) => update((s) => { s.dismissed[`${step}:${id}`] = { line, at: now(), signature: signature || null }; }),
      restoreWarning: (step, id) => update((s) => { delete s.dismissed[`${step}:${id}`]; }),

      // The parked list lives in Step 1 and is added to from any step. Nothing is
      // ever added to it without the participant asking.
      park: (text) => update((s) => {
        s.values[1] = s.values[1] || {};
        const rows = Array.isArray(s.values[1].parked) ? s.values[1].parked : [];
        s.values[1].parked = [...rows, { id: newId('park'), idea: text }];
      }),

      replaceCase: (next) => setState({ ...emptyCase(), ...migrate(next) }),
      resetCase: () => setState(emptyCase()),
    };
  }, []);

  const value = useMemo(() => ({ state, act, saveError }), [state, act, saveError]);
  return html`<${Store.Provider} value=${value}>${children}</${Store.Provider}>`;
}

export function useCase() {
  return useContext(Store);
}
