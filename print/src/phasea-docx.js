// Build the Phase A review document: the settled design of Steps 1, 2 and 3,
// plus the decisions still open for the phase.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak,
} = require('docx');
const md = require('./md-docx');

const { NAVY, GREEN, GREY, CREAM, W } = md;
const SRC = '/mnt/user-data/uploads/3. Advocacy Influencing Multi-Level Governance/Systems Thinking/systems-process/steps';

const rule = () => new Paragraph({
  spacing: { before: 60, after: 240 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GREEN } },
  children: [new TextRun({ text: '', size: 2 })],
});

const p = (runs, after = 140) => new Paragraph({
  spacing: { after, line: 276 },
  children: runs.map((r) => new TextRun({ size: 21, ...r })),
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 0, after: 160 },
  children: [new TextRun({ text, size: 32, bold: true, color: NAVY })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 340, after: 160 },
  children: [new TextRun({ text, size: 28, bold: true, color: NAVY })],
});

function decisionTable(rows, lastHeader, blankLast) {
  const widths = [900, 5200, 3500];
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
        children: ['Raised', 'The question', lastHeader].map((t, i) => new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: CREAM, color: 'auto' },
          margins: { top: 70, bottom: 70, left: 110, right: 110 },
          children: [md.cellParagraph(t, true, NAVY)],
        })),
      }),
      ...rows.map((r) => new TableRow({
        children: r.map((t, i) => new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          shading: blankLast && i === 2 ? { type: ShadingType.CLEAR, fill: 'FBFBF8', color: 'auto' } : undefined,
          margins: { top: 70, bottom: 70, left: 110, right: 110 },
          children: [md.cellParagraph(t)],
        })),
      })),
    ],
  });
}

const waiting = [
  ['28 Sep', 'Step 2: does Step 2 keep a carry-forward of its own, or is the Phase A summary on page 25 of the workbook the only record?', ''],
  ['28 Sep', 'Step 2: does 90 minutes in class fit the ADVO4 timetable? If it does not, the cut is the second pass at the sketch, moved to homework, rather than any part of the structured work', ''],
  ['28 Sep', 'Step 2: is a second colour of sticky note the right way to mark the sketch’s second pass?', ''],
  ['28 Sep', 'Step 1 (parked): which edition is the physical copy of Bardach on your shelf, and does the deficit and excess wording hold there? The literature folder holds the fourth edition of 2012, which is what the step files cite', ''],
];

const later = [
  ['29 Sep', 'Whether eight rows inside and outside, four description rows, and six dependency rows are rules or simply what fitted on the page', 'The prototype, where each becomes an explicit rule or an explicit absence of one'],
  ['28 Sep', 'Step 2: is power recorded as attributes on actors, as variables in the mapping, or both?', 'Steps 5 and 7, when they are written'],
  ['28 Sep', 'Step 1: the functional specification for Step 1 was written before the workbook became the paper form, so it describes a screen built around loose sheets', 'Checking it once the whole workbook is written'],
];

const steps = [
  ['Step 1. Define the problem, the desired change, and your position', `${SRC}/01-framing/description.md`],
  ['Step 2. Set the boundary and the perspectives', `${SRC}/02-boundary/description.md`],
  ['Step 3. Describe behaviour over time', `${SRC}/03-behaviour-over-time/description.md`],
];

const children = [
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: 'A SYSTEMS THINKING PROCESS FOR POLICY AND INTERVENTION DESIGN', size: 17, bold: true, color: GREY, characterSpacing: 30 })],
  }),
  new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: 'Phase A. Frame', size: 40, bold: true, color: NAVY })],
  }),
  new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text: 'The design of Steps 1, 2, and 3', size: 26, color: GREEN, bold: true })],
  }),
  rule(),
  p([{ text: 'As at 29 September 2026. ', bold: true },
    { text: 'This is the review copy of Phase A: what each of the three steps is for, what the participant does and in what order, the terms each step fixes, its critical check, and what it hands to the steps that follow. It is the settled design, so it leaves out the reasoning and the alternatives considered, which are in the working document, and it leaves out the page layout, which is in the workbook. The decisions still open for this phase are at the end.' }]),
  p([{ text: 'Phase A turns a topic into a system with edges. Step 1 fixes what is being analysed and who the participant is in relation to it. Step 2 decides what is inside the system and whose views count. Step 3 shows the pattern the system produces, which is the thing every later step is answerable to.', italics: true, color: GREY }], 240),
];

steps.forEach(([title, file], idx) => {
  if (idx > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(h1(title));
  const body = fs.readFileSync(file, 'utf8')
    .replace(/^#\s+.*$/m, '')          // the file's own H1 is replaced by the heading above
    .replace(/^\*\*Not yet written\.\*\*[\s\S]*?\n\n/m, '');
  children.push(...md.parse(body, { demote: 1, skipSections: ['open'] }));
});

children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1('Outstanding decisions for Phase A'));
children.push(p([{ text: 'Nothing here is settled. The first table is what is waiting on you, and the column on the right is for writing in. The second settles itself as later steps are written.' }]));
children.push(h2('Waiting on you'));
children.push(decisionTable(waiting, 'Your decision', true));
children.push(new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: '', size: 2 })] }));
children.push(h2('Settles as the work proceeds'));
children.push(decisionTable(later, 'What would settle it', false));

const doc = new Document({
  styles: { default: { document: { run: { font: 'Calibri', size: 21, color: '223343' } } } },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2] || 'out/Phase_A_design.docx', buf);
  console.log('written');
});
