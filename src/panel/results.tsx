import { useEffect, useRef, useState } from 'react';
import type { PanelState } from '../shared.js';
import { Task } from './v2/components.js';
import { recordedSummary } from './v2/evidence.js';
import { currentRun } from './workflow.js';
import { Control, Icon, type Send } from './ui.js';

export function Observation({ state }: { state: PanelState }) {
  const result = state.counterexample;
  if (!result) return null;
  if (result.kind !== 'completed') return <div className="vd-banner vd-fail" role="alert"><h3>Checks could not run</h3><p>{result.message}</p><p>No observed approval was recorded. Retry the saved case.</p></div>;
  const current = state.counterexampleCurrent === true && result.sourceHash === state.sourceHash && result.requirementRevision === state.requirement?.revision;
  // The runner records a binary approval outcome and whether it matched the rule.
  const expected = result.requirementPassed ? result.observedApproval : !result.observedApproval;
  return <>
    <p className="vd2-caption">Executed · {current ? 'current code and checks' : 'earlier source or checks'}</p>
    <dl className="vd-observation-ledger">
      <div><dt>Predicted</dt><dd>{state.prediction ? state.prediction.predictedApproval ? 'Allow approval' : 'Stop approval' : 'Not recorded'}</dd></div>
      <div><dt>Code did</dt><dd><Icon name={result.requirementPassed ? 'check' : 'fail'} /> {result.observedApproval ? 'Allowed approval' : 'Stopped approval'}</dd></div>
      <div><dt>Rule says</dt><dd>{expected ? 'Allow approval' : 'Stop approval'}</dd></div>
    </dl>
    <p className={current && result.requirementPassed ? 'vd-pass-text' : current ? 'vd-fail-text' : 'vd-stale-text'}>{current ? result.requirementPassed ? 'This case follows your rule.' : 'This case breaks your rule.' : 'Earlier result. Check your saved change before trusting it.'}</p>
    {state.prediction && result.observedApproval !== state.prediction.predictedApproval && <p className="vd-disagreement"><span aria-hidden="true">≠</span> The code behaved differently from your prediction.</p>}
    {state.prediction && <details className="vd-details"><summary>Why you made that guess</summary><blockquote>{state.prediction.reasoning}</blockquote></details>}
    <p className="vd2-caption">{result.executedCases} case{result.executedCases === 1 ? '' : 's'} executed; {result.skippedCases} skipped.</p>
    <p className="vd-muted">An observed result does not establish understanding.</p>
  </>;
}
export function Verification({ state, send, complete, notes }: { state: PanelState; send: Send; complete: () => void; notes: () => void }) {
  const run = state.ownershipRun;
  const current = currentRun(state);
  const summary = recordedSummary(state);
  return <Task title="Does your change follow the rule?" pose={summary.passed ? 'aha' : 'pointing'} action={<><Control className={summary.passed ? undefined : 'vd-primary'} disabled={state.busy || state.contextStale || state.checksSupported !== true || !state.diff || state.diff.sourceHash !== state.sourceHash} reason="Open the saved comparison and restore trusted checks first." onClick={() => send({ type: 'runOwnership' })}>{state.ownershipRunning ? 'Checking your code…' : 'Check again'}</Control>{summary.passed && <Control className="vd-primary" onClick={complete}>See my summary</Control>}</>}>
    <p>These are the results from the saved code.</p>
    {!run && <p>No full check result yet. Open the saved diff in Change, then run the ownership checks.</p>}
    {run?.kind === 'completed' && <section className={`vd-executed ${current && run.requirementPassed ? 'vd-pass' : current ? 'vd-fail' : 'vd-stale'} vd-reveal`}>
      <p className="vd-label">Executed · {current ? 'current code and checks' : 'earlier source or checks'}</p>
      <h3><Icon name={run.requirementPassed ? 'check' : 'fail'} />{!current ? 'Result needs a refresh' : run.requirementPassed ? 'Checks passed' : 'Checks break the rule'}</h3>
      <ul className="vd-cases">{run.cases.map(item => <li key={item.id}><span className={item.status === 'passed' ? 'vd-pass-text' : 'vd-fail-text'}><Icon name={item.status === 'passed' ? 'check' : 'fail'} /> {item.status === 'passed' ? 'Matches rule' : 'Breaks rule'}</span><strong>{item.id.replaceAll('-', ' ')}</strong><span>Required: {item.expectedApproval ? 'allow' : 'deny'} · Observed: {item.observedApproval ? 'allow' : 'deny'}</span></li>)}</ul>
      <p>{run.cases.length} cases executed, none skipped. Coach hints: {summary.hints ?? 'not recorded'}.</p>
    </section>}
    {run && run.kind !== 'completed' && <div className="vd-banner vd-fail" role="alert"><h3>Checks could not run</h3><p>{run.message}</p><p>No learner-answer verdict was recorded.</p></div>}
    <p className="vd-muted">Passing these cases is evidence of behavior, not mastery. Outside help is unknown.</p>
    <Control onClick={notes}>Save what I noticed</Control>
  </Task>;
}

export function Reflection({ state, send }: { state: PanelState; send: Send }) {
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
  return <section className="vd-reflection"><h3>What did you notice?</h3>
    <p>What changed in your reasoning? Save this note to keep it when you return. It is not sent to the coach.</p>
    <form onSubmit={event => {
      event.preventDefault();
      if (!text.trim() || state.busy || saving || !state.ownershipCurrent || !state.sourceHash || !state.requirement) return;
      pending.current = { text: text.trim(), count: state.reflections?.length ?? 0 }; setSaving(true);
      send({ type: 'saveReflection', text, sourceHash: state.sourceHash, requirementRevision: state.requirement.revision });
    }}>
      <label htmlFor="learning-reflection">Your note</label><textarea id="learning-reflection" required maxLength={2000} rows={2} value={text} onChange={event => setText(event.target.value)} aria-describedby="reflection-limit" />
      <p id="reflection-limit" className="vd-muted">Up to 2,000 characters. Unsaved text is not restored.</p>
      <Control type="submit" disabled={state.busy || saving || !text.trim() || !state.ownershipCurrent} reason={saving ? 'Your note is being saved.' : 'Write a note after running current trusted checks on this source.'}>{saving ? 'Saving reflection…' : 'Save my note'}</Control>
    </form>
    {state.reflections?.map(item => <section key={item.id}><p>{item.text}</p><p className="vd-muted">Saved {new Date(item.recordedAt).toLocaleString()}{item.sourceHash !== state.sourceHash || item.requirementRevision !== state.requirement?.revision ? ' · earlier source or requirement' : ''}</p></section>)}
  </section>;
}
