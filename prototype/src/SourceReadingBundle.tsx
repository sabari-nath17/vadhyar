import { useEffect, useId, useRef, useState } from 'react';
import type { SourceSnapshot } from './project-types.js';
import type { CodebaseKnowledge } from './knowledge-types.js';
import type { Concept } from './walkthrough-types.js';
import { getSelectedKnowledge } from './knowledge-api.js';
import { ProjectApiError } from './project-api.js';
import { SourceViewer } from './SourceViewer.js';
import { Control, download } from './ui.js';
import { canUseReadingConcept, chooseReadingEntry, findCapturedSource, hasMixedReadingVersions, inspectCapturedLine, putReadingCapture, readingCaptureKey, readingPins, type ReadingCapture } from './reading-bundle.js';

export function ReadingBundleRelationships({ knowledge, captures, onInspect, onNavigate }: { knowledge: CodebaseKnowledge; captures: ReadingCapture[]; onInspect: (key: string, line: number) => void; onNavigate: (fileId: string, startLine: number, lines?: number) => void }) {
 return <section aria-label="Captured static module links"><h4>Static import and re-export links</h4><p className="disclosure">These links show module references in selected source. They do not establish data handoff, callbacks or runtime behavior.</p><ul>{knowledge.relationships.map(edge => {
  const from = knowledge.files.find(file => file.contextId === edge.from)!, to = knowledge.files.find(file => file.contextId === edge.to)!;
  const captured = captures.find(capture => readingCaptureKey(capture.source) === readingCaptureKey(from))?.source;
  return <li key={`${edge.from}:${edge.to}:${edge.kind}`}><span>{from.path} · captured lines {from.startLine}–{from.endLine} → {to.path} · captured lines {to.startLine}–{to.endLine}: {edge.kind} at line {edge.line}</span>{captured && edge.line >= captured.startLine && edge.line <= captured.endLine && <div className="button-row"><Control className="text-button" onClick={() => onInspect(readingCaptureKey(captured), edge.line)}>Inspect captured link line {edge.line}</Control><Control className="text-button" onClick={() => onNavigate(captured.fileId, edge.line, 1)}>Recapture saved link line {edge.line}</Control></div>}</li>;
 })}</ul>{!knowledge.relationships.length && <p className="disclosure">No supported static module links were found between these captured ranges. Unresolved references remain unknown.</p>}</section>;
}

export function SourceReadingBundle({ source, onNavigate }: { source: SourceSnapshot; onNavigate: (fileId: string, startLine: number, lines?: number) => void }) {
 const [captures, setCaptures] = useState<ReadingCapture[]>([]), [knowledge, setKnowledge] = useState<CodebaseKnowledge | null>(null);
 const [busy, setBusy] = useState(false), [error, setError] = useState(''), [query, setQuery] = useState(''), [previewKey, setPreviewKey] = useState(''), [focus, setFocus] = useState<Concept>(), [inspectedLine, setInspectedLine] = useState<number | null>(null), [previewOpen, setPreviewOpen] = useState(false);
 const pending = useRef<AbortController | null>(null), request = useRef(0), searchId = useId();
 useEffect(() => () => { pending.current?.abort(); request.current++; }, []);
 const change = (next: ReadingCapture[]) => {
  if (next === captures) return;
  pending.current?.abort(); request.current++; setBusy(false); setKnowledge(null); setError(''); setFocus(undefined); setInspectedLine(null);
  setCaptures(next); if (!next.some(capture => readingCaptureKey(capture.source) === previewKey)) { setPreviewKey(''); setPreviewOpen(false); }
 };
 const captureCurrent = (replaceKey?: string) => {
  try { change(putReadingCapture(captures, source, replaceKey)); } catch (failure) { setError(failure instanceof Error ? failure.message : 'This source could not be added.'); }
 };
 const analyze = async () => {
  pending.current?.abort(); const controller = new AbortController(), version = ++request.current; pending.current = controller;
  setBusy(true); setError(''); setKnowledge(null);
  try {
   const result = await getSelectedKnowledge(source.projectId, readingPins(captures), controller.signal);
   if (!controller.signal.aborted && request.current === version) setKnowledge(result);
  } catch (failure) {
   if (!controller.signal.aborted && request.current === version) setError(failure instanceof ProjectApiError && failure.status === 409 ? 'A selected saved file changed. Captures are preserved. Open its range, then explicitly replace that capture before trying again.' : failure instanceof Error ? failure.message : 'Selected-source analysis is unavailable. Your captures remain exportable.');
  } finally { if (!controller.signal.aborted && request.current === version) setBusy(false); }
 };
 const duplicate = captures.some(capture => readingCaptureKey(capture.source) === readingCaptureKey(source)), sameRange = captures.some(capture => capture.source.fileId === source.fileId && capture.source.startLine === source.startLine && capture.source.endLine === source.endLine), mixed = hasMixedReadingVersions(captures);
 const selected = captures.find(capture => readingCaptureKey(capture.source) === previewKey)?.source ?? captures[0]?.source ?? source, found = findCapturedSource(captures, query);
 const preview = inspectedLine !== null && inspectedLine >= selected.startLine && inspectedLine <= selected.endLine ? inspectCapturedLine(selected, inspectedLine) : selected;
 const open = (captured: SourceSnapshot, start = captured.startLine, end = captured.endLine) => {
  const lines = Math.max(1, end - start + 1);
  if (captured.fileBytes === 0 && start === 1 && end === 0 || start >= captured.startLine && end >= start && end <= captured.endLine && lines <= 200) onNavigate(captured.fileId, start, lines);
 };
 return <section className="reading-bundle" aria-label="Selected source reading bundle">
  <h3>Build a source reading bundle</h3>
  <p className="disclosure">Keep up to five explicit captured ranges while browsing this project. This bundle lives only in this open view; export it before leaving. Reading and searching do not send source to a model, run code or change lesson progress.</p>
  <div className="button-row reading-actions">
   <div className="reading-action"><Control className="secondary" disabled={sameRange || captures.length >= 5} reason={duplicate ? 'This exact captured range is already included.' : sameRange ? 'Explicitly replace the existing capture for this range.' : 'Remove a capture before adding a sixth.'} onClick={() => captureCurrent()}>Add displayed range</Control></div>
   <div className="reading-action"><Control className="secondary" disabled={!captures.length} reason="Add a captured range before exporting." onClick={() => download(JSON.stringify({ projectId: source.projectId, captures, knowledge, status: 'View-local captured evidence; freshness is not guaranteed.' }, null, 2), 'vadhyar-reading-bundle.json')}>Export reading bundle</Control></div>
   <div className="reading-action"><Control data-reading-action="analyze" disabled={busy || !captures.length || mixed} reason={busy ? 'The selected ranges are being analyzed.' : mixed ? 'Ranges from one file have different saved hashes. Recapture and replace them with one consistent version.' : 'Add a captured range before analysis.'} onClick={() => { void analyze(); }}>{busy ? 'Analyzing selected ranges…' : 'Analyze selected ranges'}</Control></div>
   {busy && <div className="reading-action"><Control className="secondary" onClick={() => { pending.current?.abort(); request.current++; setBusy(false); }}>Cancel analysis</Control></div>}
  </div>
  {error && <p className="notice warning" role="alert">{error}</p>}
  {mixed && <p className="notice warning">This bundle contains different saved versions of the same file. Local reading and export remain available; analysis waits for consistent recaptures.</p>}
  <p className="muted" aria-live="polite">{captures.length} of 5 ranges captured{busy ? ' · analysis pending' : knowledge ? ' · selected-source analysis available' : ' · analysis not available'}.</p>
  <ol className="reading-captures" aria-label="Captured ranges">
   {captures.map((capture, index) => { const captured = capture.source, key = readingCaptureKey(captured); return <li key={key}>
    <strong>{index === 0 ? 'Entry · ' : ''}{captured.path}</strong><span className="muted"> · {captured.endLine >= captured.startLine ? `lines ${captured.startLine}–${captured.endLine}` : 'empty file'} · {captured.sourceHash.slice(0, 12)} · captured {captured.capturedAt}{captured.truncated ? ' · excerpt only' : ''}{capture.focus ? ` · selected concept ${capture.focus}` : ''}</span>
    <div className="button-row reading-actions">
     <div className="reading-action"><Control className="text-button" onClick={() => { setPreviewKey(key); setFocus(undefined); setInspectedLine(null); setPreviewOpen(true); }}>Inspect capture</Control></div>
     <div className="reading-action"><Control className="text-button" onClick={() => open(captured)}>Recapture saved range</Control></div>
     {index > 0 && <div className="reading-action"><Control className="text-button" onClick={() => change(chooseReadingEntry(captures, key))}>Choose as entry</Control></div>}
     {captured.fileId === source.fileId && captured.startLine === source.startLine && <div className="reading-action"><Control className="text-button" disabled={duplicate} reason="This exact displayed capture is already included. Recapture the saved range before replacing it." onClick={() => captureCurrent(key)}>Replace with displayed capture</Control></div>}
     <div className="reading-action"><Control className="text-button" onClick={() => change(captures.filter(item => item !== capture))}>Remove capture</Control></div>
    </div>
   </li>; })}
  </ol>
  {captures.length > 0 && <details open={previewOpen} onToggle={event => setPreviewOpen(event.currentTarget.open)} className="reading-preview"><summary>{inspectedLine === null ? 'Captured source for inspection' : `Captured source line ${inspectedLine}`}</summary><SourceViewer key={readingCaptureKey(preview)} source={preview} focus={focus} /></details>}
  <label htmlFor={searchId}>Find in captured source</label><input id={searchId} type="search" maxLength={200} value={query} onChange={event => setQuery(event.target.value)} placeholder="A name, condition or data field" />
  {query.trim() && <><p className="muted">{found.matches.length} matching captured lines{found.truncated ? ' · first 30 shown' : ''}. This searches only the ranges listed above.</p><ul className="reading-matches">{found.matches.map(match => <li key={`${match.key}:${match.line}`}><Control className="text-button" onClick={() => { setPreviewKey(match.key); setInspectedLine(match.line); setFocus(undefined); setPreviewOpen(true); }}>{match.path} · captured line {match.line}</Control><code>{match.text}</code><Control className="text-button" onClick={() => { const captured = captures.find(capture => readingCaptureKey(capture.source) === match.key)?.source; if (captured) open(captured, match.line, match.line); }}>Recapture saved line {match.line}</Control></li>)}</ul></>}
  {knowledge && <section aria-label="Analyzed captured ranges">
   <h4>Proposed reading order</h4>
   <ol>{knowledge.order.map(contextId => { const file = knowledge.files.find(item => item.contextId === contextId)!; return <li key={contextId}>{file.path} · lines {file.startLine}–{file.endLine} · {file.status} · {file.unresolvedModuleReferences} unresolved module references</li>; })}</ol>
   <ReadingBundleRelationships knowledge={knowledge} captures={captures} onNavigate={onNavigate} onInspect={(key, line) => { setPreviewKey(key); setFocus(undefined); setInspectedLine(line); setPreviewOpen(true); }} />
   {knowledge.files.map(file => { const captured = captures.find(capture => readingCaptureKey(capture.source) === readingCaptureKey(file))?.source; return <div key={file.contextId} className="reading-catalog">
    <h4>{file.path} · captured declarations</h4><p className="disclosure">{file.message}{file.omittedDeclarations ? ` ${file.omittedDeclarations} further declarations are outside this bounded catalogue.` : ''}</p>
    <ul>{file.catalog.map(concept => <li key={concept.id}>
     <strong>{concept.name}</strong> · {concept.kind} · {concept.scope} · lines {concept.startLine}–{concept.endLine} · {concept.complete ? 'complete captured declaration' : 'partial captured declaration'}
     {captured && <div className="button-row reading-actions"><div className="reading-action"><Control className="text-button" onClick={() => { setPreviewKey(readingCaptureKey(captured)); setFocus(concept); setInspectedLine(null); setPreviewOpen(true); }}>{concept.complete ? 'Inspect declaration' : 'Inspect captured fragment'}</Control></div><div className="reading-action"><Control className="text-button" disabled={concept.endLine - concept.startLine + 1 > 200} reason="This declaration exceeds the supported source range. Inspect its captured fragment." onClick={() => open(captured, concept.startLine, concept.endLine)}>{concept.complete ? 'Recapture saved declaration' : 'Recapture saved fragment'}</Control></div><div className="reading-action"><Control className="text-button" disabled={!canUseReadingConcept(file.status, concept.complete)} reason={file.status === 'invalid' || file.status === 'unsupported' ? 'Recapture readable, supported source before choosing a starting concept.' : 'A partial declaration cannot be the complete starting concept.'} onClick={event => {
      const analyzeControl = event.currentTarget.closest('.reading-bundle')?.querySelector<HTMLButtonElement>('button[data-reading-action="analyze"]');
      change(captures.map(capture => capture.source === captured ? { ...capture, focus: concept.id } : capture));
      if (analyzeControl?.isConnected && !analyzeControl.disabled && analyzeControl.getAttribute('aria-disabled') !== 'true' && analyzeControl.getClientRects().length) analyzeControl.focus();
     }}>Use as starting concept</Control></div></div>}
    </li>)}</ul>
   </div>; })}
   <ul className="disclosure">{knowledge.limits.map(limit => <li key={limit}>{limit}</li>)}</ul>
  </section>}
  <h4>Questions to guide your reading</h4><ol aria-label="Reading prompts"><li>Where does the action start in this captured source?</li><li>Which selected files hand data to one another?</li><li>Which condition decides the result, and what side effects can you see?</li><li>What remains unknown outside these captures?</li></ol>
 </section>;
}
