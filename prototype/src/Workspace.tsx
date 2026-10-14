import { useCallback, useEffect, useRef, useState } from 'react';
import { App as PreparedApp } from './App.js';
import { connectProject, getProject, getSourceState, sourceFreshness } from './project-api.js';
import { exportProjectRecord, newProjectState, persistProjectState, PROJECT_STORAGE_KEY, recordProjectAction, resetProjectState, restoreProjectState, type ProjectAction, type ProjectState } from './project-learning.js';
import type { ProjectInfo, ProjectSourceState, SourceSnapshot } from './project-types.js';
import { savedPredictionCount } from './activity.js';
import { CompanionStatus } from './CompanionStatus.js';
import { LearningPath } from './LearningPath.js';
import { lessonSteps, type Freshness } from './learning-path.js';
import { ProjectExplorer } from './ProjectExplorer.js';
import { ProjectLesson } from './ProjectLesson.js';
import { Website } from './Website.js';
import { Arrow, Control, download, Heading, Mark, NavIcon } from './ui.js';

const storage = { getItem: (key: string) => localStorage.getItem(key), setItem: (key: string, value: string) => localStorage.setItem(key, value) };
const message = (error: unknown) => error instanceof Error ? error.message : 'The project operation could not be completed.';
type Destination = 'Path' | 'Project' | 'Notebook' | 'Lesson' | 'About';
export type DraftStatus = (dirty: boolean, exportDraft?: () => void) => void;

export function WorkspaceApp() {
 const [prepared, setPrepared] = useState(false);
 const [project, setProject] = useState<ProjectInfo | null>(null);
 const [error, setError] = useState('');
 const [connecting, setConnecting] = useState(true);
 const pending = useRef(0);
 const connect = async () => {
  const request = ++pending.current;
  setConnecting(true); setError('');
  try { const value = await connectProject(); if (request === pending.current) setProject(value); }
  catch (e) { if (request === pending.current) setError(message(e)); }
  finally { if (request === pending.current) setConnecting(false); }
 };
 useEffect(() => { void connect(); return () => { pending.current++; }; }, []);
 useEffect(() => {
  if (!project) return;
  let active = true;
  let timer: ReturnType<typeof setTimeout>;
  const poll = async () => {
   let delay = 1500;
   try { const next = await getProject(); if (active) { setProject(next); setError(''); } }
   catch (e) { delay = 3000; if (active) setError(message(e)); }
   finally { if (active) timer = setTimeout(() => { void poll(); }, delay); }
  };
  timer = setTimeout(() => { void poll(); }, 1500);
  return () => { active = false; clearTimeout(timer); };
 }, [project?.id]);
 if (prepared) return <PreparedApp exitExample={() => setPrepared(false)} />;
 if (!project) return <main className="companion-app connect-screen"><Mark /><Heading title="Bring your project into focus.">One local project. One useful question.</Heading><section className="connection-state" aria-live="polite"><h2>{connecting ? 'Connecting to the local project…' : 'Project connection needs attention'}</h2><p>{error || 'The launcher approves your project folder. Files are indexed locally; source is read when you select it.'}</p>{error && <Control className="primary" onClick={() => { void connect(); }}>Retry connection <Arrow /></Control>}<p className="disclosure">Choose another folder with the launcher’s --project option. Learning records are saved in this browser.</p></section><Control className="text-button" onClick={() => setPrepared(true)}>Try the optional prepared example <Arrow /></Control></main>;
 return <ConnectedWorkspace key={project.id} project={project} example={() => setPrepared(true)} connectionError={connecting ? 'Reconnecting; current recording status is unknown.' : error} reconnect={() => { void connect(); }} />;
}
function load(projectId: string) {
 try { return restoreProjectState(localStorage.getItem(PROJECT_STORAGE_KEY(projectId)), projectId); }
 catch { return { state: newProjectState(projectId), error: 'Browser storage is unavailable. Export visible work before closing this tab.' }; }
}
function ConnectedWorkspace({ project, example, connectionError, reconnect }: { project: ProjectInfo; example: () => void; connectionError: string; reconnect: () => void }) {
 const [initial] = useState(() => load(project.id));
 const [state, setState] = useState(initial.state), current = useRef(state);
 const [error, setError] = useState(initial.error ?? ''), [unsaved, setUnsaved] = useState(false);
 const [page, setPage] = useState<Destination>('Path'), [dirty, setDirty] = useState(false);
 const view = useRef<Destination>('Path');
 const [review, setReview] = useState(false), [query, setQuery] = useState(''), [reflectionsOnly, setReflectionsOnly] = useState(false);
 const [sourceState, setSourceState] = useState<{ key: string; revision: number; value: ProjectSourceState; checkedAt: string } | null>(null);
 const [settings, setSettings] = useState(false);
 const [confirmation, setConfirmation] = useState<{ text: string; run: () => void } | null>(null);
 const dialog = useRef<HTMLDialogElement>(null), settingsDialog = useRef<HTMLDialogElement>(null);
 const draftExport = useRef<(() => void) | undefined>(undefined);
 const onDirty = useCallback<DraftStatus>((value, exportDraft) => { setDirty(value); draftExport.current = value ? exportDraft : undefined; }, []);
 const ask = (text: string, run: () => void) => setConfirmation({ text, run });
 const leave = (run: () => void) => {
  if (dirty || unsaved) ask('Leave this unsaved work? Export it first, or keep working. Saved records are retained. A pending request may still finish on the host.', run);
  else run();
 };
 const navigate = (destination: Destination) => {
  if (destination === page) return;
  leave(() => { view.current = destination; setPage(destination); onDirty(false); });
 };
 const act = (action: ProjectAction, attemptId?: string, sourceHash?: string) => {
  if (attemptId && (view.current !== 'Lesson' || current.current.attempt?.id !== attemptId || current.current.attempt.current.sourceHash !== sourceHash)) return false;
  try {
   const result = recordProjectAction(current.current, { ...action, ...(attemptId ? { attemptId } : {}) }, storage);
   current.current = result.state; setState(result.state); setUnsaved(Boolean(result.warning)); setError(result.warning ?? '');
   return !(action.type === 'beginCheck' && result.warning);
  } catch (e) { setError(message(e)); return false; }
 };
 const begin = (source: SourceSnapshot, requirement: string, caseInput: string) => {
  const run = () => { if (act({ type: 'start', source, requirement, caseInput })) { view.current = 'Lesson'; setPage('Lesson'); onDirty(false); } };
  if (current.current.attempt) { ask('Start a new question? The current attempt is retained in history. Unsaved setup or lesson text will be discarded.', run); return false; }
  run(); return true;
 };
 useEffect(() => {
  const listener = (e: BeforeUnloadEvent) => { if (dirty || unsaved) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', listener); return () => window.removeEventListener('beforeunload', listener);
 }, [dirty, unsaved]);
 useEffect(() => {
  const listener = (e: StorageEvent) => { if (e.key === PROJECT_STORAGE_KEY(project.id) || e.key === null) setError('The project record changed in another tab. Reload before saving; this draft remains here.'); };
  window.addEventListener('storage', listener); return () => window.removeEventListener('storage', listener);
 }, [project.id]);
 useEffect(() => { document.getElementById('page-heading')?.focus(); }, [page]);
 useEffect(() => { if (confirmation) dialog.current?.showModal(); else dialog.current?.close(); }, [confirmation]);
 useEffect(() => { if (settings) settingsDialog.current?.showModal(); else settingsDialog.current?.close(); }, [settings]);
 const backup = () => { try { download(localStorage.getItem(PROJECT_STORAGE_KEY(project.id)) ?? JSON.stringify(state), 'vadhyar-project-backup.json'); } catch { setError('Saved storage cannot be read. Export the visible project record.'); } };
 const retry = () => {
  try { const next = persistProjectState(storage, current.current, current.current.serial); current.current = next; setState(next); setUnsaved(false); setError(''); }
  catch (e) { setError(message(e)); }
 };
 const reset = () => {
  setSettings(false);
  ask('Reset only this project’s saved learning record? Export a backup first. Host source history and the prepared example are retained.', () => {
   try { const fresh = resetProjectState(storage, project.id); current.current = fresh; setState(fresh); setError(''); setUnsaved(false); onDirty(false); view.current = 'Path'; setPage('Path'); }
   catch { setError('This project record could not be reset.'); }
  });
 };
 const exportRecord = () => download(exportProjectRecord(state), 'vadhyar-project-record.md');
 const records = () => { setQuery(''); setReflectionsOnly(false); navigate('Notebook'); };
 const attempt = state.attempt;
 const selection = attempt?.current, selectionKey = selection ? `${selection.projectId}:${selection.fileId}:${selection.sourceHash}:${selection.startLine}` : '';
 useEffect(() => {
  if (!selection || connectionError) return;
  const controller = new AbortController();
  void getSourceState(selection.projectId, selection.fileId, controller.signal).then(value => {
   if (!controller.signal.aborted) setSourceState({ key: selectionKey, revision: project.revision, value, checkedAt: new Date().toISOString() });
  }).catch(() => { if (!controller.signal.aborted) setSourceState(null); });
  return () => controller.abort();
 }, [selectionKey, project.revision, connectionError]);
 const checkedSource = !connectionError && sourceState?.key === selectionKey && sourceState.revision === project.revision ? sourceState : null;
 const freshness: Freshness = selection ? sourceFreshness(selection, checkedSource?.value ?? null) : 'unknown';
 const attention = (error || connectionError) && <section className="notice warning save-error" role="alert"><strong>{connectionError ? 'Local connection needs attention' : 'Project record needs attention'}</strong><p>{error || connectionError}</p><div className="button-row">{connectionError && <Control onClick={() => leave(reconnect)}>Reconnect local service</Control>}{unsaved && <Control onClick={retry}>Retry saving</Control>}<Control onClick={backup}>Download saved backup</Control><Control onClick={exportRecord}>Export visible record</Control><Control onClick={() => leave(() => window.location.reload())}>Reload saved record</Control><Control onClick={reset}>Reset this project record</Control></div></section>;
 const lesson = attempt && <ProjectLesson key={attempt.id} attempt={attempt} act={action => act(action, attempt.id, attempt.current.sourceHash)} onDirty={onDirty} ask={ask} close={() => navigate('Path')} browse={() => navigate('Project')} projectName={project.name} freshness={freshness} sourceCheckedAt={checkedSource?.checkedAt} projectRevision={project.revision} hostAvailable={!connectionError} unsaved={unsaved} attention={attention} />;
 let content;
 if (page === 'Path') content = <div className="page path-page"><Heading title="Your path" action={<div className="mode-switch" role="group" aria-label="Presentation mode"><Control aria-pressed={!review} className={!review ? 'chosen' : ''} onClick={() => setReview(false)}>Guided</Control><Control aria-pressed={review} className={review ? 'chosen' : ''} onClick={() => setReview(true)}>Review</Control></div>}>One question. Follow the evidence.</Heading><LearningPath attempt={attempt} freshness={freshness} review={review} unsaved={unsaved} resume={() => navigate('Lesson')} choose={() => navigate('Project')} records={records} /></div>;
 else if (page === 'Project' || (page === 'Lesson' && !attempt)) content = <div className="page project-page"><Heading title="Begin with the source.">Confirm one rule and one case in {project.name}.</Heading><ProjectExplorer project={project} start={begin} onDirty={onDirty} /><CompanionStatus project={project} statusError={connectionError} /></div>;
 else if (page === 'Notebook') {
  const attempts = [...state.history, ...(attempt ? [attempt] : [])];
  content = <div className="page notebook-page"><Heading title="Your notebook." action={<Control className="secondary" onClick={exportRecord}>Export project record <Arrow /></Control>}>Keep the reasoning worth revisiting.</Heading><div className="notebook-tools"><label className="field search-field">Search your records<input value={query} maxLength={200} onChange={e => setQuery(e.target.value)} placeholder="Find a rule, case or reflection" /></label><div className="mode-switch" role="group" aria-label="Notebook view"><Control aria-pressed={!reflectionsOnly} className={!reflectionsOnly ? 'chosen' : ''} onClick={() => setReflectionsOnly(false)}>Questions</Control><Control aria-pressed={reflectionsOnly} className={reflectionsOnly ? 'chosen' : ''} onClick={() => setReflectionsOnly(true)}>Reflections</Control></div></div><p className="notebook-counts">{savedPredictionCount(state)} {unsaved ? 'recorded predictions · newest work unsaved' : 'saved predictions'} <span>·</span> {attempts.filter(a => a.reflection).length} reflections <span>·</span> {attempts.filter(a => a.transfer).length} separate cases</p><ProjectRecords state={state} notebook={reflectionsOnly} query={query} /><p className="disclosure">Observations, requirement verdicts and assistance are self-reported. Source and check records establish their stated coverage. Completion does not establish mastery.</p></div>;
 }
 return <div className="companion-app">
  {page === 'About' ? <><div className="website-errors">{attention}</div><Website enter={() => navigate('Path')} /></> : page === 'Lesson' && attempt ? lesson : <div className="app-shell"><a className="skip-link" href="#main">Skip to content</a><aside className="sidebar"><Control className="brand-button" aria-label="Vadhyar path" onClick={() => navigate('Path')}><Mark /></Control><span className="sidebar-label">YOUR LEARNING SPACE</span><nav aria-label="Main navigation">{(['Path', 'Project', 'Notebook'] as const).map(destination => <Control key={destination} className={'nav-item' + (page === destination ? ' active' : '')} aria-current={page === destination ? 'page' : undefined} onClick={() => navigate(destination)}><NavIcon name={destination} /><span>{destination}</span></Control>)}</nav><div className="sidebar-bottom"><CompanionStatus project={project} statusError={connectionError} compact /><p>{unsaved ? 'Newest work: unsaved in this tab' : 'Learning: saved in this browser'}</p><Control className="text-button" onClick={() => setSettings(true)}>Settings <NavIcon name="Settings" /></Control><Control className="text-button" onClick={() => navigate('About')}>About Vadhyar <Arrow /></Control></div></aside><div className="workspace"><header className="topbar"><div className="breadcrumb"><strong>{project.name}</strong><span>/</span>{page === 'Path' ? 'Your question' : page}</div><div className="topbar-right"><span className="captured-label">{attempt ? 'Captured source' : 'Local project'}</span><Control className="icon-button narrow-settings" aria-label="Settings" onClick={() => setSettings(true)}><NavIcon name="Settings" /></Control></div></header><main id="main" tabIndex={-1}>{attention}{content}</main></div></div>}
  <dialog ref={dialog} onCancel={() => setConfirmation(null)} onClose={() => setConfirmation(null)} aria-labelledby="workspace-confirm-title"><h2 id="workspace-confirm-title">Before you continue</h2><p>{confirmation?.text}</p><div className="button-row">{draftExport.current && <Control className="secondary" onClick={() => draftExport.current?.()}>Export unsaved work</Control>}<Control className="secondary" onClick={exportRecord}>Export visible record</Control></div><div className="button-row"><Control className="secondary" onClick={() => setConfirmation(null)}>Keep working</Control><Control className="primary" onClick={() => { const run = confirmation?.run; dialog.current?.close(); setConfirmation(null); run?.(); }}>Continue <Arrow /></Control></div></dialog>
  <dialog ref={settingsDialog} onCancel={() => setSettings(false)} onClose={() => setSettings(false)} aria-labelledby="settings-title"><div className="dialog-top"><h2 id="settings-title">Your local workspace</h2><Control className="icon-button" aria-label="Close settings" onClick={() => setSettings(false)}><NavIcon name="Close" /></Control></div><p>Learning records are saved in this browser at this address. Source history is stored by the local host. Use one tab to record progress.</p><div className="settings-actions"><Control className="secondary" onClick={exportRecord}>Export project record</Control><Control className="secondary" onClick={backup}>Download saved backup</Control><Control className="text-button" onClick={() => { setSettings(false); leave(example); }}>Optional prepared example <Arrow /></Control><Control className="text-button" onClick={() => { setSettings(false); navigate('About'); }}>About Vadhyar <Arrow /></Control><Control className="text-button danger" onClick={reset}>Reset this project record</Control></div><p className="disclosure">Teaching is configured beside the captured source. Every source-sharing request and project check needs its own review.</p></dialog>
 </div>;
}
function ProjectRecords({ state, notebook, query }: { state: ProjectState; notebook: boolean; query: string }) {
 const attempts = [...state.history, ...(state.attempt ? [state.attempt] : [])].reverse().filter(a => (!notebook || a.reflection) && `${a.requirement} ${a.caseInput} ${a.prediction?.text ?? ''} ${a.reflection?.text ?? ''}`.toLowerCase().includes(query.toLowerCase()));
 if (!attempts.length) return <section className="empty-state"><h2>{query ? 'No matching records.' : notebook ? 'Your reflections will live here.' : 'Your record starts here.'}</h2><p>Work through one question to keep a record of your reasoning.</p></section>;
 return <div className="project-records">{attempts.map(a => <article className="attempt-record" key={a.id}><div className="section-heading"><h2>{a.requirement}</h2><span className="chip">{a.transfer ? 'Separate case recorded' : lessonSteps.find(step => step.key === a.stage)?.label}</span></div><p className="muted">{a.baseline.path} · captured source {a.baseline.sourceHash.slice(0, 12)}</p>{notebook ? <p>{a.reflection?.text}</p> : <><dl className="generic-evidence"><dt>Case</dt><dd>{a.caseInput}</dd><dt>Original prediction</dt><dd>{a.prediction?.text ?? 'Not recorded'}</dd><dt>Original reasoning</dt><dd>{a.prediction?.reasoning ?? 'Not recorded'}</dd><dt>Observation · self-reported</dt><dd>{a.observation?.text ?? 'Not recorded'}</dd><dt>Saved source refreshes</dt><dd>{a.refreshes.map(value => value.changed ? 'Changed' : 'Unchanged').join(' → ') || 'Not refreshed'}</dd><dt>Verification</dt><dd>{a.verification?.kind === 'script' ? `${a.verification.run.scriptId}: ${a.verification.run.status}` : a.verification ? 'Manual · self-reported' : 'Not recorded'}</dd><dt>Requirement verdict · self-reported</dt><dd>{a.verification?.verdict ?? 'Not recorded'}</dd><dt>Assistance · self-declared</dt><dd>{a.verification?.assistance ?? 'Not recorded'}</dd><dt>Reflection</dt><dd>{a.reflection?.text ?? 'Not recorded'}</dd><dt>Separate case answer</dt><dd>{a.transfer ? `${a.transfer.caseInput} — ${a.transfer.prediction}` : 'Not recorded'}</dd></dl><details><summary>Inspect saved source and evidence</summary><pre className="record-source"><code>{a.baseline.text}</code></pre><p>Current captured identity: {a.current.sourceHash}</p>{a.pendingCheck && <section className="record-command"><h3>Captured command context · {a.pendingCheck.status}</h3><p>{a.pendingCheck.scriptId} · {a.pendingCheck.id ?? 'Start receipt unavailable; may have executed'}</p>{a.checkResult && <><p>Execution at last receipt: {a.checkResult.status} · exit {a.checkResult.exitCode ?? 'unknown'} · host coverage then: {a.checkResult.freshness ?? 'unknown'}</p><pre className="record-source"><code>{a.checkResult.output}</code></pre></>}<p className="disclosure">Historical operation evidence. Current host coverage is not established by opening this record.</p></section>}{!a.pendingCheck && a.verification?.kind === 'script' && <pre className="record-source"><code>{a.verification.run.output}</code></pre>}{a.teaching.map((result, index) => <section key={index}><h3>Generated interpretation · assistance</h3><p>{result.explanation.summary}</p><p className="disclosure">{result.model} · source {result.sourceHash.slice(0, 12)}. The full interpretation and coverage limits are included in the export.</p></section>)}</details></>}</article>)}</div>;
}
