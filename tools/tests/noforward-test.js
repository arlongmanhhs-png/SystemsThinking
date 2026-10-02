// Screen test: in Step 1 nothing links ahead. The size warning links to Exercise 2 only
// until Exercise 6 is written; page 8's check is not shown at Exercise 2; Exercise 4's hint
// is the page's. usage: node noforward-test.js <prototype dir>
// Since 2 October 2026 the screen has one instruction arrangement, "Before the
// exercises": each run is a saved case with no preference, or with the old preference
// for "Above each exercise", which the screen ignores.
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
const state = (v1, saved) => ({ version: 1, meta: { case: 't', started: '2026-10-01T10:00:00Z' }, values: { 1: v1, 2: {}, 3: {}, A: {} },
  ticks: {}, confirmations: {}, pending: {}, revisions: [], marks: [], returns: [], dismissed: {}, read: {}, edited: {}, ...(saved === 'old preference' ? { prefs: { passages: 'inline' } } : {}) });

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures++; };

async function open(browser, st, hash) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript((s) => { localStorage.setItem('systems-process.case.v1', JSON.stringify(s)); }, st);
  await page.goto(`http://localhost:${server.address().port}/${hash}`);
  await page.waitForTimeout(1200);
  return { page, errors };
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch();

  for (const passages of ['no preference', 'old preference']) {
    // 1. Size "no", Exercise 6 not written: the warning links back to Exercise 2 only.
    let { page, errors } = await open(browser, state({ ...base }, passages), '#/step/1');
    const links = await page.$$eval('.warning .sendsto', (els) => els.map((e) => e.innerText.trim()));
    ok(links.includes('Exercise 2') && !links.includes('Exercise 6'), `[${passages}] size warning before Exercise 6 links: ${JSON.stringify(links)}`);
    const ex4 = await page.$eval('#ex-1-4', (e) => e.innerText.replace(/\s+/g, ' '));
    const n4 = ex4.split('In the same terms as the problem definition in Exercise 2. Not how to get there.').length - 1;
    ok(n4 === 1 && !/page 11/.test(ex4), `[${passages}] Exercise 4 hint shown once, no page 11 (${n4})`);
    ok(errors.length === 0, `[${passages}] no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();

    // 2. Exercise 6 written (a later return): the warning links to Exercise 2 and Exercise 6.
    ({ page, errors } = await open(browser, state({ ...base, change_long: 'less x', change_long_year: '2035', position: 'outside', problem_form: 'excess', agreed_thing: 'x' }, passages), '#/step/1'));
    const links2 = await page.$$eval('.warning .sendsto', (els) => els.map((e) => e.innerText.trim()));
    ok(links2.includes('Exercise 2') && links2.includes('Exercise 6'), `[${passages}] size warning after Exercise 6 links: ${JSON.stringify(links2)}`);
    await page.close();

    // 3. Only Exercise 1 and 2 reached: page 8's check is not shown; at Exercise 6 it is.
    ({ page, errors } = await open(browser, state({ situation: base.situation }, passages), '#/step/1/ex/2'));
    const early = await page.evaluate(() => document.body.innerText);
    const visible = await page.$$eval('[id^="ex-1-"]', (els) => els.map((e) => e.id));
    // The check is page 10's now: not shown while only Exercises 1 and 2 are reached, in either arrangement.
    ok(!/The check before Exercise 6/i.test(early), `[${passages}] the check not shown with ${JSON.stringify(visible)}`);
    ok(/keep it for later, not in the sentence/.test(early), `[${passages}] rule 3 keeps a solution for later`);
    const refs = await page.$$eval('.pgref', (els) => els.map((e) => e.innerText.trim()));
    ok(!refs.includes('11'), `[${passages}] no link to page 11 with Exercises 1 and 2: ${JSON.stringify(refs)}`);
    ok(/Eight rules/i.test(early), `[${passages}] the eight rules still shown at Exercise 2`);
    ok(!(await page.$('.topbar__pref')) && !/Above each exercise/.test(early), `[${passages}] no instruction switch in the top bar`);
    await page.close();
    ({ page, errors } = await open(browser, state({ ...base, suit_size: 'yes', change_long: 'less x', change_long_year: '2035', position: 'outside' }, passages), '#/step/1/ex/6'));
    const late = await page.evaluate(() => document.body.innerText);
    ok(/The check before Exercise 6/i.test(late), `[${passages}] page 8's check shown at Exercise 6`);
    ok(errors.length === 0, `[${passages}] no console errors at Exercise 6 ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }
  await browser.close();
  server.close();
  console.log(failures ? `${failures} failed` : 'all passed');
  process.exit(failures ? 1 : 0);
})();
