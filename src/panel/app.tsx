import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PanelAction, PanelState } from '../shared.js';
import { SnakeGame } from './snake-game.js';

declare function acquireVsCodeApi(): { postMessage(message: PanelAction): void };
const host = acquireVsCodeApi();

function App() {
  const [state, setState] = useState<PanelState>({ refs: [], busy: true });
  const [predicted, setPredicted] = useState('');
  const [reasoning, setReasoning] = useState('');
  const runButton = useRef<HTMLButtonElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (state.counterexample?.kind === 'completed') resultHeading.current?.focus();
    else if (state.prediction) runButton.current?.focus();
  }, [state.prediction?.id, state.counterexample?.id]);
  useEffect(() => {
    const receive = (event: MessageEvent<PanelState>) => setState(event.data);
    window.addEventListener('message', receive);
    host.postMessage({ type: 'ready' });
    return () => window.removeEventListener('message', receive);
  }, []);
  return <main>
    <h1>Understand this change</h1>
    <p>NovaDesk is a prepared fixture with a disclosed ownership bug.</p>
    {state.error && <p role="alert">{state.error}</p>}
    <h2>Requirement</h2>
    <button disabled={state.busy} onClick={() => host.postMessage({ type: 'ready' })}>Refresh current context</button>
    {state.requirement && <><pre>{state.requirement.text}</pre><button disabled={state.busy || state.confirmed} onClick={() => host.postMessage({ type: 'confirmRequirement', revision: state.requirement!.revision })}>{state.confirmed ? 'Requirement confirmed' : 'Confirm this requirement'}</button></>}
    <button disabled={state.busy || !state.confirmed} onClick={() => host.postMessage({ type: 'checkpoint' })}>Save source checkpoint</button>
    <p>Captured checkpoints: {state.checkpointCount ?? 0}. Tracking begins at capture; earlier history is unknown.</p>
    <p role="status" aria-live="polite">{state.counterexampleRunning ? 'Running the saved ownership counterexample…' : state.busy ? 'Loading current source…' : `${state.refs.length} validated source reference(s)`}</p>
    <h2>Current source</h2>
    <button disabled={state.busy || !state.confirmed} onClick={() => host.postMessage({ type: 'refreshGraph' })}>Refresh source relationships</button>
    {state.graph && <section><p>Graphify {state.graph.version}: current AST relationships. These propose a requirement mapping; they do not prove policy satisfaction.</p><ul>{state.graph.relationships.map((edge, index) => <li key={index}>{state.refs.find(ref => ref.id === edge.sourceId)?.symbol} {edge.relation} {state.refs.find(ref => ref.id === edge.targetId)?.symbol} ({edge.provenance})</li>)}</ul><button disabled={state.busy || state.mappingConfirmed} onClick={() => host.postMessage({ type: 'confirmMapping', identity: state.graph!.identity })}>{state.mappingConfirmed ? 'Source mapping confirmed' : 'Use these source links for this requirement'}</button></section>}
    {state.refs.map(ref => <button key={ref.id} disabled={state.busy} onClick={() => host.postMessage({ type: 'openSource', id: ref.id })}>{ref.symbol} — {ref.path}:{ref.startLine}–{ref.endLine}</button>)}
    <h2>Explain current source</h2>
    <button disabled={state.busy} onClick={() => host.postMessage({ type: 'setupKey' })}>{state.hasKey ? 'Replace API key securely' : 'Set API key securely'}</button>
    <p>The key stays in VS Code SecretStorage. Sharing sends only the previewed requirement, approval source and source relationships to OpenAI.</p>
    <button disabled={state.busy || !state.mappingConfirmed} onClick={() => host.postMessage({ type: 'previewExplain' })}>Preview context for Explain</button>
    {state.preview && <section><h3>Context sharing preview</h3><p>Model: {state.preview.model}. A paid API request may apply.</p><pre>{state.preview.instruction}</pre><details><summary>Exact requirement, source and relationship payload</summary><pre>{state.preview.text}</pre></details><button disabled={state.busy || !state.hasKey} onClick={() => host.postMessage({ type: 'explain', identity: state.preview!.identity })}>Share this context and Explain</button></section>}
    {state.busy && state.preview && <button onClick={() => host.postMessage({ type: 'cancelExplain' })}>Cancel explanation</button>}
    {state.explanation && <section><h3>Validated explanation</h3><p>{state.explanation.explanation.summary}</p><ol>{state.explanation.explanation.steps.map((step, index) => <li key={index}><h4>{step.title}</h4><p>{step.text}</p><button disabled={state.busy} onClick={() => host.postMessage({ type: 'openSource', id: step.sourceRefId })}>Open source for this step</button></li>)}</ol><p>Model {state.explanation.model}; {state.explanation.latencyMs} ms; {state.explanation.usage?.totalTokens ?? 'unavailable'} tokens. Response {state.explanation.responseId}.</p><p>Source IDs and structure were validated. This explanation is not a check result or proof of understanding.</p></section>}
    <section aria-labelledby="prediction-title">
      <h2 id="prediction-title">Predict and observe</h2>
      <p>Using the current code, can client-other approve client-owner’s active milestone? Save your prediction and reasoning before running this prepared case.</p>
      {!state.confirmed && <p>Confirm the requirement above to start.</p>}
      {!state.prediction && <form onSubmit={event => {
        event.preventDefault();
        host.postMessage({ type: 'savePrediction', predictedApproval: predicted === 'allow', reasoning, sourceHash: state.sourceHash!, requirementRevision: state.requirement!.revision });
      }}>
        <fieldset disabled={state.busy || !state.confirmed || !state.sourceHash}>
          <legend>Your prediction</legend>
          <label htmlFor="predicted-approval">What will the current code do?</label>
          <select id="predicted-approval" required value={predicted} onChange={event => setPredicted(event.target.value)}><option value="">Choose an outcome</option><option value="allow">Allow approval</option><option value="deny">Deny approval</option></select>
          <label htmlFor="prediction-reasoning">Why do you expect this? (required, up to 1,000 characters)</label>
          <textarea id="prediction-reasoning" required maxLength={1000} rows={3} value={reasoning} onChange={event => setReasoning(event.target.value)} />
          <button type="submit" disabled={!predicted || !reasoning.trim()}>Save prediction</button>
        </fieldset>
      </form>}
      {state.prediction && <>
        <p role="status">Prediction saved: {state.prediction.predictedApproval ? 'Allow approval' : 'Deny approval'}. Reasoning: {state.prediction.reasoning}</p>
        <button ref={runButton} disabled={state.busy || state.counterexample?.kind === 'completed'} onClick={() => host.postMessage({ type: 'runCounterexample', predictionId: state.prediction!.id })}>{state.counterexampleRunning ? 'Running counterexample…' : state.counterexample && state.counterexample.kind !== 'completed' ? 'Retry ownership counterexample' : 'Run ownership counterexample'}</button>
        {state.counterexample?.kind === 'completed' && <div role="status">
          <h3 ref={resultHeading} tabIndex={-1}>{state.counterexample.requirementPassed ? 'Different-client ownership check passed' : 'Different-client ownership check FAILED'}</h3>
          <p>Runner observed: {state.counterexample.observedApproval ? 'Approval allowed' : 'Approval denied'}. Requirement expects denial for this different client.</p>
          <p>{state.counterexample.observedApproval === state.prediction.predictedApproval ? 'Observed behavior matches your saved prediction.' : 'Observed behavior differs from your saved prediction.'} This is an observation, not a score or proof of understanding.</p>
          <p>Vitest {state.counterexample.vitestVersion}: one case executed, two skipped; exit {state.counterexample.exitCode}; {state.counterexample.latencyMs} ms.</p>
          <p>Checked source: <code>{state.counterexample.sourceHash}</code><br />Requirement: <code>{state.counterexample.requirementRevision}</code></p>
          {state.refs.find(ref => ref.symbol === 'canApproveMilestone') && <button onClick={() => host.postMessage({ type: 'openSource', id: state.refs.find(ref => ref.symbol === 'canApproveMilestone')!.id })}>Open checked approval source</button>}
        </div>}
        {state.counterexample && state.counterexample.kind !== 'completed' && <p role="alert">Execution problem: {state.counterexample.message}</p>}
      </>}
    </section>
    <SnakeGame />
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
