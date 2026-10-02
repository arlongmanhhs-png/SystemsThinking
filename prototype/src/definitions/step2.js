// Step 2: set the boundary and the perspectives.
// Executable form of steps/02-boundary/spec.md, in the order of workbook pages 12
// to 19. Every key is the specification's, settled on 1 October 2026; a comment
// marked SPEC records where the screen departs from it.

const ARA = ['authority', 'responsibility', 'accountability'];

// The actors the dependency question is asked for (Exercise 7). Read off the
// allocation in Exercise 6, never chosen: any actor in a layer holding authority,
// responsibility, or accountability for a decision, plus anyone recorded as holding
// something those actors need.
// The second half cannot be derived from Exercises 5 and 6, which record what
// each actor holds but not what anyone needs. It is read from Exercise 7's own rows
// (a row whose "Who needs it" names a core actor brings its holder in), so it is
// established by what the participant writes there, as the specification says
// (decided 2 October 2026).
function dependencySubset(ctx) {
  const decisions = ctx.rows('decisions');
  const layers = new Set();
  for (const d of decisions) {
    for (const r of ARA) {
      if (d[r] && d[r] !== 'nobody' && ctx.row('layers', d[r])) layers.add(d[r]);
    }
  }
  const core = ctx.rows('actors').filter((a) => layers.has(a.layer)).map((a) => a.id);
  const coreSet = new Set(core);
  const holders = ctx.rows('dependencies')
    .filter((d) => d.needed_by && coreSet.has(d.needed_by) && d.actor && !coreSet.has(d.actor))
    .map((d) => d.actor);
  return { core, holders: [...new Set(holders)] };
}

// Which of the three patterns each decision shows (steps/02-boundary/description.md).
function araPattern(ctx) {
  return ctx.rows('decisions').map((d) => {
    const [a, r, c] = ARA.map((k) => d[k] || null);
    const out = [];
    if (!a || !r || !c) return { id: d.id, patterns: out };
    if (a !== 'nobody' && a === r && r === c) out.push('all_one');
    // SPEC: the three patterns do not cover authority or responsibility recorded as
    // nobody. Only a split between two named layers is reported as the second pattern.
    if (a !== 'nobody' && r !== 'nobody' && a !== r) out.push('authority_responsibility_apart');
    if (c === 'nobody' || (c !== a && c !== r)) out.push('accountability_elsewhere');
    return { id: d.id, patterns: out };
  });
}

function inSubset(ctx, id) {
  const { core, holders } = dependencySubset(ctx);
  return core.includes(id) || holders.includes(id);
}

// Descriptions of an actor's own, not marked as sharing another's line.
function ownDescriptions(ctx) {
  return ctx.rows('descriptions').filter((d) => !d.shares_with);
}

// Dependencies an actor in the core subset still lacks: one row per resource held.
function missingDependencies(ctx) {
  const { core } = dependencySubset(ctx);
  const rows = ctx.rows('dependencies');
  const missing = [];
  for (const id of core) {
    const actor = ctx.row('actors', id);
    if (!actor) continue;
    for (const res of actor.resources || []) {
      if (!rows.some((d) => d.actor === id && d.resource === res && (d.who_needs_it || '').trim())) {
        missing.push({ actor: id, resource: res });
      }
    }
  }
  return missing;
}

export default {
  number: 2,
  phase: 'A',
  slug: 'boundary',
  title: 'Set the boundary and the perspectives',
  purpose: 'To decide what is inside the system and what is left out, and whose views count. This is where the case stops being a topic and becomes a system with edges.',
  dependsOn: [1],
  // steps/02-boundary/spec.md: revising Step 2 marks every step its carry-forward
  // table sends an output to (decided 2 October 2026). Only built steps with
  // something in them are marked.
  marksForReview: [3, 4, 5, 6, 7, 8, 10, 12, 13],

  passages: [
    { page: 's2instr1', governs: [1, 2, 3, 4] },
    { page: 's2instr2', governs: [5] },
    { page: 's2instr3', governs: [6, 7, 8, 9] },
  ],

  pages: [
    { page: 's2work1', exercises: [1, 2, 3, 4] },
    { page: 's2work2', exercises: [5] },
    { page: 's2work3', exercises: [6, 7, 8, 9] },
    { page: 's2draw', exercises: [10] },
    { page: 's2draw2', exercises: [11] },
  ],

  derive: {
    dependency_subset: dependencySubset,
    ara_pattern: araPattern,
    missing_dependencies: missingDependencies,
    conflicting_pair_text: (ctx) => (ctx.v('conflicting_pair') || [])
      .map((id) => {
        const d = ctx.row('descriptions', id);
        if (!d) return '';
        const a = ctx.row('actors', d.actor);
        return `${a ? a.name : '___'}: ${d.reading || '___'}`;
      })
      .filter(Boolean)
      .join('\n'),
  },

  exercises: [
    {
      number: 1, page: 's2work1', where: 'sheet',
      // A screen variant (design/platform-phase-a.md, section 2). The printed
      // words name a large sheet, a book, and standing up at a table or a wall, none
      // of which the screen has. The printed form is kept beside the variant.
      screenVariant: {
        label: 'Exercise 1',
        hint: 'Put everything you know about this case onto one drawing. Pictures and symbols rather than sentences, phrases rather than paragraphs, and show who is in conflict with whom. Use marks for money, for conflict, for a blockage, and a question mark for what you do not know. Nothing on it has to be tidy.',
      },
      fields: [
        // A placeholder in this prototype (design/platform-phase-a.md, section 7).
        { key: 'sketch_first_canvas', kind: 'sketch', required: false },
        { key: 'sketch_first_image', kind: 'image', label: 'A photograph of the drawing', provisional: true, required: false },
        // SPEC: "Confirmation that the drawing exists", with no printed wording.
        { key: 'sketch_first_done', kind: 'confirm', label: 'The first drawing exists.', provisional: true, required: true },
      ],
    },
    {
      number: 2, page: 's2work1', where: 'screen',
      layout: { type: 'columns' },
      showBeside: { step: 1, derived: 'agreed_sentence', label: 'The problem definition, as agreed in Step 1', provisional: true },
      fields: [
        // Twelve inside rows and six outside entries are printed, each entry with a
        // "Because" line for its reason. No cap on screen for either.
        { key: 'inside', kind: 'table', label: 'Part of this system', min: 1, addLabel: 'Add a row', addProvisional: true,
          columns: [{ key: 'label', kind: 'line', required: true }] },
        { key: 'outside', kind: 'table', label: 'Next to it, but not part of it', min: 1, addLabel: 'Add a row', addProvisional: true,
          columns: [
            { key: 'label', kind: 'line', required: true },
            { key: 'mark', kind: 'choice', list: 'exclusion_marks', required: true, short: true, head: 'F O I' },
            { key: 'reason', kind: 'line', required: true, label: 'Because' },
          ] },
      ],
    },
    {
      number: 3, page: 's2work1', where: 'screen',
      // A screen variant (decided 2 October 2026). The printed rule puts the
      // narrowest layer on row 5 and the two-layer reason on row 3, rows the screen
      // does not have: on screen the rows are numbered as they are added, and the
      // two-layer reason is its own line, shown when there are two layers. The
      // wording awaits Ashley's approval, so it stays marked as the screen's own.
      screenVariant: {
        hint: 'Ordered by how far a decision reaches, widest scope of decision first and narrowest last. Three to five, and five is the limit. Two only if you write why this case has no third scope of decision.',
      },
      fields: [
        // Two to five, five a hard cap, and two only with a line saying why. Every
        // layer carries a reason, as every printed row now has a line for one.
        { key: 'layers', kind: 'table', min: 2, max: 5, ordered: true, numbered: true,
          addLabel: 'Add a layer', addProvisional: true,
          // On screen the two-layer line is its own field below the table, so only the
          // limit is repeated here.
          maxText: 'Three to five, and five is the limit.',
          columns: [
            { key: 'name', kind: 'line', required: true },
            { key: 'reason', kind: 'line',
              rowLabel: (i, n) => (i === 0 ? 'why this is the widest scope' : i === n - 1 ? 'why this is the narrowest scope' : 'why this scope sits here'),
              required: true },
          ] },
        { key: 'two_layers_because', kind: 'line', label: 'Why this case has no third scope of decision', provisional: true,
          showIf: (ctx) => ctx.rows('layers').length === 2,
          required: (ctx) => ctx.rows('layers').length === 2 },
      ],
    },
    {
      number: 4, page: 's2work1', where: 'screen',
      fields: [
        { key: 'actor_types', kind: 'table', min: 1, max: 5, lettered: true, addLabel: 'Add a type', addProvisional: true,
          maxText: 'At most five. As a guide, no more than one type per three actors.',
          suggestions: 'suggested_actor_types',
          columns: [{ key: 'label', kind: 'line', required: true }] },
      ],
      checks: [
        {
          id: 'type_ratio', severity: 'warn',
          test: (ctx) => {
            const n = ctx.rows('actors').length;
            const t = ctx.rows('actor_types').length;
            return n > 0 && t * 3 > n;
          },
          text: 'At most five. As a guide, no more than one type per three actors.',
        },
        // steps/02-boundary/spec.md: a type holding one actor is flagged from three
        // actors, and a type holding all the actors but one, or all of them, from six.
        {
          id: 'type_one_actor', severity: 'warn',
          test: (ctx) => ctx.rows('actors').length >= 3 && ctx.rows('actor_types').some((t) => ctx.rows('actors').filter((a) => a.type === t.id).length === 1),
          text: 'A type that ends up holding one actor is usually a name rather than a type, and belongs merged into another type.',
          source: 'steps/02-boundary/description.md',
        },
        {
          id: 'type_everything', severity: 'warn',
          test: (ctx) => {
            const actors = ctx.rows('actors');
            if (actors.length < 6) return false;
            return ctx.rows('actor_types').some((t) => actors.filter((a) => a.type === t.id).length >= actors.length - 1);
          },
          text: 'A type that holds almost everything is not doing any work, and should be divided into more types.',
          source: 'steps/02-boundary/description.md',
        },
      ],
    },
    {
      number: 5, page: 's2work2', where: 'screen',
      label: 'Exercise 5',
      title: 'The actors, and the resources each one holds',
      wide: true,
      fields: [
        // No hard cap: past twelve warns, and past fifteen warns again. Neither blocks,
        // so that this step's own return trigger, past fifteen actors, can be reached.
        { key: 'actors', kind: 'table', min: 1, warnAbove: 12, addLabel: 'Add an actor', addProvisional: true,
          maxText: 'About a dozen is the target. The fifteenth row is the limit: past it, check the granularity first and then the boundary.',
          columns: [
            { key: 'name', kind: 'line', head: 'Actor', required: true },
            { key: 'layer', kind: 'ref', of: 'layers', head: 'Layer', required: true },
            { key: 'type', kind: 'ref', of: 'actor_types', head: 'Type', required: true },
            // SPEC: "at least one ticked before the actor can be saved". A screen row
            // exists as soon as it is added, so the rule is enforced at the critical
            // check instead, and a row without a tick is never hidden.
            { key: 'admits', kind: 'choices', list: 'admission_tests', head: 'Admitted by', short: true, min: 1, required: true },
            { key: 'resources', kind: 'choices', list: 'resources', head: 'Resources held', short: true, required: false },
            { key: 'resource_note', kind: 'line', head: 'Note', provisional: true, required: false },
          ] },
      ],
      checks: [
        {
          id: 'past_twelve', severity: 'warn',
          test: (ctx) => ctx.rows('actors').length > 12 && ctx.rows('actors').length <= 15,
          text: 'About a dozen is the target. The fifteenth row is the limit: past it, check the granularity first and then the boundary.',
          sendsTo: [{ exercise: 5 }, { exercise: 2 }],
        },
        {
          id: 'past_fifteen', severity: 'warn',
          test: (ctx) => ctx.rows('actors').length > 15,
          text: 'About a dozen is the target. The fifteenth row is the limit: past it, check the granularity first and then the boundary.',
          sendsTo: [{ exercise: 5 }, { exercise: 2 }, { exercise: 3 }],
        },
        // steps/02-boundary/spec.md: flagged once there are at least three actors.
        {
          id: 'column_two', severity: 'warn',
          test: (ctx) => {
            const a = ctx.rows('actors');
            return a.length >= 3 && !a.some((x) => (x.admits || []).includes('2'));
          },
          text: 'Column 2 is the one to read back: if nothing is ticked down that column, the list has only the actors who act, and not those the system acts on.',
        },
      ],
    },
    {
      number: 6, page: 's2work3', where: 'screen',
      fields: [
        // The page has room for one decision; the second is recorded on screen only.
        { key: 'decisions', kind: 'table', min: 1, max: 2, addLabel: 'Add a second decision', addProvisional: true,
          maxText: 'If the case turns on more than one decision, do this for at most two, and say which.',
          maxSource: 'steps/02-boundary/description.md',
          layout: 'decision',
          columns: [
            { key: 'statement', kind: 'line', head: 'The decision the desired change depends on', required: true },
            { key: 'authority', kind: 'ref', of: 'layers', nobody: true, head: 'Authority', required: true },
            { key: 'responsibility', kind: 'ref', of: 'layers', nobody: true, head: 'Responsibility', required: true },
            { key: 'accountability', kind: 'ref', of: 'layers', nobody: true, head: 'Accountability', required: true },
            { key: 'authority_actor', kind: 'ref', of: 'actors', within: 'authority', required: false, provisional: true, head: 'which actor' },
            { key: 'responsibility_actor', kind: 'ref', of: 'actors', within: 'responsibility', required: false, provisional: true, head: 'which actor' },
            { key: 'accountability_actor', kind: 'ref', of: 'actors', within: 'accountability', required: false, provisional: true, head: 'which actor' },
          ] },
        { key: 'ara_pattern', kind: 'derived', derive: 'ara_pattern', display: 'ara' },
      ],
      checks: [
        {
          id: 'all_one_layer', severity: 'warn',
          test: (ctx) => araPattern(ctx).some((p) => p.patterns.includes('all_one')),
          text: 'A case where all three sit in one layer and the problem persists anyway is worth a second look at the boundary: the decision that matters may be outside the boundary.',
          source: 'steps/02-boundary/description.md',
          sendsTo: [{ exercise: 2 }, { exercise: 6 }],
        },
      ],
    },
    {
      number: 7, page: 's2work3', where: 'screen',
      subset: true,
      // When the allocation in Exercise 6 asks nothing of anyone, Exercise 7 is
      // rightly empty, and the exercises after it still appear.
      contentWhen: (ctx) => ctx.rows('decisions').length > 0 && missingDependencies(ctx).length === 0,
      // Twelve rows are printed. No cap on screen.
      // The actor column offers every actor rather than only the subset, because the
      // subset's second half is only known from these rows (specification, decided
      // 2 October 2026).
      fields: [
        // who_needs_it is free text, so a line drawn on the canvas in Exercise 10 has
        // nothing to be checked against. needed_by is the actor who needs the resource,
        // where that actor is on the list. The free text stays for "and for what", and
        // for anyone not on the list.
        { key: 'dependencies', kind: 'table', min: 0, addLabel: 'Add a row', addProvisional: true,
          columns: [
            { key: 'actor', kind: 'ref', of: 'actors', head: 'Actor', required: true },
            { key: 'resource', kind: 'choice', list: 'resources', head: 'Resource held', required: true, fromRow: { table: 'actors', ref: 'actor', key: 'resources' } },
            { key: 'needed_by', kind: 'ref', of: 'actors', head: 'Who needs it', provisional: true, required: false },
            // A blank row for an actor outside the subset is a state, not an omission.
            { key: 'who_needs_it', kind: 'line', head: 'Who needs it, and for what', required: (ctx, row) => inSubset(ctx, row.actor) },
          ] },
      ],
      checks: [
        {
          id: 'subset_rows', severity: 'block',
          test: (ctx) => missingDependencies(ctx).length > 0,
          text: 'For the actors the dependency question applies to, who needs each resource from them is recorded as well.',
          detail: 'missing_dependencies',
        },
      ],
    },
    {
      number: 8, page: 's2work3', where: 'screen',
      fields: [
        // Five rows are printed, the number the screen warns past.
        // An actor who reads the problem the way a recorded row does is marked as
        // sharing that line rather than given a line of their own, so a sharing row
        // asks for nothing else and does not count towards the two.
        { key: 'descriptions', kind: 'table', min: 0, addLabel: 'Add a description', addProvisional: true,
          columns: [
            { key: 'actor', kind: 'ref', of: 'actors', head: 'Actor', required: true },
            { key: 'reading', kind: 'line', head: 'What they take the problem to be', required: (ctx, row) => !row.shares_with, hideIf: (row) => !!row.shares_with },
            { key: 'status', kind: 'choice', list: 'evidence_status', head: 'Ev. / inf.', short: true, required: (ctx, row) => !row.shares_with, hideIf: (row) => !!row.shares_with },
            { key: 'read_from', kind: 'line', head: 'Read from what?', required: (ctx, row) => !row.shares_with, hideIf: (row) => !!row.shares_with },
            { key: 'shares_with', kind: 'ref', of: 'descriptions', self: false, head: 'Reads the problem as', provisional: true, required: false },
          ] },
        { key: 'conflicting_pair', kind: 'ref', of: 'descriptions', count: 2, required: true,
          label: 'the two descriptions from Exercise 8 that cannot both be acted on' },
      ],
      checks: [
        {
          id: 'two_own', severity: 'block',
          test: (ctx) => ownDescriptions(ctx).length < 2,
          text: 'At least two descriptions of the problem are recorded',
        },
        {
          id: 'past_five', severity: 'warn',
          test: (ctx) => ownDescriptions(ctx).length > 5,
          text: 'Five descriptions is plenty; past five the exercise becomes a survey rather than an analysis.',
          source: 'steps/02-boundary/spec.md',
        },
        {
          id: 'pair_distinct', severity: 'block',
          test: (ctx) => {
            const p = ctx.v('conflicting_pair') || [];
            return p.length === 2 && p[0] === p[1];
          },
          text: 'Two wordings of the same description do not count.',
        },
      ],
    },
    {
      number: 9, page: 's2work3', where: 'screen',
      fields: [
        { key: 'who_is_missing', kind: 'block', rows: 3, required: true },
        // Under Exercise 9, not a column on the actor table: two full-width lines with
        // the label above them, as page 17 prints them (decided 2 October 2026).
        { key: 'spoken_for_by', kind: 'block', rows: 2, label: 'Who speaks for each group the system acts on, including nobody', required: true },
      ],
    },
    {
      number: 10, page: 's2draw', where: 'spread',
      label: 'Exercise 10',
      title: 'Draw the system again',
      hint: 'Across both pages. The same case, arranged this time by the layers, the actors, and the descriptions you have just defined. Put the actors in bands by layer, widest scope of decision at the top. Draw a line between two actors where one needs a resource from the other, and mark where two actors read the problem differently. Write the three sentences on the right.',
      // A screen variant (decided 2 October 2026). The printed instruction names both
      // pages of the spread and "on the right", which the screen does not have:
      // Exercise 11 sits below the drawing. The wording awaits Ashley's approval, so
      // it stays marked as the screen's own.
      screenVariant: {
        hint: 'The same case, arranged this time by the layers, the actors, and the descriptions you have just defined. Put the actors in bands by layer, widest scope of decision at the top. Draw a line between two actors where one needs a resource from the other, and mark where two actors read the problem differently. Then write the three sentences in Exercise 11.',
      },
      wide: true,
      fields: [
        { key: 'sketch_second', kind: 'arrangement', required: true },
      ],
    },
    {
      number: 11, page: 's2draw2', where: 'spread',
      label: 'Exercise 11',
      title: 'Three sentences about what you have drawn',
      showBeside: { derived: 'conflicting_pair_text', label: 'Exercise 8' },
      fields: [
        { key: 'sentence_produces', kind: 'block', rows: 2, required: true,
          label: '1. What this system produces, whether or not anyone intends it.',
          hint: 'Read the bands: what does the arrangement reliably hand out, and to whom?' },
        { key: 'sentence_disagreement', kind: 'block', rows: 2, required: true,
          label: '2. Where the disagreement is.',
          hint: 'Take the two descriptions from Exercise 8 that cannot both be acted on, and say who holds each and what each one wants.' },
        { key: 'sentence_surprise', kind: 'block', rows: 2, required: true,
          label: '3. What surprised you when you drew it.',
          hint: 'A missing line, an actor with nothing, a layer that turned out to hold nothing.' },
      ],
    },
  ],

  // revised_on and revised_because, at the foot of every working page, are written
  // from the step's revision log, which records each revision with its date, its
  // reason, and what changed (decided 2 October 2026; see engine/store.js).
  // Workbook page 24, which stands over the step description's wording. Each sendsTo
  // is the return the specification gives beside the criterion (decided 2 October
  // 2026): page 24 prints its page, and the screen names the exercise and its page.
  criticalCheck: [
    { id: 'c1', text: 'What is excluded is written down, with a reason and a mark of F, O, or I.', sendsTo: { exercise: 2 } },
    { id: 'c2', text: 'The actors include those affected by the system but not involved in it.', sendsTo: { exercise: 5 } },
    { id: 'c3', text: 'Every actor sits in one layer and carries one type.', sendsTo: [{ exercise: 3 }, { exercise: 4 }, { exercise: 5 }] },
    { id: 'c4', text: 'For every actor, the resources held are recorded. For the actors the dependency question applies to, who needs each resource from them is recorded as well.',
      sendsTo: [{ exercise: 5 }, { exercise: 7 }] },
    { id: 'c5', text: 'Which layer can take the decision, which is tasked with carrying the decision out, and which answers for the result, are each named or recorded as nobody.',
      sendsTo: { exercise: 6 } },
    { id: 'c6', text: 'At least two descriptions of the problem are recorded, and they differ in a way that matters.', sendsTo: { exercise: 8 } },
    // Names a large sheet and a book, which the screen does not have, so the line
    // could not be ticked honestly on screen. A screen variant (decided 2 October
    // 2026), with the printed form kept beside it. The wording awaits Ashley's
    // approval, so it stays marked as the screen's own.
    { id: 'c7', text: 'The system has been drawn on a large sheet, drawn again in this book, and its three sentences written.',
      screenVariant: { text: 'The system has been drawn in Exercise 1, drawn again in Exercise 10, and its three sentences written.' },
      sendsTo: [{ exercise: 1 }, { exercise: 10 }, { exercise: 11 }] },
  ],

  carriesForward: [
    { output: 'The boundary', goesTo: [4, 5], usedAs: 'What may be named as a variable at all' },
    { output: 'The layers', goesTo: [7, 12], usedAs: 'Which scope of decision a lever sits in, and which the ask is addressed to' },
    { output: 'The actors, with layer and type', goesTo: [5, 7, 8, 12, 13], usedAs: 'Who the control markers belong to, and who is affected by a choice' },
    { output: 'The resources and the dependencies', goesTo: [5, 7, 8], usedAs: 'Relations the mapping can carry, and what would have to move for a lever to move' },
    { output: 'Authority, responsibility, and accountability', goesTo: [7, 12], usedAs: 'Where a lever can actually be pulled, and by whom' },
    { output: 'The competing descriptions', goesTo: [6, 13], usedAs: 'The mental models the narrative has to account for' },
    { output: 'The three sentences', goesTo: [3, 4], usedAs: 'The pattern to look for, and the first candidate factors' },
    { output: 'Exclusions marked fixed or out of reach', goesTo: [10], usedAs: 'The assumptions the theory of change rests on' },
    { output: 'Who is missing, and who speaks for whom', goesTo: [7, 13], usedAs: 'Where power is invisible, and whose message has to be carried by someone else' },
  ],

  returnsIn: [
    { id: 'from3_period_outside', raisedAt: 3, when: 'The period has to reach outside the boundary', fields: ['outside', 'layers'] },
    { id: 'from5_mapping', raisedAt: 5, when: 'The mapping cannot explain the pattern', fields: ['outside'] },
    { id: 'from7_lever', raisedAt: 7, when: 'A candidate lever is chosen', fields: ['dependencies'] },
  ],

  // Returns inside the step: each reopens the fields it names, not the whole step.
  returnsInside: [
    { id: 'in_all_one', when: 'All three of authority, responsibility, and accountability sit in one layer and the problem persists anyway', to: [{ exercise: 2 }, { exercise: 6 }] },
    { id: 'in_no_type', when: 'An actor will not fit any type', to: [{ exercise: 4 }, { exercise: 5 }] },
    { id: 'in_two_layers', when: 'An actor seems to need two layers, or an affected group splits into halves wanting different things', to: [{ exercise: 5 }] },
    { id: 'in_past_fifteen', when: 'Past fifteen actors', to: [{ exercise: 5 }, { exercise: 2 }, { exercise: 3 }] },
  ],

  // process.yaml, trigger raised at Step 2. The step's own specification lists no
  // outward return (SPEC).
  returnsHeading: { text: 'If this happens, go back', provisional: true },
  returnsOut: [
    { id: 'to1_outside', when: 'The actors who matter all sit outside the boundary',
      to: { step: 1, fields: ['agreed_thing', 'agreed_who', 'change_long'], exercise: 6, page: 's1work2' } },
  ],
};

export { dependencySubset, araPattern, missingDependencies, inSubset, ownDescriptions };
