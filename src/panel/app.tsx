import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PanelAction, PanelState } from '../shared.js';

declare function acquireVsCodeApi(): { postMessage(message: PanelAction): void };
const host = acquireVsCodeApi();

function App() {
  const [state, setState] = useState<PanelState>({ refs: [], busy: true });
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
    <p role="status" aria-live="polite">{state.busy ? 'Loading current source…' : `${state.refs.length} validated source reference(s)`}</p>
    <h2>Current source</h2>
    <button disabled={state.busy || !state.confirmed} onClick={() => host.postMessage({ type: 'refreshGraph' })}>Refresh source relationships</button>
    {state.graph && <section><p>Graphify {state.graph.version}: current AST relationships. These propose a requirement mapping; they do not prove policy satisfaction.</p><ul>{state.graph.relationships.map((edge, index) => <li key={index}>{state.refs.find(ref => ref.id === edge.sourceId)?.symbol} {edge.relation} {state.refs.find(ref => ref.id === edge.targetId)?.symbol} ({edge.provenance})</li>)}</ul><button disabled={state.busy || state.mappingConfirmed} onClick={() => host.postMessage({ type: 'confirmMapping', identity: state.graph!.identity })}>{state.mappingConfirmed ? 'Source mapping confirmed' : 'Use these source links for this requirement'}</button></section>}
    {state.refs.map(ref => <button key={ref.id} disabled={state.busy} onClick={() => host.postMessage({ type: 'openSource', id: ref.id })}>{ref.symbol} — {ref.path}:{ref.startLine}–{ref.endLine}</button>)}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
