const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak,
} = require('docx');
const fs = require('fs');

const NAVY = '17345E';
const GREEN = '9EA700';
const GREY = '4E5C69';
const CREAM = 'F3F2EB';
const W = 9600;

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, line: 276 },
  ...opts.paraOpts,
  children: [new TextRun({ text, size: opts.size ?? 21, color: opts.color, bold: opts.bold, italics: opts.italics })],
});

const rich = (runs, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, line: 276 },
  children: runs.map((r) => new TextRun({ size: 21, ...r })),
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 180 },
  children: [new TextRun({ text, size: 32, bold: true, color: NAVY })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 100 },
  children: [new TextRun({ text, size: 24, bold: true, color: NAVY })],
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 80 },
  children: [new TextRun({ text, size: 22, bold: true, color: NAVY })],
});

const cell = (text, width, opts = {}) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade, color: 'auto' } : undefined,
  margins: { top: 70, bottom: 70, left: 110, right: 110 },
  children: (Array.isArray(text) ? text : [text]).map((t) => new Paragraph({
    spacing: { after: 0, line: 252 },
    children: [new TextRun({ text: t, size: 19, bold: opts.bold, color: opts.color })],
  })),
});

const table = (widths, header, rows, opts = {}) => new Table({
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
      children: header.map((t, i) => cell(t, widths[i], { bold: true, color: NAVY, shade: CREAM })),
    }),
    ...rows.map((r) => new TableRow({
      children: r.map((t, i) => cell(t, widths[i], opts.shadeLast && i === r.length - 1 ? { shade: 'FBFBF8' } : {})),
    })),
  ],
});

const rule = () => new Paragraph({
  spacing: { before: 60, after: 240 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: GREEN } },
  children: [new TextRun({ text: '', size: 2 })],
});

// ---------------------------------------------------------------- content
const steps = [
  ['1', 'A. Frame', 'Define the problem, the desired change, and your position', 'Problem definition, desired change, the participant’s position'],
  ['2', 'A. Frame', 'Set the boundary and the perspectives', 'Boundary statement, layer scheme, actor types, actor list with what each holds, situation sketch'],
  ['3', 'A. Frame', 'Describe behaviour over time', 'Behaviour over time graph with its shape named, system problem definition'],
  ['4', 'B. Understand', 'Identify enablers and inhibitors', 'Grouped factors, named as variables and typed as stocks or flows'],
  ['5', 'B. Understand', 'Map the causal structure', 'Causal loop diagram with polarities, loops, delays, stocks, and control markers'],
  ['6', 'B. Understand', 'Analyse the mapping and write its narrative', 'Named loops, system traps, mental models, narrative'],
  ['7', 'C. Choose', 'Identify leverage', 'Candidate leverage points, ranked by type'],
  ['8', 'C. Choose', 'Weigh consequences and interests', 'Consequence and interests grid per candidate, choice with justification'],
  ['9', 'C. Choose', 'State the intervention hypothesis', 'IF / THEN / BECAUSE statement'],
  ['10', 'D. Test and plan', 'Test the hypothesis', 'Stock and flow sketch where relevant, theory of change with assumptions'],
  ['11', 'D. Test and plan', 'Plan monitoring and learning', 'Indicators, signals of change, review points'],
  ['12', 'E. Apply', 'Apply the analysis', 'Acting for an organisation: target actor, layer, arena, instrument, ask. Advising: options with a recommendation. Deciding: a decision. Outside: findings'],
  ['13', 'E. Apply', 'Communicate to audiences', 'Message per audience'],
];

const deps = [
  ['1. Problem, desired change, position', 'Nothing; this is the first step'],
  ['2. Boundary, perspectives, power', '1'],
  ['3. Behaviour over time', '1, 2'],
  ['4. Enablers and inhibitors', '1, 2, 3'],
  ['5. Causal structure', '3, 4'],
  ['6. Analysis and narrative', '3, 5'],
  ['7. Leverage', '2, 5, 6'],
  ['8. Consequences and interests', '2, 6, 7'],
  ['9. Hypothesis', '3, 6, 8'],
  ['10. Test', '5, 9'],
  ['11. Monitoring', '3, 10'],
  ['12. Target and ask', '1, 2, 7, 8'],
  ['13. Communication', '2, 6, 9, 12'],
];

const triggers = [
  ['The line in Step 3 cannot be drawn, because the thing named does not move', 'Step 1, to rename the thing'],
  ['The period in Step 3 has to reach outside the boundary', 'Step 2, to reopen the exclusions'],
  ['The narrative in Step 6 does not explain the pattern from Step 3', 'Step 5, or Step 3 if the pattern itself was wrong'],
  ['No leverage candidate in Step 7 reaches beyond parameters', 'Step 5 or 6'],
  ['The consequences in Step 8 are judged unacceptable for every candidate', 'Step 7'],
  ['An assumption in Step 10 is rated weak', 'Step 5 or 7'],
  ['No indicator can be found in Step 11 for an outcome', 'Step 10'],
];

const levels = [
  ['Core', 'What any systems analysis needs, whoever is doing it and from whatever position', 'Setting the boundary, mapping feedback loops'],
  ['Position framing', 'How the participant’s position frames the analysis: which questions are asked, what counts as relevant, and what the last steps deliver', 'Acting for an organisation: turning a leverage point into a target actor, arena, instrument, and ask'],
  ['Setting', 'How one course or workshop runs the process', 'ADVO4: critical checks are self-assessed, not approved by a lecturer'],
];

const principles = [
  ['1. Two questions at every design decision', 'Every element is asked: is this only for this course, or can it be used as a tool in other situations? Anything that makes sense only in one setting goes in that setting’s folder, never in the core.'],
  ['2. Three levels', null],
  ['3. Position frames the output; there is no purpose field', 'The process is for policy and intervention design: how to alleviate, solve, or prevent a social or organisational challenge. Understanding, advising, and influencing are not different processes but different positions in the same one, and position is already asked in Step 1. It decides what the last steps deliver: an ask, options with a recommendation, a decision, or findings. An evaluative version, where the intervention already exists and Steps 7 to 9 are given rather than chosen, is noted as a possible later project and is deliberately not built now.'],
  ['4. Every step has a critical check, and the check is part of the step', 'Not a separate review stage, and not approved by anyone else. The participant checks their own work against the critical check criteria, which are stated in plain words.'],
  ['5. Forwards is checked, backwards is free', 'A step opens when the one before it is complete. Going back needs no permission at any point, and no work is destroyed by going back.'],
  ['6. Every criterion that can fail has a return address', 'If a critical check criterion, or any other check, can be answered “no”, the process says which step that sends the participant back to. A dead end is a design fault.'],
  ['7. Recheck, do not redo', 'Revising an earlier step marks the steps that depend on it for review. It does not erase them. Reviewing and deciding nothing has to change is a valid outcome and is recorded as one.'],
  ['8. One thing at a time', 'A participant is asked one question at a time, and material is shown when it is needed rather than laid out in advance. The systems thinking literature fails learners by presenting whole toolkits at once.'],
  ['9. Simple first, complexity earned', 'Defaults are the simple form: caps on how much is asked for, one round before another is offered, nesting rather than a longer page. Complexity appears when the case has earned it, not because the tool can produce it.'],
  ['10. Sequential to learn, iterative to use', 'The steps are taught in order because that is how the logic is learned. In use the process is iterative, and the tool supports moving between steps without punishing it.'],
  ['11. Power is part of understanding the system', 'Power is not an advocacy extra. It enters in Step 2 (the seven resources recorded for every actor, and who needs each resource from the actors the dependency question applies to) and again in Step 7, and it is shown in the mapping itself through control markers on variables and links.'],
  ['12. The participant defines the structure; the tool constrains only its form', 'Layers and actor types are defined by the participant for their own case. Layers are ordered by scope of decision alone, never relative to the participant. The tool requires only that every actor sits in one layer and carries one type.'],
  ['13. Paper and platform are one instrument, in two settings', 'The printed page and the screen use the same zones, the same order, and the same wording. A participant who fills the page in a room must recognise the screen. They are not used in the same place: the workbook is the group instrument, worked by a group together in a room, and the large sheet and the drawing spread are theirs; the platform is for one person working one case alone, with no shared sessions, no collaborative editing, no group accounts, and no online workshop.'],
  ['14. Nothing is scored automatically', 'The tool checks that a field is filled, a choice is made, a source is given. It never judges whether an answer is good. Quality is judged by people, and a participant may pass a critical check with a weak answer: later steps expose it.'],
];

const waiting = [
  ['28 Sep', 'Step 2: does Step 2 keep a carry-forward of its own, or is the Phase A summary on page 25 of the workbook the only record?', ''],
  ['28 Sep', 'Step 2: does 90 minutes in class fit the ADVO4 timetable? If it does not, the cut is the second pass at the sketch, moved to homework, rather than any part of the structured work', ''],
  ['28 Sep', 'Step 2: is a second colour of sticky note the right way to mark the sketch’s second pass?', ''],
  ['28 Sep', 'Which edition is the physical copy of Bardach on your shelf, and does the deficit and excess wording hold there? The literature folder holds the fourth edition of 2012, which is what the step files cite', ''],
];

const later = [
  ['28 Sep', 'Is power recorded as attributes on actors, as variables in the mapping, or both?', 'Steps 5 and 7, when they are written'],
  ['28 Sep', 'The functional specification for Step 1 was written before the workbook became the paper form, so it describes a screen built around loose sheets', 'Checking it once the whole workbook is written'],
  ['28 Sep', 'The working definitions of “relevant ethical frameworks” and “professional codes” for Step 8 are not written', 'Writing Step 8'],
  ['28 Sep', 'The extended leverage hypothesis in session 4 of the Empower SDGs material is not traceable to a citable source. It resembles The Omidyar Group’s Systems practice workbook, but the wording is unconfirmed', 'Finding the source, or dropping the claim'],
  ['28 Sep', 'The tool has no name, and there is no candidate yet. Until there is, nothing in the interface carries a product name and no file is named after one', 'A name, when one suggests itself'],
  ['28 Sep', 'Which elements of the Systems Workbook app to carry over (the canvas, the step tiles, the naming nudges, the loop badges)', 'Marking them up when the screens are written, not before'],
  ['25 Sep', 'Steps 4 to 13 have no description and no workbook pages yet', 'Writing them, phase by phase, in the working document first and then into the workbook'],
];

const noted = [
  ['28 Sep', 'An evaluative version of the platform, for an intervention that already exists, is out of scope. It is recorded so that it is a decision rather than an oversight', 'A later project, if it is wanted'],
];

// ---------------------------------------------------------------- document
const children = [
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: 'A SYSTEMS THINKING PROCESS FOR POLICY AND INTERVENTION DESIGN', size: 17, bold: true, color: GREY, characterSpacing: 30 })],
  }),
  new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text: 'The steps, the rules, and what is still open', size: 40, bold: true, color: NAVY })],
  }),
  rule(),
  rich([{ text: 'As at 29 September 2026. ' , bold: true },
    { text: 'This is the review copy: the thirteen steps and what each produces, the rules the process obeys, and the decisions still waiting. It deliberately leaves out the reasoning, the literature, and the alternatives considered, which are in the working document, and the detail of how each step runs, which is in the workbook. The register of decisions already settled is a separate list and is not reproduced here.' }]),
  rich([{ text: 'Steps 1, 2, and 3 are written in full. Steps 4 to 13 are recorded here at the level of what they are for and what they produce, and their detail is still to be written.' , italics: true, color: GREY }], { after: 240 }),

  h1('The process'),
  p('Thirteen steps in five phases. Seven of the thirteen come from the Empower SDGs programme; the rest close gaps in it.'),
  table([600, 1700, 3500, 3800],
    ['#', 'Phase', 'Step', 'What it produces'], steps),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: '', size: 2 })] }),

  h2('The five phases'),
  rich([{ text: 'A. Frame (1 to 3). ', bold: true }, { text: 'What the analysis is about, where its edges are, and what pattern it has to explain.' }]),
  rich([{ text: 'B. Understand (4 to 6). ', bold: true }, { text: 'What holds the pattern in place, drawn and then explained.' }]),
  rich([{ text: 'C. Choose (7 to 9). ', bold: true }, { text: 'Where to intervene, at what cost to whom, stated as a testable hypothesis.' }]),
  rich([{ text: 'D. Test and plan (10 and 11). ', bold: true }, { text: 'Whether the hypothesis survives being made explicit, and how anyone would know it is working.' }]),
  rich([{ text: 'E. Apply (12 and 13). ', bold: true }, { text: 'What the participant’s position requires from all of it, and how it is told to the people who have to act.' }], { after: 200 }),

  h2('How the steps hold together'),
  h3('What a critical check is'),
  p('A critical check is the last part of a step, not a stage between steps. It states in plain words what the step had to produce, and the participant ticks each criterion themselves. There is no peer review, no facilitator, and no lecturer approval anywhere in the process.'),
  p('A critical check is met when the step’s required fields are present, and completeness is the only thing enforced mechanically. Quality is never judged by the tool. A participant can pass a critical check with a weak answer, which is intended: the criteria make the standard visible, and later steps expose an answer that does not hold.'),
  h3('Moving back and forth'),
  p('Forwards is checked. Backwards is free, from any step to any earlier step, without permission and without losing work. Revising a step marks every step that depends on it for review, and the marks say what changed and which answers should be looked at again. Reviewing and deciding that nothing has to change is a valid outcome and is recorded as one.'),
  h3('Which steps depend on which'),
  table([4800, 4800], ['Step', 'Uses the output of'], deps),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: '', size: 2 })] }),
  h3('Named return triggers'),
  p('Every criterion that can fail names where it sends the participant. These are the triggers that cross steps; triggers that reopen named fields inside a single step live in that step’s own specification.'),
  table([5800, 3800], ['Trigger', 'Sends the participant back to'], triggers),
  new Paragraph({ children: [new PageBreak()] }),

  h1('The rules the process obeys'),
  p('A build that cannot honour one of these stops and asks rather than working around it.'),
];

principles.forEach(([title, body]) => {
  children.push(h3(title));
  if (body) {
    children.push(p(body));
  } else {
    children.push(table([1600, 4200, 3800], ['Level', 'What it holds', 'Example'], levels));
    children.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: '', size: 2 })] }));
  }
});

children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1('Outstanding decisions'));
children.push(p('Nothing in this part is settled. The first table is what is waiting on you; the second settles itself as the work proceeds; the third is recorded so that it is a decision rather than an oversight.'));

children.push(h2('Waiting on you'));
children.push(table([900, 5200, 3500], ['Raised', 'The question', 'Your decision'], waiting, { shadeLast: true }));
children.push(new Paragraph({ spacing: { after: 220 }, children: [new TextRun({ text: '', size: 2 })] }));

children.push(h2('Settles as the work proceeds'));
children.push(table([900, 5200, 3500], ['Raised', 'The question', 'What would settle it'], later));
children.push(new Paragraph({ spacing: { after: 220 }, children: [new TextRun({ text: '', size: 2 })] }));

children.push(h2('Recorded deliberately, not awaiting an answer'));
children.push(table([900, 5200, 3500], ['Raised', 'What is recorded', 'What would reopen it'], noted));

const doc = new Document({
  styles: { default: { document: { run: { font: 'Calibri', size: 21, color: '223343' } } } },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(process.argv[2] || 'out/Systems_thinking_process_overview.docx', buf);
  console.log('written');
});
