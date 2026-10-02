// Step 1: define the problem, the desired change, and your position.
// Executable form of steps/01-framing/spec.md, laid out as the workbook lays it out
// (pages 8 to 11). The Step 1 specification was written before the workbook became
// the paper form (core/open-questions.md, 28 September), so this definition follows
// the workbook's eight exercises and keeps every specification key that maps onto
// them. Each place the two part is marked SPEC and reported in FINDINGS.md.

import { label } from './lists.js';

// The instrument words from steps/01-framing/spec.md, zone 4, with their inflections.
const INSTRUMENT_WORDS = [
  ['ban', /^ban(s|ned|ning)?$/],
  ['subsidy', /^subsid(y|ies|ise|ised|ising|ize|ized|izing)$/],
  ['campaign', /^campaign(s|ed|ing)?$/],
  ['platform', /^platforms?$/],
  ['app', /^apps?$/],
  ['training', /^train(ing|ings|ed)?$/],
];

function instrumentWord(text) {
  if (!text) return null;
  const words = String(text).toLowerCase().match(/[a-z]+/g) || [];
  const hit = INSTRUMENT_WORDS.find(([, re]) => words.some((w) => re.test(w)));
  return hit ? hit[0] : null;
}

// The warning names the word the tool found, as listed, in place of {word}
// (steps/01-framing/spec.md, Exercise 4, decided 2 October 2026).
const INSTRUMENT_WARNING = "The desired change names '{word}', which is a potential solution: say what would be different, not how to get there.";
const KEEP_A_COPY = { action: 'park', label: 'Keep a copy with the potential solutions, for later', done: 'Kept with the potential solutions, for later.' };

const TOPIC_QUESTIONS = ['suit_chronic', 'suit_history', 'suit_attempts'];
// Exercise 6's own fields: once any is written, Exercise 6 has been reached.
const EXERCISE_6 = ['problem_form', 'form_reason', 'agreed_thing', 'agreed_direction', 'agreed_who', 'agreed_since', 'agreed_consequence'];

export default {
  number: 1,
  phase: 'A',
  slug: 'framing',
  title: 'Define the problem, the desired change, and your position',
  purpose: 'To fix what is being analysed, what change is wanted, and who you are in relation to it, before any explaining starts.',
  dependsOn: [],
  // steps/01-framing/spec.md: revising Step 1 marks every step its carry-forward
  // table sends an output to, which is every later step except Step 6 (decided 2
  // October 2026). Only built steps with something in them are marked.
  marksForReview: [2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13],

  passages: [
    { page: 's1instr', governs: [1, 2, 3, 4, 5] },
    { page: 's1ref', governs: [6, 7, 8] },
  ],

  pages: [
    { page: 's1work', exercises: [1, 2, 3, 4, 5] },
    { page: 's1work2', exercises: [6, 7, 8] },
  ],

  derive: {
    // The agreed problem definition, assembled from its five slots. This is the problem
    // definition every later step reads (steps/01-framing/spec.md, "The two problem
    // definitions"). In the default form it reads as the printed sentence; in the other
    // three forms, whose sentences differ, the five parts are joined in order.
    agreed_sentence: (ctx) => {
      const k = ['agreed_thing', 'agreed_direction', 'agreed_who', 'agreed_since', 'agreed_consequence'];
      const v = k.map((x) => (ctx.v(x) && String(ctx.v(x)).trim()) || '');
      if (v.every((x) => !x)) return '';
      const s = (x) => x || '___';
      const [thing, dir, who, since, why] = v;
      if (!ctx.v('problem_form') || ctx.v('problem_form') === 'excess_deficit') {
        return `There is ${s(dir)} of ${s(thing)} for ${s(who)}, since ${s(since)}, which matters because ${s(why)}.`;
      }
      return `${s(thing)}: ${s(dir)}, for ${s(who)}, since ${s(since)}, which matters because ${s(why)}.`;
    },
    // The first attempt, assembled and shown back in full so the participant reads what
    // they have actually written. Read by nothing downstream.
    problem_sentence: (ctx) => {
      const d = label('directions', ctx.v('problem_direction'));
      const parts = ['problem_thing', 'problem_who', 'problem_since', 'problem_consequence'].map((k) => ctx.v(k));
      if (!d && parts.every((p) => !p)) return '';
      const s = (x) => (x && String(x).trim()) || '___';
      return `There is ${d || '___'} of ${s(parts[0])} for ${s(parts[1])}, since ${s(parts[2])}, which matters because ${s(parts[3])}.`;
    },
  },

  exercises: [
    {
      number: 1, page: 's1work', where: 'screen',
      // steps/01-framing/spec.md: the situation box collapses to a single line once
      // the problem definition exists.
      collapseWhen: (ctx) => ctx.complete(['problem_direction', 'problem_thing', 'problem_who', 'problem_since', 'problem_consequence']),
      // The workbook's two printed lines, checked for non-empty only, as the
      // specification now says (decided 2 October 2026). No length check.
      fields: [
        { key: 'situation', kind: 'block', rows: 3, required: true },
      ],
    },
    {
      number: 2, page: 's1work', where: 'screen',
      // The first attempt, in the printed sentence form, slot by slot, in the default
      // form only. The choice of form belongs to Exercise 6.
      layout: {
        type: 'statement',
        parts: [
          'There is', { key: 'problem_direction' }, { key: 'problem_thing' }, '\n',
          'for', { key: 'problem_who' }, 'since', { key: 'problem_since' }, '\n',
          'which matters because', { key: 'problem_consequence' },
        ],
        assembled: 'problem_sentence',
      },
      fields: [
        { key: 'problem_direction', kind: 'choice', list: 'directions', required: true, inline: true },
        { key: 'problem_thing', kind: 'line', caption: 'the thing there is too much or too little of', required: true },
        { key: 'problem_who', kind: 'line', caption: 'who it affects', required: true },
        { key: 'problem_since', kind: 'line', caption: 'when', required: true },
        { key: 'problem_consequence', kind: 'line', caption: 'the consequence', required: true },
        { key: 'rationale', kind: 'block', rows: 3, hint: 'The rationale: how and why people are affected.', required: true },
      ],
    },
    {
      number: 3, page: 's1work', where: 'screen',
      // The size verdict (size_verdict, size_note) was retired on 1 October 2026: the
      // fourth question here does the size test, and page 10 says "Exercise 3 is how
      // you know".
      layout: { type: 'yesno-grid', head: ['Y', 'N'], noteHead: 'How you know' },
      fields: [
        { key: 'suit_chronic', kind: 'choice', list: 'yes_no', required: true,
          label: 'Is this an ongoing problem, rather than something that happened once?', note: 'suit_chronic_note' },
        { key: 'suit_history', kind: 'choice', list: 'yes_no', required: true,
          label: 'Does it have a history you can describe?', note: 'suit_history_note' },
        { key: 'suit_attempts', kind: 'choice', list: 'yes_no', required: true,
          label: 'Have previous attempts to deal with it failed?', note: 'suit_attempts_note' },
        { key: 'suit_size', kind: 'choice', list: 'yes_no', required: true,
          label: 'Can you say where the problem starts and stops, and foresee about a dozen things that drive it?', note: 'suit_size_note' },
        // The disqualifier is a field of its own, not a fifth suitability question. The
        // key says what the printed question asks, so the answer is stored as ticked.
        { key: 'suit_procedure_would_solve', kind: 'choice', list: 'yes_no', required: true, callout: 'One question disqualifies a topic.',
          label: 'Could a known procedure solve this, if someone chose to?', note: 'suit_procedure_note',
          hint: 'A yes means the problem is a decision that nobody has taken, not a system that keeps producing a result. Choose a different topic.' },
        // The "How you know" lines. Not required: the check is on the answer.
        { key: 'suit_chronic_note', kind: 'line', required: false, hidden: true },
        { key: 'suit_history_note', kind: 'line', required: false, hidden: true },
        { key: 'suit_attempts_note', kind: 'line', required: false, hidden: true },
        { key: 'suit_size_note', kind: 'line', required: false, hidden: true },
        { key: 'suit_procedure_note', kind: 'line', required: false, hidden: true },
      ],
      checks: [
        // A "no" to any of the four suitability questions warns and can be dismissed
        // with one line. The size question's warning sends the participant to narrow or
        // widen the problem definition (page 10): back to Exercise 2, and to Exercise 6
        // only once it has been written, so the link never points ahead. The other three
        // send the participant to the topic. The warnings' wording is the screen's own:
        // the specification gives none.
        {
          id: 'wrong_tool', severity: 'warn',
          test: (ctx) => TOPIC_QUESTIONS.some((k) => ctx.v(k) === 'no'),
          signature: (ctx) => TOPIC_QUESTIONS.filter((k) => ctx.v(k) === 'no').join(','),
          text: 'A no to any of the first three questions means the problem may not be the kind this process is for.',
          provisional: true,
          sendsTo: { exercise: 1 },
        },
        {
          id: 'size', severity: 'warn',
          test: (ctx) => ctx.v('suit_size') === 'no',
          text: 'If you cannot say where the problem starts and stops, or cannot foresee about a dozen things that drive it, it is too large. If almost nothing drives it, it is too small.',
          sendsTo: (ctx) => (EXERCISE_6.some((k) => ctx.filled(ctx.v(k))) ? [{ exercise: 2 }, { exercise: 6 }] : { exercise: 2 }),
        },
        // The disqualifier is a stop, not a warning: a yes keeps the critical check
        // closed and cannot be dismissed. The wording is the page's.
        {
          id: 'known_procedure', severity: 'stop',
          test: (ctx) => ctx.v('suit_procedure_would_solve') === 'yes',
          text: 'A yes means the problem is a decision that nobody has taken, not a system that keeps producing a result. Choose a different topic.',
          sendsTo: { exercise: 1 },
        },
      ],
    },
    {
      number: 4, page: 's1work', where: 'screen',
      layout: { type: 'two-boxes', boxes: [['change_long', 'change_long_year'], ['change_near', 'change_near_year']] },
      fields: [
        { key: 'change_long', kind: 'block', rows: 2, label: 'In five years or more', required: true },
        // The year is printed in each box's label row.
        { key: 'change_long_year', kind: 'year', label: 'Year', required: true },
        { key: 'change_near', kind: 'block', rows: 2, label: 'A nearer point, one to five years out', required: false },
        { key: 'change_near_year', kind: 'year', label: 'Year', required: false },
      ],
      checks: [
        // The wording, the button, and the note after copying are the
        // specification's, decided 2 October 2026. The button copies the whole desired
        // change, as written, to the parked list, and the desired change is left as
        // written: the tool never edits the participant's answer.
        {
          id: 'instrument_long', severity: 'warn', field: 'change_long',
          test: (ctx) => !!instrumentWord(ctx.v('change_long')),
          signature: (ctx) => `${instrumentWord(ctx.v('change_long'))}|${ctx.v('change_long')}`,
          text: INSTRUMENT_WARNING,
          fill: (ctx) => ({ word: instrumentWord(ctx.v('change_long')) }),
          source: 'steps/01-framing/spec.md',
          offer: { ...KEEP_A_COPY, from: 'change_long' },
        },
        {
          id: 'instrument_near', severity: 'warn', field: 'change_near',
          test: (ctx) => !!instrumentWord(ctx.v('change_near')),
          signature: (ctx) => `${instrumentWord(ctx.v('change_near'))}|${ctx.v('change_near')}`,
          text: INSTRUMENT_WARNING,
          fill: (ctx) => ({ word: instrumentWord(ctx.v('change_near')) }),
          source: 'steps/01-framing/spec.md',
          offer: { ...KEEP_A_COPY, from: 'change_near' },
        },
      ],
    },
    {
      number: 5, page: 's1work', where: 'screen',
      layout: { type: 'position', firstApart: true, between: 'Or one of these, each of which acts for or advises someone:' },
      fields: [
        { key: 'position', kind: 'choice', list: 'positions', required: true },
        { key: 'on_behalf_of', kind: 'line', label: 'If one of those four, on whose behalf?',
          required: (ctx) => !!ctx.v('position') && ctx.v('position') !== 'outside' },
      ],
    },
    {
      number: 6, page: 's1work2', where: 'screen',
      // The agreed problem definition: the form first, because the form governs what
      // the slots mean, then the five slots. Every later step reads these, and nothing
      // reads the first attempt in Exercise 2, which is shown beside it, read only.
      showBeside: {
        derived: 'problem_sentence', label: 'Exercise 2',
        // Page 10: "If both answers are yes, copy the first attempt across to Exercise 6 as
        // it stands." The five slots are copied only when the participant asks, and what is
        // already written in them is replaced only after the participant agrees.
        copy: {
          label: 'Copy the first attempt across',
          map: {
            agreed_thing: (v) => v.problem_thing,
            agreed_direction: (v) => label('directions', v.problem_direction),
            agreed_who: (v) => v.problem_who,
            agreed_since: (v) => v.problem_since,
            agreed_consequence: (v) => v.problem_consequence,
          },
          replace: 'Replace what is written in the five agreed slots with the first attempt?',
          done: 'The five agreed slots hold the first attempt as it stands.',
        },
      },
      layout: {
        type: 'statement',
        before: ['problem_form', 'form_reason'],
        parts: [
          { key: 'agreed_thing' }, '\n',
          { key: 'agreed_direction' }, '\n',
          { key: 'agreed_who' }, { key: 'agreed_since' }, '\n',
          { key: 'agreed_consequence' },
        ],
        assembled: 'agreed_sentence',
      },
      fields: [
        // None is pre-selected: the default form is printed first, as on the page.
        { key: 'problem_form', kind: 'choice', list: 'problem_forms', required: true, inline: true },
        { key: 'form_reason', kind: 'line', label: 'If not the default form, why it did not fit',
          required: (ctx) => !!ctx.v('problem_form') && ctx.v('problem_form') !== 'excess_deficit' },
        { key: 'agreed_thing', kind: 'line', caption: 'the thing', required: true },
        { key: 'agreed_direction', kind: 'line', caption: 'what is wrong with it', required: true },
        { key: 'agreed_who', kind: 'line', caption: 'who it affects', required: true },
        { key: 'agreed_since', kind: 'line', caption: 'since when', required: true },
        { key: 'agreed_consequence', kind: 'line', caption: 'which matters because', required: true },
      ],
    },
    {
      number: 7, page: 's1work2', where: 'screen',
      // One description (page 10: "One description is enough here; the others come
      // later"), stored as single values, as the specification and process.yaml now
      // say (decided 2 October 2026). The printed box holds the description and what
      // it takes for granted together; the screen splits the printed prompt across
      // the two keys, so the prompt is shown once, as the two labels. Page 11 prints
      // the omission line after "Where you read it", and the screen keeps that order;
      // rep_omission stays optional.
      hint: '',
      fields: [
        { key: 'rep_description', kind: 'block', rows: 3, label: 'In their words.', required: true },
        { key: 'rep_assumption', kind: 'block', rows: 2, label: 'Then what that description takes for granted.', required: true },
        { key: 'rep_source', kind: 'line', label: 'Where you read it', required: true },
        { key: 'rep_omission', kind: 'line', label: 'What that description leaves out', required: false },
      ],
    },
    {
      number: 8, page: 's1work2', where: 'screen',
      // SPEC: the specification hides the parked list until Step 7 and shows only a
      // count. The workbook prints the list in Step 1, as Exercise 8, so the list is
      // shown here, and on every other step only its count shows until Step 7.
      // parked[] is added to from any step and blocks nothing, so an empty row blocks
      // nothing either, and a parked idea does not reveal the exercises before it.
      ignoreForDisclosure: true,
      fields: [
        { key: 'parked', kind: 'table', required: false, addLabel: 'Add a potential solution', addProvisional: true,
          columns: [{ key: 'idea', kind: 'line', required: false }] },
      ],
    },
  ],

  // Workbook page 24, which the specification and the description carry word for word
  // (settled 1 October 2026). Each sendsTo is the return the specification gives
  // beside the criterion (decided 2 October 2026): page 24 prints its page, and the
  // screen names the exercise, since on screen there are no pages (decided 2 October
  // 2026).
  criticalCheck: [
    { id: 'c1', text: 'The agreed problem definition states a situation, not a solution: what is wrong with something valued, with the reason it matters and for whom.',
      sendsTo: { exercise: 6 } },
    { id: 'c2', text: 'Your position is named.', sendsTo: { exercise: 5 } },
    { id: 'c3', text: 'The desired change is stated after the problem, not before it, in the same terms as the agreed problem definition.',
      sendsTo: { exercise: 4 } },
    { id: 'c4', text: 'The four questions in Exercise 3 are answered, and a known procedure would not solve the problem.',
      sendsTo: { exercise: 3 } },
    { id: 'c5', text: 'Potential solutions that occurred to you are in Exercise 8, not in the agreed problem definition.',
      sendsTo: { exercise: 8 } },
  ],

  carriesForward: [
    { output: 'The agreed problem definition', goesTo: [2, 3, 4], usedAs: 'The subject of the boundary, the quantity graphed over time, and the first named variable' },
    { output: 'The excess or deficit itself, as agreed', goesTo: [4, 5, 10], usedAs: 'The first candidate stock' },
    { output: 'Rationale', goesTo: [8, 12], usedAs: 'Who is affected and against what standard, which is what the consequences step works from' },
    { output: 'Desired change', goesTo: [3, 9, 11], usedAs: 'What "better" means on the graph, and the outcome the theory of change has to reach' },
    { output: 'Representation and its assumption', goesTo: [2, 7], usedAs: 'Whose framing sets the first actor list, and where invisible power is looked for' },
    { output: 'Position', goesTo: [7, 12, 13], usedAs: 'Whether own influence is mapped, what Step 12 delivers (an ask, options, a decision, findings), and who Step 13 addresses' },
    { output: 'Parked ideas', goesTo: [7], usedAs: 'The list opened when interventions are finally discussed' },
  ],

  // Returns reopen the agreed problem definition, never the first attempt.
  returnsIn: [
    { id: 'from3_not_quantity', raisedAt: 3, when: 'The pattern over time cannot be drawn for the thing named',
      fields: ['agreed_thing', 'agreed_direction'] },
    { id: 'from3_proxy', raisedAt: 3, when: 'The line can be drawn, but it is not the problem',
      fields: ['agreed_thing'] },
    { id: 'from4_size', raisedAt: 4, when: 'Fewer than about six, or more than about twenty, variables survive naming',
      fields: ['suit_size', 'suit_size_note'] },
    { id: 'from2_outside', raisedAt: 2, when: 'The actors who matter all sit outside the boundary',
      fields: ['agreed_thing', 'agreed_who', 'change_long'] },
    { id: 'from7_representation', raisedAt: 7, when: 'The powerful actors\' description turns out to be different from the one recorded',
      fields: ['rep_description', 'rep_source', 'rep_assumption', 'rep_omission'] },
  ],

  returnsOut: [],
};

export { instrumentWord };
