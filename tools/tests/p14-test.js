// Screen test: page 14 no longer links ahead to Exercise 9; page 16's section shows before
// Exercises 6 to 9, the exercises it faces in the book (since 2 October 2026 the only
// arrangement). Each run is a saved case with no preference, or with the old preference
// for "Above each exercise", which the screen ignores. The size warning links to Exercise 2 only
// until Exercise 6 is written; page 8's check is not shown at Exercise 2; Exercise 4's hint
// is the page's. usage: node noforward-test.js <prototype dir>
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.otf': 'font/otf', '.png': 'image/png' };
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

const base = { situation: 'Something is going on here in the city.', problem_thing: 'x', problem_direction: 'too_much', problem_who: 'y', problem_since: '2020', problem_consequence: 'z', rationale: 'r',
  suit_chronic: 'yes', suit_history: 'yes', suit_attempts: 'yes', suit_size: 'no', suit_procedure_would_solve: 'no' };
const state = (v1, passages) => ({ version: 1, meta: { case: 't', started: '2026-10-01T10:00:00Z' }, values: { 1: v1, 2: {}, 3: {}, A: {} },
  ticks: {}, confirmations: {}, pending: {}, revisions: [], marks: [], returns: [], dismissed: {}, read: {}, edited: {}, prefs: { passages } });

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures++; };
async function open(browser, st, hash) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript((s) => { localStorage.setItem('systems-process.case.v1', JSON.stringify(s)); }, st);
  await page.goto(`http://localhost:${server.address().port}/${hash}`);
  await page.waitForTimeout(1400);
  return { page, errors };
}
(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const passages of ['no preference', 'old preference']) {
    const st = { version: 1, meta: { case: 't', started: '2026-10-01T10:00:00Z' }, values: { 1: {}, 2: {}, 3: {}, A: {} },
      ticks: {}, confirmations: { 1: ['2026-10-01T10:00:00Z'] }, pending: {}, revisions: [], marks: [], returns: [], dismissed: {}, read: {}, edited: {},
      ...(passages === 'old preference' ? { prefs: { passages: 'inline' } } : {}) };
    const { page, errors } = await open(browser, st, '#/step/2/ex/9');
    const ids = await page.$$eval('[id^="ex-2-"]', (els) => els.map((e) => e.id));
    if (!ids.length) console.log('DEBUG', (await page.evaluate(() => location.hash + ' | ' + document.body.innerText)).slice(0, 2500));
    const all = await page.evaluate(() => document.body.innerText);
    ok(/Who speaks for the groups the system acts on/.test(all), `[${passages}] page 16's new section shown (${ids.join(',')})`);
    ok(!/on the line under Exercise 9 on page/.test(all), `[${passages}] page 14's pointer to page 17 is gone`);
    const ex5refs = await page.$$eval('#ex-2-5 .pgref', (els) => els.map((e) => e.innerText.trim()));
    ok(!ex5refs.includes('17'), `[${passages}] no link from Exercise 5 to page 17: ${JSON.stringify(ex5refs)}`);
    // Page 16 is shown once, whole, before Exercise 6, and not inside any exercise.
    const order = await page.evaluate(() => {
      const p16 = document.getElementById('passage-s2instr3');
      const ex6 = document.getElementById('ex-2-6');
      const inside = [...document.querySelectorAll('[id^="ex-2-"]')].some((e) => /Who speaks for the groups the system acts on/.test(e.innerText));
      return { before: !!(p16 && ex6 && (p16.compareDocumentPosition(ex6) & Node.DOCUMENT_POSITION_FOLLOWING)), inside };
    });
    ok(order.before && !order.inside, `[${passages}] page 16 sits before Exercise 6, not inside an exercise (${JSON.stringify(order)})`);
    ok(errors.length === 0, `[${passages}] no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }
  await browser.close(); server.close();
  console.log(failures ? `${failures} failed` : 'all passed');
  process.exit(failures ? 1 : 0);
})();
