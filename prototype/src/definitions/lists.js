// The closed lists, in one place, referenced by key from the step definitions.
// Each item carries its value (stored), its long label (printed), its short column
// form where the actor table needs one, and the gloss the workbook prints.
// Sources: steps/02-boundary/spec.md and steps/03-behaviour-over-time/spec.md for
// the lists; print/src/wb-part-*.html for every label and gloss.

export const LISTS = {
  // Step 1, Exercise 6. The default first, in fixed order.
  problem_forms: [
    { value: 'excess_deficit', label: 'Too much or too little' },
    { value: 'mismatch', label: 'Mismatch' },
    { value: 'standard', label: 'Falling short of a standard' },
    { value: 'not_yet', label: 'Not happened yet' },
  ],

  // Step 1, Exercise 2.
  directions: [
    { value: 'too_much', label: 'too much' },
    { value: 'too_little', label: 'too little' },
  ],

  // Step 1, Exercise 3. Y and N as printed.
  yes_no: [
    { value: 'yes', label: 'Y' },
    { value: 'no', label: 'N' },
  ],

  // Step 1, Exercise 5. "Analysing from outside" is printed first and none is pre-selected.
  positions: [
    { value: 'outside', label: 'Analysing from outside, with no client and no organisation' },
    { value: 'for_organisation', label: 'Acting for an organisation or a cause' },
    { value: 'advise_decider', label: 'Advising someone who decides' },
    { value: 'decide', label: 'Deciding, or my organisation does' },
    { value: 'affected', label: 'Affected by this' },
  ],

  // Step 2, Exercise 2. The three exclusion marks.
  exclusion_marks: [
    { value: 'F', label: 'fixed', short: 'F', gloss: 'Fixed means it will not change during the period being analysed.' },
    { value: 'O', label: 'out of reach', short: 'O', gloss: 'Out of reach means it could change but nobody in this case can affect it.' },
    { value: 'I', label: 'irrelevant', short: 'I', gloss: 'Irrelevant means including it would not change what the analysis concludes.' },
  ],

  // Step 2, Exercise 5. The four admission tests, numbered as the actor table heads them.
  admission_tests: [
    { value: '1', label: 'affects the problem', short: '1' },
    { value: '2', label: 'is affected by what the system produces', short: '2' },
    { value: '3', label: 'holds something others need', short: '3' },
    { value: '4', label: 'can start or stop a change', short: '4' },
  ],

  // Step 2, Exercise 5. The seven resources: long label, column head, gloss.
  resources: [
    { value: 'authority', label: 'Formal authority', short: 'Authority', gloss: 'Can decide, or change a rule' },
    { value: 'money', label: 'Money', short: 'Money', gloss: 'Holds or can redirect the funding' },
    { value: 'delivery', label: 'Delivery capacity', short: 'Delivery', gloss: 'Does the work on the ground' },
    { value: 'information', label: 'Information and expertise', short: 'Information', gloss: 'Knows something the others need to know' },
    { value: 'access', label: 'Access', short: 'Access', gloss: 'Can get to whoever decides' },
    { value: 'legitimacy', label: 'Legitimacy', short: 'Legitimacy', gloss: 'Can credibly speak for others' },
    { value: 'attention', label: 'Public attention', short: 'Attention', gloss: 'Can make an issue visible, or keep it quiet' },
  ],

  // Step 2, Exercise 4. Suggested, never imposed: offered, and added only when the
  // participant chooses one. From core/glossary.md and steps/02-boundary/spec.md.
  suggested_actor_types: [
    { value: 'public authority', label: 'public authority' },
    { value: 'delivery body', label: 'delivery body' },
    { value: 'representative organisation', label: 'representative organisation' },
    { value: 'firm', label: 'firm' },
    { value: 'affected group', label: 'affected group' },
    { value: 'knowledge body', label: 'knowledge body' },
  ],

  // Step 2, Exercise 6. The three roles.
  roles: [
    { value: 'authority', label: 'Authority', gloss: 'Who can take this decision, or change the rule the decision is made under?' },
    { value: 'responsibility', label: 'Responsibility', gloss: 'Who is tasked with carrying this decision out?' },
    { value: 'accountability', label: 'Accountability', gloss: 'Who is called to answer when what was decided goes wrong?' },
  ],

  // Step 2, Exercise 8. Printed "Ev. / inf." in the column head.
  evidence_status: [
    { value: 'evidenced', label: 'evidenced', short: 'Ev.' },
    { value: 'inferred', label: 'inferred', short: 'inf.' },
  ],

  // Step 3, Exercise 4. Labelled, never ranked.
  evidence_kinds: [
    { value: 'measured', label: 'Measured, a published series', short: 'Measured', gloss: 'The source and the years it covers' },
    { value: 'documented', label: 'Documented, from accounts', short: 'Documented', gloss: 'The documents, and what each one establishes about direction or timing' },
    { value: 'estimated', label: 'Estimated, our own reading', short: 'Estimated', gloss: 'What the estimate rests on, and the words "this line is an estimate"' },
  ],

  // Step 3, Exercise 5. The six shapes.
  shapes: [
    { value: 'steady', label: 'Steady rise or fall', gloss: 'Moves one way at roughly the same rate' },
    { value: 'accelerating', label: 'Accelerating', gloss: 'Moves one way, faster and faster' },
    { value: 'levelling', label: 'Levelling off', gloss: 'Moves one way, then flattens towards a limit' },
    { value: 'up_down', label: 'Up and down', gloss: 'Repeatedly overshoots and comes back' },
    { value: 'rise_collapse', label: 'Rise then collapse', gloss: 'Grows, turns, and falls below where it started' },
    { value: 'flat', label: 'Flat', gloss: 'Does not move, despite the pressure on it' },
  ],

};

export function item(list, value) {
  return (LISTS[list] || []).find((x) => x.value === value) || null;
}

export function label(list, value) {
  const it = item(list, value);
  return it ? it.label : '';
}
