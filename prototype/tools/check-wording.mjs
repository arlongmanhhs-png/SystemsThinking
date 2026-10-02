// Checks the participant-facing wording in the step definitions against the printed
// workbook, and every source file against the house rules in CLAUDE.md.
//
//   node tools/check-wording.mjs
//
// Each label, caption, hint, heading, criterion, and message in a definition is
// one of three things:
//   printed      found word for word on a workbook page (whitespace aside)
//   quoted       found word for word in a step's spec.md or description.md, and
//                the definition says which (`source`)
//   provisional  marked `provisional: true`: the screen's own words
// Anything else is reported as unaccounted for, which is a fault: either the words
// were changed from the page, or they need marking as provisional.
//
// The house rules: no em or en dashes anywhere in the source, and none of the
// words this project does not use in any string a participant can read.
//
// The screen files: every string the views mark as the screen's own, with the
// dialogs and the aria-labels and titles, has to be sorted into a tier in
// tools/wording-tiers.json (see below).
//
//   node tools/check-wording.mjs --screen   lists the screen strings found
//   node tools/check-wording.mjs --lines    refreshes the line numbers in the list

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const proto = join(here, '..');
const root = join(proto, '..');
const imp = (p) => import(pathToFileURL(join(proto, p)).href);

const { WORKBOOK } = await imp('src/definitions/workbook.js');
const { STEPS } = await imp('src/definitions/index.js');
const { LISTS } = await imp('src/definitions/lists.js');
const { PHASE_A } = await imp('src/definitions/phase-a.js');

const norm = (s) => String(s).replace(/\s+/g, ' ').replace(/[“”]/g, '"').trim();

function flat(x) {
  if (x == null) return '';
  if (typeof x === 'string') return x;
  if (Array.isArray(x)) return x.map(flat).join('');
  if (x.ref) return '';
  return flat(x.b || x.i || x.p || x.h || x.template || x.callout || x.opposite || '');
}

// Every printed string, as one searchable text per page.
const printed = [];
for (const p of Object.values(WORKBOOK.pages)) {
  const parts = [p.title, p.overline, flat(p.lead)];
  for (const b of p.blocks || []) {
    if (b.list) parts.push(...b.list.map(flat));
    else if (b.table) { if (b.table.head) parts.push(...b.table.head.map(flat)); for (const r of b.table.rows) parts.push(...r.map(flat)); }
    else parts.push(flat(b));
  }
  for (const z of p.zones || []) parts.push(z.label, z.title, ...z.hints, ...z.texts);
  parts.push(...(p.texts || []));
  for (const g of p.checks || []) parts.push(g.heading, ...g.criteria);
  for (const t of p.terms || []) parts.push(t.term, t.definition);
  printed.push(norm(parts.filter(Boolean).join(' ‖ ')));
}
const PRINTED = printed.join(' ‖ ');
// Short column heads printed as separate letters ("F O I") are extracted without spaces.
const inPrint = (s) => PRINTED.includes(norm(s)) || PRINTED.toLowerCase().includes(norm(s).toLowerCase())
  || (norm(s).length <= 8 && PRINTED.includes(norm(s).replace(/ /g, '')));

const specText = {};
function sourceText(rel) {
  if (!specText[rel]) specText[rel] = norm(readFileSync(join(root, rel), 'utf8').replace(/\*\*/g, ''));
  return specText[rel];
}

const rows = [];
function check(where, text, { provisional = false, source = null } = {}) {
  if (typeof text !== 'string' || !text.trim()) return;
  let status;
  if (inPrint(text)) status = 'printed';
  // A quoted fragment may end with a full stop the source's table cell does not have.
  else if (source && sourceText(source).includes(norm(text).replace(/\.$/, ''))) status = 'quoted';
  else if (provisional) status = 'provisional';
  else status = 'UNACCOUNTED';
  rows.push({ where, text, status, source, marked: !!provisional });
}

const specOf = (n) => `steps/${['01-framing', '02-boundary', '03-behaviour-over-time'][n - 1]}/spec.md`;

for (const def of STEPS) {
  const S = `Step ${def.number}`;
  check(`${S} title`, def.title, { source: 'core/process-overview.md' });
  check(`${S} purpose`, def.purpose);
  for (const ex of def.exercises) {
    const E = `${S}, Exercise ${ex.number}`;
    for (const k of ['label', 'title', 'hint']) check(`${E} ${k}`, ex[k]);
    if (ex.screenVariant) {
      check(`${E} screen variant label`, ex.screenVariant.label, { provisional: true });
      check(`${E} screen variant`, ex.screenVariant.hint, { provisional: true });
    }
    if (ex.layout) {
      for (const p of ex.layout.parts || []) if (typeof p === 'string' && p.trim() && !/^[,.\n]$/.test(p)) check(`${E} sentence form`, p);
      for (const k of ['between', 'noteHead']) check(`${E} ${k}`, ex.layout[k]);
      for (const h of ex.layout.head || []) check(`${E} head`, h);
    }
    if (ex.showBeside) check(`${E} beside`, ex.showBeside.label, { provisional: ex.showBeside.provisional });
    if (ex.showBeside && ex.showBeside.copy) {
      check(`${E} copy button`, ex.showBeside.copy.label);
      check(`${E} copy confirmation`, ex.showBeside.copy.replace, { provisional: true });
      check(`${E} copy done`, ex.showBeside.copy.done, { provisional: true });
    }
    for (const f of ex.fields) {
      const F = `${E} ${f.key}`;
      for (const k of ['label', 'caption', 'hint', 'callout']) check(`${F} ${k}`, f[k], { provisional: !!f.provisional && k === 'label' });
      check(`${F} maxText`, f.maxText, { source: f.maxSource });
      check(`${F} addLabel`, f.addLabel, { provisional: !!f.addProvisional });
      // The marks the first drawing offers, each in the words of the printed instruction.
      for (const m of f.marks || []) check(`${F} mark ${m.key}`, m.label);
      if (f.layout) { check(`${F} before`, f.layout.before); check(`${F} after`, f.layout.after); }
      for (const c of f.columns || []) {
        check(`${F}.${c.key} head`, c.head, { provisional: !!c.provisional });
        check(`${F}.${c.key} hint`, c.hint);
        if (c.label) check(`${F}.${c.key} label`, c.label, { provisional: !!c.provisional });
        if (c.rowLabel) for (const n of [2, 3, 4, 5]) for (let i = 0; i < n; i++) check(`${F}.${c.key} row label`, c.rowLabel(i, n));
      }
    }
    for (const c of ex.checks || []) {
      // A {word} the check fills in is read with the example the specification quotes.
      check(`${E} check ${c.id}`, c.fill ? String(c.text).replace(/\{word\}/g, 'subsidy') : c.text, { provisional: !!c.provisional, source: c.source || specOf(def.number) });
      if (c.offer) {
        check(`${E} check ${c.id} button`, c.offer.label, { provisional: !!c.offer.provisional, source: c.source || specOf(def.number) });
        check(`${E} check ${c.id} after the button`, c.offer.done, { provisional: !!c.offer.provisional, source: c.source || specOf(def.number) });
      }
    }
  }
  for (const c of def.criticalCheck) {
    check(`${S} critical check ${c.id}`, c.text);
    if (c.screenVariant) check(`${S} critical check ${c.id} screen variant`, c.screenVariant.text, { provisional: true });
  }
  if (def.returnsHeading) check(`${S} returns heading`, def.returnsHeading.text, { provisional: !!def.returnsHeading.provisional });
  for (const r of def.returnsOut || []) {
    check(`${S} return ${r.id}`, r.when, { source: 'process.yaml' });
    if (r.means) check(`${S} return ${r.id} means`, r.means);
  }
}
for (const [name, list] of Object.entries(LISTS)) {
  for (const o of list) {
    check(`list ${name}`, o.label, { provisional: !!o.provisional, source: 'steps/02-boundary/spec.md' });
    if (o.gloss) check(`list ${name} gloss`, o.gloss.replace(/"this line is an estimate"$/, '"this line is an estimate"'));
  }
}
for (const z of PHASE_A.zones) for (const f of z.fields || []) check(`Page 25 zone ${z.n} ${f.key}`, f.label, { provisional: !!f.provisional });

// House rules, over every source file.
const BANNED = [/\bgated?\b/i, /\bbears? on\b/i, /\bbear(s|ing)? (the|what)\b/i, /\bcashed\b/i, /\bstakeholders?\b/i];
const faults = [];
function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|css|html|md)$/.test(n)) {
      const lines = readFileSync(p, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (/[\u2013\u2014]/.test(line)) faults.push(`${p.slice(proto.length + 1)}:${i + 1}: em or en dash`);
        if (n === 'workbook.js') return; // the printed glossary names "Stakeholder" to say it is not used
        for (const re of BANNED) {
          if (re.test(line) && !/BANNED|does not use|not a word|never prints|Not used in this process/i.test(line)) faults.push(`${p.slice(proto.length + 1)}:${i + 1}: "${line.match(re)[0]}"`);
        }
      });
    }
  }
}
walk(join(proto, 'src'));
walk(join(proto, 'tools'));
for (const f of ['README.md', 'index.html', 'artifact.html']) {
  const lines = readFileSync(join(proto, f), 'utf8').split('\n');
  lines.forEach((l, i) => { if (/[\u2013\u2014]/.test(l)) faults.push(`${f}:${i + 1}: em or en dash`); });
}

// The screen's own wording in the screen files (decided 2 October 2026). Every string a
// view marks with Prov, every dialog, and every aria-label and title is listed in
// tools/wording-tiers.json in one of two tiers: "method", which says something about
// the participant's work and which Ashley approves one string at a time, and
// "controls", which the rule in CLAUDE.md covers ("Wording the screen's controls").
// The provisional strings of the definitions, counted above, are listed there too.
// A string found and not listed is unsorted, which is a fault; a listed string no
// longer found is stale, which is a fault too, so the list stays the screen's.
// A Prov whose whole content is one expression (${o.label}) shows a definition's
// string, which is checked above, or a literal the list names with "how": "literal".
function screenStrings() {
  const out = [];
  const dir = join(proto, 'src', 'views');
  for (const n of readdirSync(dir).filter((x) => x.endsWith('.js')).sort()) {
    const file = `src/views/${n}`;
    const src = readFileSync(join(dir, n), 'utf8');
    const lineAt = (i) => src.slice(0, i).split('\n').length;
    const open = /<\$\{Prov\}(?:\s+on=\$\{[^}]*\})?>/g;
    let m;
    while ((m = open.exec(src))) {
      const start = m.index + m[0].length;
      const end = src.indexOf('</${Prov}>', start);
      if (end < 0) continue;
      const text = norm(src.slice(start, end));
      // One expression with no words of its own in it shows a definition's string.
      out.push({ file, line: lineAt(m.index), text, how: /^\$\{[^'"`]*\}$/.test(text) ? 'passthrough' : 'marked' });
    }
    for (const [how, re] of [['dialog', /window\.(?:alert|confirm)\('((?:[^'\\]|\\.)*)'\)/g], ['attribute', /(?:aria-label|title|placeholder)="([^"$]+)"/g]]) {
      while ((m = re.exec(src))) out.push({ file, line: lineAt(m.index), text: norm(m[1]), how });
    }
  }
  return out;
}

const tierPath = join(here, 'wording-tiers.json');
const TIERS = JSON.parse(readFileSync(tierPath, 'utf8'));
const listed = TIERS.strings;
const key = (file, text) => `${file}\u0000${norm(text)}`;
const listedKeys = new Map(listed.map((s) => [key(s.file, s.text), s]));
const found = screenStrings();
const unsorted = [];
const seen = new Set();
for (const s of found) {
  if (s.how === 'passthrough') continue;
  const hit = listedKeys.get(key(s.file, s.text));
  if (hit) seen.add(hit);
  else unsorted.push(s);
}
// The definitions' strings marked provisional, by text, in any definition file. A
// string marked provisional that the loose match above also finds in print is listed
// too, because the screen still marks it as its own.
for (const r of rows.filter((x) => x.marked)) {
  const hits = listed.filter((s) => s.file.startsWith('src/definitions/') && norm(s.text) === norm(r.text));
  for (const h of hits) seen.add(h);
  if (!hits.length) unsorted.push({ file: 'src/definitions', line: 0, text: r.text, how: 'definition', where: r.where });
}
// Literals shown through a variable: listed by the text, found in the file.
for (const s of listed.filter((x) => x.how === 'literal')) {
  if (readFileSync(join(proto, s.file), 'utf8').includes(s.text)) seen.add(s);
}
const stale = listed.filter((s) => !seen.has(s));
for (const s of unsorted) faults.push(`${s.file}:${s.line}: screen string not sorted into a tier in tools/wording-tiers.json: "${s.text}"`);
for (const s of stale) faults.push(`tools/wording-tiers.json: listed and no longer found in ${s.file}: "${s.text}"`);
if (process.argv.includes('--screen')) {
  const defs = rows.filter((r) => r.marked).map((r) => ({ file: 'src/definitions', line: 0, text: r.text, how: 'definition', where: r.where }));
  console.log(JSON.stringify(found.filter((s) => s.how !== 'passthrough').concat(defs), null, 1));
}
if (process.argv.includes('--lines')) {
  // Refreshes the line numbers in the tier list from the files as they stand.
  for (const s of listed) {
    const f = found.find((x) => x.file === s.file && norm(x.text) === norm(s.text));
    if (f) s.line = f.line;
    else {
      const src = readFileSync(join(proto, s.file), 'utf8');
      const i = src.indexOf(s.text);
      if (i >= 0) s.line = src.slice(0, i).split('\n').length;
    }
  }
  writeFileSync(tierPath, `${JSON.stringify(TIERS, null, 1)}\n`);
}

const count = (s) => rows.filter((r) => r.status === s).length;
console.log(`Wording: ${rows.length} strings. printed ${count('printed')}, quoted ${count('quoted')}, provisional ${count('provisional')}, unaccounted ${count('UNACCOUNTED')}`);
for (const r of rows.filter((x) => x.status === 'UNACCOUNTED')) console.log(`  UNACCOUNTED  ${r.where}: "${r.text}"`);
if (process.argv.includes('--all')) for (const r of rows) console.log(`  ${r.status.padEnd(11)} ${r.where}: "${r.text}"${r.source && r.status === 'quoted' ? ` (${r.source})` : ''}`);
const tier = (t) => [...seen].filter((s) => s.tier === t).length;
console.log(`Screen's own wording: ${seen.size} strings sorted, method ${tier('method')}, controls ${tier('controls')}; unsorted ${unsorted.length}, stale ${stale.length}`);
console.log(`House rules: ${faults.length} fault${faults.length === 1 ? '' : 's'}`);
for (const f of faults) console.log(`  ${f}`);
process.exitCode = count('UNACCOUNTED') || faults.length ? 1 : 0;
