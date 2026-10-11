import { useEffect, useRef, useState } from 'react';
import type { ProjectAction, ProjectState } from '../project/shared.js';
import { SnakeGame } from './snake-game.js';
import { Control, Icon } from './ui.js';
import { Task, StartSheet, RequirementFrame, Chip } from './v2/components.js';
import logo from '../../media/vadhyar-logo.png';

const projectSteps = ['Your idea', 'What changed', 'How it works', 'Check it'] as const;
export function ProjectPanel({ state, send, setupKey }: { state: ProjectState; send: (action: ProjectAction) => void; setupKey: () => void }) {
  const [title, setTitle] = useState(''), [request, setRequest] = useState(''), [expected, setExpected] = useState('');
  const [replaces, setReplaces] = useState<string | undefined>();
  const [view, setView] = useState(0), [editing, setEditing] = useState(false), [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const pending = useRef<{id?:string;title:string;request:string;expected:string} | undefined>(undefined);
  const intent = state.intents.find(item => item.id === state.selectedIntent);
  useEffect(() => {
    const sent = pending.current;
    if (!sent) return;
    if (intent && intent.id !== sent.id && intent.title === sent.title && intent.request === sent.request && intent.expected === sent.expected) { pending.current=undefined; setSaving(false); setEditing(false); setReplaces(undefined); }
    else if (state.error) { pending.current=undefined; setSaving(false); }
  }, [state.intents, state.selectedIntent, state.error]);
  const currentGuide = !state.error && !state.specificationStale && state.guide?.snapshot === state.snapshot && state.guide?.intentRevision === intent?.revision && !state.dirty;
  const currentCheck = !state.error && !state.checkDefinitionStale && !state.dirty && state.checkResult?.snapshot === state.snapshot && state.checkResult?.intentRevision === intent?.revision;
  const edit = !intent || editing || Boolean(replaces) || !intent.expected;
  const blocked = state.busy || state.dirty;
  const reason = state.dirty ? 'Save your code first.' : 'Wait for the current operation to finish.';
  const preview = state.preview;
  let action = <Control className="vd-primary" disabled={blocked} reason={reason} onClick={() => send({type:'projectStart'})}>Start tracking my code</Control>;
  if (state.started) {
    if (preview) action = <><Control className="vd-primary" disabled={blocked} reason={reason} onClick={() => send({type:'projectSend',identity:preview.identity})}>{state.busy ? state.operation : 'Send this to OpenAI'}</Control>{state.busy && <Control onClick={() => send({type:'projectCancel'})}>Cancel request</Control>}</>;
    else if (view === 0) action = edit ? <Control className="vd-primary" type="submit" form="project-intent" disabled={state.busy || saving || !title.trim() || !request.trim()} reason={saving ? 'Wait for the editor to save this idea.' : 'Add a name and say what you want first.'}>{saving ? 'Saving my idea…' : 'Save my idea'}</Control> : !intent?.confirmedAt ? <Control className="vd-primary" disabled={state.busy || !intent?.expected} reason="Say how your idea should behave first." onClick={() => intent && send({type:'projectConfirmIntent',id:intent.id,revision:intent.revision})}>Confirm my idea</Control> : <Control className="vd-primary" onClick={() => setView(1)}>See what changed</Control>;
    else if (view === 1) action = <Control className="vd-primary" disabled={blocked} reason={reason} onClick={() => { if (!state.selectedFiles.length) send({type:'projectSelectFiles'}); else setView(2); }}>{state.selectedFiles.length ? 'Understand these files' : 'Choose relevant files'}</Control>;
    else if (view === 2) action = currentGuide ? <Control className="vd-primary" onClick={() => setView(3)}>Check my changes</Control> : <Control className="vd-primary" disabled={blocked || !intent?.confirmedAt} reason={!intent?.confirmedAt ? 'Confirm your idea first.' : reason} onClick={() => send(state.selectedFiles.length ? {type:'projectPreview',operation:'explain'} : {type:'projectSuggestFiles'})}>{state.selectedFiles.length ? 'Review before explaining' : 'Find the code for my idea'}</Control>;
    else action = <Control className="vd-primary" disabled={state.busy || Boolean(state.check && state.dirty)} reason={reason} onClick={() => send(state.check ? {type:'projectRunCheck'} : {type:'projectSelectCheck'})}>{state.check ? `Run ${state.check.script}` : 'Choose a check'}</Control>;
  }
  return <main className="vd-panel vd-learning">
    <header className="vd-header"><div className="vd-logo-plate"><img src={logo} alt="Vadhyar — understand what you build" /></div><Control className="vd-icon-button" aria-label="Open project options" onClick={() => setSettingsOpen(true)}><Icon name="settings" /></Control></header>
    <p role="status" aria-live="polite" className="vd-status">{state.busy ? state.operation : state.started ? `${state.name} · ${state.fileCount} files tracked · ${state.changes.length} changed` : state.name}</p>
    {state.started && !preview && <nav className="vd2-project-nav" aria-label="Project steps">{projectSteps.map((name,index) => <Control key={name} aria-current={view === index ? 'step' : undefined} onClick={() => setView(index)}>{name}</Control>)}</nav>}
    {state.error && <aside className="vd-banner vd-fail" role="alert"><p>{state.error}</p><Control onClick={() => send({type:'projectReady'})}>Refresh my project</Control></aside>}
    {state.notice && <p className="vd-muted" role="status">{state.notice}</p>}
    {state.specificationStale && <p className="vd-banner vd-stale">Your imported rule changed. Import it again and confirm it before asking for guidance.</p>}
    {state.dirty && <p className="vd-banner vd-stale">Save your code before reviewing context or running a check.</p>}
    <section className="vd-task vd-stage" aria-label={preview ? 'Review sharing' : state.started ? projectSteps[view] : 'Start tracking'} aria-busy={state.busy}>
    <Task title={preview ? 'Send this to OpenAI?' : state.started ? projectSteps[view] : 'Start with your code'} pose={preview ? undefined : 'pointing'} action={action}>
      {!state.started ? <><p>Save a snapshot of {state.name}. See what changes after your next coding session.</p><details className="vd-details"><summary>What is saved?</summary><p>Earlier history and who wrote the code are unknown. Tracks up to 300 supported text/source files, 100KB each and 2MB total. Dependencies, generated output, hidden files and detected private content are excluded.</p></details></> : preview ? <>
        <p>Only pressing Send shares this reviewed context. Model: <code>{preview.model}</code>.</p><p>Operation: {preview.operation}. {intent?.expected || 'The feature intention may be unknown for grouping.'}</p>
        <ul>{state.selectedFiles.map(path => <li key={path}><code>{path}</code></li>)}</ul>
        <details className="vd-details"><summary>Exactly what will be shared</summary><pre>{preview.instruction}</pre><pre>{preview.text}</pre></details>
      </> : <>
      {view === 0 && <>
        {intent && !edit && <><RequirementFrame rule={intent.title}><p>{intent.request}</p><p>It should: {intent.expected}</p></RequirementFrame><Chip icon={intent.confirmedAt ? 'check' : 'clock'}>{intent.confirmedAt ? 'You confirmed this idea' : 'Needs your confirmation'}</Chip><p className="vd-muted">{intent.origin === 'agent' ? 'Captured coding request' : intent.origin === 'specification' ? 'Imported rule' : 'Entered by you'}</p><Control onClick={() => { setTitle(intent.title); setRequest(intent.request); setExpected(intent.expected); setReplaces(intent.id); }}>Change my idea</Control></>}
        {edit ? <form id="project-intent" onSubmit={event => { event.preventDefault(); if (state.busy || saving || !title.trim() || !request.trim()) return; pending.current={id:intent?.id,title:title.trim(),request:request.trim(),expected:expected.trim()}; setSaving(true); send({type:'projectAddIntent',intent:{title,request,expected,origin:'manual'},replaces}); }}>
          <label htmlFor="feature-title">Give it a name</label><input className="vd-project-input" id="feature-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={120} required />
          <label htmlFor="feature-request">What do you want to build?</label><textarea id="feature-request" value={request} onChange={event => setRequest(event.target.value)} maxLength={6000} required />
          <label htmlFor="feature-expected">What should happen? When should it say no?</label><textarea id="feature-expected" value={expected} onChange={event => setExpected(event.target.value)} maxLength={6000} />
          <p className="vd-muted">Saving keeps earlier ideas and creates a new, unconfirmed revision. Up to 6,000 characters per description.</p>
        </form> : <Control onClick={() => { setTitle(''); setRequest(''); setExpected(''); setEditing(true); }}>Add another idea</Control>}
        <Control disabled={state.busy} onClick={() => send({type:'projectImportIntent'})}>Import a rule from my PRD</Control>
        <details className="vd-details"><summary>Saved ideas · {state.intents.length}</summary>{state.intents.map(item => <Control key={item.id} onClick={() => { send({type:'projectSelectIntent',id:item.id}); setEditing(false); setReplaces(undefined); }}>{item.title} · {item.confirmedAt ? 'confirmed' : 'unconfirmed'} · {new Date(item.createdAt).toLocaleTimeString()}</Control>)}</details>
      </>}
      {view === 1 && <>
        <p>These files changed since your saved snapshot. One file can support several ideas.</p><Control disabled={state.busy} onClick={() => send({type:'projectReady'})}>Read saved changes</Control>
        {state.changes.length ? <ul className="vd-project-files">{state.changes.map(change => <li key={change.path}><code>{change.path}</code><p className="vd-muted">{change.kind} · changed span +{change.added} / −{change.removed} lines</p><Control disabled={blocked} reason={reason} onClick={() => send({type:'projectOpenDiff',path:change.path,snapshot:state.snapshot!})}>Open this change</Control></li>)}</ul> : <p>No saved changes since this snapshot.</p>}
        <Control disabled={state.busy} onClick={() => send({type:'projectSelectFiles'})}>Choose relevant files</Control><Chip icon="source">{state.selectedFiles.length} files selected</Chip><p className="vd-muted">Choosing files approves the context, not the behavior.</p>
        <details className="vd-details"><summary>Open selected source</summary>{state.selectedFiles.map(path => <Control key={path} onClick={() => send({type:'projectOpenSource',path,snapshot:state.snapshot!})}><code>{path}</code></Control>)}</details>
        <Control disabled={blocked || !state.selectedFiles.length} reason={!state.selectedFiles.length ? 'Choose saved files first.' : reason} onClick={() => send({type:'projectPreview',operation:'group'})}>Review before grouping files</Control>
        {state.groups?.map((group,index) => <section className="vd-explanation" key={index}><h3>{group.title}</h3><p>{group.rationale}</p><p className="vd-muted">{group.intentId ? 'Suggested link to a confirmed idea.' : 'Intention unknown. Add or select your idea first.'}</p><ul>{group.paths.map(path => <li key={path}><code>{path}</code></li>)}</ul><Control disabled={state.groupSnapshot !== state.snapshot} reason="Group again after code changes." onClick={() => { send({type:'projectUseGroup',index}); if (!group.intentId) { setTitle(group.title); setRequest(''); setExpected(''); setReplaces(undefined); setEditing(true); setView(0); } }}>Use these proposed files</Control></section>)}
      </>}
      {view === 2 && <>
        <p>Understand your selected code, or plan one small change. Review the context before sharing it.</p>
        <Control disabled={blocked || !intent?.confirmedAt} reason={!intent?.confirmedAt ? 'Confirm your idea first.' : reason} onClick={() => send({type:'projectPreview',operation:'plan'})}>Review a build plan and prompt</Control>
        {currentGuide && <Control disabled={blocked} reason={reason} onClick={() => send({type:'projectPreview',operation:'explain'})}>Review a fresh explanation</Control>}
        {state.guide && <section className="vd-explanation"><h3>{state.guide.operation === 'plan' ? 'Proposed build plan' : 'Your code explained'}</h3>{!currentGuide && <p className="vd-stale-text">Earlier code or idea. Refresh the context before using this guidance.</p>}<p>{state.guide.result.summary}</p><h3>What it is for</h3><p>{state.guide.result.purpose}</p><h3>How it works</h3><p>{state.guide.result.logic}</p><h3>What it means</h3><p>{state.guide.result.consequence}</p>
          <details className="vd-details"><summary>Follow the code</summary>{state.guide.result.steps.map((step,index) => <section key={index}><h3>{step.title}</h3><p>{step.text}</p><Control disabled={!currentGuide} reason="Refresh this guidance first." onClick={() => send({type:'projectOpenSource',path:step.path,line:step.line,snapshot:state.snapshot!})}>{step.path}:{step.line}</Control></section>)}</details>
          {Boolean(state.guide.result.questions.length) && <><h3>Things to investigate</h3><ul>{state.guide.result.questions.map((question,index) => <li key={index}>{question}</li>)}</ul></>}
          {state.guide.result.plan.length > 0 && <ol>{state.guide.result.plan.map((item,index) => <li key={index}>{item}</li>)}</ol>}
          {state.guide.result.prompt && <details className="vd-details"><summary>My proposed coding prompt</summary><p>Read it before use. Copying does not send or run it.</p><pre>{state.guide.result.prompt}</pre><Control disabled={!currentGuide} reason="Refresh this guidance first." onClick={() => send({type:'projectCopyPrompt'})}>Copy this prompt</Control></details>}
          <p className="vd-muted">Guidance is not an executed check or a guarantee.</p>
        </section>}
      </>}
      {view === 3 && <>
        <p>Choose an existing project check. The editor asks for confirmation before it runs.</p><p className="vd-muted">A successful script does not establish that every rule is satisfied.</p><Control disabled={state.busy} onClick={() => send({type:'projectSelectCheck'})}>Choose a different check</Control>
        {state.busy && <Control onClick={() => send({type:'projectCancel'})}>Cancel operation</Control>}
        {state.checkResult && <section className={`vd-executed ${!currentCheck ? 'vd-stale' : state.checkResult.kind === 'completed' && state.checkResult.exitCode === 0 ? 'vd-pass' : 'vd-fail'}`}><h3><Icon name={state.checkResult.exitCode === 0 ? 'check' : 'fail'} />{!currentCheck ? 'Earlier check result' : state.checkResult.kind === 'completed' ? `Selected check exited ${state.checkResult.exitCode ?? 'without a status'}` : `Check ${state.checkResult.kind}`}</h3><p>No rule-coverage verdict is inferred.</p>{state.checkResult.output && <details className="vd-details"><summary>Actual check output · not saved</summary><pre>{state.checkResult.output}</pre></details>}</section>}
      </>}
      </>}
    </Task></section>
    {settingsOpen && <StartSheet title="More options" onClose={() => setSettingsOpen(false)} action={<Control className="vd-primary" onClick={() => setSettingsOpen(false)}>Back to my project</Control>}>
      <Control onClick={setupKey}>Connect OpenAI securely</Control><p>Snapshots, ideas and guidance stay in this workspace’s extension storage. Keys stay in SecretStorage. Nothing is sent automatically.</p>
      <Control disabled={state.busy} onClick={() => send({type:'projectConnectCapture'})}>{state.captureConnected ? 'Disable' : 'Enable'} agent capture bridge</Control><p className="vd-muted">Supported integrations call vadhyar.captureIntent or write .vadhyar/intent-events.json. Enabling the bridge does not connect every coding product.</p>
      <details className="vd-details"><summary>More detail · {state.omitted.length} excluded files</summary><p>Excluded files make coverage incomplete.</p><ul>{state.omitted.map(path => <li key={path}><code>{path}</code></li>)}</ul>{state.guide && <p>API response: {state.guide.responseId}; model {state.guide.model}; {state.guide.latencyMs}ms; tokens {state.guide.totalTokens ?? 'unavailable'}.</p>}</details><SnakeGame />
    </StartSheet>}
  </main>;
}
