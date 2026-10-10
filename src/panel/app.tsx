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
  const hintHeading = useRef<HTMLHeadingElement>(null);
  const rerunButton = useRef<HTMLButtonElement>(null);
  const ownershipHeading = useRef<HTMLHeadingElement>(null);
  const hintCount = state.hints?.length ?? 0;
  useEffect(() => {
    if (state.counterexample?.kind === 'completed') resultHeading.current?.focus();
    else if (state.prediction) runButton.current?.focus();
  }, [state.prediction?.id, state.counterexample?.id]);
  useEffect(() => { if (hintCount) hintHeading.current?.focus(); }, [hintCount]);
  useEffect(() => {
    if (state.ownershipRun) ownershipHeading.current?.focus();
    else if (state.diff) rerunButton.current?.focus();
  }, [state.diff?.id, state.ownershipRun?.id]);
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
    <p role="status" aria-live="polite">{state.ownershipRunning ? 'Running all three ownership checks…' : state.counterexampleRunning ? 'Running the saved ownership counterexample…' : state.busy && state.hintPreview ? 'Requesting a grounded hint…' : state.busy ? 'Loading current source…' : `${state.refs.length} validated source reference(s)`}</p>
    <h2>Current source</h2>
    <button disabled={state.busy || !state.confirmed} onClick={() => host.postMessage({ type: 'refreshGraph' })}>Refresh source relationships</button>
    {state.graph && <section><p>Graphify {state.graph.version}: current AST relationships. These propose a requirement mapping; they do not prove policy satisfaction.</p><ul>{state.graph.relationships.map((edge, index) => <li key={index}>{state.refs.find(ref => ref.id === edge.sourceId)?.symbol} {edge.relation} {state.refs.find(ref => ref.id === edge.targetId)?.symbol} ({edge.provenance})</li>)}</ul><button disabled={state.busy || state.mappingConfirmed} onClick={() => host.postMessage({ type: 'confirmMapping', identity: state.graph!.identity })}>{state.mappingConfirmed ? 'Source mapping confirmed' : 'Use these source links for this requirement'}</button></section>}
    {state.refs.map(ref => <button key={ref.id} disabled={state.busy} onClick={() => host.postMessage({ type: 'openSource', id: ref.id })}>{ref.symbol} — {ref.path}:{ref.startLine}–{ref.endLine}</button>)}
    <h2>Explain current source</h2>
    <button disabled={state.busy} onClick={() => host.postMessage({ type: 'setupKey' })}>{state.hasKey ? 'Replace API key securely' : 'Set API key securely'}</button>
    <p>The key stays in VS Code SecretStorage. Sharing sends only the previewed requirement, current source and selected evidence to OpenAI. Hint previews also include your saved prediction, observed counterexample and previous hints.</p>
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
        <button ref={runButton} disabled={state.busy || state.counterexample?.kind === 'completed' || state.prediction.sourceHash !== state.sourceHash} onClick={() => host.postMessage({ type: 'runCounterexample', predictionId: state.prediction!.id })}>{state.counterexampleRunning ? 'Running counterexample…' : state.counterexample && state.counterexample.kind !== 'completed' ? 'Retry ownership counterexample' : 'Run ownership counterexample'}</button>
        {state.counterexample?.kind === 'completed' && <div role="status">
          <h3 ref={resultHeading} tabIndex={-1}>{state.counterexample.requirementPassed ? 'Different-client ownership check passed' : 'Different-client ownership check FAILED'}</h3>
          {state.counterexample.sourceHash !== state.sourceHash && <p>This is the before-edit counterexample, retained with your saved prediction. It is not a check of current code.</p>}
          <p>Runner observed: {state.counterexample.observedApproval ? 'Approval allowed' : 'Approval denied'}. Requirement expects denial for this different client.</p>
          <p>{state.counterexample.observedApproval === state.prediction.predictedApproval ? 'Observed behavior matches your saved prediction.' : 'Observed behavior differs from your saved prediction.'} This is an observation, not a score or proof of understanding.</p>
          <p>Vitest {state.counterexample.vitestVersion}: one case executed, two skipped; exit {state.counterexample.exitCode}; {state.counterexample.latencyMs} ms.</p>
          <p>Checked source: <code>{state.counterexample.sourceHash}</code><br />Requirement: <code>{state.counterexample.requirementRevision}</code></p>
          {state.refs.find(ref => ref.symbol === 'canApproveMilestone') && <button disabled={state.busy || !state.sourceHash} onClick={() => host.postMessage({ type: 'openSource', id: state.refs.find(ref => ref.symbol === 'canApproveMilestone')!.id })}>Open current approval source</button>}
        </div>}
        {state.counterexample && state.counterexample.kind !== 'completed' && <p role="alert">Execution problem: {state.counterexample.message}</p>}
      </>}
    </section>
    {state.prediction && state.counterexample?.kind === 'completed' && !state.counterexample.requirementPassed && <>
      <section aria-labelledby="hint-title">
        <h2 id="hint-title">Investigate with progressive hints</h2>
        <p>Hints guide your investigation; you edit and save the code yourself. Level 1: concept. Level 2: source fields. Level 3: debugging action.</p>
        <p>Hints used: {hintCount}/3. Assistance is recorded; a passing check does not prove understanding.</p>
        <button disabled={state.busy || !state.sourceHash || hintCount >= 3} onClick={() => host.postMessage({ type: 'previewHint' })}>{hintCount >= 3 ? 'All three hints used' : `Preview hint ${hintCount + 1}`}</button>
        {state.hintPreview && <section><h3>Hint sharing preview</h3><p>Model: {state.hintPreview.model}. A paid API request may apply.</p><pre>{state.hintPreview.instruction}</pre><details><summary>Exact requirement, source, prediction, counterexample and previous hints</summary><pre>{state.hintPreview.text}</pre></details><button disabled={state.busy} onClick={() => host.postMessage({ type: 'hint', identity: state.hintPreview!.identity })}>Share this context and request hint</button></section>}
        {state.busy && state.hintPreview && <button onClick={() => host.postMessage({ type: 'cancelExplain' })}>Cancel hint request</button>}
        {state.hints?.map(item => <section key={item.id}><h3 ref={hintHeading} tabIndex={-1}>Hint {item.result.hint.level}</h3><p>{item.result.hint.text}</p>{item.sourceHash !== state.sourceHash && <p>This hint refers to the earlier source shown in its evidence.</p>}<button disabled={state.busy || item.sourceHash !== state.sourceHash} onClick={() => host.postMessage({ type: 'openSource', id: item.result.hint.sourceRefId })}>Open hint source</button><p>Model {item.result.model}; {item.result.latencyMs} ms; {item.result.usage?.totalTokens ?? 'unavailable'} tokens. Response {item.result.responseId}.</p></section>)}
      </section>
      <section aria-labelledby="edit-title">
        <h2 id="edit-title">Edit, compare and verify</h2>
        <p>Edit src/approval.ts yourself in VS Code and save it. The coach cannot edit files. Refresh the saved source, open its native before/after diff, then rerun all three trusted cases.</p>
        <button disabled={state.busy} onClick={() => host.postMessage({ type: 'ready' })}>Refresh saved source</button>
        <button disabled={state.busy || !state.sourceHash || state.sourceHash === state.baselineHash} onClick={() => host.postMessage({ type: 'openDiff' })}>Open native before/after diff</button>
        {state.diff && <p>Diff recorded: before <code>{state.diff.before.hash}</code>; saved source <code>{state.diff.after.hash}</code>.</p>}
        <button ref={rerunButton} disabled={state.busy || !state.diff || state.diff.after.hash !== state.sourceHash} onClick={() => host.postMessage({ type: 'runOwnership' })}>{state.ownershipRunning ? 'Running all three ownership checks…' : 'Run all three ownership checks'}</button>
        {state.ownershipRun && <div role={state.ownershipRun.kind === 'completed' ? 'status' : 'alert'}>
          <h3 ref={ownershipHeading} tabIndex={-1}>{state.ownershipRun.kind === 'completed' ? state.ownershipRun.requirementPassed ? 'All three ownership checks passed' : 'Ownership requirement checks FAILED' : 'Ownership checks: execution problem'}</h3>
          {state.ownershipRun.kind === 'completed' ? <><table><caption>Actual trusted runner results against your saved source</caption><thead><tr><th scope="col">Case</th><th scope="col">Required</th><th scope="col">Observed</th><th scope="col">Check</th></tr></thead><tbody>{state.ownershipRun.cases.map(item => <tr key={item.id}><th scope="row">{item.id === 'owner-client-active' ? 'Owner client' : item.id === 'other-client-active' ? 'Different client' : 'Freelancer'}</th><td>{item.expectedApproval ? 'Allow' : 'Deny'}</td><td>{item.observedApproval ? 'Allow' : 'Deny'}</td><td>{item.status === 'passed' ? 'PASS' : 'FAILED'}</td></tr>)}</tbody></table><p>Vitest {state.ownershipRun.vitestVersion}: three cases executed, none skipped; exit {state.ownershipRun.exitCode}; {state.ownershipRun.latencyMs} ms.</p><p>{state.ownershipRun.requirementPassed ? 'The saved edit satisfies these three ownership cases.' : 'The saved edit does not satisfy the ownership requirement. Keep investigating and edit it yourself.'} {hintCount} recorded hint(s); this is not a mastery or authorship claim.</p></> : <p>{state.ownershipRun.message} No learner-answer verdict was produced. Fix the execution problem and retry.</p>}
          <p>Checked source: <code>{state.ownershipRun.sourceHash}</code><br />Before-edit source: <code>{state.ownershipRun.baselineHash}</code><br />Requirement: <code>{state.ownershipRun.requirementRevision}</code></p>
        </div>}
      </section>
    </>}
    <SnakeGame />
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
