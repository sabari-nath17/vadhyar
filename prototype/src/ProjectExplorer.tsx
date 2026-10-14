import { useEffect, useRef, useState } from 'react';
import { getFiles, getSource, getVersions } from './project-api.js';
import type { ProjectFile, ProjectInfo, SourceSnapshot } from './project-types.js';
import type { DraftStatus } from './Workspace.js';
import { Arrow, Control, download, NavIcon } from './ui.js';
import { SourceWalkthrough } from './SourceWalkthrough.js';
import { SourceReadingBundle } from './SourceReadingBundle.js';

export function ProjectSource({ source, onNavigate }: { source: SourceSnapshot; onNavigate?: (fileId: string, startLine: number, lines?: number) => void }) {
 return <SourceWalkthrough key={`${source.projectId}:${source.fileId}:${source.sourceHash}:${source.startLine}:${source.endLine}`} source={source} onNavigate={onNavigate} />;
}
export function ProjectExplorer({ project, start, onDirty }: { project: ProjectInfo; start: (source: SourceSnapshot, requirement: string, caseInput: string) => boolean; onDirty: DraftStatus }) {
 const requestId = useRef(0), sourceRequest = useRef(0), historyRequest = useRef(0), mounted = useRef(true);
 const currentPage = useRef({ projectId: project.id, query: '', cursor: null as string | null });
 const [query, setQuery] = useState(''), [files, setFiles] = useState<ProjectFile[]>([]), [cursor, setCursor] = useState<string | null>(null);
 const [loading, setLoading] = useState(false), [filesError, setFilesError] = useState(''), [failedCursor, setFailedCursor] = useState<string | null>(null), [fileRetry, setFileRetry] = useState(0);
 const [source, setSource] = useState<SourceSnapshot | null>(null), [sourceError, setSourceError] = useState(''), [failedSource, setFailedSource] = useState<{ fileId: string; line: number; lines: number } | null>(null);
 const [requirement, setRequirement] = useState(''), [caseInput, setCaseInput] = useState(''), [firstLine, setFirstLine] = useState('1'), [sourceLoading, setSourceLoading] = useState(false);
 const [versions, setVersions] = useState<SourceSnapshot[]>([]), [historyError, setHistoryError] = useState(''), [historyLoading, setHistoryLoading] = useState(false), [historyRetry, setHistoryRetry] = useState(0);
 useEffect(() => { mounted.current = true; return () => { mounted.current = false; sourceRequest.current++; historyRequest.current++; }; }, []);
 useEffect(() => {
  if (currentPage.current.projectId !== project.id || currentPage.current.query !== query) currentPage.current = { projectId: project.id, query, cursor: null };
  const pageCursor = currentPage.current.cursor;
  const controller = new AbortController(), id = ++requestId.current;
  setLoading(true);
  const timer = setTimeout(() => {
   void getFiles(project.id, query, pageCursor, controller.signal).then(page => { if (!controller.signal.aborted && id === requestId.current) { setFiles(page.files); setCursor(page.nextCursor); setFilesError(''); } }).catch(e => { if (!controller.signal.aborted && id === requestId.current) { setFailedCursor(pageCursor); setFilesError(e instanceof Error ? e.message : 'Files could not be loaded.'); } }).finally(() => { if (!controller.signal.aborted && id === requestId.current) setLoading(false); });
  }, 180);
  return () => { clearTimeout(timer); controller.abort(); };
 }, [project.id, project.revision, query, fileRetry]);
 useEffect(() => {
  onDirty(Boolean(requirement || caseInput) || sourceLoading,
   () => download(JSON.stringify({ source, requirement, caseInput }, null, 2), 'vadhyar-question-setup.json'));
  return () => onDirty(false);
 }, [requirement, caseInput, sourceLoading, source, onDirty]);
 useEffect(() => {
  const id = ++historyRequest.current;
  setVersions([]); setHistoryError('');
  if (!source) return;
  setHistoryLoading(true);
  void getVersions(project.id, source.fileId).then(value => { if (mounted.current && id === historyRequest.current) setVersions(value.versions.filter(version => version.fileId === source.fileId)); }).catch(() => { if (mounted.current && id === historyRequest.current) setHistoryError('Saved versions could not be loaded. Your selected source and draft are retained.'); }).finally(() => { if (mounted.current && id === historyRequest.current) setHistoryLoading(false); });
 }, [project.id, project.revision, source?.fileId, historyRetry]);
 const select = async (fileId: string, line = 1, lines = 200) => {
  const id = ++sourceRequest.current;
  setSourceLoading(true); setSourceError(''); setFailedSource({ fileId, line, lines });
  try { const value = await getSource(project.id, fileId, line, lines); if (mounted.current && id === sourceRequest.current) { setSource(value); setFirstLine(String(value.startLine)); setHistoryRetry(value => value + 1); } }
  catch (e) { if (mounted.current && id === sourceRequest.current) setSourceError(e instanceof Error ? e.message : 'Source could not be loaded.'); }
  finally { if (mounted.current && id === sourceRequest.current) setSourceLoading(false); }
 };
 const more = async (pageCursor = cursor) => {
  const id = ++requestId.current;
  setLoading(true);
  try { const page = await getFiles(project.id, query, pageCursor); if (mounted.current && id === requestId.current) { currentPage.current = { projectId: project.id, query, cursor: pageCursor }; setFiles(page.files); setCursor(page.nextCursor); setFilesError(''); } }
  catch (e) { if (mounted.current && id === requestId.current) { setFailedCursor(pageCursor); setFilesError(e instanceof Error ? e.message : 'The file page could not be loaded.'); } }
  finally { if (mounted.current && id === requestId.current) setLoading(false); }
 };
 return <>
  <div className="project-summary"><span><strong>{project.name}</strong> · {project.indexedFiles.toLocaleString()} indexed files</span><span>{project.status === 'indexing' ? 'Indexing in progress' : project.status === 'ready' ? 'Initial scan complete' : 'Partial coverage'} · {project.skippedFiles.toLocaleString()} excluded entries</span></div>
  <div className="project-explorer"><aside className="project-files" aria-label="Project files"><label className="field">Find a file<input placeholder="Search paths in your project" maxLength={200} value={query} onChange={e => { requestId.current++; setQuery(e.target.value); }} /></label><p className="disclosure">Search matches file paths. Find the feature in your coding tool, then search its filename here.</p><div className="file-count" aria-live="polite">{loading ? 'Loading file page…' : `${files.length} files on this page`}</div>{filesError && <section className="notice warning" role="alert"><p>{filesError}</p><Control className="secondary" onClick={() => { if (failedCursor) void more(failedCursor); else setFileRetry(value => value + 1); }}>Retry file page</Control></section>}<ul>{files.map(file => <li key={file.id}><Control className={source?.fileId === file.id ? 'file-option selected' : 'file-option'} aria-pressed={source?.fileId === file.id} disabled={sourceLoading} onClick={() => { void select(file.id); }}><NavIcon name="Source" /><span>{file.path}<small>{file.language} · {file.size.toLocaleString()} bytes</small></span></Control></li>)}</ul>{!loading && files.length === 0 && !filesError && <><p>{currentPage.current.cursor ? 'This file page is empty. Return to the first page to find available paths.' : 'No matching eligible file paths. Try the filename from your coding tool; excluded folders are outside this list.'}</p>{currentPage.current.cursor && <Control className="secondary" onClick={() => { void more(null); }}>Back to first page <Arrow /></Control>}</>}{cursor && <Control className="secondary" disabled={loading} onClick={() => { void more(); }}>Next 50 files <Arrow /></Control>}<p className="disclosure">Metadata only. Hidden, vendor, generated and private files are excluded. Eligible saves update the index while recording is available.</p></aside>
   <section className="selected-source" aria-busy={sourceLoading}>{sourceError && <section className="notice warning" role="alert"><p>{sourceError}</p>{failedSource && <Control className="secondary" onClick={() => { void select(failedSource.fileId, failedSource.line, failedSource.lines); }}>Retry selected source</Control>}</section>}{source ? <><div className="source-range"><label className="field">Start line<input type="number" min={1} max={10000000} value={firstLine} onChange={e => setFirstLine(e.target.value)} /></label><Control className="secondary" disabled={sourceLoading || !Number.isInteger(Number(firstLine)) || Number(firstLine) < 1} onClick={() => { void select(source.fileId, Number(firstLine)); }}>Load excerpt</Control></div><p className="captured-time">Captured {new Date(source.capturedAt).toLocaleString()} · explicit source read</p><ProjectSource source={source} onNavigate={select} /><SourceReadingBundle key={project.id} source={source} onNavigate={select} /><details className="source-versions"><summary>Captured versions ({versions.length} retained)</summary>{historyLoading && <p role="status">Reading this file’s captured versions…</p>}{historyError && <section className="notice warning" role="alert"><p>{historyError}</p><Control className="secondary" onClick={() => setHistoryRetry(value => value + 1)}>Retry captured versions</Control></section>}{versions.map((version, i) => <details key={version.sourceHash + i}><summary>{new Date(version.capturedAt).toLocaleString()} · {version.sourceHash.slice(0, 12)} · lines {version.startLine}–{version.endLine}</summary><pre className="record-source"><code>{version.text}</code></pre></details>)}<p className="disclosure">Historical excerpts with full-file identities. Begin a question from the selected source above.</p></details><section className="project-rule"><h2>What should this code do?</h2><p>Confirm one meaningful rule and one concrete case.</p><label className="field">Requirement<textarea rows={3} maxLength={4000} value={requirement} onChange={e => setRequirement(e.target.value)} placeholder="Describe the expected behavior and the condition that matters." /></label><label className="field">Case to investigate<textarea rows={2} maxLength={2000} value={caseInput} onChange={e => setCaseInput(e.target.value)} placeholder="An input, user action, edge case, or state you can observe." /></label><Control className="primary" disabled={sourceLoading || Number(firstLine) !== source.startLine || !source.text.trim() || source.endLine < source.startLine || requirement.trim().length < 8 || caseInput.trim().length < 1} reason="Load a nonempty source range, confirm a requirement and describe a concrete case." onClick={() => start(source, requirement, caseInput)}>Start this question <Arrow /></Control><p className="disclosure">Exploring source acknowledges your intent. It does not establish understanding or mastery.</p></section></> : <div className="empty-state source-empty"><NavIcon name="Source" /><h2>Start with one useful file.</h2><p>Choose source from your project. A focused excerpt is enough to begin.</p><span className="muted">Browsing source stays local. Teaching asks for sharing approval separately.</span></div>}</section>
  </div>
 </>;
}
