import { useState } from 'react';
import type { ProjectAttempt } from './project-learning.js';
import { lessonSteps, pathStepState, type Freshness } from './learning-path.js';
import { Arrow, Control, Lotus, NavIcon } from './ui.js';

export function LearningPath({ attempt, freshness, review, unsaved, resume, choose, records }: {
 attempt: ProjectAttempt | null; freshness: Freshness; review: boolean; unsaved: boolean;
 resume: () => void; choose: () => void; records: () => void;
}) {
 const [hint, setHint] = useState('');
 if (!attempt) return <section className="path-empty">
  <Lotus /><h2>Start with one useful question.</h2>
  <p>Choose source from your project.<br />Confirm one rule and one case to investigate.</p>
  <Control className="primary" onClick={choose}>Choose a question <Arrow /></Control>
  <p className="disclosure">Your learning record is saved in this browser.</p>
 </section>;
 const current = lessonSteps.findIndex(step => step.key === attempt.stage), step = lessonSteps[current];
 const finished = Boolean(attempt.transfer);
 return <>
  <section className="path-rule"><span className="small-label">YOUR CONFIRMED RULE</span><blockquote>{attempt.requirement}</blockquote><p><code>{attempt.current.path}</code> · captured source</p></section>
  {freshness === 'changed' && <section className="notice source-update" role="status"><strong>Newer saved source is available.</strong><p>Your original prediction is kept. Earlier outcomes refer to their captured version; refresh explicitly in the lesson.</p></section>}
  <div className="path-layout">
   <ol className="learning-path" aria-label="Your question’s learning activities">
    {lessonSteps.map((item, index) => {
     const state = pathStepState(attempt, index, freshness);
     const detail = state === 'current' ? 'Current activity' : state === 'upcoming' ? item.prerequisite : index === 0 ? unsaved ? 'In this tab · baseline' : 'Saved · baseline' : freshness === 'changed' ? 'Historical · earlier source' : freshness === 'unknown' ? 'Recorded · captured version' : unsaved ? 'Recorded in this tab' : 'Recorded activity';
     return <li key={item.key} className={'path-stop ' + state} aria-current={state === 'current' ? 'step' : undefined}>
      <div className="path-label"><strong>{item.label}</strong><small>{detail}</small></div>
      <Control className="path-node" aria-label={`${item.label}: ${detail}`} onClick={() => {
       if (state === 'current') resume();
       else if (state === 'upcoming') setHint(`${item.label} becomes available ${item.prerequisite.toLowerCase()}. Continue the current activity first.`);
       else records();
      }}>{state === 'recorded' ? <NavIcon name="Check" /> : state === 'historical' ? <NavIcon name="History" /> : state === 'current' ? <NavIcon name={item.key === 'observe' ? 'Observe' : item.key === 'predict' ? 'Learn' : item.key === 'change' ? 'Source' : item.key === 'verify' ? 'Check' : 'Notebook'} /> : <span>{index + 1}</span>}</Control>
     </li>;
    })}
   </ol>
   <div className="path-next">
    <section className="next-question"><span className="small-label">{finished ? 'QUESTION RECORD' : 'NEXT SMALL STEP'}</span><h2>{finished ? 'A separate case is recorded.' : step.next}</h2><p>{finished ? 'Revisit the reasoning and scoped evidence you saved.' : step.description}</p>{attempt.verification && <div className="record-verdict"><strong>Your requirement verdict · {attempt.verification.verdict}</strong><details><summary>Your assessment and scope</summary><p>{attempt.verification.reason}</p><p className="disclosure">Self-reported, for the captured evidence.</p></details></div>}<Control className="primary" onClick={finished ? records : resume}>{finished ? 'Open question record' : 'Continue'}<Arrow /></Control>{finished && <Control className="text-button" onClick={resume}>Review captured source <Arrow /></Control>}</section>
    {review && <section className="path-review"><h3>Review the captured evidence.</h3><dl><dt>Case</dt><dd>{attempt.caseInput}</dd><dt>Original prediction</dt><dd>{attempt.prediction?.text ?? 'Not recorded'}</dd><dt>Requirement verdict · self-reported</dt><dd>{attempt.verification?.verdict ?? 'Not recorded'}</dd></dl><Control className="text-button" onClick={records}>Open full record <Arrow /></Control></section>}
    {!review && <div className="path-motif"><Lotus /><p>Keep the question small.</p><small>Keep your reasoning visible.</small></div>}
    {hint && <p className="path-hint" role="status">{hint}</p>}
   </div>
  </div>
  <div className="path-foot"><p>Review earlier steps without replacing their evidence.</p><Control className="text-button" onClick={choose}>Choose another question <Arrow /></Control></div>
 </>;
}
