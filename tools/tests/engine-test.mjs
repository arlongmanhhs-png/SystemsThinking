// Engine checks for the work order of 1 October 2026, run in Node against the prototype.
import { pathToFileURL } from 'node:url';
const base = pathToFileURL(process.cwd() + '/src/').href;
const R = { createElement: () => null, createContext: () => ({ Provider: null }), useContext: () => null, useState: () => [], useEffect: () => {}, useMemo: (f) => f(), useRef: () => ({}), useCallback: (f) => f, Fragment: null };
globalThis.React = R; globalThis.window = { React: R, ReactDOM: {}, localStorage: { getItem: () => null, setItem: () => {} } };
const { stepInfo } = await import(base + 'engine/state.js');
const { validateStep } = await import(base + 'engine/validate.js');
const { derivedAt } = await import(base + 'engine/ctx.js');
const { migrate } = await import(base + 'engine/store.js');
const { PHASE_A } = await import(base + 'definitions/phase-a.js');
const { makeCtx } = await import(base + 'engine/ctx.js');

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fails++; };
const blank = () => ({ values: { 1: {}, 2: {}, 3: {}, A: {} }, ticks: {}, confirmations: {}, pending: {}, revisions: [], marks: [], returns: [], dismissed: {}, read: {}, prefs: {} });

// ---- Step 1
const s = blank();
Object.assign(s.values[1], {
  situation: 'x', problem_direction: 'too_little', problem_thing: 'FIRST thing', problem_who: 'w', problem_since: '2015', problem_consequence: 'c', rationale: 'r',
  suit_chronic: 'yes', suit_history: 'yes', suit_attempts: 'yes', suit_size: 'yes', suit_procedure_would_solve: 'no',
  change_long: 'more homes let', change_long_year: '2032', position: 'outside',
  problem_form: 'excess_deficit', agreed_thing: 'AGREED thing', agreed_direction: 'too little', agreed_who: 'home seekers', agreed_since: '2015', agreed_consequence: 'waits exceed seven years',
  rep_description: 'd', rep_assumption: 'a', rep_source: 's',
});
let v = validateStep(s, 1);
ok(v.blocking.length === 0, `Step 1 complete case has no blocking items (${JSON.stringify(v.blocking.map((b) => b.text))})`);
ok(derivedAt(s, 1, 'agreed_sentence') === 'There is too little of AGREED thing for home seekers, since 2015, which matters because waits exceed seven years.', 'agreed sentence assembles in the default form');
s.values[1].suit_procedure_would_solve = 'yes';
v = validateStep(s, 1);
ok(v.blocking.some((b) => b.stop && b.id === 'known_procedure'), 'a yes to the disqualifier is a stop, and blocks');
ok(!v.warnings.some((w) => w.id === 'known_procedure'), 'the disqualifier is not a warning');
s.values[1].suit_procedure_would_solve = 'no';
s.values[1].suit_size = 'no';
v = validateStep(s, 1);
ok(v.blocking.length === 0 && v.warnings.some((w) => w.id === 'size'), 'a no on the size question warns and does not block');
s.values[1].suit_size = 'yes';
delete s.values[1].agreed_who;
v = validateStep(s, 1);
ok(v.blocking.some((b) => /who it affects/.test(b.text)), 'each agreed slot is required');
s.values[1].agreed_who = 'home seekers';
delete s.values[1].change_long_year;
ok(validateStep(s, 1).blocking.some((b) => /Year/.test(b.text)), 'the long-horizon year is required');
s.values[1].change_long_year = '2032';
s.values[1].problem_form = 'mismatch'; s.values[1].form_reason = 'right amount, wrong place';
ok(/^AGREED thing: too little, for home seekers/.test(derivedAt(s, 1, 'agreed_sentence')), 'agreed sentence joins the parts in the other forms');
s.values[1].problem_form = 'excess_deficit';

// ---- page 25 and Step 3 read the agreed set, never the first attempt
const zone1 = PHASE_A.zones.find((z) => z.n === 1).source(makeCtx(s, 'A'));
ok(/AGREED thing/.test(zone1) && !/FIRST/.test(zone1), 'page 25, zone 1, carries the agreed definition');
ok(derivedAt(s, 3, 'thing_measured') === undefined, '(thing_measured is a field copy, checked below)');
const { BUILT } = await import(base + 'definitions/index.js');
const tm = BUILT[3].exercises[0].fields.find((f) => f.key === 'thing_measured');
ok(tm.from.key === 'agreed_thing', 'Step 3 thing_measured copies agreed_thing');
const allText = JSON.stringify([BUILT[2], BUILT[3]], (k, val) => (typeof val === 'function' ? String(val) : val));
ok(!/problem_thing|problem_who|problem_direction|problem_since|problem_consequence|problem_agreed/.test(allText.replace(/'problem_form'|problem_form/g, '')), 'Steps 2 and 3 read nothing of the first attempt');
const s1Returns = JSON.stringify(BUILT[1].returnsIn);
ok(!/problem_(thing|who|direction|agreed)/.test(s1Returns), 'returns into Step 1 reopen the agreed set');

// ---- Step 2: two layers, reasons, speaks-for line
const t = blank(); Object.assign(t.values[1], s.values[1]);
Object.assign(t.values[2], {
  sketch_first_done: true, sketch_first_canvas: { marks: [{ id: 'mk1', mark: 'money', x: 120, y: 90 }], labels: [], connectors: [] },
  inside: [{ id: 'i', label: 'x' }], outside: [{ id: 'o', label: 'EU', mark: 'O', reason: 'r' }],
  layers: [{ id: 'L1', name: 'National', reason: 'widest' }, { id: 'L2', name: 'City', reason: '' }],
  actor_types: [{ id: 'T1', label: 'authority' }],
  actors: [{ id: 'a1', name: 'Ministry', layer: 'L1', type: 'T1', admits: ['1'] }, { id: 'a2', name: 'Tenants', layer: 'L2', type: 'T1', admits: ['2'] }],
  decisions: [{ id: 'd', statement: 's', authority: 'nobody', responsibility: 'nobody', accountability: 'nobody' }],
  descriptions: [{ id: 'e1', actor: 'a1', reading: 'r', status: 'evidenced', read_from: 'x' }, { id: 'e2', actor: 'a2', reading: 'q', status: 'inferred', read_from: 'y' }],
  conflicting_pair: ['e1', 'e2'], who_is_missing: 'm',
  sketch_second: { placed: { a1: { band: 'L1', x: 100, dy: 50 }, a2: { band: 'L2', x: 100, dy: 50 } } },
  sentence_produces: '1', sentence_disagreement: '2', sentence_surprise: '3',
});
let b2 = validateStep(t, 2).blocking.map((b) => b.text);
ok(!b2.some((x) => /at least 3/.test(x)), 'two layers are allowed');
ok(b2.some((x) => /narrowest/.test(x)), 'every layer row needs its reason (the second, here the narrowest)');
ok(b2.some((x) => /no third scope/.test(x)), 'two layers require two_layers_because');
ok(b2.some((x) => /who speaks for each group/i.test(x)), 'spoken_for_by is required under Exercise 9');
t.values[2].layers[1].reason = 'narrowest'; t.values[2].two_layers_because = 'nothing between the ministry and the city'; t.values[2].spoken_for_by = 'nobody';
b2 = validateStep(t, 2).blocking.map((b) => b.text);
ok(b2.length === 0, `Step 2 complete with two layers (${JSON.stringify(b2)})`);
// B12 (2 October 2026): Exercise 1 is complete with the confirmation and either a
// drawing on the canvas or a photograph.
const ex1 = () => validateStep(t, 2).blocking.filter((b) => b.exercise === 1).map((b) => b.text);
delete t.values[2].sketch_first_canvas;
ok(ex1().some((x) => /the first drawing, on the canvas or as a photograph/.test(x)), 'Exercise 1 with neither a drawing nor a photograph is not complete');
t.values[2].sketch_first_image = { src: 'data:image/jpeg;base64,AAAA', name: 'sheet.jpg' };
ok(ex1().length === 0, 'Exercise 1 is complete with a photograph alone');
delete t.values[2].sketch_first_image;
t.values[2].sketch_first_canvas = { marks: [], labels: [{ id: 'lb1', text: 'Tenants', x: 100, y: 100 }], connectors: [] };
ok(ex1().length === 0, 'Exercise 1 is complete with a drawing alone');
t.values[2].sketch_first_canvas = { marks: [], labels: [], connectors: [] };
ok(ex1().length === 1, 'an empty drawing does not count');
t.values[2].sketch_first_canvas = { marks: [{ id: 'mk1', mark: 'money', x: 120, y: 90 }], labels: [], connectors: [] };
t.values[2].layers.push({ id: 'L3', name: 'District', reason: 'r' });
ok(!validateStep(t, 2).blocking.some((b) => /no third scope/.test(b.text)), 'with three layers the two-layer line is not asked for');
ok(!BUILT[2].exercises.find((e) => e.number === 5).fields[0].columns.some((c) => c.key === 'spoken_for_by'), 'the actor table has no speaks-for column');

// ---- Step 3: no interval
ok(!JSON.stringify(BUILT[3].exercises.map((e) => e.fields.map((f) => f.key))).includes('interval'), 'interval is retired');

// ---- migration of a case saved under the old keys
const old = { version: 1, values: { 1: { suit_noprocedure: 'yes', problem_agreed: 'free text' }, 2: { actors: [{ id: 'a', name: 'Tenants', spoken_for_by: 'nobody' }] }, 3: { interval: 'year' } } };
const m = migrate(JSON.parse(JSON.stringify(old)));
ok(m.values[1].suit_procedure_would_solve === 'no' && !('suit_noprocedure' in m.values[1]), 'old suit_noprocedure "yes" (no procedure) becomes would_solve "no"');
ok(m.values[2].spoken_for_by === 'Tenants: nobody' && !('spoken_for_by' in m.values[2].actors[0]), 'actors[].spoken_for_by moves to the Exercise 9 line');
ok(!('interval' in m.values[3]), 'a stored interval is dropped');

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exitCode = fails ? 1 : 0;

// ---- after the verification: migration of returns, marks, and pending revisions; no cap at fifteen
const old2 = { version: 1, values: { 1: {}, 2: {}, 3: {} },
  returns: [{ id: 'r', from: 3, to: 1, fields: ['problem_thing', 'problem_direction', 'problem_agreed'], resolved: null }],
  marks: [{ id: 'm', on: 2, from: 1, fields: ['suit_noprocedure', 'problem_agreed', 'rationale'], resolved: null }],
  pending: { 1: { since: 'x', before: { suit_noprocedure: 'yes', problem_agreed: 'old' } } } };
const m2 = migrate(JSON.parse(JSON.stringify(old2)));
ok(JSON.stringify(m2.returns[0].fields) === JSON.stringify(['agreed_thing', 'agreed_direction']), 'an open return into Step 1 reopens the agreed slots');
ok(JSON.stringify(m2.marks[0].fields) === JSON.stringify(['suit_procedure_would_solve', 'rationale']), 'a review mark is renamed and loses problem_agreed');
ok(m2.pending[1].before.suit_procedure_would_solve === 'no' && !('problem_agreed' in m2.pending[1].before), 'a pending revision is renamed with its answer turned round');
const u = blank(); Object.assign(u.values[2], t.values[2]);
u.values[2].actors = Array.from({ length: 16 }, (_, i) => ({ id: 'x' + i, name: 'A' + i, layer: 'L1', type: 'T1', admits: ['2'] }));
const w16 = validateStep(u, 2);
ok(!w16.blocking.some((b) => /actors/i.test(b.text) && /15|fifteen/.test(b.text)) && w16.warnings.some((w) => w.id === 'past_fifteen'), 'sixteen actors warn past fifteen and do not block');
ok(BUILT[2].exercises.find((e) => e.number === 5).fields[0].max === undefined, 'the actor table has no hard cap');

// ---- A damaged file (found in review, 2 October 2026): members of the wrong type
// are brought back to shape rather than crashing a step screen.
const { hydrate } = await import(base + 'engine/store.js');
const h = hydrate({ version: 1, meta: 'Damaged', values: { 1: { situation: 'Kept' }, 2: 'x', 3: null }, revisions: null, marks: 'none', returns: 7, pending: null, ticks: [], confirmations: { 1: ['2026-10-01T10:00:00Z'] }, dismissed: 'd', read: null });
ok(Array.isArray(h.revisions) && Array.isArray(h.marks) && Array.isArray(h.returns), 'a damaged file: the lists are arrays');
ok(['ticks', 'pending', 'dismissed', 'read', 'edited', 'meta'].every((k) => h[k] && typeof h[k] === 'object' && !Array.isArray(h[k])), 'a damaged file: the maps are objects');
ok(h.values[1].situation === 'Kept' && typeof h.values[2] === 'object' && typeof h.values[3] === 'object' && typeof h.values.A === 'object', 'a damaged file: each step\'s values are an object, and what was there is kept');
ok(h.confirmations[1].length === 1 && typeof h.meta.started === 'string', 'a damaged file: what was well formed stays, and the start date is filled in');
ok(JSON.stringify(hydrate({ version: 1, values: {} }).values) === JSON.stringify({ 1: {}, 2: {}, 3: {}, A: {} }), 'an empty file: every step has its values object');
console.log(fails ? `${fails} FAILED` : 'all passed (with the verification additions)');
process.exitCode = fails ? 1 : 0;
