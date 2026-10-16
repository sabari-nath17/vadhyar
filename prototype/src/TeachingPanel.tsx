import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { projectRequest } from './project-api.js';
import { teachingExplanationSchema, teachingStatusSchema, type SourceSnapshot } from './project-types.js';
import type { TeachingExplanation } from './project-learning.js';
import { Arrow, Control, download } from './ui.js';
import { createTeachingContext } from '../privacy.mjs';

export function TeachingPanel({ source, requirement, caseInput, onBusy, onUnretained, saved, onResult }: { source: SourceSnapshot; requirement: string; caseInput: string; onBusy: (busy: boolean) => void; onUnretained: (result: TeachingExplanation | null) => void; saved: TeachingExplanation[]; onResult: (result: TeachingExplanation) => boolean }) {
 const [status, setStatus] = useState<z.infer<typeof teachingStatusSchema> | null>(null), [key, setKey] = useState(''), [model, setModel] = useState('');
 const [busy, setBusy] = useState(false), [error, setError] = useState(''), [consent, setConsent] = useState(false);
 const [result, setResult] = useState<TeachingExplanation | null>(saved.at(-1) ?? null), [retained, setRetained] = useState(true);
 const [statusRetry, setStatusRetry] = useState(0), [setupLoading, setSetupLoading] = useState(true);
 const keyInput = useRef<HTMLInputElement>(null), modelInput = useRef<HTMLSelectElement>(null), recovery = useRef<HTMLDivElement>(null), actionFocus = useRef<Element | null>(null);
  const dialog = useRef<HTMLDialogElement>(null), pending = useRef<AbortController | null>(null), focusReturn = useRef<HTMLElement | null>(null), approvedFingerprint = useRef<string | null>(null), submitting = useRef(false);
  const buildRequest = () => ({ fileId: source.fileId, sourceHash: source.sourceHash, startLine: source.startLine, endLine: source.endLine, lines: Math.max(1, source.endLine - source.startLine + 1), requirement: requirement.trim(), caseInput: caseInput.trim(), model, approved: true as const });
  const requestPreview = buildRequest(), previewContext = createTeachingContext(source, requestPreview.requirement, requestPreview.caseInput);
  const fingerprint = JSON.stringify({ request: requestPreview, context: previewContext });
 useEffect(() => {
  const origin = actionFocus.current;
  if (busy || setupLoading || !origin) return;
  actionFocus.current = null;
  if (document.activeElement !== origin && document.activeElement !== document.body) return;
  const target = error ? recovery.current?.querySelector('button') : status?.connected ? modelInput.current : keyInput.current;
  if (target?.isConnected && target.getClientRects().length && !target.disabled && target.getAttribute('aria-disabled') !== 'true') target.focus();
 }, [busy, setupLoading, error, status?.connected]);
 useEffect(() => () => pending.current?.abort(), []);
 useEffect(() => () => onUnretained(null), [onUnretained]);
 useEffect(() => { onBusy(busy); return () => onBusy(false); }, [busy, onBusy]);
 useEffect(() => {
  const controller = new AbortController(); setSetupLoading(true);
  void projectRequest('/api/teaching', teachingStatusSchema, undefined, controller.signal).then(value => { if (!controller.signal.aborted) { setStatus(value); setModel(value.model ?? ''); } }).catch(() => { if (!controller.signal.aborted) setError('Teaching setup is unavailable. Local recording and learning steps still work.'); }).finally(() => { if (!controller.signal.aborted) setSetupLoading(false); });
  return () => controller.abort();
 }, [statusRetry]);
  useEffect(() => { const node = dialog.current; if (!node) return; if (consent) { if (!node.open) node.showModal(); node.querySelector('button')?.focus(); } else if (node.open) node.close(); }, [consent]);
  useEffect(() => { if (!consent || approvedFingerprint.current === fingerprint) return; approvedFingerprint.current = null; setConsent(false); setError('The source, rule, case or model changed. Review the current preview before sending.'); }, [consent, fingerprint]);
 const connect = async () => {
  actionFocus.current = document.activeElement;
  setBusy(true); setError('');
  const supplied = key; setKey('');
  const controller = new AbortController(); pending.current = controller;
  try { const value = await projectRequest('/api/teaching/connect', teachingStatusSchema, { key: supplied }, controller.signal); if (!controller.signal.aborted) { setStatus(value); setModel(value.model ?? ''); } }
  catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'OpenAI could not connect.'); }
  finally { if (!controller.signal.aborted) setBusy(false); }
 };
  const explain = async (body: ReturnType<typeof buildRequest>) => {
   if (submitting.current) return;
   submitting.current = true; setConsent(false); setBusy(true); setError('');
  const controller = new AbortController(); pending.current = controller;
  try {
    const value = await projectRequest('/api/teaching/explain', teachingExplanationSchema, body, controller.signal);
   if (controller.signal.aborted) return;
   const accepted = onResult(value);
   setResult(value); setRetained(accepted);
   onUnretained(accepted ? null : value);
  } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Explanation could not be generated. Recording is unaffected.'); }
   finally { if (!controller.signal.aborted) { submitting.current = false; setBusy(false); } }
 };
 const disconnect = async () => {
  actionFocus.current = document.activeElement;
  setBusy(true); setError('');
  const controller = new AbortController(); pending.current = controller;
  try { const value = await projectRequest('/api/teaching/disconnect', teachingStatusSchema, {}, controller.signal); if (!controller.signal.aborted) { setStatus(value); setModel(''); } }
  catch { if (!controller.signal.aborted) setError('Provider disconnection could not be confirmed. Stop the launcher to clear its session key.'); }
  finally { if (!controller.signal.aborted) setBusy(false); }
 };
  const dismissConsent = () => { approvedFingerprint.current = null; setConsent(false); };
  const cancel = () => { actionFocus.current = document.activeElement; pending.current?.abort(); submitting.current = false; setBusy(false); setStatus(null); setModel(''); setError('The browser request was cancelled. It may already have reached the host or provider; usage already incurred cannot be undone. Retry teaching setup to read its actual status.'); };
 const historical = result && result.sourceHash !== source.sourceHash;
 return <section className="teaching-panel"><h3>A teacher alongside your code.</h3><p>OpenAI is the teaching provider. Your coding tool can be different.</p>{error && <div ref={recovery} className="notice warning" role="alert"><p>{error}</p><Control className="secondary" disabled={busy} onClick={() => { actionFocus.current = document.activeElement; setSetupLoading(true); setError(''); setStatusRetry(value => value + 1); }}>Retry teaching setup</Control></div>}{!status?.connected ? <><label className="field">OpenAI API key · host session memory<input ref={keyInput} type="password" autoComplete="off" spellCheck={false} maxLength={512} value={key} disabled={busy} onChange={e => setKey(e.target.value)} placeholder="Enter your own API key" /></label><Control className="secondary" disabled={busy || setupLoading || key.trim().length < 8} reason={setupLoading ? 'Reading teaching setup…' : busy ? 'Wait for the current teacher request to finish.' : 'Enter your complete OpenAI API key to connect. Teaching is optional; manual learning works without it.'} onClick={() => { void connect(); }}>Connect OpenAI</Control><p className="disclosure">The local host keeps this key in memory for this session and uses it to authenticate with OpenAI. It is not saved in your browser or learning record. Setup checks available models without sending lesson source.</p></> : <><label className="field">Teaching model<select ref={modelInput} value={model} disabled={busy} onChange={e => setModel(e.target.value)}><option value="">Choose an available model</option>{status.models.map(value => <option key={value} value={value}>{value}</option>)}</select></label><div className="button-row"><Control className="secondary" disabled={busy || !retained || !model || saved.length >= 5} reason={!retained ? 'Export this interpretation and resolve the saved record before asking again.' : busy ? 'Wait for the current teacher request to finish.' : !model ? 'Choose an available teaching model first.' : 'An attempt retains up to five interpretations. Export and start another question when full.'} onClick={event => { focusReturn.current = event.currentTarget; approvedFingerprint.current = fingerprint; setError(''); setConsent(true); }}>{busy ? 'Waiting for OpenAI…' : 'Review request'}<Arrow /></Control><Control className="text-button" disabled={busy} onClick={() => { void disconnect(); }}>Disconnect</Control></div></>}{busy && <Control className="text-button" onClick={cancel}>Cancel browser request</Control>}{result && <section className="generated-explanation"><strong>Generated interpretation{historical ? ' · earlier source' : ''}</strong><p className="disclosure">{result.model} · source {result.sourceHash.slice(0, 12)} · lines {result.startLine}–{result.endLine}</p>{!retained && <p className="notice warning" role="alert">Not retained in this question. Export this interpretation before leaving.</p>}{!retained && <Control className="secondary" disabled={busy} onClick={() => { if (onResult(result)) { setRetained(true); onUnretained(null); } }}>Retry retaining interpretation</Control>}<p>{result.explanation.summary}</p><ul>{result.explanation.conditions.map((condition, i) => <li key={i}><strong>Lines {condition.startLine}–{condition.endLine}</strong>: {condition.explanation}</li>)}</ul><h4>Questions to investigate</h4><ul>{result.explanation.questions.map((question, i) => <li key={i}>{question}</li>)}</ul><h4>Coverage and uncertainty</h4><ul>{result.explanation.limits.map((limit, i) => <li key={i}>{limit}</li>)}</ul><Control className="text-button" onClick={() => download(JSON.stringify(result, null, 2), 'vadhyar-teaching-interpretation.json')}>Export this interpretation <Arrow /></Control></section>}<p className="disclosure">Generated explanations are assistance, not executed evidence. Declare their use in your learning record. No silent provider fallback.</p><dialog ref={dialog} onCancel={event => { event.preventDefault(); dismissConsent(); }} onClose={() => { approvedFingerprint.current = null; setConsent(false); const target = focusReturn.current; focusReturn.current = null; if (target?.isConnected) target.focus(); }} aria-labelledby="teaching-consent-title" aria-describedby="teaching-consent-description">
<h2 id="teaching-consent-title">Review what OpenAI receives</h2>
<p id="teaching-consent-description">Vadhyar sends this rule, case and selected source context to OpenAI. Your host uses the key to authenticate with OpenAI; the key is not part of this lesson context or your learning record.</p>
<dl>
<div><dt>Rule</dt><dd><pre className="record-source"><code>{previewContext.requirement}</code></pre></dd></div>
<div><dt>Case</dt><dd><pre className="record-source"><code>{previewContext.caseInput}</code></pre></dd></div>
<div><dt>Path</dt><dd><code>{previewContext.path}</code></dd></div>
<div><dt>Language</dt><dd>{previewContext.language}</dd></div>
<div><dt>Line range</dt><dd>{previewContext.startLine}–{previewContext.endLine}</dd></div>
<div><dt>Model</dt><dd><code>{model}</code></dd></div>
<div><dt>Numbered source sent</dt><dd><pre className="record-source"><code>{previewContext.source}</code></pre></dd></div>
</dl>
<p className="disclosure">The file identity and revision are checked locally and are not sent as lesson context. Other files and development history are excluded.</p>
<p className="notice warning">OpenAI API usage may be billed to your account. Vadhyar cannot estimate this request’s cost or response time.</p>
<p className="disclosure">Before generation, the host checks the source, rule, case, path, language and model for a limited set of recognizable private-value patterns. This is not comprehensive secret detection. Vadhyar will not redact or change your text; review and correct sensitive content yourself.</p>
<details><summary>Fixed provider instructions and settings</summary><p>Vadhyar asks for a concise plain-language explanation of only this excerpt, actual line citations, learner questions and coverage limits. It instructs OpenAI to treat supplied text as data, not instructions, and to make no claims about other files, execution, correctness or mastery. The request sets <code>store: false</code>, provides no tools and caps output at 3,000 tokens; this is not a promise about provider-side retention.</p></details>
<div className="button-row">
<Control className="secondary" onClick={dismissConsent}>Cancel</Control>
<Control className="primary" onClick={() => { if (submitting.current) return; if (approvedFingerprint.current !== fingerprint) { approvedFingerprint.current = null; setConsent(false); setError('The source, rule, case or model changed. Review the current preview before sending.'); return; } approvedFingerprint.current = null; void explain(requestPreview); }}>Send request <Arrow /></Control>
</div>
</dialog></section>;
}
