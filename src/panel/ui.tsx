import { useId, type ButtonHTMLAttributes } from 'react';
import { sharingSummary } from './workflow.js';
import type { ContextPreview, PanelAction, SourceRef } from '../shared.js';

export type Send = (action: PanelAction) => void;
export function Control({ disabled, reason = 'Available after the current operation finishes.', className, onClick, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { reason?: string }) {
  const id = useId();
  return <><button {...props} className={disabled ? className?.replace('vd-primary', 'vd-unavailable') : className} aria-disabled={disabled || undefined} aria-describedby={disabled ? id : props['aria-describedby']} onClick={event => { if (disabled) { event.preventDefault(); return; } onClick?.(event); }}>{children}</button>{disabled && <p id={id} className="vd-muted vd-unavailable-reason">{reason}</p>}</>;
}
export function Icon({ name }: { name: 'settings' | 'source' | 'check' | 'fail' | 'egg' }) {
  const paths = {
    settings: 'M4 7h16M4 17h16M8 4v6M16 14v6',
    source: 'm8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18',
    check: 'm5 12 4 4L19 6',
    fail: 'm6 6 12 12M6 18 18 6',
    egg: 'M12 3C8 3 5 11 5 15a7 7 0 0 0 14 0c0-4-3-12-7-12Z',
  };
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
export function SourceLinks({ refs, busy, current, send }: { refs: SourceRef[]; busy: boolean; current?: boolean; send: Send }) {
  if (busy) return null;
  return <div className="vd-source-list">{refs.slice(0, 5).map(ref => <Control className="vd-source" key={ref.id} disabled={current !== true} reason="Source links are stale. Save and refresh current context." onClick={() => send({ type: 'openSource', id: ref.id })}><Icon name="source" /><span><strong>{ref.symbol}</strong><span className="vd-file">{ref.path}:{ref.startLine}–{ref.endLine}</span></span></Control>)}</div>;
}
export function SharingPreview({ preview, kind, busy, hasKey, send }: { preview: ContextPreview; kind: 'explain' | 'hint'; busy: boolean; hasKey?: boolean; send: Send }) {
  const selected = sharingSummary(preview.text);
  return <section className="vd-consent" aria-label="Context sharing preview">
    <h3>Review before sharing</h3>
    <p>Send the selected requirement, source and relationships to OpenAI{kind === 'hint' ? ', along with your prediction, observed result and earlier hints' : ''}.</p>
    <p className="vd-teaching">{selected?.requirement ?? 'Context summary unavailable. Refresh the preview before sharing.'}</p>{selected && <ul className="vd-selected-files">{selected.files.map(file => <li key={file}><code>{file}</code></li>)}</ul>}
    <p className="vd-muted">Model: <code>{preview.model}</code>. A paid API request may apply.</p>
    <details className="vd-details"><summary>Exact context and instructions</summary><pre>{preview.instruction}</pre><pre>{preview.text}</pre></details>
    <Control className="vd-primary" disabled={busy || !selected} reason={busy ? 'Available after this request finishes.' : 'Available after a valid sharing preview is prepared.'} onClick={() => send(!hasKey && kind === 'explain' ? { type: 'setupKey' } : { type: kind, identity: preview.identity })}>{kind === 'explain' ? hasKey ? 'Send this context for an explanation' : 'Connect OpenAI' : hasKey ? 'Send this context for a hint' : 'Connect OpenAI and request hint'}</Control>
    {busy && <Control onClick={() => send({ type: 'cancelExplain' })}>Cancel {kind === 'hint' ? 'hint request' : 'explanation'}</Control>}
  </section>;
}
