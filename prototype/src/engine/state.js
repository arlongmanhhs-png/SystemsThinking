// A step's state is computed, never stored: empty, in progress, critical check open,
// passed, reopened. What is stored is the field values, the critical check ticks
// with their dates, the confirmations, the revision log, the pending edits on a
// passed step, the review marks, and the returns (design/platform-phase-a.md,
// section 4).

import { BUILT } from '../definitions/index.js';
import { validateStep, stepHasContent, progress } from './validate.js';

const arr = (x) => (Array.isArray(x) ? x : []);
const last = (xs) => (xs.length ? xs[xs.length - 1] : null);

export const STATE_LABEL = {
  empty: 'Empty',
  progress: 'In progress',
  open: 'Critical check open',
  passed: 'Passed',
  reopened: 'Reopened',
};

export function stepInfo(state, stepNo) {
  const def = BUILT[stepNo];
  const v = validateStep(state, stepNo);
  const ticks = (state.ticks && state.ticks[stepNo]) || {};
  const allTicked = def.criticalCheck.every((c) => ticks[c.id]);
  const confirmations = arr(state.confirmations && state.confirmations[stepNo]);
  const lastConfirm = last(confirmations);
  const pending = state.pending && state.pending[stepNo];
  const returns = arr(state.returns).filter((r) => r.to === stepNo && !r.resolved);
  const revisions = arr(state.revisions).filter((r) => r.step === stepNo && r.kind === 'revision');
  const lastRevision = last(revisions);
  const marks = arr(state.marks).filter((m) => m.on === stepNo && !m.resolved);
  const everPassed = confirmations.length > 0;
  const revisedSincePass = !!(lastRevision && lastConfirm && lastRevision.at > lastConfirm);

  // Passed is never removed by the system. Once a step has passed, anything that
  // would undo the pass (an edit, a return, a new gap made by a change in an earlier
  // step, an unticked criterion) shows as reopened, with its reason, never as a
  // silent fall back to in progress.
  let status;
  let reason = null;
  if (everPassed && (pending || returns.length || revisedSincePass || v.blocking.length || !allTicked)) {
    status = 'reopened';
    if (returns.length) reason = { kind: 'return', item: returns[0] };
    else if (pending) reason = { kind: 'pending', item: pending };
    else if (revisedSincePass) reason = { kind: 'revision', item: lastRevision };
    else if (v.blocking.length) reason = { kind: 'blocking', item: v.blocking[0] };
    else reason = { kind: 'unticked', item: null };
  } else if (everPassed) {
    status = 'passed';
  } else if (!stepHasContent(state, stepNo)) {
    status = 'empty';
  } else if (v.blocking.length === 0) {
    status = 'open';
  } else {
    status = 'progress';
  }

  return {
    status,
    reason,
    blocking: v.blocking,
    warnings: v.warnings,
    checkOpen: v.blocking.length === 0,
    allTicked,
    ticks,
    passedAt: status === 'passed' ? lastConfirm : null,
    everPassed,
    lastConfirm,
    pending: pending || null,
    returns,
    marks,
    progress: progress(state, stepNo),
  };
}

// Forwards is checked: a step opens when the one before it has passed its critical
// check at least once. Nothing already opened is ever closed again, and going back
// needs no permission.
export function stepOpens(state, stepNo) {
  if (stepNo === 1) return true;
  const prev = arr(state.confirmations && state.confirmations[stepNo - 1]);
  return prev.length > 0;
}
