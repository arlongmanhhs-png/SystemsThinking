// Screen test for page references on screen (decided 2 October 2026): on screen
// there are no pages, so a printed "on page 10" names the Step and the Exercise, or
// the screen's own place, and the printed workbook keeps its page numbers.
// Checks: every step screen with every instruction passage open, the case view, the
// read-through, and the glossary show no "page <number>" apart from the sentences
// listed below, which are left for Ashley (core/open-questions.md); a sample of
// references reads as English ("Three other forms ... are in the Step 1
// instructions, under ..."; page 25's "Decided in Step 1, Exercise 6."; the Step 3
// table's "Step 1, Exercise 6, and rename the thing"); each is marked as the
// screen's own wording; each link still goes to its target; a glossary term's
// pop-up and the glossary's where-lines name the instructions, and a term set out
// on a page the screen does not show names nothing; and the file at the end of
// Phase A (ReadFile.js) holds no "page <number>" either.
// usage: node refs-test.js <prototype dir>
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

const KEY = 'systems-process.case.v1';
// A case that has passed all three critical checks, so every exercise and every
// passage shows; nothing marked as read, so every passage shows in full.
const SAMPLE = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-case.json'), 'utf8'));
SAMPLE.read = {};

// Sentences whose only job is about paper, left as printed until Ashley says how
// each reads on screen (core/open-questions.md, 2 October 2026). Neither is shown
// today (the first is on the working pages' margins, which the screen does not
// render; the second is on page 2, which the screen does not show); each is listed
// by its exact sentence so that the check stays honest if the screen ever shows it.
const LEFT_FOR_ASHLEY = [
  'More rows than these go on the notes pages, from page 26.',
  'Every step has an instruction page on the left and a working page on the right.',
];
const PAGE = /\bpages?\s+\d/i;
const strip = (text) => LEFT_FOR_ASHLEY.reduce((t, s) => t.split(s).join(''), text).replace(/\s+/g, ' ');
const pageHits = (text) => { const m = strip(text).match(new RegExp(`.{0,40}${PAGE.source}.{0,40}`, 'gi')); return m || []; };

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures++; };
async function open(browser, hash) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript((s) => { localStorage.setItem('systems-process.case.v1', JSON.stringify(s)); }, SAMPLE);
  await page.goto(`http://localhost:${server.address().port}/${hash}`);
  await page.waitForTimeout(900);
  return { page, errors };
}
const text = (page, sel) => page.$eval(sel, (e) => e.innerText.replace(/\s+/g, ' ').trim());
// Clicks a link and reports where the address went, then comes back.
async function follow(page, sel, hash) {
  await page.click(sel);
  await page.waitForTimeout(250);
  const went = await page.evaluate(() => location.hash);
  await page.goto(`http://localhost:${server.address().port}/${hash}`);
  await page.waitForTimeout(600);
  return went;
}

(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  // 1. No page number on any screen: the case view, the three step screens with every
  //    passage open, the read-through, and the glossary.
  for (const hash of ['#/', '#/step/1', '#/step/2', '#/step/3', '#/read', '#/glossary']) {
    const { page, errors } = await open(browser, hash);
    if (hash.startsWith('#/step/')) {
      const n = Number(hash.slice(-1));
      const want = await page.evaluate(async (k) => { const d = await import('/src/definitions/index.js'); return d.BUILT[k].passages.map((p) => p.page); }, n);
      const shown = await page.$$eval('article.passage--full', (els) => els.map((e) => e.id.replace('passage-', '')));
      ok(want.every((id) => shown.includes(id)), `${hash}: every instruction passage is open (${shown.join(', ')})`);
    }
    const hits = pageHits(await page.evaluate(() => document.body.innerText));
    ok(hits.length === 0, `${hash}: no "page <number>" on screen ${hits.length ? JSON.stringify(hits) : ''}`);
    ok(errors.length === 0, `${hash}: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 2. Step 1: "Three other forms" names the Step 1 instructions by their heading,
  //    marked as the screen's own, and the link opens that passage; the reverse
  //    reference on page 10 reads the same way.
  {
    const { page, errors } = await open(browser, '#/step/1');
    const p8 = await text(page, '#passage-s1instr');
    ok(p8.includes('Three other forms, and when each is needed, are in the Step 1 instructions, under "When too much and too little does not fit".'), `Step 1: "Three other forms" names the instructions by heading (${(p8.match(/Three other forms[^.]*\./) || [])[0]})`);
    ok(await page.$('#passage-s1instr .prov a.pgref'), 'Step 1: the reference is a link, marked as the screen\'s own wording');
    const p10 = await text(page, '#passage-s1ref');
    ok(p10.includes('The form in the Step 1 instructions, under "The problem definition", is the default, not the only one.'), `Step 1: page 10's reference back reads the same way (${(p10.match(/The form in[^.]*\./) || [])[0]})`);
    const went = await follow(page, '#passage-s1instr a.pgref', '#/step/1');
    ok(went === '#/step/1?passage=s1ref', `Step 1: the link opens the passage it names (${went})`);
    ok(errors.length === 0, `Step 1: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 3. Step 2: "from page 12" reads "from the Step 2 instructions, under ..."; a
  //    term's pop-up names the instructions where the term is set out.
  {
    const { page, errors } = await open(browser, '#/step/2');
    const p14 = await text(page, '#passage-s2instr2');
    ok(p14.includes('are the four admission tests from the Step 2 instructions, under "Four words this step uses precisely":'), `Step 2: "from page 12" reads from the instructions by heading (${(p14.match(/are the four admission tests[^:]*:/) || [])[0]})`);
    await page.click('#passage-s2instr1 .term__word >> nth=0');
    await page.waitForTimeout(200);
    const pop = await text(page, '#passage-s2instr1 .term__pop');
    ok(/^Actor /.test(pop) && pop.includes('In the Step 2 instructions, under "Four words this step uses precisely"'), `Step 2: the term pop-up names the instructions (${pop})`);
    ok(pageHits(pop).length === 0, 'Step 2: the pop-up shows no page number');
    ok(await page.$('#passage-s2instr1 .term__pop .prov a.pgref'), 'Step 2: the pop-up\'s place is a link, marked as the screen\'s own wording');
    ok(errors.length === 0, `Step 2: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 4. Step 3: "Step 1, page 11" reads "Step 1, Exercise 6" in the printed table and
  //    in the returns table built from the definition; "on page 11" in the system
  //    problem definition's passage reads "in Step 1, Exercise 6"; the link goes to
  //    Exercise 6.
  {
    const { page, errors } = await open(browser, '#/step/3');
    const p20 = await text(page, '#passage-s3instr');
    ok(p20.includes('Step 1, Exercise 6, and rename the thing. What was named is a condition or a judgement, not a quantity'), `Step 3: the table reads "Step 1, Exercise 6, and rename the thing" (${(p20.match(/Step 1, [^.]*rename the thing\./) || [])[0]})`);
    ok(p20.includes('Step 1, Exercise 6. The problem definition named a proxy') && p20.includes('Step 2, Exercise 2, and reopen the exclusions'), 'Step 3: the other two rows name their exercises');
    const returns = await text(page, '.returns');
    ok(returns.includes('Step 1, Exercise 6, and rename the thing') && !PAGE.test(returns), `Step 3: the returns table names the exercise, not the page (${returns.slice(0, 120)})`);
    ok(await page.$('.returns .returnlink .prov'), 'Step 3: the returns table\'s exercise is marked as the screen\'s own wording');
    const p22 = await text(page, '#passage-s3ref');
    ok(p22.includes('It is a different sentence from the problem definition in Step 1, Exercise 6: that one says what is wrong'), `Step 3: page 22's reference reads "in Step 1, Exercise 6" (${(p22.match(/It is a different sentence[^:]*:/) || [])[0]})`);
    const went = await follow(page, '#passage-s3instr table a.pgref >> nth=0', '#/step/3');
    ok(went === '#/step/1/ex/6', `Step 3: the table's link goes to Step 1, Exercise 6 (${went})`);
    ok(errors.length === 0, `Step 3: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 5. The case view: page 25's "Decided on page" rows name the exact exercise each
  //    belongs to, two pages named together read as two exercises, and each link
  //    goes to its exercise.
  {
    const { page, errors } = await open(browser, '#/');
    const hints = await page.$$eval('.carry__zone > .carry__content > .es-hint', (els) => els.map((e) => e.innerText.replace(/\s+/g, ' ').trim()));
    const want = [
      'Decided in Step 1, Exercise 6.',
      'Decided in Step 1, Exercises 4 and 5.',
      'Decided in Step 2, Exercise 2.',
      'Decided in Step 2, Exercises 3 and 6. Each layer keeps its row from Step 2, Exercise 3.',
      'Decided in Step 2, Exercise 8. Name the actor holding each.',
      'Written in Step 2, Exercise 11.',
      'Written in Step 3, Exercises 5 and 6.',
    ];
    want.forEach((w, i) => ok(hints[i] === w, `case view: zone ${i + 1} reads "${w}" (${hints[i]})`));
    ok((await page.$$('.carry__zone .es-hint .prov a.pgref')).length >= 9, 'case view: every reference is a link, marked as the screen\'s own wording');
    ok(await follow(page, '.carry__zone >> nth=0 >> a.pgref', '#/') === '#/step/1/ex/6', 'case view: zone 1 links to Step 1, Exercise 6');
    ok(await follow(page, '.carry__zone >> nth=3 >> a.pgref >> nth=1', '#/') === '#/step/2/ex/6', 'case view: zone 4\'s second number links to Step 2, Exercise 6');
    ok(await follow(page, '.carry__zone >> nth=3 >> a.pgref >> nth=2', '#/') === '#/step/2/ex/3', 'case view: zone 4\'s "from Step 2, Exercise 3" links to Exercise 3');
    ok(errors.length === 0, `case view: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 6. The glossary: each where-line names the instructions, the critical checks name
  //    their place, a term set out on a page the screen does not show has no
  //    where-line, and the link opens the passage.
  {
    const { page, errors } = await open(browser, '#/glossary');
    const items = await page.$$eval('.glossary__item', (els) => els.map((e) => ({ term: e.querySelector('dt').innerText.trim(), where: (e.querySelector('.glossary__where') || {}).innerText || '' })));
    const where = (t) => (items.find((x) => x.term === t) || {}).where.replace(/\s+/g, ' ').trim();
    ok(where('Actor') === 'In the Step 2 instructions, under "Four words this step uses precisely"', `glossary: Actor (${where('Actor')})`);
    ok(where('Position') === 'In the Step 1 instructions, under "The five positions, and what each one changes"', `glossary: Position (${where('Position')})`);
    ok(where('Critical check') === 'In the critical check at the foot of each step', `glossary: Critical check (${where('Critical check')})`);
    ok(where('Desired change') === 'In the Step 1 instructions, "Define the problem"', `glossary: a term with no heading of its own names the passage by its title (${where('Desired change')})`);
    ok(where('System') === '', `glossary: System, set out on page 5, which the screen does not show, has no where-line (${where('System')})`);
    ok(items.every((x) => !PAGE.test(x.where)), 'glossary: no where-line shows a page number');
    ok(await follow(page, '.glossary__item:has(dt:text-is("Actor")) a.pgref', '#/glossary') === '#/step/2?passage=s2instr1', 'glossary: Actor links to the Step 2 passage');
    ok(errors.length === 0, `glossary: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  // 7. The file at the end of Phase A holds no page number.
  {
    const { page, errors } = await open(browser, '#/read');
    const html = await page.evaluate(async (k) => {
      const m = await import('/src/views/ReadFile.js');
      return m.readThroughHtml(JSON.parse(localStorage.getItem(k)));
    }, KEY);
    const body = html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
    const hits = pageHits(body);
    ok(hits.length === 0, `file: no "page <number>" in the read-through file ${hits.length ? JSON.stringify(hits) : ''}`);
    ok(errors.length === 0, `file: no console errors ${errors.length ? JSON.stringify(errors) : ''}`);
    await page.close();
  }

  await browser.close();
  server.close();
  console.log(failures ? `${failures} failed` : 'all passed');
  process.exit(failures ? 1 : 0);
})();
