import { PathHome, LessonStart, Completion, EvidenceReview } from './home.js';
import { ProjectPanel } from './project.js';
import type { ProjectAction } from '../project/shared.js';
import { RequirementImport } from './reuse-controls.js';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PanelAction, PanelState } from '../shared.js';
import { SnakeGame } from './snake-game.js';
import { steps, availableSteps, completedSteps, currentRun, requirementProse, requirementCases, suggestedStep, type Step } from './workflow.js';
import { Understand } from './understand.js';
import { Change } from './change.js';
import { Observation, Verification } from './results.js';
import { Task, AnswerCard, ProgressSegments, RequirementFrame, FeedbackSheet, StartSheet } from './v2/components.js';
import { Control, Icon } from './ui.js';
import { playTone } from './v2/sound.js';
import { recordedSummary } from './v2/evidence.js';
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
  const [route, setRoute] = useState<'home' | 'lesson' | 'complete' | 'evidence' | 'break'>('home');
  const [startOpen, setStartOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const [bloom, setBloom] = useState(false);
  const celebrated = useRef(new Set<string>());
  const lastSounds = useRef({counter:'',verified:''});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const taskHeading = useRef<HTMLDivElement>(null);
  const pendingPrediction = useRef<{ source: string; requirement: string } | undefined>(undefined);
  const available = availableSteps(state);
  const active = available.includes(step) ? step : 'confirm';
  const activeIndex = steps.findIndex(item => item.id === active);
  const checking = state.ownershipRunning || state.counterexampleRunning;
  const status = checking ? 'Executing saved-source checks…' : state.busy && state.hintPreview ? 'Preparing your next hint…' : state.busy && state.preview ? 'Preparing your explanation…' : state.busy ? 'Finding current project context…' : state.contextStale || !state.sourceHash ? 'Context needs a refresh · saved evidence is historical' : state.checksSupported === false && state.requirement?.checksAvailable !== false ? 'Trusted checks unavailable · earlier results are historical' : currentRun(state) && state.ownershipRun?.kind === 'completed' && state.ownershipRun.requirementPassed ? 'Checks passed for current code' : 'Current source ready';
  function finish() { const id = state.ownershipRun?.id; setBloom(Boolean(id && !celebrated.current.has(id))); if (id) celebrated.current.add(id); setRoute('complete'); }
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
  useEffect(() => { taskHeading.current?.querySelector<HTMLElement>('h2')?.focus(); }, [active, route, state.hints?.length]);

  useEffect(() => {
    const counter = state.counterexample?.id ?? '';
    const verified = state.ownershipRun?.id ?? '';
    if (counter !== lastSounds.current.counter && state.counterexampleCurrent && state.counterexample?.kind === 'completed') playTone(sound, 'reveal');
    if (verified !== lastSounds.current.verified && recordedSummary(state).passed) playTone(sound, 'verified');
    lastSounds.current = {counter,verified};
  }, [state, sound]);
  if (state.project) return <ProjectPanel state={state.project} send={action => host.postMessage(action)} setupKey={() => send({ type: 'setupKey' })} />;
  return <main className="vd-panel vd-learning" onClickCapture={event => { const button = event.target instanceof Element ? event.target.closest('button') : null; if (button && button.id !== 'vd-sound-toggle' && button.getAttribute('aria-disabled') !== 'true') playTone(sound,'tap'); }}>
    <header className="vd-header"><div className="vd-logo-plate"><img src={logo} alt="Vadhyar — understand what you build" /></div><Control id="vd-settings-toggle" className="vd-icon-button" aria-label="Open settings" aria-haspopup="dialog" aria-expanded={settingsOpen} aria-controls="vd-settings" onClick={() => setSettingsOpen(true)}><Icon name="settings" /></Control></header>
    {settingsOpen && <StartSheet id="vd-settings" title="More options" onClose={() => setSettingsOpen(false)} action={<Control className="vd-primary" onClick={() => setSettingsOpen(false)}>Back</Control>}><Control id="vd-sound-toggle" role="switch" aria-checked={sound} onClick={() => setSound(!sound)}>Sound: {sound ? 'on' : 'off'}</Control><p className="vd-muted">Optional, local tones. Off again when this panel is reopened.</p><details className="vd-details"><summary>Demo preparation</summary><p>Demo reset and recorded-response fallback are planned. They are not enabled here.</p><p>Use a marked disposable workspace for rehearsal. API errors remain errors; this panel never substitutes a recorded answer.</p></details><p>API credentials stay in VS Code SecretStorage. Enter them only through the native secure prompt.</p><Control disabled={state.busy} onClick={() => send({ type: 'setupKey' })}>{state.hasKey ? 'Replace OpenAI key securely' : 'Connect OpenAI'}</Control><Control disabled={state.busy} onClick={() => send({ type: 'ready' })}>Read saved code</Control><Control disabled={state.busy || !state.confirmed || state.contextStale} onClick={() => send({ type: 'refreshGraph' })}>Update code connections</Control><p>NovaDesk’s original teaching seed deliberately omits ownership. Simulated actors are not authentication.</p><Control disabled={state.busy} onClick={() => send({ type: 'showMemoryLocation' })}>Show memory location</Control>{state.memoryLocation && <p>Local session folder: <code>{state.memoryLocation}</code></p>}<Control disabled={state.busy || saving} reason="Available after the current operation finishes." onClick={() => send({ type: 'clearNovaDeskSession' })}>Clear prepared exercise</Control><p>Native confirmation is required. Project Guide records, workspace files and API credentials are preserved. Session clearing does not sign you out.</p>    <Control onClick={() => { setSettingsOpen(false); setRoute('evidence'); }}>Show my proof</Control>
    <details className="vd-details"><summary>More detail</summary><p>{state.contextStale ? 'Last refreshed source' : 'Current source'}: <code>{state.sourceHash ?? 'unavailable'}</code></p><p>Requirement revision: <code>{state.requirement?.revision ?? 'unavailable'}</code></p>{state.explanation && <p>Explanation: model {state.explanation.model}; {state.explanation.latencyMs} ms; {state.explanation.usage?.totalTokens ?? 'unavailable'} tokens; response <code>{state.explanation.responseId}</code>.</p>}{state.hints?.map(item => <p key={item.id}>Hint {item.result.hint.level}: {item.recordedAt}; {item.result.model}; {item.result.latencyMs} ms; response <code>{item.result.responseId}</code>.</p>)}{state.counterexample && <p>Counterexample source: <code>{state.counterexample.sourceHash}</code>; {state.counterexample.latencyMs} ms; Vitest {state.counterexample.vitestVersion}.</p>}{state.ownershipRun && <p>Full check source: <code>{state.ownershipRun.sourceHash}</code>; baseline: <code>{state.ownershipRun.baselineHash}</code>; {state.ownershipRun.latencyMs} ms.</p>}</details>
<SnakeGame /></StartSheet>}
    <p className="vd-status" role="status" aria-live="polite">{status}</p>
    {route === 'lesson' && <ProgressSegments current={activeIndex} done={completedSteps(state).map(id => steps.findIndex(item => item.id === id))} available={available.map(id => steps.findIndex(item => item.id === id))} busy={state.busy || saving} onChoose={index => navigate(steps[index].id)} onClose={() => setRoute('home')} />}
    {state.error && <div className="vd-banner vd-fail" role="alert"><p>{state.error}</p><p>Your typed answer is kept here.</p><Control disabled={state.busy} onClick={() => send({ type: 'ready' })}>Refresh saved context</Control></div>}
    {state.notice && <p role="status" className="vd-muted vd-notice">{state.notice}</p>}
    <section className={`vd-task vd-stage vd-screen-${route}`} key={route === 'lesson' ? active : route} ref={taskHeading} tabIndex={-1} aria-label={route === 'lesson' ? `Current task: ${steps[activeIndex].name}` : {home:'Your path',complete:'Completion',evidence:'Your proof',break:'Take a break'}[route]} aria-busy={state.busy || saving}>
      {route === 'home' && <PathHome state={state} start={() => setStartOpen(true)} proof={() => setRoute('evidence')} takeBreak={() => setRoute('break')} challenge={() => { send({type:'startTransfer'}); setRoute('lesson'); }} />}
      {route === 'complete' && <Completion state={state} bloom={bloom} challenge={() => { send({type:'startTransfer'}); setRoute('lesson'); }} home={() => setRoute('home')} proof={() => setRoute('evidence')} />}
      {route === 'evidence' && <EvidenceReview state={state} send={send} back={() => setRoute('home')} />}
      {route === 'break' && <Task title="Take a break" pose="resting" action={<Control className="vd-primary" onClick={() => setRoute('home')}>Back to my path</Control>}><p>Your saved lesson stays in this workspace.</p><SnakeGame defaultOpen /></Task>}
      {route === 'lesson' && <>
      {active === 'confirm' && <Task title="Is this your rule?" pose="welcome" action={<Control className="vd-primary" disabled={state.busy} onClick={() => state.requirement && !state.confirmed ? send({ type: 'confirmRequirement', revision: state.requirement.revision }) : state.confirmed ? navigate('understand') : send({ type: 'ready' })}>{state.busy ? 'Reading your rule…' : state.confirmed ? 'Show me the code' : state.requirement ? 'Confirm my rule' : 'Read my rule'}</Control>}>
        <RequirementFrame rule={state.requirement ? requirementProse(state.requirement.text) : 'Read one rule to begin.'} />
        {state.requirement && state.requirement.checksAvailable !== false && <p className="vd-muted">Prepared NovaDesk exercise · the original sample has an intentional ownership bug. Actors are simulated.</p>}
        {requirementCases(state.requirement).length > 0 && <details className="vd-details" open><summary>What should happen</summary><ul className="vd-cases">{requirementCases(state.requirement).map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.text}</span></li>)}</ul><p className="vd-muted">These are expected examples, not executed results.</p></details>}
        <p>{state.confirmed ? 'You confirmed this rule.' : 'Read it before confirming. This is the behavior we will check.'}</p>
        <details className="vd-details"><summary>Show the full rule and examples</summary>{state.requirement && <pre>{state.requirement.text}</pre>}<RequirementImport state={state} send={send} /></details>
        <details className="vd-details"><summary>Save a code snapshot</summary><Control disabled={state.busy || !state.confirmed} onClick={() => send({ type: 'checkpoint' })}>Save this code</Control>{state.checkpointCount !== undefined && <p>{state.checkpointCount} snapshots saved.</p>}<p>Tracking starts when you save. Earlier history and authorship are unknown.</p></details>
      </Task>}
      {active === 'understand' && <Understand state={state} send={send} next={() => navigate('predict')} />}
      {active === 'predict' && <Task title={state.prediction ? 'Your guess is saved' : 'Will it allow this?'} action={!state.prediction ? <Control className="vd-primary" type="submit" form="prediction-form" disabled={state.busy || saving || state.contextStale || state.checksSupported !== true || !predicted || !reasoning.trim()} reason={saving ? 'Saving your guess before the check.' : state.contextStale ? 'Save and refresh the code first.' : state.checksSupported !== true ? 'Restore trusted checks and refresh first.' : 'Pick an answer and tell us why first.'}>{saving ? 'Saving your guess…' : 'Save my guess and check'}</Control> : <Control className="vd-primary" disabled={state.busy || saving || state.contextStale || state.checksSupported !== true || (state.counterexample?.kind !== 'completed' && state.prediction.sourceHash !== state.sourceHash && !state.baselineHash)} onClick={() => state.counterexample?.kind === 'completed' ? navigate('observe') : send({ type: 'runCounterexample', predictionId: state.prediction!.id })}>{state.counterexampleRunning ? 'Checking saved code…' : state.counterexample?.kind === 'completed' ? 'See what happened' : 'Run the saved check'}</Control>}>
        <p>{state.exercise === 'transfer' ? 'The owner asks to approve an archived milestone.' : 'Another client asks to approve.'}</p>
        {!state.prediction ? <form id="prediction-form" onSubmit={event => {
          event.preventDefault();
          if (state.busy || saving || state.contextStale || state.checksSupported !== true || !state.sourceHash || !state.requirement || !predicted || !reasoning.trim()) return;
          pendingPrediction.current = { source: state.sourceHash, requirement: state.requirement.revision }; setSaving(true);
          send({ type: 'savePrediction', predictedApproval: predicted === 'allow', reasoning, sourceHash: state.sourceHash, requirementRevision: state.requirement.revision });
        }}><fieldset><legend className="vd-sr-only">Will the code allow it?</legend>{['allow', 'deny'].map((value,index) => <AnswerCard key={value} number={index+1} name="prediction" value={value} selected={predicted === value} label={value === 'allow' ? 'Yes, allow it' : 'No, stop it'} choose={() => setPredicted(value)} />)}<label htmlFor="prediction-reasoning">Why do you think so?</label><textarea id="prediction-reasoning" required maxLength={1000} rows={2} value={reasoning} onChange={event => setReasoning(event.target.value)} /><p className="vd-muted">{reasoning.length} of 1,000 characters</p></fieldset></form> : <><section className="vd-prediction"><p className="vd-label">Saved guess · locked</p><h3>{state.prediction.predictedApproval ? 'Yes, allow it' : 'No, stop it'}</h3><blockquote>{state.prediction.reasoning}</blockquote></section>{state.counterexample?.kind !== 'completed' && <Observation state={state} />}</>}
      </Task>}
      {active === 'observe' && <Task title="What happened?" pose="curious" action={state.counterexample?.kind === 'completed' && !feedbackDismissed ? <FeedbackSheet tone={state.counterexampleCurrent ? state.counterexample.requirementPassed ? 'ok' : 'bad' : 'hint'} title={state.counterexample.observedApproval ? 'The code allowed it.' : 'The code stopped it.'} text={state.counterexampleCurrent ? state.counterexample.requirementPassed ? 'This case follows your rule.' : 'This case breaks your rule.' : 'This is an earlier result. Check the current code before trusting it.'} onClose={() => setFeedbackDismissed(true)}><Control className="vd-primary" disabled={state.busy || !available.includes('change')} reason="This case matches the rule. No prepared debug task is available." onClick={() => navigate('change')}>{available.includes('change') ? 'Find out why' : 'This case matches the rule'}</Control></FeedbackSheet> : <Control className="vd-primary" disabled={state.busy || !available.includes('change')} reason="This case matches the rule. No prepared debug task is available." onClick={() => navigate('change')}>{available.includes('change') ? 'Find out why' : 'This case matches the rule'}</Control>}><Observation state={state} />{feedbackDismissed && <Control onClick={() => setFeedbackDismissed(false)}>Show the result card</Control>}</Task>}
      {active === 'change' && <Change state={state} send={send} />}
      {active === 'verify' && <Verification state={state} send={send} complete={finish} />}
      </>}
    </section>
    {startOpen && <LessonStart state={state} close={() => setStartOpen(false)} begin={() => { setStartOpen(false); setRoute('lesson'); }} />}
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
