import { TechnicalDetails } from './lesson-shell.js';
import { useState } from 'react';
import { Reflection } from './results.js';
import type { PanelState } from '../shared.js';
import { steps, suggestedStep, requirementProse, requirementTitle } from './workflow.js';
import { Control, type Send } from './ui.js';
import { Task, PathNode, Chip, Guide, StartSheet, ProofSticker, Bloom } from './v2/components.js';
import { recordedSummary } from './v2/evidence.js';

export function PathHome({ state, start, proof, takeBreak, challenge }: { state: PanelState; start: () => void; proof: () => void; takeBreak: () => void; challenge: () => void }) {
  const summary = recordedSummary(state);
  const imported = state.requirement?.checksAvailable === false;
  return <Task title="Understand your code" action={<Control className="vd-primary" disabled={state.busy || !state.requirement} reason="Wait for your saved rule to load." onClick={start}>{imported ? state.confirmed ? 'Continue my rule' : 'Start with my rule' : state.confirmed ? 'Continue practice' : 'Start guided practice'}</Control>}>
    <div className="vd2-home-intro"><Guide pose="welcome" /><p>See how your code works. Plan or try your next change.</p></div>
    <section className="vd2-path-info"><h3>Your own project</h3><p>Keep your idea. Track changes. Explain code or plan your next coding prompt.</p><p className="vd2-caption">Open the editor command menu:</p><code>Vadhyar: Open Project Guide</code><p className="vd2-caption">Experimental · uses your existing checks.</p></section>
    <h3>{imported ? 'Your selected rule' : 'Guided practice'}</h3>
    <Chip icon="source">Saved in this workspace</Chip>
    <div className="vd2-path"><PathNode state={summary.passed ? 'done' : 'current'} label={requirementTitle(state.requirement)} description={imported ? 'Explanation only · no prepared checks for this rule.' : state.requirement ? 'Prepared exercise · intentional bug in the original sample.' : 'Your project rule will appear here.'} onSelect={start} />
      {imported ? <PathNode state="locked" label="Try a change" description="This imported rule has no approved check mapping." /> : state.exercise !== 'transfer' && <PathNode state={summary.passed ? 'current' : 'locked'} label="Try the next rule" description={summary.passed ? 'Available · a small follow-up change.' : 'Finish the current saved-code checks first.'} onSelect={challenge} />}
      <PathNode state="break" label="Take a break" description="Play Snake. Your lesson stays here." onSelect={takeBreak} />
    </div>
    <Control onClick={proof}>Show my proof</Control>
  </Task>;
}

export function LessonStart({ state, begin, close }: { state: PanelState; begin: () => void; close: () => void }) {
  const step = steps.find(item => item.id === suggestedStep(state));
  return <StartSheet title={requirementTitle(state.requirement)} pose="welcome" onClose={close} action={<><Control className="vd-primary" disabled={state.busy || !state.requirement} reason="Wait for your saved rule to load." onClick={begin}>{state.confirmed ? 'Continue' : 'Start'}</Control><Control onClick={close}>Not now</Control></>}>
    <p>Find the code. Make a guess. Try a change and check it.</p>
    {state.confirmed && <p className="vd2-caption">Saved step: {step?.name}. {state.contextStale ? 'Refresh the saved code before using earlier results.' : 'Currentness is checked again before each action.'}</p>}
    <div className="vd2-step-chips">{steps.map(item => <Chip key={item.id} icon="clock">{item.name}</Chip>)}</div>
    <details className="vd-details"><summary>{state.requirement?.checksAvailable === false ? 'Explanation only' : 'Prepared exercise · original sample has an intentional bug'}</summary><p>{state.requirement ? requirementProse(state.requirement.text) : 'Read the project rule first.'}</p><p>Earlier authorship and external help are unknown. A check shows behavior; it does not measure understanding.</p></details>
  </StartSheet>;
}

export function Completion({ state, home, proof, challenge, bloom = false }: { state: PanelState; home: () => void; proof: () => void; challenge: () => void; bloom?: boolean }) {
  const summary = recordedSummary(state);
  return <Task title={summary.passed ? 'Your saved code follows this rule' : 'This result needs a refresh'} pose={summary.passed ? undefined : 'pointing'} art={summary.passed ? <Bloom animate={bloom} /> : undefined} action={<Control className="vd-primary" onClick={home}>Back to my path</Control>}>
    {summary.passed ? <><p>{summary.matched} of {summary.total} recorded cases match.</p><div className="vd2-proof-list">{summary.earned.map(item => <ProofSticker key={item} proof={item} earned={summary.earned} />)}</div><Chip icon="bulb">Coach hints: {summary.hints ?? 'not recorded'}</Chip><p className="vd2-caption">These checks show this behavior. Authorship, outside help and learning gains are not established.</p></> : <p>The code, rule or check definitions changed. Your earlier evidence is still available.</p>}
    <Control onClick={proof}>Show my proof</Control>
    {summary.passed && state.exercise !== 'transfer' && <Control disabled={state.busy} onClick={challenge}>Try the next rule</Control>}
  </Task>;
}

export function EvidenceReview({ state, send, back, open = true }: { state: PanelState; send: Send; back: () => void; open?: boolean }) {
  const [tab, setTab] = useState<'timeline' | 'technical'>('timeline');
  return <StartSheet id="vd-evidence" title="Your saved record" open={open} onClose={back} action={<Control className="vd-primary" onClick={back}>Back to my task</Control>}>
    <div className="vd-evidence-tabs" role="tablist" aria-label="Saved record views" onKeyDown={event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 'timeline' : event.key === 'End' ? 'technical' : tab === 'timeline' ? 'technical' : 'timeline';
      setTab(next); event.currentTarget.querySelector<HTMLElement>(`#vd-${next}-tab`)?.focus();
    }}>
      <Control id="vd-timeline-tab" role="tab" aria-selected={tab === 'timeline'} aria-controls="vd-timeline" tabIndex={tab === 'timeline' ? 0 : -1} onClick={() => setTab('timeline')}>Timeline and handover</Control>
      <Control id="vd-technical-tab" role="tab" aria-selected={tab === 'technical'} aria-controls="vd-technical" tabIndex={tab === 'technical' ? 0 : -1} onClick={() => setTab('technical')}>Technical details</Control>
    </div>
    <section id="vd-timeline" role="tabpanel" aria-labelledby="vd-timeline-tab" hidden={tab !== 'timeline'}>
    <p>Only saved events appear here. Earlier authorship and outside help are unknown.</p>
    {state.evidence?.length ? <ol className="vd2-evidence-list">{state.evidence.map(item => <li key={item.id}><h3>{item.title}</h3><p className="vd2-caption"><time dateTime={item.at}>{new Date(item.at).toLocaleString()}</time> · {item.current ? 'Matches current inputs' : 'Historical or unverified for current inputs'}</p><p>{item.detail}</p></li>)}</ol> : <p>No saved proof yet. Confirm your rule and save a code snapshot to begin.</p>}
    <Control disabled={state.busy || state.contextStale || !state.evidence?.length} reason="Refresh saved context with recorded evidence first." onClick={() => send({type:'exportHandover'})}>Export my proof</Control>
    <Reflection state={state} send={send} />
    </section>
    <section id="vd-technical" role="tabpanel" aria-labelledby="vd-technical-tab" hidden={tab !== 'technical'}><TechnicalDetails state={state} /></section>
  </StartSheet>;
}
