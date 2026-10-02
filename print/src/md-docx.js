// Markdown -> docx, in the house style used by the overview document.
// Handles headings, paragraphs, bold/italic/code, pipe tables, bullet and
// ordered lists, and blockquotes. Frontmatter is stripped.
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak,
} = require('docx');

const NAVY = '17345E';
const GREEN = '9EA700';
const GREY = '4E5C69';
const CREAM = 'F3F2EB';
const W = 9600;

// folder paths mean nothing on paper
const PATHS = [
  [/`core\/critical-checks\.md`/g, 'the critical checks'],
  [/`core\/open-questions\.md`/g, 'the outstanding decisions'],
  [/`core\/glossary\.md`/g, 'the glossary'],
  [/`core\/principles\.md`/g, 'the principles'],
  [/`core\/decisions\.md`/g, 'the register of settled decisions'],
  [/`sources\/sources\.md`/g, 'the sources list'],
  [/`design\/workbook\.md`/g, 'the workbook design note'],
  [/`courses\/advo4\/manual\.md`/g, 'the ADVO4 course manual'],
  [/`print\/src\/`/g, 'the print sources'],
  [/`print\/`/g, 'the print folder'],
  [/`steps\/0?(\d+)-[a-z-]+\/?`/g, 'Step $1'],
];

function inline(text) {
  PATHS.forEach(([re, to]) => { text = text.replace(re, to); });
  const runs = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0; let m;
  const push = (t, o) => { if (t) runs.push(new TextRun({ text: t, size: 21, ...o })); };
  while ((m = re.exec(text)) !== null) {
    push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) push(tok.slice(2, -2), { bold: true });
    else if (tok.startsWith('`')) push(tok.slice(1, -1), { font: 'Consolas', size: 19, color: GREY });
    else if (tok.startsWith('[')) push(tok.slice(1, tok.indexOf(']')), { color: NAVY });
    else push(tok.slice(1, -1), { italics: true });
    last = m.index + tok.length;
  }
  push(text.slice(last));
  return runs.length ? runs : [new TextRun({ text: '', size: 21 })];
}

const cellRuns = (text) => inline(text).map((r) => { r.constructor; return r; });

function tableCell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade, color: 'auto' } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [new Paragraph({
      spacing: { after: 0, line: 252 },
      children: inline(text).map((r) => new TextRun({
        ...r, // keep the parsed formatting
      })),
    })],
  });
}

// docx TextRun instances cannot be respread; rebuild from the raw text instead.
function cellParagraph(text, bold, color) {
  const runs = [];
  PATHS.forEach(([re, to]) => { text = text.replace(re, to); });
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0; let m;
  const push = (t, o = {}) => { if (t) runs.push(new TextRun({ text: t, size: 19, bold: bold || o.bold, color: color || o.color, italics: o.italics, font: o.font })); };
  while ((m = re.exec(text)) !== null) {
    push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) push(tok.slice(2, -2), { bold: true });
    else if (tok.startsWith('`')) push(tok.slice(1, -1), { font: 'Consolas', color: GREY });
    else push(tok.slice(1, -1), { italics: true });
    last = m.index + tok.length;
  }
  push(text.slice(last));
  if (!runs.length) push(' ');
  return new Paragraph({ spacing: { after: 0, line: 252 }, children: runs });
}

function makeTable(rows) {
  const header = rows[0];
  const body = rows.slice(2); // row 1 is the --- separator
  const n = header.length;
  const first = Math.min(2600, Math.max(1200, Math.round(W / n)));
  const widths = n === 2 ? [4300, 5300]
    : n === 3 ? [2200, 3700, 3700]
      : new Array(n).fill(Math.floor(W / n));
  const sum = widths.reduce((a, b) => a + b, 0);
  widths[widths.length - 1] += W - sum;
  return new Table({
    columnWidths: widths,
    width: { size: W, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'BDC2C7' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'BDC2C7' },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'D3D6D9' },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: header.map((t, i) => new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: CREAM, color: 'auto' },
          margins: { top: 70, bottom: 70, left: 110, right: 110 },
          children: [cellParagraph(t, true, NAVY)],
        })),
      }),
      ...body.map((r) => new TableRow({
        children: r.map((t, i) => new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          margins: { top: 70, bottom: 70, left: 110, right: 110 },
          children: [cellParagraph(t)],
        })),
      })),
    ],
  });
}

const HEAD_SIZE = { 1: 32, 2: 28, 3: 23, 4: 21 };
const HEAD_LEVEL = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4 };

function parse(md, opts = {}) {
  const out = [];
  const lines = md.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n');
  let i = 0;
  let skipping = false;
  while (i < lines.length) {
    const line = lines[i];

    const head = /^(#{1,4})\s+(.*)$/.exec(line);
    if (head) {
      const lvl = head[1].length + (opts.demote || 0);
      const title = head[2].trim();
      skipping = opts.skipSections && opts.skipSections.includes(title.toLowerCase());
      if (!skipping) {
        out.push(new Paragraph({
          heading: HEAD_LEVEL[Math.min(lvl, 4)],
          spacing: { before: lvl <= 2 ? 340 : 230, after: lvl <= 2 ? 160 : 90 },
          children: [new TextRun({ text: title, size: HEAD_SIZE[Math.min(lvl, 4)], bold: true, color: NAVY })],
        }));
      }
      i++; continue;
    }
    if (skipping) { i++; continue; }

    if (/^\s*$/.test(line)) { i++; continue; }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i].replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
        i++;
      }
      out.push(makeTable(rows));
      out.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: '', size: 2 })] }));
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(new Paragraph({
        spacing: { before: 120, after: 180, line: 276 },
        indent: { left: 340 },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: GREEN, space: 12 } },
        shading: { type: ShadingType.CLEAR, fill: CREAM, color: 'auto' },
        children: inline(buf.join(' ')),
      }));
      continue;
    }

    // a line opening with a bare year and a full stop is wrapped prose, not a list item
    const li = /^\s*\d{4}\.\s/.test(line) ? null : /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) {
      const ordered = /\d/.test(li[2]);
      let n = 0;
      while (i < lines.length) {
        const m2 = /^\s*\d{4}\.\s/.test(lines[i]) ? null : /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]);
        if (!m2) break;
        let text = m2[3];
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s/.test(lines[i])) {
          text += ' ' + lines[i].trim(); i++;
        }
        n++;
        out.push(new Paragraph({
          spacing: { after: 70, line: 264 },
          indent: { left: 340, hanging: 260 },
          children: [new TextRun({ text: ordered ? `${n}.  ` : '•  ', size: 21, color: NAVY, bold: true }), ...inline(text)],
        }));
      }
      out.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: '', size: 2 })] }));
      continue;
    }

    // paragraph: join wrapped lines
    let text = line;
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^[|>#]/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s/.test(lines[i])) {
      text += ' ' + lines[i].trim(); i++;
    }
    out.push(new Paragraph({ spacing: { after: 140, line: 276 }, children: inline(text) }));
  }
  return out;
}

module.exports = { parse, inline, makeTable, cellParagraph, NAVY, GREEN, GREY, CREAM, W, HEAD_LEVEL, HEAD_SIZE };
