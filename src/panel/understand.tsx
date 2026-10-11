import { Task, Banner } from './v2/components.js';
import { Walkthrough } from './reuse-controls.js';
import type { PanelState } from '../shared.js';
import { Control, SharingPreview, SourceLinks, type Send } from './ui.js';

export function Understand({ state, send, next }: { state: PanelState; send: Send; next: () => void }) {
  if (state.hasKey === false && !state.explanationCurrent) return <Task title="Connect OpenAI for guidance" pose="key" action={<Control className="vd-primary" disabled={state.busy} onClick={() => send({type:'setupKey'})}>Connect OpenAI</Control>}><p>The editor opens a secure key prompt. Your key stays there.</p><p>You will review the code and rule before anything is sent.</p><SourceLinks refs={state.refs} busy={state.busy} current={state.referencesCurrent} send={send} /></Task>;
  const primary = state.contextStale || !state.requirement ? 'Read the saved code' : !state.confirmed ? 'Confirm your rule' : !state.graphCurrent ? 'Find the code' : !state.mappingConfirmed ? 'Use these code links' : state.preview && !state.explanationCurrent ? undefined : state.explanationCurrent ? (state.requirement?.checksAvailable === false ? 'Open the code' : 'Make a guess') : 'Review what will be shared';
  function act() {
    if (state.contextStale || !state.requirement) send({ type: 'ready' });
    else if (!state.confirmed) send({ type: 'confirmRequirement', revision: state.requirement.revision });
    else if (!state.graphCurrent || !state.graph) send({ type: 'refreshGraph' });
    else if (!state.mappingConfirmed) send({ type: 'confirmMapping', identity: state.graph.identity });
    else if (state.explanationCurrent) { if (state.requirement?.checksAvailable === false && state.refs[0]) send({ type: 'openSource', id: state.refs[0].id }); else next(); }
    else send({ type: 'previewExplain' });
  }
  if (state.preview && !state.explanationCurrent) return <SharingPreview preview={state.preview} kind="explain" busy={state.busy} hasKey={state.hasKey} send={send} />;
  return <Task title={state.busy ? 'Finding the relevant code…' : 'How does this work?'} pose={state.busy ? 'thinking' : 'pointing'} action={primary && <Control className="vd-primary" disabled={state.busy} onClick={act}>{state.busy ? 'Reading your code…' : primary}</Control>}>
    <p>Follow your rule into the code. The links open the real files.</p>
    {state.contextStale && <Banner tone="hint" title="Your code needs a refresh">Save any edits, then read the saved code. Earlier explanations stay in your proof.</Banner>}
    {state.busy && <div className="vd2-loading" aria-hidden="true"><span /><span /></div>}
    {!state.confirmed && <p className="vd-muted">Confirm the requirement before using the project’s source.</p>}
    {state.confirmed && <SourceLinks refs={state.refs} busy={state.busy} current={state.referencesCurrent} send={send} />}
    {state.graph && <details className="vd-details" open={state.graphCurrent && !state.mappingConfirmed}><summary>Show the code connections · {state.graph.relationships.length}{!state.graphCurrent ? ' · historical' : ''}</summary><p>Graphify {state.graph.version}. These links propose where the rule is implemented. They do not prove its behavior.</p><ul>{state.graph.relationships.map((edge, index) => <li key={index}>{state.graph!.refs.find(ref => ref.id === edge.sourceId)?.symbol} → {state.graph!.refs.find(ref => ref.id === edge.targetId)?.symbol}: {edge.relation} ({edge.provenance})</li>)}</ul><p>{!state.graphCurrent ? 'Read current code before approving these links.' : state.mappingConfirmed ? 'You approved these links for this rule.' : 'Read the source links before approving them.'}</p></details>}
    {state.explanation && <section className="vd-explanation vd-reveal">
      <h3>{state.explanationCurrent ? 'Source-linked explanation' : 'Recorded explanation · historical'}</h3>{!state.explanationCurrent && <p className="vd-stale-text">This explanation is stale or its source links need rebuilding. Refresh current context before using it.</p>}<p className="vd-teaching">{state.explanation.explanation.summary}</p>
      <details className="vd-details"><summary>Take me through the code</summary><Walkthrough state={state} send={send} /><ol>{state.explanation.explanation.steps.map((step, index) => <li key={index}><h3>{step.title}</h3><p>{step.text}</p>{!state.busy && state.refs.some(ref => ref.id === step.sourceRefId) && <Control disabled={!state.explanationCurrent || !state.referencesCurrent} reason="Refresh current explanation and source links first." onClick={() => send({ type: 'openSource', id: step.sourceRefId })}>Open source for this step</Control>}</li>)}</ol></details>
      <p className="vd-muted">This interpretation is not an executed check or proof of understanding.</p>
    </section>}
  </Task>;
}
