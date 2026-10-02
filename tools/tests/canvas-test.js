// Screen test for decision B12 (2 October 2026): the first drawing, Step 2,
// Exercise 1, as a free-form canvas beside the photograph slot.
// Checks: a label, a mark, and a connector are placed; a thing moves by dragging
// and with the arrow keys, and is removed with its button and the Delete key; the
// last change is undone; every thing has a touch-sized hit target and a visible
// focus ring; the drawing persists across a reload and the read-through draws it;
// Exercise 1 completes with a drawing alone, with a photograph alone, and not with
// neither; the sheet scrolls inside its own container at 400px with no horizontal
// scroll of the page; and no console errors.
// usage: node canvas-test.js <prototype dir>
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
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

const KEY = 'systems-process.case.v1';
const T0 = '2026-10-01T12:00:00.000Z';
// Step 1 passed, so Step 2 opens; the Step 2 instruction pages read, so Exercise 1 shows at once.
const state = (v2 = {}) => ({
  version: 1, meta: { case: 'Waiting lists', started: '2026-10-01T10:00:00Z' },
  values: { 1: { situation: 'Something is going on here in the city.' }, 2: v2, 3: {}, A: {} },
  ticks: {}, confirmations: { 1: [T0] }, pending: {}, revisions: [], marks: [], returns: [], dismissed: {}, read: { s2instr1: T0, s2instr2: T0, s2instr3: T0 }, edited: {},
});
const drawing = {
  marks: [{ id: 'mk1', mark: 'money', x: 420, y: 160 }, { id: 'mk2', mark: 'question', x: 760, y: 300 }],
  labels: [{ id: 'lb1', text: 'Tenants on the waiting list', x: 180, y: 120 }, { id: 'lb2', text: 'City council', x: 520, y: 320 }],
  connectors: [{ id: 'cn1', a: 'lb1', b: 'mk1' }, { id: 'cn2', a: 'lb2', b: 'mk2' }],
};

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, st, hash, viewport = { width: 1280, height: 900 }, hasTouch = false) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, hasTouch });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('systems-process.case.v1', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, st);
  await page.goto(`http://localhost:${server.address().port}/${hash}`);
  await page.waitForTimeout(1200);
  return { page, errors };
}
const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
const canvasOf = async (page) => ((await stored(page)).values[2] || {}).sketch_first_canvas || null;
const counts = (v) => ({ marks: ((v && v.marks) || []).length, labels: ((v && v.labels) || []).length, connectors: ((v && v.connectors) || []).length });
// A point on the sheet, in viewport coordinates, with the sheet scrolled into view.
async function at(page, x, y) {
  const r = await page.$eval('.sk__svg', (e) => { e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { left: b.left, top: b.top }; });
  return { x: r.left + x, y: r.top + y };
}
async function centreOf(page, selector) {
  return page.$eval(selector, (e) => { e.scrollIntoView({ block: 'center' }); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  // 1. Placing, connecting, moving, removing, undoing, with the mouse.
  {
    const { page, errors } = await open(browser, state(), '#/step/2/ex/1');
    ok(await page.$('#ex-2-1 .sk__svg'), 'Exercise 1 shows the canvas');
    ok(!(await page.$('.sketch-placeholder')), 'the placeholder is gone');
    ok(await page.$('#ex-2-1 .field__imagepick'), 'the photograph slot stands beside the canvas');
    const markButtons = await page.$$eval('#ex-2-1 .sk__markbtn', (els) => els.map((e) => e.textContent.trim()));
    ok(markButtons.length === 4 && /money/.test(markButtons[0]) && /conflict/.test(markButtons[1]) && /a blockage/.test(markButtons[2]) && /A question mark for what you do not know/.test(markButtons[3]), `the four marks page 13 names, in its words: ${JSON.stringify(markButtons)}`);

    // A label: one click on the sheet, then typing.
    let p = await at(page, 200, 150);
    await page.mouse.click(p.x, p.y);
    await sleep(100);
    ok(await page.$('.sk__edit'), 'a click on the sheet opens a label to write in');
    await page.keyboard.type('Tenants');
    await page.keyboard.press('Enter');
    await sleep(400);
    let v = await canvasOf(page);
    ok(v && v.labels.length === 1 && v.labels[0].text === 'Tenants' && v.labels[0].x === 200 && v.labels[0].y === 150, `the label is stored where it was placed: ${JSON.stringify(v && v.labels)}`);
    ok((await page.$$('.sk__thing--label')).length === 1, 'the label is drawn');

    // A mark: choose its button, then click the sheet; the button stays chosen.
    await page.click('#ex-2-1 .sk__markbtn:has-text("money")');
    p = await at(page, 420, 160);
    await page.mouse.click(p.x, p.y);
    await sleep(300);
    v = await canvasOf(page);
    ok(v && v.marks.length === 1 && v.marks[0].mark === 'money' && v.marks[0].x === 420 && v.marks[0].y === 160, `the mark is stored where it was placed: ${JSON.stringify(v && v.marks)}`);
    ok(await page.$eval('#ex-2-1 .sk__markbtn:has-text("money")', (e) => e.getAttribute('aria-pressed')) === 'true', 'the mark button stays chosen for the next mark');
    p = await at(page, 600, 260);
    await page.mouse.click(p.x, p.y);
    await sleep(300);
    v = await canvasOf(page);
    ok(v && v.marks.length === 2, 'a second click places a second mark');

    // A connector: click one thing, then the other.
    await page.click('#ex-2-1 button:has-text("Draw a connector")');
    let a = await centreOf(page, '[data-thing="' + v.labels[0].id + '"]');
    let b = await centreOf(page, '[data-thing="' + v.marks[0].id + '"]');
    await page.mouse.click(a.x, a.y);
    await page.mouse.click(b.x, b.y);
    await sleep(300);
    v = await canvasOf(page);
    ok(v && v.connectors.length === 1 && v.connectors[0].a === v.labels[0].id && v.connectors[0].b === v.marks[0].id, `the connector joins the label and the mark: ${JSON.stringify(v && v.connectors)}`);
    ok((await page.$$('.sk__conn')).length === 1, 'the connector is drawn');
    await page.mouse.click(a.x, a.y);
    await page.mouse.click(b.x, b.y);
    await sleep(300);
    v = await canvasOf(page);
    ok(v.connectors.length === 1, 'the same two things are not joined twice');

    // Moving by dragging.
    await page.click('#ex-2-1 button:has-text("Write a label")');
    b = await centreOf(page, '[data-thing="' + v.marks[0].id + '"]');
    await page.mouse.move(b.x, b.y);
    await page.mouse.down();
    await page.mouse.move(b.x + 60, b.y + 30, { steps: 6 });
    await page.mouse.move(b.x + 120, b.y + 60, { steps: 6 });
    await page.mouse.up();
    await sleep(400);
    v = await canvasOf(page);
    ok(v.marks[0].x === 540 && v.marks[0].y === 220, `the mark moved by dragging: ${JSON.stringify(v.marks[0])}`);
    ok(v.labels.length === 1 && v.marks.length === 2, 'the drag added nothing');

    // Removing a thing takes its connectors with it; undo brings both back.
    a = await centreOf(page, '[data-thing="' + v.labels[0].id + '"]');
    await page.mouse.click(a.x, a.y);
    await sleep(100);
    ok(await page.$('#ex-2-1 button:has-text("Remove the label")'), 'a selected label offers its remove button');
    await page.click('#ex-2-1 button:has-text("Remove the label")');
    await sleep(300);
    v = await canvasOf(page);
    ok(v.labels.length === 0 && v.connectors.length === 0 && v.marks.length === 2, 'removing the label removes its connector too');
    await page.click('#ex-2-1 button:has-text("Undo the last change")');
    await sleep(300);
    v = await canvasOf(page);
    ok(v.labels.length === 1 && v.connectors.length === 1, 'undo brings the label and its connector back');

    // Changing a label's text.
    a = await centreOf(page, '[data-thing="' + v.labels[0].id + '"]');
    await page.mouse.dblclick(a.x, a.y);
    await sleep(100);
    ok(await page.$('.sk__edit'), 'a double click on a label opens its text');
    await page.keyboard.type('Tenants waiting');
    await page.keyboard.press('Enter');
    await sleep(300);
    v = await canvasOf(page);
    ok(v.labels[0].text === 'Tenants waiting', `the label's text changed: ${v.labels[0].text}`);

    // A label left empty is not kept.
    p = await at(page, 300, 400);
    await page.mouse.click(p.x, p.y);
    await page.keyboard.press('Escape');
    await sleep(300);
    v = await canvasOf(page);
    ok(v.labels.length === 1, 'a label with nothing typed is not kept');

    // Removing everything stores nothing.
    for (const id of [v.labels[0].id, v.marks[0].id, v.marks[1].id]) {
      const c = await centreOf(page, `[data-thing="${id}"]`);
      await page.mouse.click(c.x, c.y);
      await page.keyboard.press('Delete');
      await sleep(200);
    }
    v = await canvasOf(page);
    ok(v === null, `an emptied drawing is stored as nothing: ${JSON.stringify(v)}`);
    ok(errors.length === 0, `no console errors on the canvas ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 2. Keyboard: adding, moving, connecting, removing, with a visible focus ring;
  //    touch-sized hit targets.
  {
    const { page, errors } = await open(browser, state({ sketch_first_canvas: drawing }), '#/step/2/ex/1');
    const hits = await page.$$eval('.sk__thing .sk__hit', (els) => els.map((e) => { const b = e.getBoundingClientRect(); return [b.width, b.height]; }));
    ok(hits.length === 4 && hits.every(([w, h]) => w >= 44 && h >= 44), `every thing has a hit target of at least 44px: ${JSON.stringify(hits)}`);
    const connHit = await page.$eval('.sk__connhit', (e) => parseFloat(getComputedStyle(e).strokeWidth));
    ok(connHit >= 20, `a connector's hit stroke is at least 20px (${connHit})`);

    await page.focus('.sk__svg');
    await page.keyboard.press('Tab');
    let active = await page.evaluate(() => ({ thing: document.activeElement.getAttribute('data-thing'), conn: document.activeElement.getAttribute('data-connector') }));
    ok(active.thing || active.conn, `Tab from the sheet reaches a thing or a connector: ${JSON.stringify(active)}`);
    // Reach a mark or a label, whichever comes first after the connectors.
    for (let i = 0; i < 3 && !active.thing; i++) {
      await page.keyboard.press('Tab');
      active = await page.evaluate(() => ({ thing: document.activeElement.getAttribute('data-thing'), conn: document.activeElement.getAttribute('data-connector') }));
    }
    ok(!!active.thing, `Tab reaches a thing: ${JSON.stringify(active)}`);
    const ring = await page.evaluate(() => { const h = document.activeElement.querySelector('.sk__hit'); return h ? getComputedStyle(h).stroke : 'none'; });
    ok(ring && ring !== 'none', `the focused thing shows a ring (${ring})`);
    const before = (await canvasOf(page));
    const find = (v, id) => [...v.marks, ...v.labels].find((x) => x.id === id);
    const was = find(before, active.thing);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowDown');
    await sleep(400);
    let v = await canvasOf(page);
    const now = find(v, active.thing);
    ok(now.x === was.x + 16 && now.y === was.y + 32, `the arrow keys move the focused thing (${was.x},${was.y} to ${now.x},${now.y})`);
    ok(await page.evaluate((id) => document.activeElement.getAttribute('data-thing') === id, active.thing), 'focus stays on the thing after a move');

    // A connector from the keyboard: choose the tool, Enter on one thing, Tab to another, Enter.
    await page.click('#ex-2-1 button:has-text("Draw a connector")');
    await page.focus(`[data-thing="${drawing.marks[0].id}"]`);
    await page.keyboard.press('Enter');
    await page.focus(`[data-thing="${drawing.marks[1].id}"]`);
    await page.keyboard.press('Enter');
    await sleep(400);
    v = await canvasOf(page);
    ok(v.connectors.length === 3 && v.connectors.some((c) => c.a === drawing.marks[0].id && c.b === drawing.marks[1].id), 'a connector is drawn from the keyboard');

    // A label from the keyboard: the label tool, Enter on the sheet, typing, Enter.
    await page.click('#ex-2-1 button:has-text("Write a label")');
    await page.focus('.sk__svg');
    await page.keyboard.press('Enter');
    await sleep(100);
    ok(await page.$('.sk__edit'), 'Enter on the sheet opens a label to write in');
    await page.keyboard.type('Ministry');
    await page.keyboard.press('Enter');
    await sleep(400);
    v = await canvasOf(page);
    ok(v.labels.length === 3 && v.labels.some((l) => l.text === 'Ministry'), 'a label is written from the keyboard');
    ok(await page.evaluate(() => !!document.activeElement.getAttribute('data-thing')), 'the new label takes focus');

    // A mark from the keyboard: its button, then Enter on the sheet.
    await page.click('#ex-2-1 .sk__markbtn:has-text("a blockage")');
    await page.focus('.sk__svg');
    await page.keyboard.press('Enter');
    await sleep(400);
    v = await canvasOf(page);
    ok(v.marks.length === 3 && v.marks.some((m) => m.mark === 'blockage'), 'a mark is placed from the keyboard');

    // Delete removes the focused thing.
    await page.focus(`[data-thing="${drawing.labels[1].id}"]`);
    await page.keyboard.press('Delete');
    await sleep(400);
    v = await canvasOf(page);
    ok(v.labels.length === 2 && !v.labels.some((l) => l.id === drawing.labels[1].id) && !v.connectors.some((c) => c.a === drawing.labels[1].id), 'Delete removes the focused label and its connector');
    ok(errors.length === 0, `no console errors with the keyboard ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 3. Persistence across a reload, and the read-through draws the drawing.
  {
    const { page, errors } = await open(browser, state(), '#/step/2/ex/1');
    const p = await at(page, 240, 180);
    await page.mouse.click(p.x, p.y);
    await page.keyboard.type('Housing corporation');
    await page.keyboard.press('Enter');
    await page.click('#ex-2-1 .sk__markbtn:has-text("conflict")');
    const q = await at(page, 500, 220);
    await page.mouse.click(q.x, q.y);
    await sleep(500);
    await page.reload();
    await page.waitForTimeout(1200);
    const drawn = await page.$$eval('.sk__thing', (els) => els.map((e) => e.getAttribute('aria-label')));
    ok(drawn.length === 2 && drawn.includes('Housing corporation') && drawn.includes('A mark for conflict'), `the drawing is back after a reload: ${JSON.stringify(drawn)}`);
    const v = await canvasOf(page);
    ok(counts(v).labels === 1 && counts(v).marks === 1, 'the stored drawing is what was drawn');
    await page.goto(`http://localhost:${server.address().port}/#/read`);
    await page.waitForTimeout(800);
    const read = await page.$$eval('.read__drawing--first .sk__svg--read .sk__thing', (els) => els.length);
    ok(read === 2, `the read-through draws the first drawing (${read} things)`);
    ok(errors.length === 0, `no console errors across the reload ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 4. Completion: Exercise 1 with a drawing alone, a photograph alone, and neither.
  {
    const { page, errors } = await open(browser, state(), '#/step/2/ex/1');
    const problems = (v2) => page.evaluate(async ({ s, v2 }) => {
      const m = await import('/src/engine/validate.js');
      const st = { ...s, values: { ...s.values, 2: v2 } };
      return m.validateStep(st, 2).blocking.filter((b) => b.exercise === 1).map((b) => b.text);
    }, { s: state(), v2 });
    const done = { sketch_first_done: true };
    const photo = { src: 'data:image/jpeg;base64,AAAA', name: 'sheet.jpg', at: T0 };
    let b = await problems({ ...done, sketch_first_canvas: drawing });
    ok(b.length === 0, `complete with a drawing alone: ${JSON.stringify(b)}`);
    b = await problems({ ...done, sketch_first_image: photo });
    ok(b.length === 0, `complete with a photograph alone: ${JSON.stringify(b)}`);
    b = await problems({ ...done, sketch_first_canvas: drawing, sketch_first_image: photo });
    ok(b.length === 0, 'complete with both');
    b = await problems(done);
    ok(b.length === 1 && /the first drawing, on the canvas or as a photograph/.test(b[0]), `not complete with neither: ${JSON.stringify(b)}`);
    b = await problems({ ...done, sketch_first_canvas: { marks: [], labels: [], connectors: [] } });
    ok(b.length === 1, 'an empty drawing does not count');
    b = await problems({ sketch_first_canvas: drawing });
    ok(b.length === 1 && !/canvas/.test(b[0]), `the confirmation is still needed with a drawing: ${JSON.stringify(b)}`);
    // On screen: the closed critical check names what is missing from Exercise 1.
    const txt = await page.evaluate(() => document.body.textContent);
    ok(/the first drawing, on the canvas or as a photograph/.test(txt), 'the closed critical check names the drawing or the photograph');
    ok(errors.length === 0, `no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 5. Phone width: the sheet scrolls inside its own container; the page does not.
  {
    const { page, errors } = await open(browser, state({ sketch_first_canvas: drawing }), '#/step/2/ex/1', { width: 400, height: 800 }, true);
    const w = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
    ok(w <= 400, `400px: no horizontal scroll of the page (${w})`);
    const sheet = await page.$eval('.sk__sheet', (e) => ({ scroll: e.scrollWidth, client: e.clientWidth, overflow: getComputedStyle(e).overflowX }));
    ok(sheet.overflow === 'auto' && sheet.scroll > sheet.client, `400px: the sheet scrolls inside its own container ${JSON.stringify(sheet)}`);
    // A tap places a label at phone width too.
    await page.click('#ex-2-1 button:has-text("Write a label")');
    const p = await at(page, 120, 420);
    await page.touchscreen.tap(p.x, p.y);
    await sleep(200);
    ok(await page.$('.sk__edit'), '400px: a tap on the sheet opens a label to write in');
    await page.keyboard.type('Rent tribunal');
    await page.keyboard.press('Enter');
    await sleep(400);
    const v = await canvasOf(page);
    ok(v.labels.some((l) => l.text === 'Rent tribunal'), '400px: the label is stored');
    ok(errors.length === 0, `400px: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 6. No cap: a label longer than the 80 characters the build once capped is kept
  //    whole, and nothing disables the buttons (the caps were removed after review,
  //    2 October 2026).
  {
    const { page, errors } = await open(browser, state(), '#/step/2/ex/1');
    await page.click('#ex-2-1 button:has-text("Write a label")');
    const p = await at(page, 200, 150);
    await page.mouse.click(p.x, p.y);
    await sleep(100);
    ok(!(await page.$eval('.sk__edit', (e) => e.hasAttribute('maxlength'))), 'no cap: the label box has no maxlength');
    const long = 'The housing corporations that own the social stock and set the allocation rules for the whole region together';
    await page.keyboard.type(long);
    await page.keyboard.press('Enter');
    await sleep(400);
    const v = await canvasOf(page);
    ok(v && v.labels.length === 1 && v.labels[0].text === long, `no cap: a label of ${long.length} characters is kept whole`);
    ok(!(await page.$eval('#ex-2-1 button:has-text("Write a label")', (b) => b.disabled)), 'no cap: the buttons are never disabled');
    ok(errors.length === 0, `no cap: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log(failures ? `${failures} failed` : 'all passed');
  process.exitCode = failures ? 1 : 0;
})();
