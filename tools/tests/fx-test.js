// Fix round of 2 October 2026: B27's "Because" label, B11's sketch_second_left as a bare
// date and time, and B13's review_result, with cases saved in the old shapes.
// usage: node fx-test.js <prototype dir> <out prefix>
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const OUT = process.argv[3];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f.endsWith('/')) f += 'index.html';
  const p = path.join(ROOT, f);
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  });
});

const layers = [
  { id: 'l1', name: 'National government', reason: 'sets the rules' },
  { id: 'l2', name: 'Municipality', reason: 'allocates' },
  { id: 'l3', name: 'Neighbourhood', reason: 'lives with it' },
];
const types = [{ id: 't1', label: 'public authority' }, { id: 't2', label: 'affected group' }, { id: 't3', label: 'delivery body' }];
const actors = [
  { id: 'a1', name: 'Ministry of Housing', layer: 'l1', type: 't1', admits: ['1', '4'], resources: ['authority', 'money'] },
  { id: 'a2', name: 'Rent tribunal', layer: 'l1', type: 't1', admits: ['4'], resources: ['authority'] },
  { id: 'a3', name: 'City council', layer: 'l2', type: 't1', admits: ['1', '4'], resources: ['authority', 'money'] },
  { id: 'a4', name: 'Housing corporation', layer: 'l2', type: 't3', admits: ['1', '3'], resources: ['delivery'] },
  { id: 'a5', name: 'Tenants on the waiting list', layer: 'l3', type: 't2', admits: ['2'], resources: ['legitimacy'] },
];
// d3 is recorded and has no line, so the report on leaving has something to say.
const dependencies = [
  { id: 'd1', actor: 'a1', resource: 'money', needed_by: 'a3', who_needs_it: 'City council, for building' },
  { id: 'd2', actor: 'a4', resource: 'delivery', needed_by: 'a3', who_needs_it: 'City council, to build' },
  { id: 'd3', actor: 'a2', resource: 'authority', needed_by: 'a3', who_needs_it: 'City council, for a ruling' },
];
const descriptions = [
  { id: 'r1', actor: 'a3', reading: 'Not enough land', status: 'evidenced', read_from: 'council minutes' },
  { id: 'r2', actor: 'a5', reading: 'Allocation is unfair', status: 'evidenced', read_from: 'petition' },
];
const placed = { a1: { band: 'l1', x: 110, dy: 60 }, a2: { band: 'l1', x: 420, dy: 60 }, a3: { band: 'l2', x: 100, dy: 60 }, a4: { band: 'l2', x: 520, dy: 70 }, a5: { band: 'l3', x: 130, dy: 60 } };
const lines = [{ id: 'ln1', a: 'a1', b: 'a3' }, { id: 'ln2', a: 'a4', b: 'a3' }];
const outside = [{ id: 'o1', label: 'The national housing market', mark: 'out_of_reach', reason: 'set by interest rates' }];

const T0 = '2026-10-01T12:00:00.000Z';
const state = (left, extra = {}) => ({
  version: 1, meta: { case: 'Waiting lists', started: '2026-10-01T10:00:00Z' },
  values: { 1: {}, 2: { inside: [{ id: 'i1', label: 'City council' }], outside, layers, actor_types: types, actors, dependencies, descriptions, conflicting_pair: ['r1', 'r2'], sketch_second: { placed, lines, marks: [] }, ...(left === undefined ? {} : { sketch_second_left: left }) }, 3: {}, A: {} },
  ticks: {}, confirmations: { 1: ['2026-10-01T10:00:00Z'] }, pending: {}, revisions: [], marks: [], returns: [], dismissed: {}, read: { s2instr1: T0, s2instr2: T0, s2instr3: T0 }, edited: {},
  ...extra,
});

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures++; };

async function open(browser, st, hash) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('systems-process.case.v1', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, st);
  await page.goto(`http://localhost:${server.address().port}/${hash}`);
  await page.waitForTimeout(1500);
  return { page, errors };
}
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('systems-process.case.v1')));

(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  // B27: the reason beside each outside row is labelled as page 13 prints it.
  let { page, errors } = await open(browser, state(undefined), '#/step/2/ex/2');
  const aria = await page.$$eval('#ex-2-2 input', (els) => els.map((e) => e.getAttribute('aria-label')));
  ok(aria.includes('Because') && !aria.includes('reason'), `Exercise 2 reason input labelled "Because": ${JSON.stringify(aria)}`);
  const ex2 = await page.$('#ex-2-2');
  if (ex2) await ex2.screenshot({ path: `${OUT}-ex2.png` });
  ok(errors.length === 0, `no console errors at Exercise 2 ${errors.length ? JSON.stringify(errors) : ''}`);
  await page.close();

  // B11: a case saved with the old { at } shape shows the report, and is migrated on load.
  ({ page, errors } = await open(browser, state({ at: T0 }), '#/step/2/ex/10'));
  let txt = await page.evaluate(() => document.body.textContent);
  ok(/When you left the drawing/.test(txt) && /Rent tribunal/.test(txt.split('When you left the drawing')[1] || ''), 'old { at } shape: the report shows, naming the undrawn dependency');
  ok(errors.length === 0, `no console errors with the old shape ${errors.length ? JSON.stringify(errors) : ''}`);
  await page.close();

  // B11: the bare string shows the report.
  ({ page, errors } = await open(browser, state(T0), '#/step/2/ex/10'));
  txt = await page.evaluate(() => document.body.textContent);
  ok(/When you left the drawing/.test(txt) && !/Invalid Date|undefined|NaN/.test(txt.split('When you left the drawing')[1].slice(0, 60)), `bare string: the report shows with a date: "${txt.split('When you left the drawing')[1].slice(0, 30).trim()}"`);
  const report = await page.$('.arr__report');
  if (report) await report.screenshot({ path: `${OUT}-report.png` });
  await page.close();

  // B11: pressing the button stores a bare date and time.
  ({ page, errors } = await open(browser, state(undefined), '#/step/2/ex/10'));
  txt = await page.evaluate(() => document.body.textContent);
  ok(!/When you left the drawing/.test(txt), 'never left: no report');
  await page.click('.arr__leave');
  await page.waitForTimeout(800);
  let s = await stored(page);
  const left = s.values[2].sketch_second_left;
  ok(typeof left === 'string' && !Number.isNaN(Date.parse(left)), `the leave button stores a bare date and time: ${JSON.stringify(left)}`);
  txt = await page.evaluate(() => document.body.textContent);
  ok(/When you left the drawing/.test(txt), 'after leaving: the report shows');
  ok((s.revisions || []).length === 0, 'leaving records no revision');
  ok(errors.length === 0, `no console errors on leaving ${errors.length ? JSON.stringify(errors) : ''}`);
  await page.close();

  // B13: a case saved with "outcome" is read as review_result, and the log shows it.
  const old = {
    revisions: [{ id: 'rev0', step: 1, at: T0, kind: 'revision', because: 'sharper', since: T0, fields: [{ key: 'situation', before: 'a', after: 'b' }] },
      { id: 'rev1', step: 2, at: '2026-10-01T13:00:00.000Z', kind: 'review', mark: 'm1', outcome: 'unchanged', because: null }],
    marks: [{ id: 'm1', on: 2, from: 1, at: T0, revision: 'rev0', fields: ['situation'], because: 'sharper', resolved: { at: '2026-10-01T13:00:00.000Z', outcome: 'unchanged', line: null } }],
    returns: [{ id: 'ret1', from: 3, to: 2, trigger: 'x', when: 'w', fields: [], at: T0, resolved: { at: T0, outcome: 'revised', line: null } }],
  };
  ({ page, errors } = await open(browser, state(T0, old), '#/step/2'));
  txt = await page.evaluate(() => document.body.textContent);
  ok(/Reviewed [^\n]*: looked, and it still holds/.test(txt), 'old "outcome" review entry shows "looked, and it still holds"');
  const mig = await page.evaluate(async (o) => { const m = await import('/src/engine/store.js'); return m.migrate(JSON.parse(JSON.stringify(o))); }, state({ at: T0 }, old));
  ok(mig.revisions[1].review_result === 'unchanged' && !('outcome' in mig.revisions[1]), 'migrate: revision entry renamed');
  ok(mig.marks[0].resolved.review_result === 'unchanged' && !('outcome' in mig.marks[0].resolved), 'migrate: mark resolution renamed');
  ok(mig.returns[0].resolved.review_result === 'revised' && !('outcome' in mig.returns[0].resolved), 'migrate: return resolution renamed');
  ok(mig.values[2].sketch_second_left === T0, 'migrate: sketch_second_left becomes a bare date and time');
  ok(errors.length === 0, `no console errors with the old log ${errors.length ? JSON.stringify(errors) : ''}`);
  await page.close();

  // B13: resolving a mark now writes review_result.
  const fresh = {
    revisions: [{ id: 'rev0', step: 1, at: T0, kind: 'revision', because: 'sharper', since: T0, fields: [{ key: 'situation', before: 'a', after: 'b' }] }],
    marks: [{ id: 'm1', on: 2, from: 1, at: T0, revision: 'rev0', fields: ['situation'], because: 'sharper', resolved: null }],
  };
  ({ page, errors } = await open(browser, state(T0, fresh), '#/step/2'));
  const btn = await page.$('button:has-text("I looked, and it still holds")');
  if (btn) { await btn.click(); await page.waitForTimeout(800); }
  s = await stored(page);
  const rev = (s.revisions || []).find((r) => r.kind === 'review');
  ok(!!btn && rev && rev.review_result === 'unchanged' && !('outcome' in rev) && s.marks[0].resolved && s.marks[0].resolved.review_result === 'unchanged', `resolving a mark writes review_result: ${JSON.stringify(rev)}`);
  ok(errors.length === 0, `no console errors resolving a mark ${errors.length ? JSON.stringify(errors) : ''}`);
  await page.close();

  // B35: the browser title.
  ({ page } = await open(browser, state(undefined), '#/step/1'));
  ok((await page.title()) === 'Systems Thinking Process', `browser title: ${await page.title()}`);
  await page.close();

  await browser.close();
  server.close();
  console.log(failures ? `${failures} failed` : 'all passed');
  process.exitCode = failures ? 1 : 0;
})();
