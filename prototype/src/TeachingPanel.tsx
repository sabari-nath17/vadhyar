import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { projectRequest } from './project-api.js';
import { teachingExplanationSchema, teachingStatusSchema, type SourceSnapshot } from './project-types.js';
import type { TeachingExplanation } from './project-learning.js';
import { Arrow, Control, download } from './ui.js';

export function TeachingPanel({ source, requirement, caseInput, onBusy, onUnretained, saved, onResult }: { source: SourceSnapshot; requirement: string; caseInput: string; onBusy: (busy: boolean) => void; onUnretained: (result: TeachingExplanation | null) => void; saved: TeachingExplanation[]; onResult: (result: TeachingExplanation) => boolean }) {
 const [status, setStatus] = useState<z.infer<typeof teachingStatusSchema> | null>(null), [key, setKey] = useState(''), [model, setModel] = useState('');
 const [busy, setBusy] = useState(false), [error, setError] = useState(''), [consent, setConsent] = useState(false);
 const [result, setResult] = useState<TeachingExplanation | null>(saved.at(-1) ?? null), [retained, setRetained] = useState(true);
 const [statusRetry, setStatusRetry] = useState(0), [setupLoading, setSetupLoading] = useState(true);
 const dialog = useRef<HTMLDialogElement>(null), pending = useRef<AbortController | null>(null);
 useEffect(() => () => pending.current?.abort(), []);
 useEffect(() => () => onUnretained(null), [onUnretained]);
 useEffect(() => { onBusy(busy); return () => onBusy(false); }, [busy, onBusy]);
 useEffect(() => {
  const controller = new AbortController(); setSetupLoading(true);
  void projectRequest('/api/teaching', teachingStatusSchema, undefined, controller.signal).then(value => { if (!controller.signal.aborted) { setStatus(value); setModel(value.model ?? ''); } }).catch(() => { if (!controller.signal.aborted) setError('Teaching setup is unavailable. Local recording and learning steps still work.'); }).finally(() => { if (!controller.signal.aborted) setSetupLoading(false); });
  return () => controller.abort();
 }, [statusRetry]);
 useEffect(() => { if (consent) dialog.current?.showModal(); else dialog.current?.close(); }, [consent]);
 const connect = async () => {
  setBusy(true); setError('');
  const supplied = key; setKey('');
  const controller = new AbortController(); pending.current = controller;
  try { const value = await projectRequest('/api/teaching/connect', teachingStatusSchema, { key: supplied }, controller.signal); if (!controller.signal.aborted) { setStatus(value); setModel(value.model ?? ''); } }
  catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'OpenAI could not connect.'); }
  finally { if (!controller.signal.aborted) setBusy(false); }
 };
 const explain = async () => {
  setConsent(false); setBusy(true); setError('');
  const controller = new AbortController(); pending.current = controller;
  try {
   const value = await projectRequest('/api/teaching/explain', teachingExplanationSchema, { fileId: source.fileId, sourceHash: source.sourceHash, startLine: source.startLine, endLine: source.endLine, lines: Math.max(1, source.endLine - source.startLine + 1), requirement, caseInput, model, approved: true }, controller.signal);
   if (controller.signal.aborted) return;
   const accepted = onResult(value);
   setResult(value); setRetained(accepted);
   onUnretained(accepted ? null : value);
  } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Explanation could not be generated. Recording is unaffected.'); }
  finally { if (!controller.signal.aborted) setBusy(false); }
 };
 const disconnect = async () => {
  setBusy(true); setError('');
  const controller = new AbortController(); pending.current = controller;
  try { const value = await projectRequest('/api/teaching/disconnect', teachingStatusSchema, {}, controller.signal); if (!controller.signal.aborted) { setStatus(value); setModel(''); } }
  catch { if (!controller.signal.aborted) setError('Provider disconnection could not be confirmed. Stop the launcher to clear its session key.'); }
  finally { if (!controller.signal.aborted) setBusy(false); }
 };
 const cancel = () => { pending.current?.abort(); setBusy(false); setStatus(null); setModel(''); setError('The browser request was cancelled. It may already have reached the host or provider; usage already incurred cannot be undone. Retry teaching setup to read its actual status.'); };
 const historical = result && result.sourceHash !== source.sourceHash;
 return <section className="teaching-panel"><h3>A teacher alongside your code.</h3><p>OpenAI is the teaching provider. Your coding tool can be different.</p>{error && <div className="notice warning" role="alert"><p>{error}</p><Control className="secondary" disabled={busy} onClick={() => { setError(''); setStatusRetry(value => value + 1); }}>Retry teaching setup</Control></div>}{!status?.connected ? <><label className="field">OpenAI API key · this host session only<input type="password" autoComplete="off" spellCheck={false} maxLength={512} value={key} disabled={busy} onChange={e => setKey(e.target.value)} placeholder="Enter your own API key" /></label><Control className="secondary" disabled={busy || setupLoading || key.trim().length < 8} reason={setupLoading ? 'Reading teaching setup…' : busy ? 'Wait for the current teacher request to finish.' : 'Enter your complete OpenAI API key to connect. Teaching is optional; manual learning works without it.'} onClick={() => { void connect(); }}>Connect OpenAI</Control><p className="disclosure">The key stays in the local host’s memory and clears on shutdown. It is never stored in browser history. Setup checks models; no source is sent.</p></> : <><label className="field">Teaching model<select value={model} disabled={busy} onChange={e => setModel(e.target.value)}><option value="">Choose an available model</option>{status.models.map(value => <option key={value} value={value}>{value}</option>)}</select></label><div className="button-row"><Control className="secondary" disabled={busy || !retained || !model || saved.length >= 5} reason={!retained ? 'Export this interpretation and resolve the saved record before asking again.' : busy ? 'Wait for the current teacher request to finish.' : !model ? 'Choose an available teaching model first.' : 'An attempt retains up to five interpretations. Export and start another question when full.'} onClick={() => setConsent(true)}>{busy ? 'Waiting for OpenAI…' : 'Review excerpt and ask teacher'}<Arrow /></Control><Control className="text-button" disabled={busy} onClick={() => { void disconnect(); }}>Disconnect</Control></div></>}{busy && <Control className="text-button" onClick={cancel}>Cancel browser request</Control>}{result && <section className="generated-explanation"><strong>Generated interpretation{historical ? ' · earlier source' : ''}</strong><p className="disclosure">{result.model} · source {result.sourceHash.slice(0, 12)} · lines {result.startLine}–{result.endLine}</p>{!retained && <p className="notice warning" role="alert">Not retained in this question. Export this interpretation before leaving.</p>}{!retained && <Control className="secondary" disabled={busy} onClick={() => { if (onResult(result)) { setRetained(true); onUnretained(null); } }}>Retry retaining interpretation</Control>}<p>{result.explanation.summary}</p><ul>{result.explanation.conditions.map((condition, i) => <li key={i}><strong>Lines {condition.startLine}–{condition.endLine}</strong>: {condition.explanation}</li>)}</ul><h4>Questions to investigate</h4><ul>{result.explanation.questions.map((question, i) => <li key={i}>{question}</li>)}</ul><h4>Coverage and uncertainty</h4><ul>{result.explanation.limits.map((limit, i) => <li key={i}>{limit}</li>)}</ul><Control className="text-button" onClick={() => download(JSON.stringify(result, null, 2), 'vadhyar-teaching-interpretation.json')}>Export this interpretation <Arrow /></Control></section>}<p className="disclosure">Generated explanations are assistance, not executed evidence. Declare their use in your learning record. No silent provider fallback.</p><dialog ref={dialog} onCancel={() => setConsent(false)} onClose={() => setConsent(false)} aria-labelledby="teaching-consent-title"><h2 id="teaching-consent-title">Send this excerpt to OpenAI?</h2><p>The request contains {source.path}, lines {source.startLine}–{source.endLine}, your confirmed requirement and case. It uses {model} and may incur API usage charges.</p><p className="disclosure">Source identity {source.sourceHash}. Other files and development history are excluded. Review this excerpt for private information before sending.</p><pre className="record-source"><code>{source.text}</code></pre><div className="button-row"><Control className="secondary" onClick={() => setConsent(false)}>Cancel</Control><Control className="primary" onClick={() => { void explain(); }}>Send this excerpt <Arrow /></Control></div></dialog></section>;
}
