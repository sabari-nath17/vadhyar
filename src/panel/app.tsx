import { ProjectPanel } from './project.js';
import type { ProjectAction } from '../project/shared.js';
import { RequirementImport } from './reuse-controls.js';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PanelAction, PanelState } from '../shared.js';
import { SnakeGame } from './snake-game.js';
import { steps, availableSteps, completedSteps, currentRun, requirementProse, suggestedStep, type Step } from './workflow.js';
import { Understand } from './understand.js';
import { Change } from './change.js';
import { Observation, Verification } from './results.js';
import { Control, Icon } from './ui.js';
import logo from '../../media/vadhyar-logo.png';

declare function acquireVsCodeApi(): { postMessage(message: PanelAction | ProjectAction): void };
const host = acquireVsCodeApi();
const send = (action: PanelAction) => host.postMessage(action);

function App() {
  const [state, setState] = useState<PanelState>({ refs: [], busy: true });
  const [step, setStep] = useState<Step>('confirm');
  const [predicted, setPredicted] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settings = useRef<HTMLDetailsElement>(null);
  const taskHeading = useRef<HTMLDivElement>(null);
  const pendingPrediction = useRef<{ source: string; requirement: string } | undefined>(undefined);
  const available = availableSteps(state);
  const active = available.includes(step) ? step : 'confirm';
  const activeIndex = steps.findIndex(item => item.id === active);
  const checking = state.ownershipRunning || state.counterexampleRunning;
  const status = checking ? 'Executing saved-source checks…' : state.busy && state.hintPreview ? 'Preparing your next hint…' : state.busy && state.preview ? 'Preparing your explanation…' : state.busy ? 'Finding current project context…' : state.contextStale || !state.sourceHash ? 'Context needs a refresh · saved evidence is historical' : state.checksSupported === false && state.requirement?.checksAvailable !== false ? 'Trusted checks unavailable · earlier results are historical' : currentRun(state) && state.ownershipRun?.kind === 'completed' && state.ownershipRun.requirementPassed ? 'Checks passed for current code' : 'Current source ready';
  function navigate(next: Step) { if (state.confirmed) send({ type: 'setStage', stage: next }); else setStep(next); }
  useEffect(() => {
    const receive = (event: MessageEvent<PanelState>) => setState(event.data);
    window.addEventListener('message', receive);
    send({ type: 'ready' });
    return () => window.removeEventListener('message', receive);
  }, []);
  useEffect(() => {
    const pending = pendingPrediction.current;
    if (!pending) return;
    if (state.error || (state.sourceHash && state.sourceHash !== pending.source) || state.requirement?.revision !== pending.requirement) { pendingPrediction.current = undefined; setSaving(false); return; }
    if (state.prediction && state.prediction.sourceHash === pending.source && state.prediction.requirementRevision === pending.requirement) {
      pendingPrediction.current = undefined; setSaving(false);
      send({ type: 'runCounterexample', predictionId: state.prediction.id });
    }
  }, [state.prediction, state.error, state.sourceHash, state.requirement?.revision]);
  useEffect(() => {
    if (!state.sessionCleared) return;
    pendingPrediction.current = undefined; setPredicted(''); setReasoning(''); setSaving(false);
  }, [state.sessionCleared]);
  useEffect(() => { pendingPrediction.current = undefined; setPredicted(''); setReasoning(''); setSaving(false); }, [state.exercise]);
  useEffect(() => { setStep(suggestedStep(state)); }, [state.stage, state.confirmed, state.counterexample?.id, state.ownershipRun?.id]);
  useEffect(() => { taskHeading.current?.focus(); }, [active, state.hints?.length]);
  if (state.project) return <ProjectPanel state={state.project} send={action => host.postMessage(action)} setupKey={() => send({ type: 'setupKey' })} />;
  return <main className="vd-panel vd-learning">
    <header className="vd-header"><div className="vd-logo-plate"><img src={logo} alt="Vadhyar — understand what you build" /></div><Control id="vd-settings-toggle" className="vd-icon-button" aria-label="Open settings" aria-expanded={settingsOpen} aria-controls="vd-settings" onClick={() => { if (settings.current) { settings.current.open = !settings.current.open; if (settings.current.open) settings.current.querySelector('button')?.focus(); } }}><Icon name="settings" /></Control></header>
    <h1 className="vd-page-title">Understand what you build</h1>
    <p className="vd-status" role="status" aria-live="polite">{status}</p>
    <details id="vd-settings" className="vd-details vd-settings" ref={settings} onToggle={event => { setSettingsOpen(event.currentTarget.open); if (!event.currentTarget.open && event.currentTarget.contains(document.activeElement)) document.getElementById('vd-settings-toggle')?.focus(); }} onKeyDown={event => { if (event.key === 'Escape' && settings.current) { settings.current.open = false; document.getElementById('vd-settings-toggle')?.focus(); } }}><summary>Settings and project context</summary><p>API credentials stay in VS Code SecretStorage. Enter them only through the native secure prompt.</p><Control disabled={state.busy} onClick={() => send({ type: 'setupKey' })}>{state.hasKey ? 'Replace API key securely' : 'Connect OpenAI'}</Control><Control disabled={state.busy} onClick={() => send({ type: 'ready' })}>Refresh</Control><Control disabled={state.busy || !state.confirmed || state.contextStale} onClick={() => send({ type: 'refreshGraph' })}>Update code connections</Control><p>NovaDesk’s original teaching seed deliberately omits ownership. Simulated actors are not authentication.</p><Control disabled={state.busy} onClick={() => send({ type: 'showMemoryLocation' })}>Show memory location</Control>{state.memoryLocation && <p>Local session folder: <code>{state.memoryLocation}</code></p>}<Control disabled={state.busy || saving} reason="Available after the current operation finishes." onClick={() => send({ type: 'clearNovaDeskSession' })}>Clear NovaDesk session</Control><p>Native confirmation is required. Project Guide records, workspace files and API credentials are preserved. Session clearing does not sign you out.</p></details>
    <div className="vd-divider" aria-hidden="true"><span /><i /><i /><i /><span /></div>
    <section className="vd-requirement" aria-labelledby="requirement-title"><h2 id="requirement-title" className="vd-label">Requirement{state.requirement?.checksAvailable !== false ? ' · prepared demo' : ''}</h2><p className="vd-teaching">{state.requirement ? requirementProse(state.requirement.text) : 'Read one rule, follow its source, then make it your own.'}</p><p className="vd-muted">{state.requirement?.checksAvailable !== false && <>NovaDesk’s original teaching seed deliberately omits ownership. Simulated actors are not authentication.<br /></>}{state.confirmed ? 'Confirmed for this session' : 'Awaiting your confirmation'} · {state.checkpointCount ?? 0} checkpoints</p><details className="vd-details" open={active === 'confirm'}><summary>Acceptance cases and checkpoint</summary><RequirementImport state={state} send={send} />{state.requirement && <pre>{state.requirement.text}</pre>}<Control disabled={state.busy || !state.confirmed} onClick={() => send({ type: 'checkpoint' })}>Save a snapshot of this code</Control><p>Tracking begins at capture. Earlier authorship and history are unknown.</p></details></section>
    {state.error && <div className={`vd-banner ${state.sourceHash ? 'vd-fail' : 'vd-stale'}`} role="alert"><p>{state.error}</p><p>Your typed answer is preserved.</p><Control disabled={state.busy} onClick={() => send({ type: 'ready' })}>Refresh saved context</Control></div>}
    {state.notice && <p role="status" className="vd-muted">{state.notice}</p>}
    <nav className="vd-steps" aria-label="Learning steps"><p>Step {activeIndex + 1} of {steps.length} · <strong>{steps[activeIndex].name}</strong></p><div>{steps.map((item, index) => <div key={item.id} className="vd-step-segment"><Control className={item.id === active ? 'vd-current' : completedSteps(state).includes(item.id) ? 'vd-done' : ''} aria-label={`${item.name}${!available.includes(item.id) ? ' — not yet available' : ''}`} aria-current={item.id === active ? 'step' : undefined} disabled={!available.includes(item.id) || state.busy || saving} reason={!state.confirmed ? 'Available after confirmation.' : item.id === 'observe' ? 'After the saved case runs.' : item.id === 'change' ? 'After observing a broken rule.' : item.id === 'verify' ? 'After inspecting saved changes.' : 'Available after the current operation.'} onClick={() => navigate(item.id)}><span>{index + 1}</span><span className="vd-step-name">{item.name}</span></Control></div>)}</div></nav>
    <section className="vd-task vd-stage" key={active} ref={taskHeading} tabIndex={-1} aria-label={`Current task: ${steps[activeIndex].name}`} aria-busy={state.busy || saving}>
      {active === 'confirm' && <><h2>Confirm your requirement</h2><p>Review the rule and its acceptance cases above. This is the behavior your investigation will follow.</p><Control className="vd-primary" disabled={state.busy} onClick={() => state.requirement && !state.confirmed ? send({ type: 'confirmRequirement', revision: state.requirement.revision }) : state.confirmed ? navigate('understand') : send({ type: 'ready' })}>{state.confirmed ? 'Continue to source' : state.requirement ? 'Confirm this requirement' : 'Read the project requirement'}</Control></>}
      {active === 'understand' && <Understand state={state} send={send} next={() => navigate('predict')} />}
      {active === 'predict' && <><h2>Predict before you run</h2><p>{state.exercise === 'transfer' ? 'Using the current code, can the owning client approve an archived milestone? Predict before seeing its executed result.' : 'Using the current code, can client-other approve client-owner’s active milestone?'}</p>{!state.prediction ? <form onSubmit={event => {
        event.preventDefault();
        if (!state.sourceHash || !state.requirement || !predicted || !reasoning.trim()) return;
        pendingPrediction.current = { source: state.sourceHash, requirement: state.requirement.revision }; setSaving(true);
        send({ type: 'savePrediction', predictedApproval: predicted === 'allow', reasoning, sourceHash: state.sourceHash, requirementRevision: state.requirement.revision });
      }}><fieldset><legend>What will the code do?</legend>{['allow', 'deny'].map(value => <label className="vd-option" key={value}><input type="radio" name="prediction" value={value} required checked={predicted === value} onChange={() => setPredicted(value)} /><span>{value === 'allow' ? 'Allow approval' : 'Deny approval'}</span></label>)}<label htmlFor="prediction-reasoning">Why do you expect this?</label><textarea id="prediction-reasoning" required maxLength={1000} rows={2} value={reasoning} onChange={event => setReasoning(event.target.value)} /><p className="vd-muted">Up to 1,000 characters. Your prediction locks before the case runs.</p><Control className="vd-primary" type="submit" disabled={state.busy || saving || state.contextStale || state.checksSupported !== true || !predicted || !reasoning.trim()} reason={saving ? 'Your prediction is being saved before the case runs.' : state.contextStale ? 'Save source and refresh before predicting.' : state.checksSupported !== true ? 'Restore trusted checks and refresh before predicting.' : 'Available after choosing an outcome and writing your reason.'}>{saving ? 'Saving your prediction…' : 'Save prediction and run case'}</Control></fieldset></form> : <><section className="vd-prediction"><p className="vd-label">You predicted · locked</p><h3>{state.prediction.predictedApproval ? 'Allow approval' : 'Deny approval'}</h3><blockquote>{state.prediction.reasoning}</blockquote></section><>{state.counterexample?.kind !== 'completed' && <Observation state={state} />}</><Control className="vd-primary" disabled={state.busy || saving || state.contextStale || state.checksSupported !== true || (state.counterexample?.kind !== 'completed' && state.prediction.sourceHash !== state.sourceHash && !state.baselineHash)} onClick={() => state.counterexample?.kind === 'completed' ? navigate('observe') : send({ type: 'runCounterexample', predictionId: state.prediction!.id })}>{state.counterexampleRunning ? 'Running saved case…' : state.counterexample?.kind === 'completed' ? 'Review observed case' : 'Run saved case'}</Control></>}</>}
      {active === 'observe' && <><h2>Observe what happened</h2><Observation state={state} /><Control className="vd-primary" disabled={state.busy || !available.includes('change')} reason="This case matches the rule; no prepared debug task is available." onClick={() => navigate('change')}>{available.includes('change') ? 'Investigate this result' : 'This case matches the rule'}</Control></>}
      {active === 'change' && <Change state={state} send={send} />}
      {active === 'verify' && <Verification state={state} send={send} />}
    </section>
    <details className="vd-details"><summary>Evidence so far · timeline and handover</summary><p>Only saved events appear here. Earlier authorship and external assistance are unknown. No mastery or learning-gain claim.</p>{state.evidence?.length ? <ol aria-label="Recorded learning evidence">{state.evidence.map(item => <li key={item.id}><strong>{item.title}</strong><p><time dateTime={item.at}>{new Date(item.at).toLocaleString()}</time> · {item.current ? 'Matches current inputs' : 'Historical or unverified for current inputs'}</p><p>{item.detail}</p><details><summary>Recorded identities</summary><p>Requirement: <code>{item.requirementRevision}</code></p>{item.sourceHash && <p>Source: <code>{item.sourceHash}</code></p>}<p>Record: <code>{item.id}</code></p></details></li>)}</ol> : <p>No saved evidence yet. Confirm the requirement and capture source to begin.</p>}<Control disabled={state.busy || state.contextStale || !state.evidence?.length} reason="Available after refreshing saved context with recorded evidence." onClick={() => send({ type: 'exportHandover' })}>Export Markdown handover</Control></details>
    <details className="vd-details"><summary>Technical details</summary><p>{state.contextStale ? 'Last refreshed source' : 'Current source'}: <code>{state.sourceHash ?? 'unavailable'}</code></p><p>Requirement revision: <code>{state.requirement?.revision ?? 'unavailable'}</code></p>{state.explanation && <p>Explanation: model {state.explanation.model}; {state.explanation.latencyMs} ms; {state.explanation.usage?.totalTokens ?? 'unavailable'} tokens; response <code>{state.explanation.responseId}</code>.</p>}{state.hints?.map(item => <p key={item.id}>Hint {item.result.hint.level}: {item.recordedAt}; {item.result.model}; {item.result.latencyMs} ms; response <code>{item.result.responseId}</code>.</p>)}{state.counterexample && <p>Counterexample source: <code>{state.counterexample.sourceHash}</code>; {state.counterexample.latencyMs} ms; Vitest {state.counterexample.vitestVersion}.</p>}{state.ownershipRun && <p>Full check source: <code>{state.ownershipRun.sourceHash}</code>; baseline: <code>{state.ownershipRun.baselineHash}</code>; {state.ownershipRun.latencyMs} ms.</p>}</details>
    <SnakeGame />
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
