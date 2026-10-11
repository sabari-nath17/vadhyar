import { useEffect, useRef, useState } from 'react';
import type { PanelState } from '../shared.js';
import { Task } from './v2/components.js';
import { currentRun } from './workflow.js';
import { Control, Icon, type Send } from './ui.js';

export function Observation({ state }: { state: PanelState }) {
  const result = state.counterexample;
  if (!result) return null;
  if (result.kind !== 'completed') return <div className="vd-banner vd-fail" role="alert"><h3>Checks could not run</h3><p>{result.message}</p><p>No observed approval was recorded. Retry the saved case.</p></div>;
  const current = state.counterexampleCurrent === true && result.sourceHash === state.sourceHash && result.requirementRevision === state.requirement?.revision;
  return <>
    {state.prediction && <section className="vd-prediction"><p className="vd-label">You predicted · locked</p><h3>{state.prediction.predictedApproval ? 'Approval allowed' : 'Approval denied'}</h3><blockquote>{state.prediction.reasoning}</blockquote></section>}
    <section className={`vd-executed ${!current ? 'vd-stale' : result.requirementPassed ? 'vd-pass' : 'vd-fail'} vd-reveal`}>
      <p className="vd-label">Executed · {current ? 'current code and checks' : 'earlier source or checks'} · {result.requirementPassed ? 'matches rule' : 'breaks rule'}</p>
      <h3><Icon name={result.requirementPassed ? 'check' : 'fail'} /> {result.observedApproval ? 'Approval allowed' : 'Approval denied'}</h3>
      <p>{result.caseId === 'owner-client-archived' ? 'Even the owning client must be denied for an archived milestone.' : 'The different client must be denied.'} One case executed; {result.skippedCases} skipped.</p>
      {!current && <p>Historical observation. Inspect the saved diff and rerun all checks to verify current code.</p>}
    </section>
    {state.prediction && result.observedApproval !== state.prediction.predictedApproval && <p className="vd-disagreement"><span aria-hidden="true">≠</span> The code behaved differently from your prediction.</p>}
    <p className="vd-muted">An observed result does not establish understanding.</p>
  </>;
}
export function Verification({ state, send }: { state: PanelState; send: Send }) {
  const run = state.ownershipRun;
  const current = currentRun(state);
  return <Task title="Does your change follow the rule?" pose={current && run?.kind === 'completed' && run.requirementPassed ? 'aha' : 'pointing'} action={<><Control className={state.exercise !== 'transfer' && current && run?.kind === 'completed' && run.requirementPassed ? undefined : 'vd-primary'} disabled={state.busy || state.contextStale || state.checksSupported !== true || !state.diff || state.diff.sourceHash !== state.sourceHash} reason="Open the saved comparison and restore trusted checks first." onClick={() => send({ type: 'runOwnership' })}>{state.ownershipRunning ? 'Checking your code…' : 'Check again'}</Control>{state.exercise !== 'transfer' && current && run?.kind === 'completed' && run.requirementPassed && <Control className="vd-primary" disabled={state.busy} onClick={() => send({ type: 'startTransfer' })}>Try the next rule</Control>}</>}>
    <p>These are the results from the saved code.</p>
    {!run && <p>No full check result yet. Open the saved diff in Change, then run the ownership checks.</p>}
    {run?.kind === 'completed' && <section className={`vd-executed ${current && run.requirementPassed ? 'vd-pass' : current ? 'vd-fail' : 'vd-stale'} vd-reveal`}>
      <p className="vd-label">Executed · {current ? 'current code and checks' : 'earlier source or checks'}</p>
      <h3><Icon name={run.requirementPassed ? 'check' : 'fail'} />{!current ? 'Result needs a refresh' : run.requirementPassed ? 'Checks passed' : 'Checks break the rule'}</h3>
      <ul className="vd-cases">{run.cases.map(item => <li key={item.id}><span className={item.status === 'passed' ? 'vd-pass-text' : 'vd-fail-text'}><Icon name={item.status === 'passed' ? 'check' : 'fail'} /> {item.status === 'passed' ? 'Matches rule' : 'Breaks rule'}</span><strong>{item.id.replaceAll('-', ' ')}</strong><span>Required: {item.expectedApproval ? 'allow' : 'deny'} · Observed: {item.observedApproval ? 'allow' : 'deny'}</span></li>)}</ul>
      <p>{run.cases.length} cases executed, none skipped. {state.hints?.length ?? 0} hints used.</p>
    </section>}
    {run && run.kind !== 'completed' && <div className="vd-banner vd-fail" role="alert"><h3>Checks could not run</h3><p>{run.message}</p><p>No learner-answer verdict was recorded.</p></div>}
    <p className="vd-muted">Passing these cases is evidence of behavior, not mastery. {state.exercise === 'transfer' ? `${state.hints?.length ?? 0} coach hints recorded in this transfer. External assistance is unknown.` : 'Try the archived-milestone rule next, using your own edit.'}</p>
    <Reflection state={state} send={send} />
  </Task>;
}

function Reflection({ state, send }: { state: PanelState; send: Send }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const pending = useRef<{ text: string; count: number } | undefined>(undefined);
  useEffect(() => {
    if (!pending.current) return;
    if ((state.reflections?.length ?? 0) > pending.current.count && state.reflections?.at(-1)?.text === pending.current.text) {
      const saved = pending.current.text;
      setText(current => current.trim() === saved ? '' : current); setSaving(false); pending.current = undefined;
    } else if (state.error) { setSaving(false); pending.current = undefined; }
  }, [state.reflections, state.error]);
  return <details className="vd-details"><summary>What did you notice? · saved here</summary>
    <p>What changed in your reasoning? Save this note to keep it when you return. It is not sent to the coach.</p>
    <form onSubmit={event => {
      event.preventDefault();
      if (!text.trim() || saving || !state.sourceHash || !state.requirement) return;
      pending.current = { text: text.trim(), count: state.reflections?.length ?? 0 }; setSaving(true);
      send({ type: 'saveReflection', text, sourceHash: state.sourceHash, requirementRevision: state.requirement.revision });
    }}>
      <label htmlFor="learning-reflection">Your note</label><textarea id="learning-reflection" required maxLength={2000} rows={2} value={text} onChange={event => setText(event.target.value)} aria-describedby="reflection-limit" />
      <p id="reflection-limit" className="vd-muted">Up to 2,000 characters. Unsaved text is not restored.</p>
      <Control type="submit" disabled={state.busy || saving || !text.trim() || !state.ownershipCurrent} reason={saving ? 'Your note is being saved.' : 'Write a note after running current trusted checks on this source.'}>{saving ? 'Saving reflection…' : 'Save my note'}</Control>
    </form>
    {state.reflections?.map(item => <section key={item.id}><p>{item.text}</p><p className="vd-muted">Saved {new Date(item.recordedAt).toLocaleString()}{item.sourceHash !== state.sourceHash || item.requirementRevision !== state.requirement?.revision ? ' · earlier source or requirement' : ''}</p></section>)}
  </details>;
}
