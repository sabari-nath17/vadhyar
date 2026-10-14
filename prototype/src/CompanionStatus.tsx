import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { getChanges } from './project-api.js';
import { projectChangesSchema, type ProjectInfo } from './project-types.js';
import { Arrow, Control, NavIcon } from './ui.js';

export function CompanionStatus({ project, statusError = '', compact = false }: { project: ProjectInfo; statusError?: string; compact?: boolean }) {
 const [feed, setFeed] = useState<z.infer<typeof projectChangesSchema> | null>(null), [error, setError] = useState('');
 const [open, setOpen] = useState(false), [retry, setRetry] = useState(0), [loading, setLoading] = useState(false);
 const dialog = useRef<HTMLDialogElement>(null);
 useEffect(() => {
  if (compact && !open) return;
  let active = true;
  setLoading(true);
  void getChanges(project.id).then(value => { if (active) { setFeed(value); setError(''); } }).catch(() => { if (active) setError('Development history could not be read. Saved learning records remain available.'); }).finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
 }, [project.id, project.revision, open, compact, retry]);
 useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
 const label = statusError ? 'Recording status unknown' : project.watching ? 'Recording eligible files' : 'Recorder needs attention';
 const details = <>
  {statusError ? <section className="notice warning" role="alert"><strong>Current recording status is unknown.</strong><p>{statusError}</p><p>The previous connection status is not a fresh health check. Reconnect from the workspace alert or restart the launcher.</p></section> : !project.watching && <section className="notice warning" role="alert"><strong>Automatic recording is unavailable.</strong><p>Saved source can still be inspected. Restart the launcher to retry the watcher. Category: {project.watchError ?? 'not started'}.</p></section>}
  <dl className="recorder-facts"><dt>Source index</dt><dd>{project.status === 'indexing' ? 'Indexing in progress' : project.status === 'ready' ? 'Initial scan complete' : 'Partial or unavailable coverage'} · {project.indexedFiles.toLocaleString()} files</dd><dt>Coverage</dt><dd>{project.skippedFiles.toLocaleString()} excluded entries · {project.scanErrors} scan errors</dd><dt>AI-session signal</dt><dd>Not connected</dd><dt>Build status</dt><dd>Check evidence required</dd><dt>Host source revision</dt><dd>{project.revision}</dd></dl>
  <h3>Recent saved-file events</h3>
  {error && <div className="notice warning" role="alert"><p>{error}</p><Control className="secondary" onClick={() => setRetry(value => value + 1)}>Retry development history</Control></div>}
  <div className="change-feed" aria-busy={loading}>{feed?.changes.length ? <ul>{feed.changes.map(change => <li key={change.id}><span><strong>{change.path}</strong><small>{change.kind} · {change.tracked ? 'selected source version captured' : 'metadata recorded'}</small></span><time dateTime={change.capturedAt}>{new Date(change.capturedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</time></li>)}</ul> : <p className="muted">{loading ? 'Reading development history…' : error ? 'History is unavailable. Retry this read; saved records are retained.' : 'Later eligible saves appear here after the starting index.'}</p>}</div>
  <p className="disclosure">Metadata follows eligible saved files. Source history begins for selected files; the last 20 versions are retained. Events can coalesce and coverage is bounded. This feed does not establish selected-source freshness or a runtime result.</p>
 </>;
 if (!compact) return <details className="recorder-details"><summary><span className={'status-dot ' + (!statusError && project.watching ? 'recording' : 'unknown')} />{label}<Arrow /></summary>{details}</details>;
 return <><Control className="recording-control text-button" onClick={() => setOpen(true)}><span className={'status-dot ' + (!statusError && project.watching ? 'recording' : 'unknown')} />{label}</Control><dialog ref={dialog} onCancel={() => setOpen(false)} onClose={() => setOpen(false)} aria-labelledby="recorder-title"><div className="dialog-top"><h2 id="recorder-title">Local recording</h2><Control className="icon-button" aria-label="Close recording details" onClick={() => setOpen(false)}><NavIcon name="Close" /></Control></div>{details}</dialog></>;
}
