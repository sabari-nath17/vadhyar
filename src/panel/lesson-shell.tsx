import type { PanelState } from '../shared.js';
import { Control, type Send } from './ui.js';
import { RequirementImport } from './reuse-controls.js';
import { StartSheet } from './v2/components.js';
import { recordedSummary } from './v2/evidence.js';
import { requirementCases, type Step } from './workflow.js';

export function lockedStepReason(state: PanelState, step: Step): string {
  if (state.busy) return 'Finish the current operation first.';
  if (!state.confirmed) return 'Read and confirm your rule first.';
  if (state.requirement?.checksAvailable === false) return 'This imported rule supports explanations. It has no approved checks for the practice steps.';
  if (!state.sourceHash) return 'Read your saved code first.';
  if (step === 'observe') return 'Save a guess and run its case first.';
  if (step === 'change') return 'A completed case must show a broken rule before this practice change opens.';
  if (step === 'verify') return 'Compare your saved change first.';
  return 'Finish the earlier steps first.';
}

export function RuleOptions({ state, send, close }: { state: PanelState; send: Send; close: () => void }) {
  return <StartSheet title="Your rule and examples" onClose={close} action={<Control className="vd-primary" onClick={close}>Back to my task</Control>}>
    {state.requirement ? <><p>{state.requirement.checksAvailable === false ? 'Imported rule · explanation only. No executable checks are mapped.' : 'Prepared NovaDesk exercise · the original sample intentionally omits ownership. Simulated actors are not authentication.'}</p><pre>{state.requirement.text}</pre></> : <p>Read the saved project to load your rule.</p>}
    {requirementCases(state.requirement).length > 0 && <><h3>What should happen</h3><ul className="vd-cases">{requirementCases(state.requirement).map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.text}</span></li>)}</ul><p className="vd2-caption">Expected examples, not executed results.</p></>}
    <p>{state.confirmed ? 'You confirmed this rule for this session.' : 'Confirm this rule before using its code.'}</p>
    <Control disabled={state.busy || !state.confirmed} reason="Confirm the rule and finish the current operation first." onClick={() => send({type:'checkpoint'})}>Save a snapshot of this code</Control>
    <p className="vd2-caption">{state.checkpointCount === undefined ? 'Snapshot count not recorded.' : `${state.checkpointCount} snapshots recorded.`} Tracking starts at capture. Earlier history and authorship are unknown.</p>
    <RequirementImport state={state} send={send} />
  </StartSheet>;
}

export function PanelOptions({ state, send, close, proof, takeBreak, challenge, sound, setSound, saving }: { state: PanelState; send: Send; close: () => void; proof: () => void; takeBreak: () => void; challenge: () => void; sound: boolean; setSound: (value: boolean) => void; saving: boolean }) {
  const index = state.walkthrough?.index ?? 0;
  const tour = state.explanation?.explanation.steps;
  const tourCurrent = Boolean(!state.busy && state.explanationCurrent && state.referencesCurrent && state.walkthrough && state.walkthrough.sourceHash === state.sourceHash && state.walkthrough.requirementRevision === state.requirement?.revision);
  return <StartSheet id="vd-settings" title="More options" onClose={close} action={<Control className="vd-primary" onClick={close}>Back to my task</Control>}>
    <Control disabled={state.busy} onClick={() => send({type:'setupKey'})}>{state.hasKey ? 'Replace OpenAI key securely' : 'Connect OpenAI'}</Control><p className="vd2-caption">Enter the key in the editor’s secure prompt. It stays in SecretStorage.</p>
    <Control disabled={state.busy} onClick={() => send({type:'ready'})}>Refresh saved context</Control>
    <Control disabled={state.busy || !state.confirmed || state.contextStale} reason="Confirm your rule and refresh saved code first." onClick={() => send({type:'refreshGraph'})}>Update code connections</Control>
    <RequirementImport state={state} send={send} />
    {tour && <><Control disabled={!tourCurrent} reason="Refresh the explanation and its code links first." onClick={() => send({type:'walkthroughStep',index})}>Highlight walkthrough step</Control>{index > 0 && <Control disabled={!tourCurrent} reason="Refresh the current walkthrough first." onClick={() => send({type:'walkthroughStep',index:index-1})}>Previous walkthrough step</Control>}{index < tour.length-1 && <Control disabled={!tourCurrent} reason="Refresh the current walkthrough first." onClick={() => send({type:'walkthroughStep',index:index+1})}>Next walkthrough step</Control>}<Control disabled={!tourCurrent} reason="Refresh the current walkthrough first." onClick={() => send({type:'exportWalkthrough'})}>Export walkthrough</Control></>}
    <Control onClick={proof}>Show my proof</Control>
    {recordedSummary(state).passed && state.exercise !== 'transfer' && <Control disabled={state.busy} onClick={challenge}>Try the next rule</Control>}
    <Control onClick={takeBreak}>Take a short break</Control>
    <Control id="vd-sound-toggle" role="switch" aria-checked={sound} onClick={() => setSound(!sound)}>Sound: {sound ? 'on' : 'off'}</Control><p className="vd2-caption">Optional local tones. Off again when the panel reopens.</p>
    <Control disabled={state.busy} onClick={() => send({type:'showMemoryLocation'})}>Show memory location</Control>{state.memoryLocation && <p>Local session folder: <code>{state.memoryLocation}</code></p>}
    <Control disabled={state.busy || saving} reason="Finish the current operation first." onClick={() => send({type:'clearNovaDeskSession'})}>Clear prepared exercise</Control><p className="vd2-caption">The editor asks for confirmation. Project Guide records, workspace files and API credentials are preserved. This does not sign you out.</p>
    <details className="vd-details"><summary>Demo preparation · planned</summary><p>Demo reset and recorded-response fallback are planned, not enabled. Use a marked disposable workspace. API errors remain errors; a recorded answer never substitutes for one.</p></details>
  </StartSheet>;
}

export function TechnicalDetails({ state }: { state: PanelState }) {
  return <div className="vd-technical">
    <p>{state.contextStale ? 'Last refreshed source' : 'Current source'}: <code>{state.sourceHash ?? 'unavailable'}</code></p><p>Requirement revision: <code>{state.requirement?.revision ?? 'unavailable'}</code></p>
    <p>Requirement approval: {state.confirmed ? 'confirmed' : 'not confirmed'}. Mapping approval: {state.mappingConfirmed ? 'confirmed' : 'not confirmed'}.</p>
    <p>Source references: {state.refs.length}; {state.referencesCurrent ? 'current validated locations' : 'historical or unverified'}. Checkpoints: {state.checkpointCount ?? 'not recorded'}.</p>
    {state.graph && <><p>Graphify {state.graph.version}; graph identity <code>{state.graph.identity}</code>; {state.graphCurrent ? 'current' : 'historical'}. Extracted {state.graph.extractedAt}.</p><ul>{state.graph.relationships.map((edge,index) => <li key={index}>{edge.sourceId} → {edge.targetId}: {edge.relation} ({edge.provenance})</li>)}</ul></>}
    {state.explanation && <p>Explanation: model {state.explanation.model}; {state.explanation.latencyMs} ms; {state.explanation.usage?.totalTokens ?? 'unavailable'} tokens; response <code>{state.explanation.responseId}</code>.</p>}
    {state.hints?.map(item => <p key={item.id}>Hint {item.result.hint.level}: {item.recordedAt}; {item.result.model}; {item.result.latencyMs} ms; response <code>{item.result.responseId}</code>.</p>)}
    {state.counterexample && <p>Counterexample source: <code>{state.counterexample.sourceHash}</code>; {state.counterexample.latencyMs} ms; Vitest {state.counterexample.vitestVersion}; {state.counterexample.kind === 'completed' ? `${state.counterexample.executedCases} executed, ${state.counterexample.skippedCases} skipped.` : `${state.counterexample.kind}: ${state.counterexample.message}`}</p>}
    {state.ownershipRun && <p>Full check source: <code>{state.ownershipRun.sourceHash}</code>; baseline: <code>{state.ownershipRun.baselineHash}</code>; {state.ownershipRun.latencyMs} ms; status {state.ownershipRun.kind}.</p>}
    {state.evidence?.map(item => <section key={item.id}><h3>{item.title}</h3><p>Rule revision: <code>{item.requirementRevision}</code></p>{item.sourceHash && <p>Source: <code>{item.sourceHash}</code></p>}<p>Record: <code>{item.id}</code></p></section>)}
  </div>;
}
