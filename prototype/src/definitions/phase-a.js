// Phase A, what carries forward: workbook page 25, as the panel of the case view.
// "The agreed version, copied here." Each zone is a copy the participant makes and
// can edit, with the field it was copied from shown beside it, so a divergence is
// visible rather than silent (design/platform-phase-a.md, section 5). Nothing is
// copied until the participant asks for it.

import { label } from './lists.js';

const lines = (xs) => xs.filter((x) => x && String(x).trim()).join('\n');

export const PHASE_A = {
  page: 'carries',
  zones: [
    {
      n: 1, key: 'carry_problem',
      // The agreed problem definition, assembled from its five slots in Exercise 6.
      source: (ctx) => ctx.derivedAt(1, 'agreed_sentence') || '',
      from: [{ step: 1, exercise: 6 }],
    },
    {
      n: 2, key: 'carry_change_position',
      source: (ctx) => {
        const pos = ctx.at(1, 'position');
        const behalf = ctx.at(1, 'on_behalf_of');
        const y = ctx.at(1, 'change_long_year');
        return lines([
          ctx.at(1, 'change_long') ? `${ctx.at(1, 'change_long')}${y ? ` (${y})` : ''}` : '',
          ctx.at(1, 'change_near') ? `${ctx.at(1, 'change_near')}${ctx.at(1, 'change_near_year') ? ` (${ctx.at(1, 'change_near_year')})` : ''}` : '',
          pos ? `${label('positions', pos)}${behalf && pos !== 'outside' ? `, on behalf of ${behalf}` : ''}` : '',
        ]);
      },
      from: [{ step: 1, exercise: 4 }, { step: 1, exercise: 5 }],
    },
    {
      // Written here: neither half exists anywhere in Step 2 (design/platform-phase-a.md,
      // section 11, question 4). No source to copy from.
      n: 3, written: true,
      fields: [
        { key: 'boundary_sentence', kind: 'block', rows: 2, label: 'The boundary, in one sentence', provisional: true },
        { key: 'exclusion_most_likely_wrong', kind: 'ref', of: 'outside', step: 2, label: 'The exclusion most likely to be wrong', provisional: true },
        { key: 'exclusion_most_likely_wrong_note', kind: 'line', label: 'why', provisional: true },
      ],
      from: [{ step: 2, exercise: 2 }],
    },
    {
      n: 4, key: 'carry_layers_decision',
      source: (ctx) => {
        const layers = ctx.rowsAt(2, 'layers');
        const decisions = ctx.rowsAt(2, 'decisions');
        const name = (id) => (id === 'nobody' ? 'nobody' : (layers.find((l) => l.id === id) || {}).name || '');
        const out = layers.map((l, i) => `${i + 1} ${l.name || ''}`);
        decisions.forEach((d, i) => {
          if (decisions.length > 1) out.push(`${d.statement || ''}`);
          else if (d.statement) out.push(d.statement);
          out.push(`Authority: ${name(d.authority)}`);
          out.push(`Responsibility: ${name(d.responsibility)}`);
          out.push(`Accountability: ${name(d.accountability)}`);
        });
        return lines(out);
      },
      from: [{ step: 2, exercise: 3 }, { step: 2, exercise: 6 }],
    },
    {
      n: 5, key: 'carry_disagreement',
      source: (ctx) => ctx.derivedAt(2, 'conflicting_pair_text') || '',
      from: [{ step: 2, exercise: 8 }],
    },
    {
      n: 6, key: 'carry_sentences',
      source: (ctx) => lines([
        ctx.at(2, 'sentence_produces') && `1. ${ctx.at(2, 'sentence_produces')}`,
        ctx.at(2, 'sentence_disagreement') && `2. ${ctx.at(2, 'sentence_disagreement')}`,
        ctx.at(2, 'sentence_surprise') && `3. ${ctx.at(2, 'sentence_surprise')}`,
      ]),
      from: [{ step: 2, exercise: 11 }],
    },
    {
      n: 7, key: 'carry_spd_shape',
      source: (ctx) => lines([
        ctx.derivedAt(3, 'system_problem_definition'),
        ctx.at(3, 'shape') ? label('shapes', ctx.at(3, 'shape')) : '',
      ]),
      from: [{ step: 3, exercise: 6 }, { step: 3, exercise: 5 }],
    },
  ],

  // What the step specifications say carries forward and page 25 leaves in the
  // steps' own pages, because page 25 is one page (design/platform-phase-a.md,
  // section 5). Listed so the narrow panel can be compared with the wider one.
  alsoCarried: [
    { what: 'The actor list, with layer and type', step: 2, exercise: 5 },
    { what: 'The resource ticks', step: 2, exercise: 5 },
    { what: 'The dependency table', step: 2, exercise: 7 },
    { what: 'The event strip', step: 3, exercise: 3 },
    { what: 'The evidence labels', step: 3, exercise: 4 },
    { what: 'The two futures', step: 3, exercise: 7 },
  ],
};
