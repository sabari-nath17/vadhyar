import type { PanelState } from '../shared.js';
import { Control, type Send } from './ui.js';

export function RequirementImport({ state, send }: { state: PanelState; send: Send }) {
  return <section aria-label="Requirement source">
    <Control disabled={state.busy} onClick={() => send({ type: 'importRequirement' })}>Import requirement</Control>
    {state.requirement?.checksAvailable === false && <>
      <p>Imported: {state.requirement.title}. Scenarios are descriptive; no executable checks are mapped.</p>
      <details><summary>Imported scenarios ({state.requirement.scenarios?.length ?? 0})</summary>
        {state.requirement.scenarios?.map(scenario => <section key={scenario.title}><h3>{scenario.title}</h3><pre>{scenario.text}</pre><p>Not verified</p></section>)}
      </details>
    </>}
    <Control disabled={state.busy} onClick={() => send({ type: 'usePreparedRequirement' })}>Use prepared requirement</Control>
  </section>;
}

export function Walkthrough({ state, send }: { state: PanelState; send: Send }) {
  const steps = state.explanation?.explanation.steps;
  const index = state.walkthrough?.index ?? 0;
  const step = steps?.[index];
  if (!step || !steps || !state.walkthrough) return null;
  if (state.busy || !state.explanationCurrent || !state.referencesCurrent || state.walkthrough.sourceHash !== state.sourceHash || state.walkthrough.requirementRevision !== state.requirement?.revision) return <p>Walkthrough navigation is available after refreshing the current explanation.</p>;
  const stale = state.walkthrough.sourceHash !== state.sourceHash || state.walkthrough.requirementRevision !== state.requirement?.revision;
  return <section aria-label="Code walkthrough">
    <p role="status">Step {index + 1} of {steps.length}: {step.title}</p><p>{step.text}</p>
    {index > 0 && <Control disabled={state.busy || stale} reason="Refresh the current explanation before navigating." onClick={() => send({ type: 'walkthroughStep', index: index - 1 })}>Previous</Control>}
    <Control disabled={state.busy || stale} onClick={() => send({ type: 'walkthroughStep', index })}>Highlight current step</Control>
    {index < steps.length - 1 && <Control disabled={state.busy || stale} reason="Refresh the current explanation before navigating." onClick={() => send({ type: 'walkthroughStep', index: index + 1 })}>Next</Control>}
    <Control disabled={state.busy || stale} onClick={() => send({ type: 'exportWalkthrough' })}>Export walkthrough</Control>
    {state.notice && <p role="status">{state.notice}</p>}
  </section>;
}
