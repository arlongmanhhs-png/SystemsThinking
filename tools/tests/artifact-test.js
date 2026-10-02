// Screen test for the artifact entry page and decision B02 (where a case is kept),
// built 2 October 2026 and reworked the same day after review. artifact.html is
// served inside a skeleton like the one the claude.ai host wraps it in, with a fake
// window.claude injected before any script runs: use(name) resolves later to an
// in-memory db, user and downloads namespace shaped as the capability .d.ts files
// describe them, or to null.
// Checks: the page renders with no console errors; the views are inert and the
// footer says the case is being read until the capabilities resolve; with db null
// the case persists in the browser-only slot; with db present an empty database
// receives the browser-only copy, which moves into the person's own slot, and a
// reload restores from the database; a case held in the database is the case when
// the own slot's copy is not pending, or is pending but descends from an older case;
// a pending copy that descends from the database's case is carried into the
// database instead; another person's slot is neither shown, carried, nor written
// over, signed in or out; a member whose database is not served keeps the own slot;
// a change made elsewhere shows without clobbering one typed here; a torn read ends
// in a notice with "Read the case again", and the page stays inert until the read
// succeeds; "Save the case to a file" calls downloads.save with JSON that "Open a
// saved case" accepts; a damaged file opens without crashing a step; a declined
// save shows a notice and does not throw; and nothing scrolls sideways at 400px.
// usage: node artifact-test.js <prototype dir>
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.otf': 'font/otf', '.png': 'image/png' };
// What the host puts around the page: charset and viewport, a small reset, and the
// safe-area padding on :root. The icon link stands for the host's own icon, so that
// the browser's request for /favicon.ico does not log a 404 here.
const SKELETON_HEAD = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><style>body{margin:0;font:14px system-ui,sans-serif;background:#f4f4f2}img{max-width:100%}[hidden]{display:none!important}:root{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}</style></head><body>';
const SKELETON_TAIL = '</body></html>';
const server = http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/artifact-test.html') {
    const content = fs.readFileSync(path.join(ROOT, 'artifact.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(SKELETON_HEAD + content + SKELETON_TAIL);
    return;
  }
  if (f.endsWith('/')) f += 'index.html';
  const p = path.join(ROOT, f);
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  });
});

// The browser's slots, as storage.js names them: the browser-only slot, and a
// signed-in person's own slot with its record beside it.
const KEY = 'systems-process.case.v1';
const OWN = (id) => `${KEY}.user.${id}`;
const SYNC = (id) => `${OWN(id)}.sync`;
const empty = () => ({ version: 1, meta: { case: '', started: '2026-10-01T10:00:00Z' }, values: { 1: {}, 2: {}, 3: {}, A: {} },
  ticks: {}, confirmations: {}, pending: {}, revisions: [], marks: [], returns: [], dismissed: {}, read: {}, edited: {} });
const named = (name, extra = {}) => ({ ...empty(), meta: { case: name, started: '2026-10-01T10:00:00Z' }, ...extra });
// The database layout storage.js writes: a head naming one part, for a small case.
const inDatabase = (s, stamp = 's_seed') => ({
  'data/users/u_test/case': { version: 1, stamp, updated: '2026-10-02T09:00:00Z', parts: [`case-part-${stamp}-0`], blobs: [] },
  [`data/users/u_test/case-part-${stamp}-0`]: { text: JSON.stringify(s) },
});

// The fake window.claude, run before any script of the page. use() resolves after
// opts.delay milliseconds (30 by default), never during the script's first run.
function fakeClaude(opts) {
  const tick = () => new Promise((r) => setTimeout(r, 5));
  const persist = (store) => { try { sessionStorage.setItem('fake-db', JSON.stringify(store)); } catch (e) { /* none */ } };
  let store = null;
  try { store = JSON.parse(sessionStorage.getItem('fake-db') || 'null'); } catch (e) { store = null; }
  if (!store) { store = opts.seed || {}; persist(store); }
  const listeners = {};
  const SEG = /^[A-Za-z0-9_\-.~:@+]+$/;
  const snap = (p) => {
    const d = store[p];
    return { id: p.split('/').pop(), exists: d !== undefined, data: () => (d === undefined ? undefined : JSON.parse(JSON.stringify(d))), metadata: { fromCache: false, hasPendingWrites: false } };
  };
  const notify = (p) => { for (const fn of listeners[p] || []) setTimeout(() => fn(snap(p)), 0); };
  const check = (p, even) => {
    const segs = p.split('/');
    if ((segs.length % 2 === 0) !== even) throw new TypeError(`path parity: ${p}`);
    for (const s of segs) if (!SEG.test(s) || s === '.' || s === '..') throw new TypeError(`bad segment: ${s}`);
  };
  const doc = (p) => {
    check(p, true);
    return {
      id: p.split('/').pop(),
      path: p,
      get: async () => { await tick(); return snap(p); },
      set: async (data) => {
        await tick();
        if (opts.rejectWrites) throw { code: 'invalid_argument', message: 'cannot write here' };
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw { code: 'invalid_argument', message: 'body must be an object' };
        if (JSON.stringify(data).length > 256 * 1024) throw { code: 'invalid_argument', message: 'document over 256 KiB' };
        store[p] = JSON.parse(JSON.stringify(data));
        persist(store);
        window.__fake.writes.push(p);
        notify(p);
      },
      update: async (data) => {
        await tick();
        if (store[p] === undefined) throw { code: 'invalid_argument', message: 'no such document' };
        store[p] = { ...store[p], ...JSON.parse(JSON.stringify(data)) };
        persist(store);
        notify(p);
      },
      delete: async () => { await tick(); delete store[p]; persist(store); window.__fake.deletes.push(p); notify(p); },
      acquire: async () => ({ acquired: true }),
      onSnapshot: (next) => {
        (listeners[p] = listeners[p] || new Set()).add(next);
        window.__fake.subscriptions.push(p);
        setTimeout(() => next(snap(p)), 0);
        return () => listeners[p].delete(next);
      },
      collection: (c) => collection(`${p}/${c}`),
    };
  };
  const collection = (p) => {
    check(p, false);
    return { path: p, doc: (id) => doc(`${p}/${id || `d${Math.random().toString(36).slice(2, 8)}`}`), add: async (data) => { const d = doc(`${p}/d${Math.random().toString(36).slice(2, 8)}`); await d.set(data); return d; } };
  };
  const db = Object.freeze({ doc, collection });
  const id = opts.userId || 'u_test';
  const user = Object.freeze({
    isOwner: async () => false, canEdit: async () => false, can: async () => null, id: async () => id,
    me: async () => ({ id, name: '', avatarUrl: '', color: '', email: null, isOwner: false, canEdit: false }),
    profiles: async () => ({}), name: async () => '', avatarUrl: async () => null, search: async () => [], email: async () => null,
  });
  const downloads = Object.freeze({
    save: async (req) => {
      await tick();
      window.__fake.saves.push({ filename: req.filename, data: typeof req.data === 'string' ? req.data : null });
      if (opts.decline) throw { code: 'declined', message: 'the viewer said no' };
      return { status: 'saved' };
    },
  });
  window.__fake = { writes: [], deletes: [], saves: [], subscriptions: [], dump: () => JSON.parse(JSON.stringify(store)), externalWrite: (p, data) => { store[p] = data; persist(store); notify(p); } };
  const ns = { db: opts.db ? db : null, user: opts.user ? user : null, downloads: opts.downloads ? downloads : null };
  window.claude = Object.freeze({ use: (name) => new Promise((r) => setTimeout(() => r(ns[name] || null), opts.delay || 30)) });
}

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// own: { id, case, base, pending } seeds a person's own slot and its record.
async function open(browser, opts, hash = '', { browserCase = null, own = null, viewport = { width: 1280, height: 900 }, settle = 900 } = {}) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(fakeClaude, opts);
  await page.addInitScript(({ k, s, own, ownKey, syncKey }) => {
    if (s) localStorage.setItem(k, JSON.stringify(s));
    if (own) { localStorage.setItem(ownKey, JSON.stringify(own.case)); localStorage.setItem(syncKey, JSON.stringify({ base: own.base || null, pending: !!own.pending })); }
  }, { k: KEY, s: browserCase, own, ownKey: own ? OWN(own.id) : '', syncKey: own ? SYNC(own.id) : '' });
  await page.goto(`http://localhost:${server.address().port}/artifact-test.html${hash}`);
  await page.waitForTimeout(settle);
  return { page, errors };
}
const caseName = (page) => page.$eval('.topbar__caseinput', (e) => e.value);
const footer = (page) => page.$eval('.foot', (e) => e.innerText.replace(/\s+/g, ' '));
const inert = (page) => page.$eval('.app__body', (e) => e.inert);
const item = (page, k) => page.evaluate((k) => { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; }, k);
const stored = (page) => item(page, KEY);
const ownOf = (page, id = 'u_test') => item(page, OWN(id));
const syncOf = (page, id = 'u_test') => item(page, SYNC(id));
const headOf = (dump) => dump['data/users/u_test/case'];
const textOf = (dump) => {
  const h = headOf(dump);
  if (!h) return null;
  return h.parts.map((n) => (dump[`data/users/u_test/${n}`] || {}).text || '').join('');
};
const headWrites = (writes) => writes.filter((w) => w.endsWith('/case')).length;

(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  // 1. db null: the page renders, the case persists in the browser-only slot, the
  //    footer says so.
  {
    const { page, errors } = await open(browser, { db: false, user: false, downloads: true }, '#/');
    ok(await page.$('.topbar__title'), 'db null: the page renders');
    ok(!(await inert(page)), 'db null: the views are not inert once the capabilities have resolved');
    ok(/kept in this browser only/.test(await footer(page)), 'db null: the footer says the case is kept in this browser only');
    await page.fill('.topbar__caseinput', 'Browser case');
    await sleep(500);
    const s = await stored(page);
    ok(s && s.meta.case === 'Browser case', 'db null: the case persists in the browser-only slot');
    ok(errors.length === 0, `db null: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 2. Until the capabilities resolve, the views are inert, the footer's buttons
  //    wait, and the footer says the case is being read; the browser-only copy is
  //    not shown before then.
  {
    const { page, errors } = await open(browser, { db: false, user: false, downloads: true, delay: 1200 }, '#/', { browserCase: named('Waiting'), settle: 400 });
    ok(await inert(page), 'resolving: the views are inert');
    ok(await caseName(page) === '', 'resolving: no case is shown yet');
    ok(/The case is being read from claude.ai\./.test(await footer(page)), 'resolving: the footer says the case is being read');
    ok(await page.$eval('.foot__acts button', (b) => b.disabled), 'resolving: the footer buttons wait');
    await sleep(1400);
    ok(!(await inert(page)), 'resolved: the views are no longer inert');
    ok(await caseName(page) === 'Waiting', 'resolved: the browser-only copy is the case');
    ok(/kept in this browser only/.test(await footer(page)), 'resolved: the footer says where the case is kept');
    ok(!(await page.$eval('.foot__acts button', (b) => b.disabled)), 'resolved: the footer buttons work');
    ok(errors.length === 0, `resolving: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 3. db present, empty area, the browser-only slot holds a case: carried into the
  //    database and moved into the person's own slot; a reload with the browser
  //    cleared restores from the database.
  {
    const { page, errors } = await open(browser, { db: true, user: true, downloads: true }, '#/', { browserCase: named('Carried') });
    ok(/private area of your claude.ai account/.test(await footer(page)), 'db present: the footer says the case is kept in the account');
    let dump = await page.evaluate(() => window.__fake.dump());
    ok(headOf(dump) && headOf(dump).version === 1 && headOf(dump).parts.length === 1, `db present: the empty area received a head document ${JSON.stringify(headOf(dump))}`);
    ok((textOf(dump) || '').includes('"case":"Carried"'), 'db present: the empty area received the browser-only case');
    const own = await ownOf(page);
    const sync = await syncOf(page);
    ok(own && own.meta.case === 'Carried', 'db present: the copy moved into the person\'s own slot');
    ok(!(await stored(page)), 'db present: the browser-only slot is empty after the move');
    ok(sync && sync.pending === false && sync.base === headOf(dump).stamp, `db present: the own slot's record says the account holds the copy ${JSON.stringify(sync)}`);
    const subs = await page.evaluate(() => window.__fake.subscriptions);
    ok(subs.length === 1 && subs[0] === 'data/users/u_test/case', `db present: subscribed once, to the head ${JSON.stringify(subs)}`);
    // A change typed here is written after a pause, only once, and the copy stops
    // being pending once the account holds it.
    await page.fill('.topbar__caseinput', 'Carried and typed');
    await sleep(1500);
    dump = await page.evaluate(() => window.__fake.dump());
    ok((textOf(dump) || '').includes('"case":"Carried and typed"'), 'db present: a change typed here reaches the database');
    const writes = await page.evaluate(() => window.__fake.writes);
    ok(headWrites(writes) === 2, `db present: one head write for the carry and one for the pause (${headWrites(writes)})`);
    const deletes = await page.evaluate(() => window.__fake.deletes);
    ok(deletes.length === 1 && Object.keys(dump).length === 2, `db present: the part the new head no longer names is deleted (${deletes.length} deletes, ${Object.keys(dump).length} documents)`);
    const after = await syncOf(page);
    ok(after && after.pending === false && after.base === headOf(dump).stamp, `db present: the record follows the write ${JSON.stringify(after)}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(900);
    ok(await caseName(page) === 'Carried and typed', 'db present: a reload with the browser cleared restores the case from the database');
    ok(errors.length === 0, `db present: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 4. The database holds a case and the own slot's copy is not pending: the
  //    database case is the case; a change from another device shows; one typed
  //    here is not clobbered.
  {
    const { page, errors } = await open(browser, { db: true, user: true, downloads: true, seed: inDatabase(named('From the database')) }, '#/', { own: { id: 'u_test', case: named('From the browser'), base: 's_seed', pending: false } });
    ok(await caseName(page) === 'From the database', 'held: the database case is read, not the own slot\'s copy');
    const own = await ownOf(page);
    ok(own && own.meta.case === 'From the database', 'held: the own slot now holds the database case');
    const writes = await page.evaluate(() => window.__fake.writes);
    ok(writes.length === 0, `held: nothing written back on reading (${writes.length} writes)`);
    await page.evaluate((docs) => { for (const [p, d] of Object.entries(docs)) window.__fake.externalWrite(p, d); }, inDatabase(named('From another device'), 's_other'));
    await sleep(600);
    ok(await caseName(page) === 'From another device', 'another device: its change shows here');
    ok((await syncOf(page)).base === 's_other', 'another device: the own slot\'s record now descends from its case');
    await page.fill('.topbar__caseinput', 'Typed here');
    await page.evaluate((docs) => { for (const [p, d] of Object.entries(docs)) window.__fake.externalWrite(p, d); }, inDatabase(named('Arrived while typing'), 's_clobber'));
    await sleep(1800);
    ok(await caseName(page) === 'Typed here', 'another device: a change being typed here is kept');
    const dump = await page.evaluate(() => window.__fake.dump());
    ok((textOf(dump) || '').includes('"case":"Typed here"'), 'another device: the change typed here is the one in the database');
    ok(errors.length === 0, `another device: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 5. The own slot's copy is pending and descends from the case the database holds
  //    (the account's write did not finish last time): the copy is newer, is the
  //    case, and is carried into the database.
  {
    const { page, errors } = await open(browser, { db: true, user: true, downloads: true, seed: inDatabase(named('From the database')) }, '#/', { own: { id: 'u_test', case: named('Typed before closing'), base: 's_seed', pending: true } });
    ok(await caseName(page) === 'Typed before closing', 'pending: the own slot\'s copy is the case');
    const dump = await page.evaluate(() => window.__fake.dump());
    ok((textOf(dump) || '').includes('"case":"Typed before closing"'), 'pending: the copy is carried into the database');
    const writes = await page.evaluate(() => window.__fake.writes);
    ok(headWrites(writes) === 1, `pending: one head write (${headWrites(writes)})`);
    const sync = await syncOf(page);
    ok(sync && sync.pending === false && sync.base === headOf(dump).stamp, `pending: the record says the account holds the copy now ${JSON.stringify(sync)}`);
    ok(errors.length === 0, `pending: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 6. The own slot's copy is pending but descends from an older case than the
  //    database holds (another device wrote meanwhile): the database case wins.
  {
    const { page, errors } = await open(browser, { db: true, user: true, downloads: true, seed: inDatabase(named('From the database')) }, '#/', { own: { id: 'u_test', case: named('Older and pending'), base: 's_old', pending: true } });
    ok(await caseName(page) === 'From the database', 'conflict: the database case is the case');
    const writes = await page.evaluate(() => window.__fake.writes);
    ok(writes.length === 0, `conflict: nothing written on reading (${writes.length} writes)`);
    const sync = await syncOf(page);
    ok(sync && sync.pending === false && sync.base === 's_seed', `conflict: the own slot's record now descends from the database case ${JSON.stringify(sync)}`);
    ok(errors.length === 0, `conflict: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 7. Another person's own slot, signed in as someone else: not shown, not carried,
  //    and not written over.
  {
    const { page, errors } = await open(browser, { db: true, user: true, downloads: true }, '#/', { own: { id: 'u_other', case: named('Someone else'), base: null, pending: true } });
    ok(await caseName(page) === '', 'another person, signed in: their copy is not shown');
    const dump = await page.evaluate(() => window.__fake.dump());
    ok(!headOf(dump), 'another person, signed in: their copy is not carried into this account');
    await page.fill('.topbar__caseinput', 'Mine');
    await sleep(1500);
    const other = await ownOf(page, 'u_other');
    ok(other && other.meta.case === 'Someone else' && (await syncOf(page, 'u_other')).pending === true, 'another person, signed in: their slot is untouched by what is typed here');
    ok((await ownOf(page)).meta.case === 'Mine', 'another person, signed in: what is typed here goes to this person\'s own slot');
    ok(errors.length === 0, `another person, signed in: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 8. Another person's own slot, signed out: not shown, and not written over.
  {
    const { page, errors } = await open(browser, { db: false, user: false, downloads: true }, '#/', { own: { id: 'u_other', case: named('Someone else'), base: 's_x', pending: false } });
    ok(await caseName(page) === '', 'another person, signed out: their copy is not shown');
    ok(/kept in this browser only/.test(await footer(page)), 'another person, signed out: the footer says the browser');
    await page.fill('.topbar__caseinput', 'Signed out');
    await sleep(500);
    ok((await stored(page)).meta.case === 'Signed out', 'another person, signed out: what is typed goes to the browser-only slot');
    ok((await ownOf(page, 'u_other')).meta.case === 'Someone else', 'another person, signed out: their slot is untouched');
    ok(errors.length === 0, `another person, signed out: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 9. A signed-in member whose database is not served keeps the own slot, pending.
  {
    const { page, errors } = await open(browser, { db: false, user: true, downloads: true }, '#/', { own: { id: 'u_test', case: named('Own, no database'), base: 's_seed', pending: false } });
    ok(await caseName(page) === 'Own, no database', 'no database: the own slot\'s copy is the case');
    ok(/kept in this browser only/.test(await footer(page)), 'no database: the footer says the browser');
    await page.fill('.topbar__caseinput', 'Own, typed');
    await sleep(500);
    const sync = await syncOf(page);
    ok((await ownOf(page)).meta.case === 'Own, typed' && sync.pending === true && sync.base === 's_seed', `no database: the change stays in the own slot, pending ${JSON.stringify(sync)}`);
    ok(errors.length === 0, `no database: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 10. A member who cannot write there stays in the browser, with a notice.
  {
    const { page, errors } = await open(browser, { db: true, user: true, downloads: true, rejectWrites: true }, '#/');
    await page.fill('.topbar__caseinput', 'View only');
    await sleep(1500);
    const f = await footer(page);
    ok(/kept in this browser only/.test(f), 'cannot write: the footer says the case is kept in this browser only');
    ok(/could not be saved in your claude.ai account; it is kept in this browser/.test(f), 'cannot write: the saving notice says what failed');
    const own = await ownOf(page);
    ok(own && own.meta.case === 'View only', 'cannot write: the case persists in the own slot');
    ok(errors.length === 0, `cannot write: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 11. A torn read (the head names a document that is missing): after the attempts
  //     a notice shows with "Read the case again", the views stay inert, and once
  //     the document is there the read succeeds.
  {
    const seed = inDatabase(named('Torn'));
    const part = Object.keys(seed).find((k) => /case-part-/.test(k));
    const { page, errors } = await open(browser, { db: true, user: true, downloads: true, seed: { 'data/users/u_test/case': seed['data/users/u_test/case'] } }, '#/', { settle: 6000 });
    ok(/The case could not be read from your claude.ai account\./.test(await footer(page)), 'torn: the notice shows');
    ok(await inert(page), 'torn: the views stay inert');
    ok(await caseName(page) === '', 'torn: no case is shown');
    await page.evaluate(({ p, d }) => window.__fake.externalWrite(p, d), { p: part, d: seed[part] });
    await page.click('text=Read the case again');
    await sleep(600);
    ok(await caseName(page) === 'Torn', 'read again: the case loads');
    ok(!(await inert(page)) && !/could not be read/.test(await footer(page)), 'read again: the views work and the notice is gone');
    ok(/private area of your claude.ai account/.test(await footer(page)), 'read again: the footer says the account');
    ok(errors.length === 0, `torn: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 12. Save the case to a file, through downloads.save; Open a saved case accepts it,
  //     after a question asked on the page; a damaged file opens without a crash.
  {
    const { page, errors } = await open(browser, { db: false, user: false, downloads: true }, '#/', { browserCase: named('Saved one') });
    await page.click('text=Save the case to a file');
    await sleep(300);
    const saves = await page.evaluate(() => window.__fake.saves);
    ok(saves.length === 1 && /^case-\d{4}-\d{2}-\d{2}\.json$/.test(saves[0].filename), `save: downloads.save called with a json filename ${JSON.stringify(saves.map((s) => s.filename))}`);
    const accepted = await page.evaluate(async (text) => { const m = await import('/src/engine/store.js'); return m.looksLikeCase(JSON.parse(text)); }, saves[0].data || '');
    ok(accepted, 'save: the JSON handed over is a saved case');
    ok(!(await page.$('.foot__notice')), 'save: no notice after a save the viewer accepted');
    await page.fill('.topbar__caseinput', 'Changed since');
    await page.setInputFiles('.foot input[type=file]', { name: 'case.json', mimeType: 'application/json', buffer: Buffer.from(saves[0].data) });
    await sleep(300);
    let f = await footer(page);
    ok(/Open this saved case\? The saved case replaces the current case, kept in this browser\. To keep the current case, save the current case to a file first\./.test(f), 'open: the question is asked on the page, naming each case');
    await page.click('text=Keep the current case');
    ok(await caseName(page) === 'Changed since', 'open: keeping the current case keeps it');
    await page.setInputFiles('.foot input[type=file]', { name: 'case.json', mimeType: 'application/json', buffer: Buffer.from(saves[0].data) });
    await sleep(300);
    await page.click('text=Open the saved case');
    ok(await caseName(page) === 'Saved one', 'open: the saved case replaces the current one');
    await page.setInputFiles('.foot input[type=file]', { name: 'notes.json', mimeType: 'application/json', buffer: Buffer.from('{"hello": 1}') });
    await sleep(300);
    f = await footer(page);
    ok(/That file is not a saved case\./.test(f), 'open: a file that is not a case gets the notice');
    // A damaged file: members of the wrong type are brought back to shape.
    const damaged = { version: 1, meta: 'Damaged', values: { 1: { situation: 'Kept' }, 2: 'x' }, revisions: null, marks: 'none', pending: null, ticks: [], confirmations: { 1: ['2026-10-01T10:00:00Z'] } };
    await page.setInputFiles('.foot input[type=file]', { name: 'damaged.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(damaged)) });
    await sleep(300);
    await page.click('text=Open the saved case');
    await sleep(300);
    await page.evaluate(() => { window.location.hash = '#/step/1'; });
    await sleep(600);
    ok(await page.$('.step'), 'damaged file: the step screen renders');
    const kept = await stored(page);
    ok(kept && kept.values[1].situation === 'Kept' && Array.isArray(kept.revisions) && typeof kept.values[2] === 'object', `damaged file: the answer that was there is kept, in a case brought back to shape ${JSON.stringify(kept && { revisions: kept.revisions, v2: kept.values[2] })}`);
    await page.click('text=Start a new case');
    await sleep(100);
    ok(/Start a new, empty case\? The new case replaces the current case, kept in this browser\. To keep the current case, save the current case to a file first\./.test(await footer(page)), 'new case: the question is asked on the page, naming each case');
    await page.click('text=Start the new case');
    ok(await caseName(page) === '', 'new case: the case is emptied');
    ok(errors.length === 0, `save and open: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 13. A declined save shows a notice and does not throw; no downloads, another.
  {
    const { page, errors } = await open(browser, { db: false, user: false, downloads: true, decline: true }, '#/');
    await page.click('text=Save the case to a file');
    await sleep(300);
    ok(/The file was not saved\./.test(await footer(page)), 'declined: the notice shows');
    await page.click('text=Close the notice');
    ok(!/The file was not saved\./.test(await footer(page)), 'declined: the notice closes');
    ok(errors.length === 0, `declined: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
    const second = await open(browser, { db: false, user: false, downloads: false }, '#/');
    await second.page.click('text=Save the case to a file');
    await sleep(300);
    ok(/Saving a file is not available in this view\./.test(await footer(second.page)), 'no downloads: the notice shows');
    ok(second.errors.length === 0, `no downloads: no console errors ${second.errors.length ? JSON.stringify(second.errors) : ''}`);
    await second.page.close();
  }

  // 14. Phone width: nothing scrolls sideways at 400px, on every view.
  {
    const s = named('Phone', {
      values: { 1: { situation: 'Something is going on here in the city.', problem_thing: 'x', problem_direction: 'too_much', problem_who: 'y', problem_since: '2020', problem_consequence: 'z' }, 2: { actors: [{ id: 'a1', name: 'Ministry of Housing' }] }, 3: {}, A: {} },
      confirmations: { 1: ['2026-10-01T10:00:00Z'], 2: ['2026-10-01T10:00:00Z'] },
    });
    for (const hash of ['#/', '#/step/1', '#/step/2', '#/step/3', '#/read', '#/glossary']) {
      const { page, errors } = await open(browser, { db: false, user: false, downloads: true }, hash, { browserCase: s, viewport: { width: 400, height: 800 } });
      const w = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      ok(w <= 400, `400px ${hash}: no horizontal scroll of the page (${w})`);
      ok(errors.length === 0, `400px ${hash}: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(failures ? `${failures} failed` : 'all passed');
  process.exit(failures ? 1 : 0);
})();
