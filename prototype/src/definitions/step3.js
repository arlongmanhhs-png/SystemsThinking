// Step 3: describe behaviour over time.
// Executable form of steps/03-behaviour-over-time/spec.md, in the order of workbook
// pages 20 to 23. Nothing on this step is open (settled 29 September 2026).


// The interval was retired as a field on 1 October 2026, so the line is read yearly.
function intervalStep() {
  return 1;
}

// The evidence segments have to tile the line from the first year to the last,
// with no unlabelled gap (Exercise 4). Returns the gaps, as pairs of years.
function evidenceGaps(ctx) {
  const from = Number(ctx.v('period_from'));
  const to = Number(ctx.v('period_to'));
  if (!from || !to || to <= from) return [];
  const segs = ctx.rows('evidence')
    .map((e) => ({ a: Number(e.range && e.range.from), b: Number(e.range && e.range.to) }))
    .filter((s) => s.a && s.b && s.b >= s.a)
    .sort((x, y) => x.a - y.a);
  // Years are read as whole years, as people write "the years it covers": 2012 to
  // 2018 followed by 2019 to 2024 leaves no gap.
  const step = intervalStep(ctx);
  const gaps = [];
  let reach = from;
  for (const s of segs) {
    if (s.a > reach + step + 1e-6) gaps.push([reach, s.a]);
    reach = Math.max(reach, s.b);
  }
  if (reach < to) gaps.push([reach, to]);
  return gaps;
}

export default {
  number: 3,
  phase: 'A',
  slug: 'behaviour-over-time',
  title: 'Describe behaviour over time',
  purpose: 'To show the pattern the system produces. This is the first step that looks at the case as something that has been happening rather than as something that is the case.',
  dependsOn: [1, 2],
  // steps/03-behaviour-over-time/spec.md: revising Step 3 marks every step its
  // carry-forward table sends an output to, and Step 4 (decided 2 October 2026).
  // None is built yet, so nothing is marked within Phase A.
  marksForReview: [4, 5, 6, 7, 9, 10, 11],

  // Page 22's guidance on labelling evidence serves Exercise 4 but is printed after
  // it, on the instruction page for Exercises 5 to 7, and the screen keeps the book's
  // order (decided 2 October 2026).
  passages: [
    { page: 's3instr', governs: [1, 2, 3, 4] },
    { page: 's3ref', governs: [5, 6, 7] },
  ],

  pages: [
    { page: 's3work1', exercises: [1, 2, 3, 4] },
    { page: 's3work2', exercises: [5, 6, 7] },
  ],

  derive: {
    interval_step: intervalStep,
    evidence_gaps: evidenceGaps,
    // The Step 1 problem form decides which measure is suggested, never imposed.
    form_route: (ctx) => ctx.at(1, 'problem_form') || null,
    system_problem_definition: (ctx) => {
      const k = ['spd_since', 'spd_quantity', 'spd_shape', 'spd_tried'].map((x) => ctx.v(x));
      if (k.every((x) => !x)) return '';
      const s = (x) => (x && String(x).trim()) || '___';
      return `Since ${s(k[0])}, ${s(k[1])} has ${s(k[2])}, and ${s(k[3])} has not changed it.`;
    },
  },

  // The commonest return in the whole process, shown on the Step 3 screen rather
  // than buried (design/platform-phase-a.md, section 8). Wording from page 20, whose
  // "Step 1, page 11" the screen shows as "Step 1, Exercise 6": `page` is the printed
  // page, and the screen names the exercise (decided 2 October 2026).
  returnsOut: [
    { id: 'to1_not_quantity', when: 'The line cannot be drawn, because the quantity does not move',
      means: 'What was named is a condition or a judgement, not a quantity',
      action: 'and rename the thing',
      to: { step: 1, fields: ['agreed_thing', 'agreed_direction'], exercise: 6, page: 's1work2' } },
    { id: 'to1_proxy', when: 'The line can be drawn, but it is not the problem',
      means: 'The problem definition named a proxy',
      to: { step: 1, fields: ['agreed_thing'], exercise: 6, page: 's1work2' } },
    { id: 'to2_outside', when: 'The period has to reach outside your boundary',
      action: 'and reopen the exclusions',
      to: { step: 2, fields: ['outside', 'layers'], exercise: 2, page: 's2work1' } },
  ],

  exercises: [
    {
      number: 1, page: 's3work1', where: 'screen',
      // The thing measured is copied from agreed_thing, in the agreed problem definition,
      // never from the first attempt. Renaming it in Step 1 marks this step for review.
      showBeside: { step: 1, derived: 'agreed_sentence', label: 'The problem definition, as agreed in Step 1', provisional: true },
      fields: [
        // Fixed by Step 1 and not editable here: changing it is a return to Step 1.
        { key: 'thing_measured', kind: 'derived', from: { step: 1, key: 'agreed_thing' },
          label: 'The thing measured, from the agreed problem definition', required: true, returnLink: 'to1_not_quantity' },
        { key: 'form_route', kind: 'derived', derive: 'form_route', display: 'form_route', hidden: (ctx) => !ctx.at(1, 'problem_form') || ctx.at(1, 'problem_form') === 'excess_deficit' },
        // SPEC: one printed line holds both; the specification has two keys.
        { key: 'measure', kind: 'line', label: 'How you are measuring it', required: true },
        { key: 'measure_because', kind: 'line', label: 'and why that measure', required: true },
        { key: 'nearest_quantity_because', kind: 'line', label: 'Not happened yet: why the quantity graphed is the nearest',
          required: (ctx) => ctx.at(1, 'problem_form') === 'not_yet' && ctx.v('no_nearest_quantity') !== true,
          showIf: (ctx) => ctx.at(1, 'problem_form') === 'not_yet' },
        // A case that cannot produce even a nearest quantity has no history, which is
        // surfaced as a finding at the critical check.
        { key: 'no_nearest_quantity', kind: 'confirm', label: 'No quantity with a history can be found.', provisional: true,
          required: false, finding: true,
          showIf: (ctx) => ctx.at(1, 'problem_form') === 'not_yet' },
        { key: 'period_start', kind: 'year', label: 'The period starts at', required: true, inline: true },
        { key: 'period_start_because', kind: 'line', label: 'because', required: true, inline: true },
      ],
    },
    {
      number: 2, page: 's3work1', where: 'screen',
      wide: true,
      fields: [
        { key: 'period_from', kind: 'year', label: 'From', required: true, inline: true },
        { key: 'period_to', kind: 'year', label: 'to', required: true, inline: true },
        // Pairs of time and value, placed on the grid or typed, as the specification
        // now says (decided 2 October 2026): there is no freehand line.
        { key: 'series', kind: 'series', label: 'The quantity above', required: true, min: 2,
          graph: { role: 'main' } },
      ],
      checks: [
        {
          id: 'period_order', severity: 'block',
          test: (ctx) => Number(ctx.v('period_from')) && Number(ctx.v('period_to')) && Number(ctx.v('period_to')) <= Number(ctx.v('period_from')),
          text: 'The second year comes after the first.',
          provisional: true,
        },
        {
          id: 'from_is_start', severity: 'warn',
          test: (ctx) => ctx.v('period_from') && ctx.v('period_start') && String(ctx.v('period_from')) !== String(ctx.v('period_start')),
          text: 'The line starts in a different year from the period in Exercise 1.',
          provisional: true,
          sendsTo: { exercise: 1 },
        },
      ],
    },
    {
      number: 3, page: 's3work1', where: 'screen',
      wide: true,
      fields: [
        { key: 'events', kind: 'table', min: 1, warnAbove: 6, addLabel: 'Add an event', addProvisional: true,
          graph: { role: 'events' },
          columns: [
            { key: 'year', kind: 'year', head: 'Year', provisional: true, required: true },
            { key: 'label', kind: 'line', head: 'What happened', provisional: true, required: true },
          ] },
        { key: 'events_total', kind: 'number', required: false,
          layout: { before: 'Six cells. If there were more,', after: 'in total, and these are the ones that mattered.' } },
      ],
      checks: [
        // The specification quotes the warning (decided 2 October 2026). The printed
        // line under the table ("Six cells", which names the paper) stays as printed.
        {
          id: 'seventh_event', severity: 'warn',
          test: (ctx) => ctx.rows('events').length > 6,
          text: 'Keep the six events that mattered, and write how many there were in total in the line below.',
        },
        {
          id: 'event_outside_period', severity: 'warn',
          test: (ctx) => {
            const a = Number(ctx.v('period_from'));
            const b = Number(ctx.v('period_to'));
            return !!(a && b) && ctx.rows('events').some((e) => Number(e.year) && (Number(e.year) < a || Number(e.year) > b));
          },
          signature: (ctx) => ctx.rows('events').map((e) => e.year).join(','),
          text: 'An event falls outside the years of the line, so it cannot be lined up under its year.',
          provisional: true,
          sendsTo: [{ exercise: 1 }, { exercise: 2 }],
        },
      ],
    },
    {
      number: 4, page: 's3work1', where: 'screen',
      wide: true,
      fields: [
        { key: 'evidence', kind: 'table', min: 1, addLabel: 'Mark a part of the line', addProvisional: true,
          graph: { role: 'evidence' },
          columns: [
            { key: 'kind', kind: 'choice', list: 'evidence_kinds', head: 'Kind', provisional: true, required: true },
            { key: 'range', kind: 'span', head: 'Years', provisional: true, required: true },
            { key: 'note', kind: 'block', rows: 2, head: 'What you write beside the line', required: true,
              hintFrom: { list: 'evidence_kinds', by: 'kind', field: 'gloss' } },
          ] },
      ],
      checks: [
        {
          id: 'unlabelled_gap', severity: 'block',
          test: (ctx) => evidenceGaps(ctx).length > 0,
          text: 'Mark each part of the line. An unlabelled mixture is the one thing that is not allowed.',
          detail: 'evidence_gaps',
        },
      ],
    },
    {
      number: 5, page: 's3work2', where: 'screen',
      fields: [
        { key: 'shape', kind: 'choice', list: 'shapes', required: true, gloss: true, graph: { role: 'thumb' } },
        { key: 'shape_because', kind: 'block', rows: 2, label: 'Why your graph is that shape.', required: true },
      ],
    },
    {
      number: 6, page: 's3work2', where: 'screen',
      layout: {
        type: 'statement',
        parts: [
          'Since', { key: 'spd_since' }, ',', { key: 'spd_quantity' }, 'has', { key: 'spd_shape' }, '\n',
          'and', { key: 'spd_tried' }, 'has not changed it.',
        ],
        assembled: 'system_problem_definition',
      },
      // Shown beside the Step 1 problem definition, so the participant can see the two
      // are not the same sentence.
      showBeside: { step: 1, derived: 'agreed_sentence', label: 'The problem definition, as agreed in Step 1', provisional: true },
      fields: [
        { key: 'spd_since', kind: 'line', caption: 'when the period starts', required: true },
        { key: 'spd_quantity', kind: 'line', caption: 'the quantity', required: true },
        { key: 'spd_shape', kind: 'line', caption: 'the shape', required: true },
        { key: 'spd_tried', kind: 'line', caption: 'what has been tried', required: true },
        { key: 'system_problem_definition', kind: 'derived', derive: 'system_problem_definition', hidden: true },
      ],
    },
    {
      number: 7, page: 's3work2', where: 'screen',
      wide: true,
      layout: { type: 'two-boxes', boxes: [['future_unchanged'], ['other_quantity_label', 'other_quantity_series']] },
      fields: [
        // Optional. Dotted lines on the same axes as the line in Exercise 2.
        { key: 'future_unchanged', kind: 'series', label: 'The same quantity', required: false,
          graph: { role: 'futures', pair: 'future_desired', dotted: true } },
        { key: 'future_desired', kind: 'series', required: false, hidden: true, graph: { role: 'futures-pair' } },
        // One further quantity, not two (settled 29 September 2026).
        { key: 'other_quantity_label', kind: 'line', label: 'Another quantity', required: false },
        { key: 'other_quantity_series', kind: 'series', required: false, graph: { role: 'other' } },
      ],
    },
  ],

  // Workbook page 24. Each sendsTo is the return the specification gives beside the
  // criterion (decided 2 October 2026): page 24 prints its page, and the screen names
  // the exercise, since on screen there are no pages (decided 2 October 2026).
  criticalCheck: [
    { id: 'c1', text: 'The quantity graphed measures the thing named in the agreed problem definition, and a line says which measure it is and why that one.',
      sendsTo: { exercise: 1 } },
    { id: 'c2', text: 'The period reaches back to the last major change in the system, or ten years, and a line says which.',
      sendsTo: { exercise: 1 } },
    { id: 'c3', text: 'The line carries its evidence, with each part marked measured, documented, or estimated.',
      sendsTo: { exercise: 4 } },
    { id: 'c4', text: 'What has been tried is on the event strip, with the years.', sendsTo: { exercise: 3 } },
    { id: 'c5', text: 'The shape is named, with a line saying why the graph is that shape.', sendsTo: { exercise: 5 } },
    { id: 'c6', text: 'The system problem definition is written, and it is not the agreed problem definition reworded.',
      sendsTo: { exercise: 6 } },
  ],

  carriesForward: [
    { output: 'The graph and its shape', goesTo: [5, 6], usedAs: 'What the mapping has to produce, and what the narrative has to account for' },
    { output: 'The system problem definition', goesTo: [5, 6, 9, 11], usedAs: 'The pattern Step 9 says will change, and Step 11 measures' },
    { output: 'The event strip', goesTo: [5, 7, 10], usedAs: 'First candidates for delays, what has already been tried, and what the plan is assuming about timing' },
    { output: 'The evidence and its kind', goesTo: [10, 11], usedAs: 'How much weight the plan can put on the baseline, and what an indicator can realistically be' },
    { output: 'The two futures, where drawn', goesTo: [9, 11], usedAs: 'The shape the hypothesis claims, and the gap the early signals read' },
  ],

  returnsIn: [
    { id: 'from5_structure', raisedAt: 5, when: 'The mapping cannot produce a structure that would make this shape', fields: ['shape', 'shape_because'] },
    { id: 'from6_narrative', raisedAt: 6, when: 'The narrative does not explain the pattern', fields: ['shape', 'series', 'spd_since', 'spd_quantity', 'spd_shape', 'spd_tried'] },
  ],
};

export { evidenceGaps, intervalStep };
