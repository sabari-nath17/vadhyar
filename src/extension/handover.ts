import type { EvidenceRow } from '../shared.js';
import type { Session, loadExplanation } from './session.js';
import { plain } from './walkthrough.js';

export function sessionEvidence(session: Session, current: { sourceHash: string; requirementRevision: string; fingerprints?: { harness: string; config: string; lock: string }; explanationCurrent: boolean }, explanation?: Awaited<ReturnType<typeof loadExplanation>>): EvidenceRow[] {
  const rows: EvidenceRow[] = [];
  const add = (row: Omit<EvidenceRow, 'current'>, checks?: { harness: string; config: string; lock: string }, run = false) => rows.push({ ...row, current: row.requirementRevision === current.requirementRevision && (!row.sourceHash || row.sourceHash === current.sourceHash) && (!run || Boolean(checks && current.fingerprints && Object.entries(current.fingerprints).every(([key, value]) => checks[key as keyof typeof checks] === value))) });
  session.requirements.forEach(item => add({ id: `requirement-${item.revision}`, kind: 'requirement', at: item.confirmedAt, title: 'Requirement confirmed', detail: item.title ?? item.id, requirementRevision: item.revision }));
  session.checkpoints.forEach((item, index) => add({ id: `checkpoint-${index}-${item.hash}`, kind: 'checkpoint', at: item.capturedAt, title: 'Source checkpoint', detail: item.path, requirementRevision: item.requirementRevision, sourceHash: item.hash }));
  session.predictions.forEach(item => add({ id: item.id, kind: 'prediction', at: item.savedAt, title: `${item.caseId === 'owner-client-archived' ? 'Transfer' : 'Ownership'} prediction saved`, detail: `Predicted ${item.predictedApproval ? 'allow' : 'deny'}. ${item.reasoning}`, requirementRevision: item.requirementRevision, sourceHash: item.sourceHash }));
  for (const event of session.activity) {
    if (event.type === 'counterexample' || event.type === 'ownership') {
      const run = event.run;
      const detail = run.kind !== 'completed' ? `${run.kind}: ${run.message} No learner verdict.` : event.type === 'counterexample' && event.run.kind === 'completed' ? `${event.run.caseId}: observed ${event.run.observedApproval ? 'allow' : 'deny'}; requirement ${event.run.requirementPassed ? 'passed' : 'failed'}.` : event.type === 'ownership' && event.run.kind === 'completed' ? `${event.run.suiteId}: ${event.run.cases.map(item => `${item.id} ${item.status} (required ${item.expectedApproval ? 'allow' : 'deny'}, observed ${item.observedApproval ? 'allow' : 'deny'})`).join('; ')}. Exit ${event.run.exitCode}.` : '';
      add({ id: run.id, kind: event.type, at: run.finishedAt, title: event.type === 'counterexample' ? 'Prepared case executed' : 'Full checks executed', detail, requirementRevision: run.requirementRevision, sourceHash: run.sourceHash }, run.fingerprints, true);
    } else {
      const detail = event.type === 'hint' ? `Level ${event.result.hint.level}: ${event.result.hint.text}` : event.type === 'diff' ? `Native diff: ${event.before.hash} → ${event.after.hash}` : event.text;
      add({ id: event.id, kind: event.type, at: event.recordedAt, title: event.type === 'hint' ? 'Coach hint recorded' : event.type === 'diff' ? 'Saved-source diff opened' : 'Local reflection saved', detail, requirementRevision: event.requirementRevision, sourceHash: event.sourceHash });
    }
  }
  if (explanation) rows.push({ id: `explanation-${explanation.responseId}`, kind: 'explanation', at: explanation.capturedAt, title: 'Validated explanation saved', detail: `Model ${explanation.model}; response ${explanation.responseId}; ${explanation.latencyMs} ms.`, sourceHash: explanation.sourceHash, requirementRevision: explanation.requirementRevision, current: current.explanationCurrent });
  return rows.sort((a, b) => a.at.localeCompare(b.at));
}

export function handoverReport(session: Session, rows: EvidenceRow[]): string {
  const text = ['# Vadhyar NovaDesk evidence handover', '', 'Prepared exercise with disclosed bugs. Passing fixed checks is behavior evidence, not mastery or a measured learning gain. Earlier authorship and external assistance are unknown. This report is a snapshot; freshness can change after export.', '', '## Confirmed requirement revisions', ...session.requirements.map(item => `\n### ${plain(item.title ?? item.id)}\nRevision: ${item.revision}\n\n${plain(item.text)}`), '', '## Attempts and assistance', ...session.predictions.map(item => `\n- ${item.id}: ${item.caseId === 'owner-client-archived' ? 'archived transfer' : 'ownership'}; ${session.activity.filter(event => event.type === 'hint' && event.predictionId === item.id).length} coach hints recorded. Source: ${item.sourceHash}; requirement: ${item.requirementRevision}.`), '', '## Recorded evidence', ...rows.map(row => `\n### ${plain(row.title)}\n${plain(row.at)} · ${row.current ? 'matches inputs at export' : 'historical or unverified for export inputs'}\nID: ${plain(row.id)}\nRequirement: ${row.requirementRevision}\nSource: ${row.sourceHash ?? 'not captured in this record'}\n\n${plain(row.detail)}`), ''].join('\n');
  if (text.length > 900_000) throw new Error('Handover exceeds the supported export size; saved records are retained.');
  return text;
}
