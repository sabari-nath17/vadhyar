import type { PanelState } from '../../shared.js';

export const lessonSteps = ['Your rule', 'How it works', 'Your guess', 'What happened', 'Try a change', 'Check it'] as const;
export const proofLabels = {
  'predicted-first': 'Predicted first',
  'found-the-bug': 'Found the bug',
  'fixed-it-yourself': 'Fixed it yourself',
  'all-cases-match': 'All cases match',
  'no-hints': 'No hints',
} as const;
export type Proof = keyof typeof proofLabels;

export function recordedSummary(state: PanelState) {
  const run = state.ownershipRun;
  const current = run?.kind === 'completed' && run.sourceHash === state.sourceHash && run.requirementRevision === state.requirement?.revision;
  const cases = run?.kind === 'completed' ? run.cases : [];
  const expectedIds = ['owner-client-active', 'other-client-active', 'freelancer-active'];
  const complete = current && run?.kind === 'completed' && cases.length === expectedIds.length && expectedIds.every(id => cases.some(item => item.id === id)) && cases.every(item => (item.status === 'passed') === (item.observedApproval === item.expectedApproval));
  const passed = Boolean(complete && run?.kind === 'completed' && run.requirementPassed && run.exitCode === 0 && cases.every(item => item.status === 'passed'));
  const prediction = state.prediction;
  const observed = state.counterexample;
  const predictedFirst = Boolean(prediction && observed && prediction.id === observed.predictionId && prediction.sourceHash === observed.sourceHash && prediction.requirementRevision === observed.requirementRevision && Date.parse(prediction.savedAt) <= Date.parse(observed.startedAt));
  const hints = state.hints?.filter(item => item.predictionId === prediction?.id).length;
  const earned: Proof[] = [];
  if (predictedFirst) earned.push('predicted-first');
  if (passed) earned.push('all-cases-match');
  if (passed && predictedFirst && hints === 0) earned.push('no-hints');
  // shortcut: source-open history and authorship are unrecorded; add stickers when the host supplies that evidence.
  return { current, complete, passed, matched: complete ? cases.filter(item => item.status === 'passed').length : undefined, total: complete ? cases.length : undefined, hints, predictedFirst, earned };
}
