// Screen test for the file of the whole of Phase A (decision B03, built 2 October
// 2026): the read-through saved as one self-contained HTML document.
// Checks: the file builds for the sample case (tools/tests/sample-case.json, a case
// that has passed all three critical checks) and for a partly done case; it is one
// document with no script, inline CSS with A4 print styles, and the three faces
// embedded; opened in a browser it holds every exercise of Steps 1 to 3 in the
// book's order with its number, each step's state and the date it passed, the Step 3
// graph as inline SVG, both drawings, the photograph, and page 25 at the end; every
// piece of participant text is escaped; locally the button hands the browser a
// download named read-through-<date>.html; in the artifact the button calls
// downloads.save with that name, a declined save shows a notice, and no downloads
// shows another; the case view offers the file once Phase A is complete and not
// before; and nothing scrolls sideways at 400px.
// usage: node export-test.js <prototype dir>
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.otf': 'font/otf', '.png': 'image/png' };
// What the host puts around the artifact's page (see artifact-test.js).
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

const KEY = 'systems-process.case.v1';
const SAMPLE = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-case.json'), 'utf8'));
const PROBE = ' <b>bold</b> & <script>alert(1)</script>';
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
// The sample case with text a browser would read as markup, in a field, an actor's
// name, and a label on the first drawing, and with a photograph.
function probed() {
  const s = JSON.parse(JSON.stringify(SAMPLE));
  s.values[1].situation += PROBE;
  s.values[2].actors[4].name = 'Tenants & co';
  s.values[2].sketch_first_canvas.labels[1].text = 'Tenants <on the list>';
  s.values[2].sketch_first_image = { src: PNG, name: 'sheet.png', at: '2026-09-20T10:00:00Z' };
  return s;
}
const partly = () => ({ version: 1, meta: { case: 'Just begun', started: '2026-10-01T10:00:00Z' },
  values: { 1: { situation: 'Something is going on here in the city.', problem_thing: 'noise' }, 2: {}, 3: {}, A: {} },
  ticks: {}, confirmations: {}, pending: {}, revisions: [], marks: [], returns: [], dismissed: {}, read: {}, edited: {} });

// A fake window.claude with the downloads capability only (see artifact-test.js).
function fakeClaude(opts) {
  const downloads = Object.freeze({
    save: async (req) => {
      await new Promise((r) => setTimeout(r, 5));
      window.__fake.saves.push({ filename: req.filename, data: typeof req.data === 'string' ? req.data : null });
      if (opts.decline) throw { code: 'declined', message: 'the viewer said no' };
      return { status: 'saved' };
    },
  });
  window.__fake = { saves: [] };
  const ns = { db: null, user: null, downloads: opts.downloads ? downloads : null };
  window.claude = Object.freeze({ use: (name) => new Promise((r) => setTimeout(() => r(ns[name] || null), 30)) });
}

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, { page: file = 'index.html', hash = '#/read', state = null, claude = null, viewport = { width: 1280, height: 900 } } = {}) {
  const page = await browser.newPage({ viewport, acceptDownloads: true });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  if (claude) await page.addInitScript(fakeClaude, claude);
  await page.addInitScript(({ k, s }) => { if (s) localStorage.setItem(k, JSON.stringify(s)); }, { k: KEY, s: state });
  await page.goto(`http://localhost:${server.address().port}/${file}${hash}`);
  await page.waitForTimeout(700);
  return { page, errors };
}
// The file, built in the page from the case it holds, as the button builds it.
const build = (page) => page.evaluate(async (k) => {
  const m = await import('/src/views/ReadFile.js');
  const s = JSON.parse(localStorage.getItem(k));
  return m.readThroughFile(s);
}, KEY);
// What the definitions say the file must hold, read from the page's own modules.
const expected = (page) => page.evaluate(async () => {
  const d = await import('/src/definitions/index.js');
  const w = await import('/src/definitions/workbook.js');
  return { steps: d.STEPS.map((s) => ({ n: s.number, title: s.title, exercises: s.exercises.map((e) => e.number) })), carries: w.WORKBOOK.pages.carries.title, zones: w.WORKBOOK.pages.carries.zones.length };
});
// The file opened in a browser of its own, read through the DOM.
async function opened(browser, html) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.setContent(html, { waitUntil: 'load' });
  const read = await page.evaluate(() => ({
    scripts: document.scripts.length,
    title: document.title,
    h1: (document.querySelector('.read__head h1') || {}).textContent,
    h1prov: !!document.querySelector('.read__head h1 .prov'),
    caseName: (document.querySelector('.read__case') || {}).textContent || '',
    saved: [...document.querySelectorAll('.read__head .es-hint')].map((e) => e.textContent),
    steps: [...document.querySelectorAll('.read__step[data-step]')].map((s) => ({
      n: s.dataset.step,
      h2: s.querySelector('h2').textContent,
      state: s.querySelector(':scope > .es-hint').textContent,
      exercises: [...s.querySelectorAll('.read__ex')].map((e) => e.querySelector('.read__exn').textContent),
      titles: [...s.querySelectorAll('.read__ex h3')].map((e) => e.textContent.trim()),
    })),
    graphs: document.querySelectorAll('svg.graph__svg').length,
    graphPaths: document.querySelectorAll('svg.graph__svg .graph__series path').length,
    events: [...document.querySelectorAll('svg.graph__svg .graph__eventlabel')].map((e) => e.textContent),
    evidence: document.querySelectorAll('svg.graph__svg .ev rect').length,
    sketch: document.querySelectorAll('svg.sk__svg--read').length,
    sketchThings: document.querySelectorAll('svg.sk__svg--read .sk__thing').length,
    sketchConns: document.querySelectorAll('svg.sk__svg--read .sk__conn').length,
    sketchLabels: [...document.querySelectorAll('svg.sk__svg--read .sk__labeltext')].map((e) => e.textContent),
    arrangement: document.querySelectorAll('svg.arr__svg--read').length,
    arrangementNodes: document.querySelectorAll('svg.arr__svg--read .arr__node').length,
    arrangementLines: document.querySelectorAll('svg.arr__svg--read .arr__line').length,
    arrangementMarks: document.querySelectorAll('svg.arr__svg--read .arr__mark').length,
    counts: (document.querySelector('.read__field[data-field="sketch_second"] .prov') || {}).textContent,
    lines: (document.querySelector('.read__field[data-field="sketch_second"] .es-hint') || {}).textContent,
    img: (document.querySelector('img.read__img') || {}).getAttribute ? document.querySelector('img.read__img').getAttribute('src') : null,
    last: (document.querySelector('.read > section:last-of-type h2') || {}).textContent,
    zones: document.querySelectorAll('.read__step[data-page="carries"] .read__ex[data-zone]').length,
    zoneTexts: [...document.querySelectorAll('.read__step[data-page="carries"] .read__text')].map((e) => e.textContent),
    situation: (document.querySelector('.read__field[data-field="situation"] .read__text') || {}).textContent,
    bolds: document.querySelectorAll('.read b').length,
    actorCells: [...document.querySelectorAll('.read__field[data-field="actors"] td')].map((e) => e.textContent),
    links: document.querySelectorAll('a').length,
    fonts: [...document.fonts].map((f) => `${f.family} ${f.weight}`),
  }));
  await page.close();
  return { read, errors };
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  // 1. The sample case: the file as a string.
  {
    const { page, errors } = await open(browser, { state: probed() });
    const want = await expected(page);
    const f = await build(page);
    ok(/^read-through-\d{4}-\d{2}-\d{2}\.html$/.test(f.filename), `sample: the file is named read-through-<date>.html (${f.filename})`);
    ok(f.type === 'text/html', 'sample: the file is text/html');
    const html = f.text;
    ok(/^<!doctype html>/i.test(html), 'sample: one HTML document, starting with the doctype');
    ok(!/<script\b/i.test(html), 'sample: no script in the file');
    ok(html.includes('<style>') && html.includes('@page{size:A4') && html.includes('@media print'), 'sample: inline CSS with A4 print styles');
    ok(html.includes('color-scheme:light'), 'sample: one light look');
    const faces = (html.match(/@font-face\{font-family:"([^"]+)";font-weight:(\d+)/g) || []).map((m) => m.replace(/@font-face\{font-family:"([^"]+)";font-weight:(\d+)/, '$1 $2'));
    ok(faces.join(', ') === 'Outfit 400, Outfit 600, Archivo 400, Archivo Narrow 500, Archivo Narrow 600', `sample: the three faces are embedded (${faces.join(', ')})`);
    ok((html.match(/data:font\/woff2;base64,/g) || []).length === 5, 'sample: each face is a data URL');
    ok(!/walsheim/i.test(html), 'sample: GT Walsheim Pro is never referenced');
    ok(html.length < 400 * 1024, `sample: the file stays small (${Math.round(html.length / 1024)} KB)`);
    ok(html.includes('&lt;b&gt;bold&lt;/b&gt; &amp; &lt;script&gt;alert(1)&lt;/script&gt;'), 'sample: the probe text is escaped in the markup');
    ok(!html.includes('<b>'), 'sample: no <b> element in the file');
    ok(html.includes('Tenants &amp; co'), 'sample: an actor name with an ampersand is escaped');
    ok(html.includes('Tenants &lt;on the list&gt;'), 'sample: a label on the first drawing is escaped inside the SVG');
    ok(!new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`).test(html), 'sample: no em or en dash in the file');
    ok(errors.length === 0, `sample: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);

    // 2. The same file, opened in a browser.
    const { read, errors: openErrors } = await opened(browser, html);
    ok(openErrors.length === 0, `opened: no page errors ${openErrors.length ? JSON.stringify(openErrors) : ''}`);
    ok(read.scripts === 0, 'opened: no script element');
    ok(read.title.includes('Waiting lists'), `opened: the title carries the case name (${read.title})`);
    ok(read.h1 === 'Phase A, read through' && read.h1prov, 'opened: the heading is the read-through\'s, marked provisional');
    ok(read.caseName === 'Waiting lists', 'opened: the case name is at the top');
    ok(read.saved.some((t) => /^Started 14 September 2026$/.test(t)) && read.saved.some((t) => /^Saved to a file on \d+ \w+ \d{4}$/.test(t)), `opened: the start date and the date of saving are at the top (${JSON.stringify(read.saved)})`);
    ok(read.steps.map((s) => s.n).join(',') === want.steps.map((s) => s.n).join(','), `opened: the three steps in order (${read.steps.map((s) => s.n).join(',')})`);
    for (const w of want.steps) {
      const s = read.steps.find((x) => x.n === String(w.n));
      ok(s && s.h2 === `Step ${w.n}. ${w.title}`, `opened: Step ${w.n} has its number and title (${s && s.h2})`);
      ok(s && s.exercises.join(',') === w.exercises.join(','), `opened: Step ${w.n} holds every exercise in the book's order (${s && s.exercises.join(',')})`);
      ok(s && s.titles.every((t) => /^\d+ \S/.test(t)), `opened: Step ${w.n}'s exercises carry a title each`);
    }
    ok(read.steps[0].state === 'Passed, 16 September 2026' && read.steps[2].state === 'Passed, 30 September 2026', `opened: each step's state and the date it passed (${read.steps.map((s) => s.state).join(' | ')})`);
    ok(read.graphs === 3, `opened: the Step 3 graphs are inline SVG, the line, the two futures, and the other quantity (${read.graphs})`);
    ok(read.graphPaths === 5, `opened: five lines drawn across the three graphs (${read.graphPaths})`);
    ok(read.events.join(' | ') === '2015 Housing act amended | 2019 Building programme announced | 2022 Rent cap', `opened: the event strip under the line (${read.events.join(' | ')})`);
    ok(read.evidence === 3, `opened: the three evidence segments under the line (${read.evidence})`);
    ok(read.sketch === 1 && read.sketchThings === 7 && read.sketchConns === 3, `opened: the first drawing is drawn (${read.sketch} drawing, ${read.sketchThings} things, ${read.sketchConns} connectors)`);
    ok(read.sketchLabels.includes('Tenants <on the list>'), 'opened: the label reads as typed, not as markup');
    ok(read.img && read.img.startsWith('data:image/png'), 'opened: the photograph is embedded');
    ok(read.counts === '5 of 5 actors placed; 3 lines; 1 disagreement marks.', `opened: the second drawing as counts (${read.counts})`);
    ok(read.lines === 'Ministry of Housing to City council; Housing corporation to City council; Rent tribunal to City council', `opened: the second drawing as a list of lines (${read.lines})`);
    ok(read.arrangement === 1 && read.arrangementNodes === 5 && read.arrangementLines === 3 && read.arrangementMarks === 1, `opened: the second drawing is drawn too (${read.arrangementNodes} actors, ${read.arrangementLines} lines, ${read.arrangementMarks} marks)`);
    ok(read.last === want.carries && read.zones === want.zones, `opened: page 25 is last, with its ${want.zones} zones (${read.last})`);
    ok(read.zoneTexts[2].includes('Allocation and building of social housing') && read.zoneTexts[2].includes('Migration into the city'), 'opened: page 25 zone 3 holds the boundary sentence and the exclusion');
    ok(read.situation && read.situation.endsWith(PROBE), 'opened: the probe reads as text, not as markup');
    ok(read.bolds === 0, 'opened: no bold element made from the probe');
    ok(read.actorCells.includes('Tenants & co'), 'opened: the actor name reads as typed');
    ok(read.links === 0, 'opened: nothing in the file is a link');
    ok(read.fonts.length === 5, `opened: the five embedded faces are read by the browser (${read.fonts.join(', ')})`);

    // 3. Locally, the button hands the browser a download.
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('text=Save the read-through to a file')]);
    ok(/^read-through-\d{4}-\d{2}-\d{2}\.html$/.test(download.suggestedFilename()), `local: the download is named read-through-<date>.html (${download.suggestedFilename()})`);
    const saved = fs.readFileSync(await download.path(), 'utf8');
    ok(/^<!doctype html>/i.test(saved) && saved.includes('<main class="read">'), 'local: the download is the file');
    ok(!(await page.$('.savefile__notice')), 'local: no notice after a save');
    ok(errors.length === 0, `local: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 4. A partly done case builds too.
  {
    const { page, errors } = await open(browser, { state: partly() });
    const want = await expected(page);
    const f = await build(page);
    ok(!/<script\b/i.test(f.text), 'partly: no script in the file');
    const { read, errors: openErrors } = await opened(browser, f.text);
    ok(openErrors.length === 0, `partly: no page errors ${openErrors.length ? JSON.stringify(openErrors) : ''}`);
    ok(read.steps.map((s) => s.exercises.join(',')).join(' / ') === want.steps.map((s) => s.exercises.join(',')).join(' / '), 'partly: every exercise of every step is in the file');
    ok(read.steps.map((s) => s.state).join(' | ') === 'In progress | Empty | Empty', `partly: the states are the steps' own (${read.steps.map((s) => s.state).join(' | ')})`);
    ok(read.graphs === 0 && read.sketch === 0 && read.arrangement === 0, 'partly: nothing is drawn where nothing was drawn');
    ok(read.counts === '0 of 0 actors placed; 0 lines; 0 disagreement marks.', `partly: the second drawing's counts are still read (${read.counts})`);
    ok(read.zones === want.zones, 'partly: page 25 is in the file');
    ok(read.situation === 'Something is going on here in the city.', 'partly: the one answer written is in the file');
    ok(errors.length === 0, `partly: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    // The case view does not offer the file before Phase A is complete.
    await page.goto(`http://localhost:${server.address().port}/index.html#/`);
    await page.waitForTimeout(400);
    ok(!(await page.$('.caseview__file')), 'partly: the case view does not offer the file');
    await page.close();
  }

  // 5. In the artifact, the file goes through downloads.save, from the read-through
  //    and from the case view once Phase A is complete.
  {
    const { page, errors } = await open(browser, { page: 'artifact-test.html', state: SAMPLE, claude: { downloads: true } });
    await page.click('text=Save the read-through to a file');
    await sleep(800);
    let saves = await page.evaluate(() => window.__fake.saves);
    ok(saves.length === 1 && /^read-through-\d{4}-\d{2}-\d{2}\.html$/.test(saves[0].filename), `artifact: downloads.save called with a filename ending .html (${JSON.stringify(saves.map((s) => s.filename))})`);
    ok(saves[0].data && /^<!doctype html>/i.test(saves[0].data) && saves[0].data.includes('<main class="read">') && !/<script\b/i.test(saves[0].data), 'artifact: the data handed over is the file');
    ok(!(await page.$('.savefile__notice')), 'artifact: no notice after a save the viewer accepted');
    // The same page, moved to the case view: the earlier save stays counted.
    await page.goto(`http://localhost:${server.address().port}/artifact-test.html#/`);
    await page.waitForTimeout(500);
    ok(await page.$('.caseview__file'), 'artifact: the case view offers the file once Phase A is complete');
    const before = saves.length;
    await page.click('.caseview__file >> text=Save the read-through to a file');
    await sleep(800);
    saves = await page.evaluate(() => window.__fake.saves);
    ok(saves.length === before + 1 && saves[saves.length - 1].filename.endsWith('.html') && saves[saves.length - 1].data === saves[0].data, 'artifact: the case view\'s button saves the same file');
    ok(errors.length === 0, `artifact: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 6. A declined save shows a notice and does not throw; no downloads, another.
  {
    const { page, errors } = await open(browser, { page: 'artifact-test.html', state: SAMPLE, claude: { downloads: true, decline: true } });
    await page.click('text=Save the read-through to a file');
    await sleep(800);
    const notice = () => page.$eval('.read', (e) => e.innerText.replace(/\s+/g, ' '));
    ok(/The file was not saved\./.test(await notice()), 'declined: the notice shows beside the button');
    await page.click('.read >> text=Close the notice');
    ok(!/The file was not saved\./.test(await notice()), 'declined: the notice closes');
    ok(errors.length === 0, `declined: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
    const second = await open(browser, { page: 'artifact-test.html', state: SAMPLE, claude: { downloads: false } });
    await second.page.click('text=Save the read-through to a file');
    await sleep(800);
    ok(/Saving a file is not available in this view\./.test(await second.page.$eval('.read', (e) => e.innerText.replace(/\s+/g, ' '))), 'no downloads: the notice shows');
    ok(second.errors.length === 0, `no downloads: no console errors ${second.errors.length ? JSON.stringify(second.errors) : ''}`);
    await second.page.close();
  }

  // 7. Phone width: the read-through and the case view with the button, no sideways scroll.
  for (const hash of ['#/read', '#/']) {
    const { page, errors } = await open(browser, { state: SAMPLE, hash, viewport: { width: 400, height: 800 } });
    const w = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
    ok(w <= 400, `400px ${hash}: no horizontal scroll of the page (${w})`);
    ok(errors.length === 0, `400px ${hash}: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log(failures ? `${failures} failed` : 'all passed');
  process.exit(failures ? 1 : 0);
})();
