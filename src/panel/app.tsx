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
import { Task, AnswerCard, ProgressSegments, RequirementFrame, FeedbackSheet } from './v2/components.js';
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
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  const [paused, setPaused] = useState(false);
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
  useEffect(() => setFeedbackDismissed(false), [state.counterexample?.id]);
  useEffect(() => { taskHeading.current?.querySelector<HTMLElement>('h2')?.focus(); }, [active, state.hints?.length]);
  if (state.project) return <ProjectPanel state={state.project} send={action => host.postMessage(action)} setupKey={() => send({ type: 'setupKey' })} />;
  return <main className="vd-panel vd-learning">
    <header className="vd-header"><div className="vd-logo-plate"><img src={logo} alt="Vadhyar — understand what you build" /></div><Control id="vd-settings-toggle" className="vd-icon-button" aria-label="Open settings" aria-expanded={settingsOpen} aria-controls="vd-settings" onClick={() => { if (settings.current) { settings.current.open = !settings.current.open; if (settings.current.open) settings.current.querySelector('button')?.focus(); } }}><Icon name="settings" /></Control></header>
    <details id="vd-settings" className="vd-details vd-settings" ref={settings} onToggle={event => { setSettingsOpen(event.currentTarget.open); if (!event.currentTarget.open && event.currentTarget.contains(document.activeElement)) document.getElementById('vd-settings-toggle')?.focus(); }} onKeyDown={event => { if (event.key === 'Escape' && settings.current) { settings.current.open = false; document.getElementById('vd-settings-toggle')?.focus(); } }}><summary>More options</summary><p>API credentials stay in VS Code SecretStorage. Enter them only through the native secure prompt.</p><Control disabled={state.busy} onClick={() => send({ type: 'setupKey' })}>{state.hasKey ? 'Replace OpenAI key securely' : 'Connect OpenAI'}</Control><Control disabled={state.busy} onClick={() => send({ type: 'ready' })}>Read saved code</Control><Control disabled={state.busy || !state.confirmed || state.contextStale} onClick={() => send({ type: 'refreshGraph' })}>Update code connections</Control><p>NovaDesk’s original teaching seed deliberately omits ownership. Simulated actors are not authentication.</p><Control disabled={state.busy} onClick={() => send({ type: 'showMemoryLocation' })}>Show memory location</Control>{state.memoryLocation && <p>Local session folder: <code>{state.memoryLocation}</code></p>}<Control disabled={state.busy || saving} reason="Available after the current operation finishes." onClick={() => send({ type: 'clearNovaDeskSession' })}>Clear prepared exercise</Control><p>Native confirmation is required. Project Guide records, workspace files and API credentials are preserved. Session clearing does not sign you out.</p>    <details className="vd-details"><summary>Show proof · history and handover</summary><p>Only saved events appear here. Earlier authorship and external assistance are unknown. No mastery or learning-gain claim.</p>{state.evidence?.length ? <ol aria-label="Recorded learning evidence">{state.evidence.map(item => <li key={item.id}><strong>{item.title}</strong><p><time dateTime={item.at}>{new Date(item.at).toLocaleString()}</time> · {item.current ? 'Matches current inputs' : 'Historical or unverified for current inputs'}</p><p>{item.detail}</p><details><summary>Recorded identities</summary><p>Requirement: <code>{item.requirementRevision}</code></p>{item.sourceHash && <p>Source: <code>{item.sourceHash}</code></p>}<p>Record: <code>{item.id}</code></p></details></li>)}</ol> : <p>No saved evidence yet. Confirm the requirement and capture source to begin.</p>}<Control disabled={state.busy || state.contextStale || !state.evidence?.length} reason="Available after refreshing saved context with recorded evidence." onClick={() => send({ type: 'exportHandover' })}>Export Markdown handover</Control></details>
    <details className="vd-details"><summary>More detail</summary><p>{state.contextStale ? 'Last refreshed source' : 'Current source'}: <code>{state.sourceHash ?? 'unavailable'}</code></p><p>Requirement revision: <code>{state.requirement?.revision ?? 'unavailable'}</code></p>{state.explanation && <p>Explanation: model {state.explanation.model}; {state.explanation.latencyMs} ms; {state.explanation.usage?.totalTokens ?? 'unavailable'} tokens; response <code>{state.explanation.responseId}</code>.</p>}{state.hints?.map(item => <p key={item.id}>Hint {item.result.hint.level}: {item.recordedAt}; {item.result.model}; {item.result.latencyMs} ms; response <code>{item.result.responseId}</code>.</p>)}{state.counterexample && <p>Counterexample source: <code>{state.counterexample.sourceHash}</code>; {state.counterexample.latencyMs} ms; Vitest {state.counterexample.vitestVersion}.</p>}{state.ownershipRun && <p>Full check source: <code>{state.ownershipRun.sourceHash}</code>; baseline: <code>{state.ownershipRun.baselineHash}</code>; {state.ownershipRun.latencyMs} ms.</p>}</details>
<SnakeGame /></details>
    <p className="vd-status" role="status" aria-live="polite">{status}</p>
    <ProgressSegments current={activeIndex} done={completedSteps(state).map(id => steps.findIndex(item => item.id === id))} available={available.map(id => steps.findIndex(item => item.id === id))} busy={state.busy || saving} onChoose={index => navigate(steps[index].id)} onClose={() => setPaused(true)} />
    {state.error && <div className="vd-banner vd-fail" role="alert"><p>{state.error}</p><p>Your typed answer is kept here.</p><Control disabled={state.busy} onClick={() => send({ type: 'ready' })}>Refresh saved context</Control></div>}
    {state.notice && <p role="status" className="vd-muted">{state.notice}</p>}
    <section className="vd-task vd-stage" key={paused ? 'paused' : active} ref={taskHeading} tabIndex={-1} aria-label={`Current task: ${steps[activeIndex].name}`} aria-busy={state.busy || saving}>
      {paused ? <Task title="Ready when you are" pose="resting" action={<Control className="vd-primary" onClick={() => setPaused(false)}>Continue</Control>}><p>Saved steps stay in this workspace. Your unsaved answer is kept while this panel stays open.</p></Task> : <>
      {active === 'confirm' && <Task title="Is this your rule?" pose="welcome" action={<Control className="vd-primary" disabled={state.busy} onClick={() => state.requirement && !state.confirmed ? send({ type: 'confirmRequirement', revision: state.requirement.revision }) : state.confirmed ? navigate('understand') : send({ type: 'ready' })}>{state.busy ? 'Reading your rule…' : state.confirmed ? 'Show me the code' : state.requirement ? 'Confirm my rule' : 'Read my rule'}</Control>}>
        <RequirementFrame rule={state.requirement ? requirementProse(state.requirement.text) : 'Read one rule to begin.'} />
        {state.requirement && state.requirement.checksAvailable !== false && <p className="vd-muted">Prepared NovaDesk exercise · the original sample has an intentional ownership bug. Actors are simulated.</p>}
        <p>{state.confirmed ? 'You confirmed this rule.' : 'Read it before confirming. This is the behavior we will check.'}</p>
        <details className="vd-details"><summary>Show the full rule and examples</summary>{state.requirement && <pre>{state.requirement.text}</pre>}<RequirementImport state={state} send={send} /></details>
        <details className="vd-details"><summary>Save a code snapshot</summary><Control disabled={state.busy || !state.confirmed} onClick={() => send({ type: 'checkpoint' })}>Save this code</Control>{state.checkpointCount !== undefined && <p>{state.checkpointCount} snapshots saved.</p>}<p>Tracking starts when you save. Earlier history and authorship are unknown.</p></details>
      </Task>}
      {active === 'understand' && <Understand state={state} send={send} next={() => navigate('predict')} />}
      {active === 'predict' && <Task title={state.prediction ? 'Your guess is saved' : 'Will it allow this?'} action={!state.prediction ? <Control className="vd-primary" type="submit" form="prediction-form" disabled={state.busy || saving || state.contextStale || state.checksSupported !== true || !predicted || !reasoning.trim()} reason={saving ? 'Saving your guess before the check.' : state.contextStale ? 'Save and refresh the code first.' : state.checksSupported !== true ? 'Restore trusted checks and refresh first.' : 'Pick an answer and tell us why first.'}>{saving ? 'Saving your guess…' : 'Save my guess and check'}</Control> : <Control className="vd-primary" disabled={state.busy || saving || state.contextStale || state.checksSupported !== true || (state.counterexample?.kind !== 'completed' && state.prediction.sourceHash !== state.sourceHash && !state.baselineHash)} onClick={() => state.counterexample?.kind === 'completed' ? navigate('observe') : send({ type: 'runCounterexample', predictionId: state.prediction!.id })}>{state.counterexampleRunning ? 'Checking saved code…' : state.counterexample?.kind === 'completed' ? 'See what happened' : 'Run the saved check'}</Control>}>
        <p>{state.exercise === 'transfer' ? 'The owner asks to approve an archived milestone.' : 'Another client asks to approve.'}</p>
        {!state.prediction ? <form id="prediction-form" onSubmit={event => {
          event.preventDefault();
          if (state.busy || saving || !state.sourceHash || !state.requirement || !predicted || !reasoning.trim()) return;
          pendingPrediction.current = { source: state.sourceHash, requirement: state.requirement.revision }; setSaving(true);
          send({ type: 'savePrediction', predictedApproval: predicted === 'allow', reasoning, sourceHash: state.sourceHash, requirementRevision: state.requirement.revision });
        }}><fieldset><legend className="vd-sr-only">Will the code allow it?</legend>{['allow', 'deny'].map((value,index) => <AnswerCard key={value} number={index+1} name="prediction" value={value} selected={predicted === value} label={value === 'allow' ? 'Yes, allow it' : 'No, stop it'} choose={() => setPredicted(value)} />)}<label htmlFor="prediction-reasoning">Why do you think so?</label><textarea id="prediction-reasoning" required maxLength={1000} rows={2} value={reasoning} onChange={event => setReasoning(event.target.value)} /><p className="vd-muted">{reasoning.length} of 1,000 characters</p></fieldset></form> : <><section className="vd-prediction"><p className="vd-label">Saved guess · locked</p><h3>{state.prediction.predictedApproval ? 'Yes, allow it' : 'No, stop it'}</h3><blockquote>{state.prediction.reasoning}</blockquote></section>{state.counterexample?.kind !== 'completed' && <Observation state={state} />}</>}
      </Task>}
      {active === 'observe' && <Task title="What happened?" pose="curious" action={state.counterexample?.kind === 'completed' && !feedbackDismissed ? <FeedbackSheet tone={state.counterexampleCurrent ? state.counterexample.requirementPassed ? 'ok' : 'bad' : 'hint'} title={state.counterexample.observedApproval ? 'The code allowed it.' : 'The code stopped it.'} text={state.counterexampleCurrent ? state.counterexample.requirementPassed ? 'This case follows your rule.' : 'This case breaks your rule.' : 'This is an earlier result. Check the current code before trusting it.'} onClose={() => setFeedbackDismissed(true)}><Control className="vd-primary" disabled={state.busy || !available.includes('change')} reason="This case matches the rule. No prepared debug task is available." onClick={() => navigate('change')}>{available.includes('change') ? 'Find out why' : 'This case matches the rule'}</Control></FeedbackSheet> : <Control className="vd-primary" disabled={state.busy || !available.includes('change')} reason="This case matches the rule. No prepared debug task is available." onClick={() => navigate('change')}>{available.includes('change') ? 'Find out why' : 'This case matches the rule'}</Control>}><Observation state={state} />{feedbackDismissed && <Control onClick={() => setFeedbackDismissed(false)}>Show the result card</Control>}</Task>}
      {active === 'change' && <Change state={state} send={send} />}
      {active === 'verify' && <Verification state={state} send={send} />}
      </>}
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
