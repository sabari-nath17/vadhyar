import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ProjectAction, ProjectAttempt, TeachingExplanation } from './project-learning.js';
import { getCapturedSource, getRun, getScripts, runScript, ProjectApiError } from './project-api.js';
import type { ProjectScript, SourceSnapshot } from './project-types.js';
import type { DraftStatus } from './Workspace.js';
import { lessonSteps, type Freshness } from './learning-path.js';
import { checkReceiptBuffer, type CheckReceiptBuffer } from './check-receipt.js';
import { TeachingPanel } from './TeachingPanel.js';
import { ProjectSource } from './ProjectExplorer.js';
import { SourceViewer } from './SourceViewer.js';
import { Arrow, Control, download, Lotus, Mark, NavIcon } from './ui.js';

export function ProjectLesson({ attempt: a, act, onDirty, browse, close, ask, projectName, freshness, sourceCheckedAt, projectRevision, hostAvailable, unsaved, attention }: {
 attempt: ProjectAttempt; act: (action: ProjectAction) => boolean; onDirty: DraftStatus;
 browse: () => void; close: () => void; ask: (text: string, run: () => void) => void;
 projectName: string; freshness: Freshness; sourceCheckedAt?: string; projectRevision: number; hostAvailable: boolean; unsaved: boolean; attention?: ReactNode;
}) {
 const [newerSource, setNewerSource] = useState<SourceSnapshot | null>(null), [teachingBusy, setTeachingBusy] = useState(false);
 const [draft, setDraft] = useState<Record<string, string>>({}), [error, setError] = useState(''), [busy, setBusy] = useState(false);
 const [scripts, setScripts] = useState<ProjectScript[]>([]), [scriptId, setScriptId] = useState('');
 const [scriptsStatus, setScriptsStatus] = useState<'loading' | 'error' | 'ready'>('loading'), [scriptsError, setScriptsError] = useState(''), [scriptsRetry, setScriptsRetry] = useState(0);
 const [manual, setManual] = useState(!a.pendingCheck), [consent, setConsent] = useState(false), [sourceOpen, setSourceOpen] = useState(() => window.innerWidth >= 1100);
 const [receiptRead, setReceiptRead] = useState<{ revision: number; at: string } | null>(null);
 const [unretained, setUnretained] = useState<CheckReceiptBuffer | null>(null);
 const [teachingDraft, setTeachingDraft] = useState<TeachingExplanation | null>(null);
 const inputMethod = useRef<'pointer' | 'keyboard'>('keyboard');
 const [stageMotion, setStageMotion] = useState(false);
 const dialog = useRef<HTMLDialogElement>(null), mounted = useRef(true), latest = useRef(a), starting = useRef(false);
 latest.current = a;
 const index = lessonSteps.findIndex(step => step.key === a.stage), step = lessonSteps[index];
 const run = a.checkResult, pendingCheck = a.pendingCheck, lostRun = pendingCheck?.status === 'unknown';
 const checkBlocked = Boolean(unretained) || pendingCheck?.status === 'starting' || lostRun || run?.status === 'running';
 const current = (origin: ProjectAttempt) => mounted.current && latest.current.id === origin.id && latest.current.current.sourceHash === origin.current.sourceHash && latest.current.stage === origin.stage;
 useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
 useEffect(() => { setDraft({}); setError(''); setNewerSource(null); document.getElementById('lesson-heading')?.focus(); }, [a.stage, a.id]);
 useEffect(() => {
  onDirty(Object.values(draft).some(Boolean) || Boolean(unretained || teachingDraft) || busy || pendingCheck?.status === 'starting' || (run?.status === 'running' && !lostRun) || teachingBusy,
   () => download(JSON.stringify({ requirement: a.requirement, caseInput: a.caseInput, attemptId: a.id, source: a.current, draft, check: run, unretained, teachingDraft }, null, 2), 'vadhyar-unsaved-question.json'));
  return () => onDirty(false);
 }, [draft, busy, run, unretained, teachingDraft, pendingCheck?.status, lostRun, teachingBusy, onDirty, a]);
 useEffect(() => {
  if (a.stage !== 'verify' || !hostAvailable) return;
  let active = true;
  setScriptsStatus('loading'); setScriptsError('');
  void getScripts(a.current.projectId).then(value => { if (active) { setScripts(value.scripts); setScriptId(value.scripts[0]?.id ?? ''); setScriptsStatus('ready'); } }).catch(e => { if (active) { setScriptsError(e instanceof ProjectApiError ? e.message : 'The local service could not return a readable check list.'); setScriptsStatus('error'); } });
  return () => { active = false; };
 }, [a.stage, a.current.projectId, hostAvailable, scriptsRetry]);
 useEffect(() => { if (consent) dialog.current?.showModal(); else dialog.current?.close(); }, [consent]);
 useEffect(() => {
  if (pendingCheck?.status === 'starting' && !starting.current && !unretained) act({ type: 'loseCheck', attemptId: a.id, operationId: pendingCheck.operationId });
 }, [pendingCheck?.status, pendingCheck?.operationId, unretained?.run.id]);
 useEffect(() => {
  if (!hostAvailable) { setReceiptRead(null); return; }
  const jobId = unretained?.run.id ?? pendingCheck?.id;
  if (!pendingCheck || !jobId || (!unretained && pendingCheck.status !== 'accepted') || a.stage !== 'verify') return;
  let active = true;
  let timer: ReturnType<typeof setTimeout>;
  const poll = async () => {
   let delay = 700;
   try {
    const next = await getRun(a.current.projectId, jobId);
    if (active) {
     const previous = latest.current.checkResult;
     const buffered = checkReceiptBuffer(latest.current, pendingCheck.operationId, next);
     const changed = !previous || next.status !== previous.status || next.output !== previous.output || next.freshness !== previous.freshness;
     if (unretained) {
      setUnretained(buffered); setReceiptRead(null);
      if (next.status !== 'running') return;
     } else if (changed && !act({ type: 'updateCheck', attemptId: a.id, operationId: pendingCheck.operationId, run: next })) {
      setUnretained(buffered); setReceiptRead(null); setError('The returned check receipt could not be attached. It remains separately exportable; saving requires an explicit retry. Execution will not repeat.');
     } else {
      setReceiptRead({ revision: projectRevision, at: new Date().toISOString() }); setError('');
      if (next.status !== 'running') return;
     }
    }
   }
   catch (e) {
    delay = 1500;
    if (active) {
     setReceiptRead(null);
     if (e instanceof ProjectApiError && (e.status === 404 || e.status === 410)) { act({ type: 'loseCheck', attemptId: a.id, operationId: pendingCheck.operationId }); setError('The check status is no longer available in this host session. Its outcome is unknown. Clear this pending view before another check; no command repeats automatically.'); return; }
     else setError('Check status is temporarily unavailable. Status reads will retry; the command will not run again.');
    }
   }
   if (active) timer = setTimeout(() => { void poll(); }, delay);
  };
  void poll();
  return () => { active = false; clearTimeout(timer); };
 }, [pendingCheck?.id, pendingCheck?.status, pendingCheck?.operationId, unretained?.run.id, a.stage, a.current.projectId, projectRevision, hostAvailable]);
 const save = (action: ProjectAction) => { if (!current(a)) return false; const saved = act(action); if (saved) { setDraft({}); setStageMotion(inputMethod.current === 'pointer'); } return saved; };
 const retryReceipt = () => {
  if (!unretained || !pendingCheck || !current(a) || unretained.attemptId !== a.id || unretained.operationId !== pendingCheck.operationId) return;
  if (act({ type: pendingCheck.id ? 'updateCheck' : 'acceptCheck', attemptId: a.id, operationId: pendingCheck.operationId, run: unretained.run })) { setUnretained(null); setReceiptRead(null); setError(''); }
 };
 const observe = async () => {
  const origin = a, text = draft.text;
  setBusy(true); setError(''); setNewerSource(null);
  try {
   const source = await getCapturedSource(origin.baseline);
   if (!current(origin)) return;
   if (source.sourceHash !== origin.baseline.sourceHash) { setNewerSource(source); setError('Saved source changed after your prediction. No observation was recorded against the earlier version. Start a fresh question with the current source; the original prediction is kept.'); }
   else save({ type: 'observe', text, source });
  } catch (e) { if (current(origin)) setError(e instanceof Error ? e.message : 'Saved source could not be checked. No observation was recorded.'); }
  finally { if (mounted.current) setBusy(false); }
 };
 const refresh = async () => {
  const origin = a;
  setBusy(true); setError('');
  try {
   const source = await getCapturedSource(origin.current);
   if (!current(origin)) return;
   const changed = source.sourceHash !== origin.current.sourceHash;
   const apply = () => { if (current(origin) && act({ type: 'refresh', source })) { setStageMotion(origin.stage === 'change' && inputMethod.current === 'pointer'); if (changed) { setReceiptRead(null); setDraft({}); } } };
   if (changed && (Object.values(draft).some(Boolean) || unretained || teachingDraft)) ask('Saved source changed. Apply this version and discard unsaved text, the separately held receipt or teacher response? Export unsaved work first. The original prediction and saved records are retained.', apply);
   else apply();
  } catch (e) { if (current(origin)) setError(e instanceof Error ? e.message : 'Saved source could not be refreshed.'); }
  finally { if (mounted.current) setBusy(false); }
 };
 const script = scripts.find(value => value.id === scriptId);
 const execute = async () => {
  if (!script || busy) return;
  const origin = a;
  const operationId = crypto.randomUUID();
  setConsent(false); setBusy(true); setError(''); setReceiptRead(null); starting.current = true;
  if (!act({ type: 'beginCheck', attemptId: origin.id, operationId, fileId: origin.current.fileId, sourceHash: origin.current.sourceHash, manifestHash: script.manifestHash, scriptId: script.id })) { starting.current = false; setBusy(false); return; }
  try {
   const value = await runScript(origin.current, script);
   if (current(origin)) {
    const buffered = checkReceiptBuffer(latest.current, operationId, value);
    if (!act({ type: 'acceptCheck', attemptId: origin.id, operationId, run: value })) {
     setUnretained(buffered); setError('The returned job receipt could not be attached. Its ID and status remain exportable in this tab. Retry attachment explicitly; no command will repeat.');
    }
   }
  }
  catch (e) { if (current(origin)) { act({ type: 'loseCheck', attemptId: origin.id, operationId }); setError(e instanceof Error ? e.message : 'The start outcome is unknown. The command was not repeated.'); } }
  finally { starting.current = false; if (mounted.current) setBusy(false); }
 };
 const terminalRun = run && !['running', 'stale'].includes(run.status) && run.sourceHash === a.current.sourceHash && run.fileId === a.current.fileId && (run.freshness === 'current' || (['error', 'timeout'].includes(run.status) && run.freshness === 'unknown' && (draft.verdict ?? 'uncertain') !== 'satisfied'));
 const valid = (...keys: string[]) => keys.every(key => (draft[key] ?? '').trim().length >= (['caseInput', 'prediction', 'assistance'].includes(key) || (key === 'text' && a.stage === 'predict') ? 1 : 8));
 const field = (key: string, label: string, placeholder: string, rows = 3) => <label className="field">{label}<textarea rows={rows} maxLength={2000} value={draft[key] ?? ''} disabled={busy} onChange={e => setDraft(previous => ({ ...previous, [key]: e.target.value }))} placeholder={placeholder} /></label>;
 const complete = a.stage === 'complete' && Boolean(a.transfer);
 const canSave = !busy && !teachingBusy && (a.stage === 'predict' ? valid('text', 'reasoning') : a.stage === 'observe' ? valid('text') : a.stage === 'change' ? true : a.stage === 'verify' ? !checkBlocked && valid('reason', 'assistance') && (manual ? valid('description', 'evidence') : Boolean(terminalRun && hostAvailable && receiptRead?.revision === projectRevision)) : a.stage === 'reflect' ? valid('text') : complete || valid('caseInput', 'prediction', 'reasoning', 'assistance'));
 const recordRun = async (common: { verdict: 'satisfied' | 'not-satisfied' | 'uncertain'; reason: string; assistance: string }) => {
  if (!run || !pendingCheck) return;
  const origin = a;
  setBusy(true); setError(''); setReceiptRead(null);
  try {
   const fresh = await getRun(origin.current.projectId, run.id);
   if (!current(origin)) return;
   const buffered = checkReceiptBuffer(latest.current, pendingCheck.operationId, fresh);
   if (!act({ type: 'updateCheck', attemptId: origin.id, operationId: pendingCheck.operationId, run: fresh })) { setUnretained(buffered); setError('The freshly read receipt could not be attached. Its output and coverage remain separately exportable; verification was not recorded.'); return; }
   setReceiptRead({ revision: projectRevision, at: new Date().toISOString() });
   if ((fresh.freshness !== 'current' && !(['error', 'timeout'].includes(fresh.status) && fresh.freshness === 'unknown' && common.verdict !== 'satisfied')) || fresh.status === 'running' || fresh.status === 'stale') { setError('This command’s current coverage is stale or unknown. Its execution result is retained. Clear it explicitly and review a new check, or use truthful manual evidence.'); return; }
   save({ type: 'verifyRun', ...common, run: fresh });
  } catch (e) { if (current(origin)) { setReceiptRead(null); setError(e instanceof Error ? e.message : 'Current command coverage could not be read. No verification was recorded.'); } }
  finally { if (mounted.current) setBusy(false); }
 };
 const advance = () => {
  if (a.stage === 'predict') save({ type: 'predict', text: draft.text, reasoning: draft.reasoning });
  else if (a.stage === 'observe') void observe();
  else if (a.stage === 'change') void refresh();
  else if (a.stage === 'verify') {
   const common = { verdict: (draft.verdict ?? 'uncertain') as 'satisfied' | 'not-satisfied' | 'uncertain', reason: draft.reason, assistance: draft.assistance };
   if (manual) save({ type: 'verifyManual', ...common, description: draft.description, evidence: draft.evidence });
   else if (run) void recordRun(common);
  } else if (a.stage === 'reflect') save({ type: 'reflect', text: draft.text });
  else if (complete) close();
  else save({ type: 'transfer', caseInput: draft.caseInput, prediction: draft.prediction, reasoning: draft.reasoning, assistance: draft.assistance });
 };
 return <div className="focused-lesson" data-input={stageMotion ? 'pointer' : 'keyboard'} onPointerDown={() => { inputMethod.current = 'pointer'; }} onKeyDown={() => { inputMethod.current = 'keyboard'; }}>
  <a className="skip-link" href="#main">Skip to question</a>
  <header className="lesson-header"><Mark /><span className="lesson-breadcrumb">{projectName} / {a.current.path}</span><ol className="lesson-progress" aria-label="Learning activities">{lessonSteps.map((item, i) => <li key={item.key} className={i < index || complete ? 'recorded' : i === index ? 'current' : ''} aria-current={i === index && !complete ? 'step' : undefined}><span className="sr-only">{item.label}: {i < index || complete ? 'recorded activity' : i === index ? 'current activity' : 'upcoming activity'}</span></li>)}</ol><span className="lesson-count">{step.label} · {index + 1} of {lessonSteps.length}</span><Control className="icon-button" aria-label="Close lesson and return to Path" onClick={close}><NavIcon name="Close" /></Control></header>
  <main id="main" className="lesson-body" tabIndex={-1}>{attention}{error && <section className="notice warning" role="alert"><strong>Before you continue</strong><p>{error}</p></section>}{freshness === 'changed' && <section className="notice source-update" role="status"><strong>Newer saved source is available.</strong><p>This question keeps its captured source. Earlier outcomes remain attached to that version; explicitly review the saved file.</p></section>}
   {teachingDraft && <section className="notice warning" role="alert"><strong>Teacher response · not saved in this question</strong><p>{teachingDraft.explanation.summary}</p><p>This response stays in this tab until retained. Export it before leaving, or open the teacher to retry retaining it.</p><Control className="secondary" onClick={() => download(JSON.stringify(teachingDraft, null, 2), 'vadhyar-unretained-teaching.json')}>Export unsaved teacher response</Control></section>}
   {unretained && <section className="notice warning" role="alert"><strong>Returned check receipt · not saved in this record</strong><p>Returned status: {unretained.run.status} · job {unretained.run.id}. Its current coverage is not accepted as verification. Your saved record has not been replaced.</p><pre className="record-source"><code>{unretained.run.output || 'No output was captured in this returned receipt.'}</code></pre><div className="button-row"><Control className="secondary" onClick={() => download(JSON.stringify(unretained, null, 2), 'vadhyar-unretained-check.json')}>Export returned receipt</Control><Control className="secondary" disabled={busy || !hostAvailable} reason="Reconnect before retrying attachment. No command will repeat." onClick={retryReceipt}>Retry attaching receipt</Control></div><p className="disclosure">If storage is full or changed in another tab, export this receipt and the existing record before explicit reload/reset. Export alone does not free capacity.</p></section>}
   {pendingCheck && !unretained && <section className="command-state" role="status">{pendingCheck.status === 'unknown' || pendingCheck.status === 'starting' ? <><strong>{pendingCheck.status === 'starting' ? 'Check start is pending.' : 'Check outcome is unknown.'}</strong><p>The command may have executed. It will not repeat automatically. Explicitly clear this context before recording another check or manual evidence.</p></> : <><strong>{unsaved ? 'Check receipt kept in this tab' : 'Saved check receipt'} · {run?.status ?? 'status not yet read'}</strong><p>Host coverage at the last read: {hostAvailable && receiptRead?.revision === projectRevision ? run?.freshness ?? 'unknown' : 'unknown until rechecked'}.{receiptRead && ` Read ${new Date(receiptRead.at).toLocaleTimeString()}.`}</p></>}{a.stage === 'verify' && (pendingCheck.status === 'unknown' || (run && run.status !== 'running')) && <Control className="secondary" onClick={() => ask('Clear this command context? The receipt or unknown outcome is kept in history. Unsaved verdict text will be discarded; execution is not repeated.', () => { if (current(a)) act({ type: 'clearCheck', attemptId: a.id, operationId: pendingCheck.operationId }); })}>Clear saved check context</Control>}</section>}
   <div className="focused-lesson-grid"><section className="lesson-task" key={a.stage}><p className="task-step">{step.label.toUpperCase()} · STEP {index + 1} OF {lessonSteps.length}</p><h1 id="lesson-heading" tabIndex={-1}>{complete ? 'Separate case recorded.' : step.title}</h1><p className="task-description">{complete ? 'Keep the explanation and its coverage with your question.' : step.description}</p>{a.stage !== 'predict' && <details className="question-summary"><summary>Your confirmed rule and case</summary><blockquote>{a.requirement}</blockquote><p><strong>Case</strong><br />{a.caseInput}</p></details>}
    {a.stage === 'predict' && <><section className="case-card"><span className="small-label">THIS CASE</span><p className="case-input">{a.caseInput}</p><p>Rule: {a.requirement}</p></section>{field('text', 'What do you expect?', 'Describe the expected outcome.', 2)}{field('reasoning', 'What in the code led you there?', 'Point to the condition or behavior behind your prediction.')}<p className="disclosure">You can change this draft until you save it.</p></>}
    {a.stage === 'observe' && <><section className="saved-thought"><strong>{unsaved ? 'Prediction recorded in this tab · baseline source' : 'Prediction saved · baseline source'}</strong><p>{a.prediction?.text}</p><small>{a.baseline.sourceHash.slice(0, 12)}</small></section><section className="case-card"><span className="small-label">THIS CASE</span><p className="case-input">{a.caseInput}</p></section><p>Try this same case in your running app or an existing test in your usual coding tool. Report the outcome and method; Vadhyar has not run it. If you cannot run it, record that limitation and keep verification uncertain instead of inventing an outcome.</p>{field('text', 'Observed outcome · self-reported', 'What happened, and how did you observe it?')}{newerSource && <Control className="secondary" onClick={() => ask('Start a fresh question with the newer saved source? The original prediction is kept in history; unsaved observation text will be discarded.', () => { if (current(a)) act({ type: 'start', source: newerSource, requirement: a.requirement, caseInput: a.caseInput }); })}>Start fresh with saved source <Arrow /></Control>}</>}
    {a.stage === 'change' && <><section className="saved-thought"><strong>Observation recorded · self-reported</strong><p>{a.observation?.text}</p></section><p>Make any needed edit in your editor and save the file. If the source already meets your rule, continue unchanged.</p><p>Refresh compares the saved full-file identity and keeps your original prediction.</p><p className="disclosure">The browser reads saved files. Editing stays in your existing tool.</p></>}
    {a.stage === 'verify' && <><div className="source-refresh-state">{a.refreshes.at(-1)?.changed ? 'Saved source changed' : 'Saved source unchanged'} · captured {a.current.sourceHash.slice(0, 12)}</div><div className="mode-switch evidence-mode" role="group" aria-label="Verification evidence"><Control aria-pressed={manual} className={manual ? 'chosen' : ''} onClick={() => setManual(true)}>Manual evidence</Control><Control aria-pressed={!manual} className={!manual ? 'chosen' : ''} onClick={() => setManual(false)}>Existing project check</Control></div>{manual ? <>{field('description', 'Verification method · self-reported', 'Describe what you checked and where.')}{field('evidence', 'Evidence and coverage · self-reported', 'Record the result and which cases remain unchecked.')}</> : <><p>Run only an approved existing root-package check. It executes trusted repository code on this computer.</p>{!hostAvailable ? <section className="notice warning"><strong>Local check list unavailable.</strong><p>Reconnect the local service, or use manual evidence.</p></section> : scriptsStatus === 'loading' ? <section className="quiet-note" role="status"><strong>Reading existing project checks…</strong><p>You can use manual evidence while the list loads.</p></section> : scriptsStatus === 'error' ? <section className="notice warning" role="alert"><strong>Existing checks could not be read.</strong><p>{scriptsError}</p><Control className="secondary" disabled={busy} onClick={() => setScriptsRetry(value => value + 1)}>Retry check list</Control><p>Manual evidence remains available.</p></section> : scripts.length ? <><label className="field">Existing check<select value={scriptId} disabled={run?.status === 'running' && !lostRun} onChange={e => setScriptId(e.target.value)}>{scripts.map(value => <option key={value.id} value={value.id}>{value.id}</option>)}</select></label><pre className="single-code"><code>{script?.command}</code></pre><Control className="secondary" disabled={busy || !hostAvailable || Boolean(pendingCheck) || !script} reason={!hostAvailable ? 'Reconnect the local service before reviewing a check.' : pendingCheck ? run?.status === 'running' && !lostRun ? 'Wait for the acknowledged check to finish.' : 'Clear the saved check context first.' : 'Wait for the current operation to finish.'} onClick={() => setConsent(true)}>Review and run check <Arrow /></Control></> : <section className="quiet-note"><strong>No supported root-package check.</strong><p>Use manual evidence. Other language runners are not connected.</p></section>}{run && <section className={'run-result ' + (!unretained && !lostRun && run.freshness === 'current' && hostAvailable && receiptRead?.revision === projectRevision ? 'feedback' : 'notice warning')} aria-live="polite"><strong>{unretained ? 'Last saved receipt status: ' : lostRun ? 'Last received command status: ' : 'Command '}{run.status}{run.exitCode !== null ? ` · exit ${run.exitCode}` : ''}</strong><pre><code>{run.output || (unretained ? 'No output was captured in the last saved receipt.' : lostRun ? 'No output was captured before status became unavailable.' : run.status === 'running' ? 'Waiting for output…' : 'No output was captured.')}</code></pre><p>Execution status is retained separately from current coverage: {!unretained && !lostRun && hostAvailable && receiptRead?.revision === projectRevision ? run.freshness ?? 'unknown' : 'unknown until rechecked'}. It does not verify your requirement or whole project.</p></section>}</>}<label className="field">Requirement verdict · your assessment<select value={draft.verdict ?? 'uncertain'} onChange={e => setDraft(previous => ({ ...previous, verdict: e.target.value }))}><option value="uncertain">Uncertain</option><option value="satisfied">Satisfied for the checked case</option><option value="not-satisfied">Not satisfied</option></select></label>{field('reason', 'Why does the evidence support that verdict?', 'Explain what was established and what is still uncertain.')}{field('assistance', 'Assistance used · self-declared', 'Describe AI, people, documentation, or no additional help.')}<Control className="text-button" disabled={busy || (run?.status === 'running' && !lostRun)} onClick={() => { void refresh(); }}>Refresh source again <Arrow /></Control></>}
    {a.stage === 'reflect' && <><section className="saved-thought"><strong>Requirement verdict · {a.verification?.verdict}</strong><p>{a.verification?.reason}</p><small>Your assessment of the checked case.</small></section>{field('text', 'Your reflection', 'What explains the result? What would you investigate next?', 5)}<Control className="text-button" disabled={busy} onClick={() => { void refresh(); }}>Refresh source after another edit <Arrow /></Control></>}
    {a.stage === 'complete' && <><section className="saved-thought"><strong>{unsaved ? 'Reflection kept in this tab.' : 'Reflection saved.'}</strong><p>{a.reflection?.text}</p></section><section className="record-verdict"><strong>Your requirement verdict · {a.verification?.verdict}</strong><p>{a.verification?.reason}</p><p className="disclosure">Your assessment of the captured evidence. Recorded activities do not resolve an uncertain or unmet rule.</p></section>{a.transfer ? <section className="separate-case-record"><Lotus /><h2>Your separate case</h2><p>{a.transfer.caseInput}</p><p><strong>Prediction</strong><br />{a.transfer.prediction}</p><p><strong>Reasoning</strong><br />{a.transfer.reasoning}</p><p><strong>Assistance · self-declared</strong><br />{a.transfer.assistance}</p><p className="disclosure">This answer is self-reported. Learning transfer has not been independently measured.</p></section> : <>{field('caseInput', 'A separate case', 'Choose a different input, state or edge case.', 2)}{field('prediction', 'Expected outcome', 'What should happen in the new case?', 2)}{field('reasoning', 'Your reasoning', 'Explain which condition decides the outcome.')}{field('assistance', 'Assistance used · self-declared', 'Describe additional help, or no additional help.')}</>}<Control className="text-button" disabled={busy} onClick={() => { void refresh(); }}>Refresh saved source <Arrow /></Control></>}
    <p className="storage-note">{unsaved ? 'Newest work is unsaved in this tab. Export it or retry saving before leaving.' : 'Learning records are saved in this browser.'}</p>
   </section><aside className="lesson-context"><details className="captured-context" open={sourceOpen} onToggle={e => setSourceOpen(e.currentTarget.open)}><summary><span className="small-label">YOUR CAPTURED SOURCE</span><strong>{a.current.path}</strong><span className="narrow-source-label">View source <Arrow /></span></summary><div className="captured-content"><SourceViewer source={a.current} /><p className="captured-time">Captured {new Date(a.current.capturedAt).toLocaleString()} · explicit refresh</p><details className="source-identity"><summary>Source details</summary><p>Lines {a.current.startLine}–{a.current.endLine} · {a.current.fileBytes.toLocaleString()} bytes{a.current.truncated ? ' · excerpt only' : ''}</p><p className="source-hash">{a.current.sourceHash}</p><p className="disclosure">{freshness === 'current' ? `Selected saved file matched at ${sourceCheckedAt ? new Date(sourceCheckedAt).toLocaleTimeString() : 'the last read'}. Other files and runtime inputs are outside this comparison.` : freshness === 'changed' ? 'A newer saved source is available; this excerpt is the captured version.' : 'Selected-source freshness has not been established. Inspect or refresh saved source explicitly.'}</p></details><details className="source-exploration"><summary>Open source walkthrough <Arrow /></summary><p>Explore the deciding conditions without advancing the lesson.</p><ProjectSource source={a.current} /></details><Control className="text-button" onClick={browse}>Browse project source <Arrow /></Control></div></details><details className="teacher-access"><summary>Ask a teacher · optional <Arrow /></summary><TeachingPanel key={`${a.id}:${a.current.sourceHash}`} source={a.current} requirement={a.requirement} caseInput={a.caseInput} onBusy={setTeachingBusy} onUnretained={setTeachingDraft} saved={a.teaching} onResult={result => current(a) && act({ type: 'teaching', result })} /></details></aside></div>
  </main>
  <footer className="lesson-action"><div><p>{busy ? 'Reading the local project…' : a.stage === 'predict' ? 'Save your prediction before observing.' : a.stage === 'observe' ? 'Your observation is a self-report.' : a.stage === 'change' ? 'An edit is optional. Saved source is checked explicitly.' : a.stage === 'verify' ? 'Record the evidence, scope and assistance you used.' : complete ? 'Activities recorded. Their coverage stays visible.' : 'Keep your reasoning with the captured source.'}</p><Control className="primary" disabled={!canSave} reason={busy ? 'The current operation is still pending.' : a.stage === 'verify' && checkBlocked ? unretained ? 'Attach the returned receipt before recording verification, or export it before leaving.' : lostRun ? 'Clear the unknown check context before recording evidence.' : 'Wait for the acknowledged check to finish.' : a.stage === 'verify' && !manual && (!hostAvailable || receiptRead?.revision !== projectRevision) ? 'Read a current host receipt before recording command evidence.' : 'Complete the required fields before recording this activity.'} onClick={advance}>{busy ? 'Reading saved source…' : complete ? 'Back to Path' : step.action}<Arrow /></Control></div></footer>
  <dialog ref={dialog} onCancel={() => setConsent(false)} onClose={() => setConsent(false)} aria-labelledby="script-consent-title"><h2 id="script-consent-title">Run this existing project check?</h2><p>This executes trusted repository code on your computer. The runner is not a sandbox. It may change files according to the command.</p><pre className="single-code"><code>{script?.command}</code></pre><p className="disclosure">Source {a.current.sourceHash.slice(0, 12)} · manifest {script?.manifestHash.slice(0, 12)}. The host checks both before execution; pre/post hooks are excluded.</p><div className="button-row"><Control className="secondary" onClick={() => setConsent(false)}>Cancel</Control><Control className="primary" onClick={() => { void execute(); }}>Run this exact check <Arrow /></Control></div></dialog>
 </div>;
}
