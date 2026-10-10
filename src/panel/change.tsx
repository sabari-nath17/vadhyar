import type { PanelState } from '../shared.js';
import { Control, SharingPreview, SourceLinks, type Send } from './ui.js';

export function Change({ state, send }: { state: PanelState; send: Send }) {
  const changed = Boolean(state.sourceHash && state.baselineHash !== state.sourceHash);
  const diffCurrent = state.diff?.sourceHash === state.sourceHash;
  return <>
    <h2>Make your change</h2>
    <p>Edit the linked source yourself in VS Code. Save it, refresh its context, then inspect the native before/after diff.</p>
    <SourceLinks refs={state.refs} busy={state.busy} current={state.referencesCurrent} send={send} />
    {!state.busy && <Control onClick={() => send({ type: 'ready' })}>Refresh saved source</Control>}
    {state.hints?.map(evidence => <section key={evidence.id} className="vd-hint vd-explanation vd-reveal">
      <h3>Hint {evidence.result.hint.level} · {['Concept', 'Source attention', 'Debugging action'][evidence.result.hint.level - 1]}</h3>
      <p className="vd-teaching">{evidence.result.hint.text}</p>
      {!state.busy && state.referencesCurrent && evidence.sourceHash === state.sourceHash && evidence.requirementRevision === state.requirement?.revision && state.refs.some(ref => ref.id === evidence.result.hint.sourceRefId) && <Control onClick={() => send({ type: 'openSource', id: evidence.result.hint.sourceRefId })}>Open hint source</Control>}
      {(state.contextStale || evidence.sourceHash !== state.sourceHash || evidence.requirementRevision !== state.requirement?.revision) && <p className="vd-stale-text">This hint describes an earlier version.</p>}
    </section>)}
    <details className="vd-details"><summary>Need a hint?</summary><p>The coach guides your reasoning; you make the edit. Each request shares your prediction and observed result.</p>{(state.hints?.length ?? 0) < 3 ? !state.busy && <Control disabled={state.busy || state.contextStale || state.checksSupported !== true || !state.sourceHash || !state.confirmed} onClick={() => send({ type: 'previewHint' })}>Review context for hint {(state.hints?.length ?? 0) + 1}</Control> : <p>All three hint levels used. Continue with your saved edit.</p>}</details>
    {state.hintPreview ? <SharingPreview preview={state.hintPreview} kind="hint" busy={state.busy} hasKey={state.hasKey} send={send} /> : <>
      {state.diff && <p className="vd-muted">Native diff opened{diffCurrent ? ' for current saved source' : ' for an earlier version'}. Baseline is your captured pre-edit source.</p>}
      <Control className="vd-primary" disabled={state.busy || state.contextStale || state.checksSupported !== true || !changed || (diffCurrent && !state.diff)} reason="Available after saving a change, refreshing source and restoring trusted checks." onClick={() => send({ type: diffCurrent && state.diff ? 'runOwnership' : 'openDiff' })}>{state.ownershipRunning ? 'Running prepared checks…' : diffCurrent && state.diff ? 'Run checks on my changes' : 'Inspect my saved change'}</Control>
      {!changed && <p className="vd-muted">Save a change before comparing it with the baseline.</p>}
    </>}
  </>;
}
