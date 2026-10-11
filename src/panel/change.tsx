import { Task, Chip, Banner } from './v2/components.js';
import type { PanelState } from '../shared.js';
import { Control, SharingPreview, SourceLinks, type Send } from './ui.js';

export function Change({ state, send }: { state: PanelState; send: Send }) {
  const changed = Boolean(state.sourceHash && state.baselineHash !== state.sourceHash);
  const diffCurrent = state.diff?.sourceHash === state.sourceHash;
  if (state.hintPreview) return <SharingPreview preview={state.hintPreview} kind="hint" busy={state.busy} hasKey={state.hasKey} send={send} />;
  return <Task title="Try one small change" pose="pointing" action={<Control className="vd-primary" disabled={state.busy || state.contextStale || state.checksSupported !== true || !changed || (diffCurrent && !state.diff)} reason="Save a change, refresh it and restore trusted checks first." onClick={() => send({ type: diffCurrent && state.diff ? 'runOwnership' : 'openDiff' })}>{state.ownershipRunning ? 'Checking your code…' : diffCurrent && state.diff ? 'Check my change' : 'Compare my change'}</Control>}>
    {state.contextStale && <Banner tone="hint" title="Save and refresh your code">Earlier hints and checks cannot verify this version.</Banner>}
    <Chip icon="source">{state.contextStale ? 'Needs a refresh' : 'Saved code'}</Chip>
    {state.hints && <Chip icon="bulb">Coach hints recorded: {state.hints.length}</Chip>}
    <p>Open the code, make your change, then save. You can ask for a hint.</p>
    <SourceLinks refs={state.refs} busy={state.busy} current={state.referencesCurrent} send={send} />
    {!state.busy && <Control onClick={() => send({ type: 'ready' })}>Read my saved change</Control>}
    {state.hints?.map(evidence => <section key={evidence.id} className="vd-hint vd-explanation vd-reveal">
      <h3>Hint {evidence.result.hint.level} · {['The idea', 'Where to look', 'What to try'][evidence.result.hint.level - 1]}</h3>
      <p className="vd-teaching">{evidence.result.hint.text}</p>
      {!state.busy && state.referencesCurrent && evidence.sourceHash === state.sourceHash && evidence.requirementRevision === state.requirement?.revision && state.refs.some(ref => ref.id === evidence.result.hint.sourceRefId) && <Control onClick={() => send({ type: 'openSource', id: evidence.result.hint.sourceRefId })}>Open hint source</Control>}
      {(state.contextStale || evidence.sourceHash !== state.sourceHash || evidence.requirementRevision !== state.requirement?.revision) && <p className="vd-stale-text">This hint describes an earlier version.</p>}
    </section>)}
    <details className="vd-details"><summary>Need a hint?</summary><p>The coach guides your reasoning; you make the edit. Each request shares your prediction and observed result.</p>{(state.hints?.length ?? 0) < 3 ? !state.busy && <Control disabled={state.busy || state.contextStale || state.checksSupported !== true || !state.sourceHash || !state.confirmed} onClick={() => send({ type: 'previewHint' })}>Review before getting a hint</Control> : <p>All three hint levels used. Continue with your saved edit.</p>}</details>
    {state.diff && <p className="vd-muted">Comparison opened{diffCurrent ? ' for your saved code' : ' for an earlier version'}. It starts from your captured code.</p>}
    {!changed && <p className="vd-muted">Save a change before comparing it.</p>}
  </Task>;
}
