import { Walkthrough } from './reuse-controls.js';
import type { PanelState } from '../shared.js';
import { Control, SharingPreview, SourceLinks, type Send } from './ui.js';

export function Understand({ state, send, next }: { state: PanelState; send: Send; next: () => void }) {
  const primary = state.contextStale || !state.requirement ? 'Refresh current context' : !state.confirmed ? 'Confirm this requirement' : !state.graphCurrent ? 'Find relevant source' : !state.mappingConfirmed ? 'Use these source links' : state.preview && !state.explanationCurrent ? undefined : state.explanationCurrent ? (state.requirement?.checksAvailable === false ? 'Explore the linked source' : 'Continue to prediction') : 'Review context for explanation';
  function act() {
    if (state.contextStale || !state.requirement) send({ type: 'ready' });
    else if (!state.confirmed) send({ type: 'confirmRequirement', revision: state.requirement.revision });
    else if (!state.graphCurrent || !state.graph) send({ type: 'refreshGraph' });
    else if (!state.mappingConfirmed) send({ type: 'confirmMapping', identity: state.graph.identity });
    else if (state.explanationCurrent) { if (state.requirement?.checksAvailable === false && state.refs[0]) send({ type: 'openSource', id: state.refs[0].id }); else next(); }
    else send({ type: 'previewExplain' });
  }
  return <>
    <h2>Understand this change</h2>
    <p>Follow the rule into the code. Read what it decides before predicting its behavior.</p>
    {!state.confirmed && <p className="vd-muted">Confirm the requirement before using the project’s source.</p>}
    {state.confirmed && <SourceLinks refs={state.refs} busy={state.busy} current={state.referencesCurrent} send={send} />}
    {state.graph && <details className="vd-details"><summary>Source relationships · {state.graph.relationships.length}{!state.graphCurrent ? ' · historical' : ''}</summary><p>Graphify {state.graph.version}. These relationships propose a mapping; they do not prove the rule is satisfied.</p><ul>{state.graph.relationships.map((edge, index) => <li key={index}>{state.graph!.refs.find(ref => ref.id === edge.sourceId)?.symbol} → {state.graph!.refs.find(ref => ref.id === edge.targetId)?.symbol}: {edge.relation} ({edge.provenance})</li>)}</ul><p>{!state.graphCurrent ? 'Saved relationships are stale. Extract current source before confirming its mapping.' : state.mappingConfirmed ? 'Mapping confirmed for this requirement.' : 'Review these source links before confirming the mapping.'}</p></details>}
    {state.explanation && <section className="vd-explanation vd-reveal">
      <h3>{state.explanationCurrent ? 'Source-linked explanation' : 'Recorded explanation · historical'}</h3>{!state.explanationCurrent && <p className="vd-stale-text">This explanation is stale or its source links need rebuilding. Refresh current context before using it.</p>}<p className="vd-teaching">{state.explanation.explanation.summary}</p>
      <details className="vd-details"><summary>Explain further and walk through code</summary><Walkthrough state={state} send={send} /><ol>{state.explanation.explanation.steps.map((step, index) => <li key={index}><h3>{step.title}</h3><p>{step.text}</p>{!state.busy && state.refs.some(ref => ref.id === step.sourceRefId) && <Control disabled={!state.explanationCurrent || !state.referencesCurrent} reason="Refresh current explanation and source links first." onClick={() => send({ type: 'openSource', id: step.sourceRefId })}>Open source for this step</Control>}</li>)}</ol></details>
      <p className="vd-muted">This interpretation is not an executed check or proof of understanding.</p>
    </section>}
    {state.preview && !state.explanationCurrent && <SharingPreview preview={state.preview} kind="explain" busy={state.busy} hasKey={state.hasKey} send={send} />}
    {primary && <Control className="vd-primary" disabled={state.busy} onClick={act}>{primary}</Control>}
  </>;
}
