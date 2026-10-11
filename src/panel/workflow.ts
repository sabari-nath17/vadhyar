import { availableSteps, type PanelState } from '../shared.js';
export { availableSteps } from '../shared.js';

export const steps = [
  { id: 'confirm', name: 'Your rule' },
  { id: 'understand', name: 'How it works' },
  { id: 'predict', name: 'Your guess' },
  { id: 'observe', name: 'What happened' },
  { id: 'change', name: 'Try a change' },
  { id: 'verify', name: 'Check it' },
] as const;
export type Step = typeof steps[number]['id'];

export function suggestedStep(state: PanelState): Step {
  if (state.stage && availableSteps(state).includes(state.stage)) return state.stage;
  if (!state.confirmed) return 'confirm';
  if (state.ownershipRun) return 'verify';
  if (state.diff) return 'change';
  if (state.counterexample?.kind === 'completed') return 'observe';
  if (state.prediction) return 'predict';
  return 'understand';
}

export function currentRun(state: PanelState): boolean {
  return state.ownershipCurrent === true && state.ownershipRun?.kind === 'completed' && state.ownershipRun.sourceHash === state.sourceHash && state.ownershipRun.requirementRevision === state.requirement?.revision;
}

export function requirementProse(text: string): string {
  return text.split('\n').map(line => line.trim()).find(line => line && !/^(#|ID:|Revision:|Source(?: revision)?:|[-*] )/.test(line)) ?? 'Refresh the project to read its requirement.';
}

export function completedSteps(state: PanelState): Step[] {
  const done: Step[] = state.confirmed ? ['confirm'] : [];
  if (state.explanation && state.explanationCurrent) done.push('understand');
  if (state.prediction) done.push('predict');
  if (state.counterexample?.kind === 'completed') done.push('observe');
  if (state.diff && state.diff.sourceHash === state.sourceHash) done.push('change');
  if (currentRun(state) && state.ownershipRun?.kind === 'completed' && state.ownershipRun.requirementPassed) done.push('verify');
  return done;
}

export function sharingSummary(text: string): { requirement: string; files: string[] } | undefined {
  try {
    if (text.length > 30_000) return;
    const data = JSON.parse(text);
    if (typeof data?.requirement?.text !== 'string' || typeof data.requirement.path !== 'string' || typeof data?.source?.path !== 'string') return;
    return { requirement: requirementProse(data.requirement.text), files: [data.requirement.path, data.source.path] };
  } catch { return; }
}
