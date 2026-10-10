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
    <p role="status" aria-live="polite">{state.busy ? 'Loading current source…' : `${state.refs.length} validated source reference(s)`}</p>
    <h2>Current source</h2>
    {state.refs.map(ref => <button key={ref.id} disabled={state.busy} onClick={() => host.postMessage({ type: 'openSource', id: ref.id })}>{ref.symbol} — {ref.path}:{ref.startLine}–{ref.endLine}</button>)}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
