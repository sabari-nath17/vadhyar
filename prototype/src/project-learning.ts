import { z } from 'zod';
import { identitySchema, projectRunSchema, sourceSnapshotSchema, teachingExplanationSchema, type ProjectRun, type SourceSnapshot } from './project-types.js';

export type TeachingExplanation = z.infer<typeof teachingExplanationSchema>;

const text = z.string().trim().min(8).max(2000);
const verdict = z.enum(['satisfied', 'not-satisfied', 'uncertain']);
const time = z.string().datetime();
const HISTORY_LIMIT = 20;
const RECORD_LIMIT = 3_000_000;
const predictionSchema = z.object({ text, reasoning: text, sourceHash: identitySchema, recordedAt: time }).strict();
const observationSchema = z.object({ kind: z.literal('self-reported'), text, sourceHash: identitySchema, recordedAt: time }).strict();
const refreshSchema = z.object({ beforeHash: identitySchema, afterHash: identitySchema, changed: z.boolean(), recordedAt: time }).strict();
const verificationFields = { sourceHash: identitySchema, verdict, reason: text, assistance: text, recordedAt: time };
const verificationSchema = z.discriminatedUnion('kind', [
 z.object({ kind: z.literal('script'), ...verificationFields, run: projectRunSchema }).strict(),
 z.object({ kind: z.literal('manual'), ...verificationFields, description: text, evidence: text, selfReported: z.literal(true) }).strict()
]);
const transferSchema = z.object({ caseInput: text, prediction: text, reasoning: text, assistance: text, recordedAt: time }).strict();
const pendingCheckSchema = z.object({ operationId: z.uuid(), status: z.enum(['starting', 'accepted', 'unknown']), id: z.uuid().nullable(), fileId: identitySchema, sourceHash: identitySchema, manifestHash: identitySchema, scriptId: z.string().min(1).max(80) }).strict();
export type PendingCheck = z.infer<typeof pendingCheckSchema>;
const attemptSchema = z.object({
 id: z.uuid(), stage: z.enum(['predict', 'observe', 'change', 'verify', 'reflect', 'complete']),
 baseline: sourceSnapshotSchema, current: sourceSnapshotSchema,
 requirement: z.string().trim().min(8).max(4000), caseInput: text,
 prediction: predictionSchema.nullable(), observation: observationSchema.nullable(),
 refreshes: z.array(refreshSchema).max(20), verification: verificationSchema.nullable(),
 reflection: z.object({ text, recordedAt: time }).strict().nullable(), transfer: transferSchema.nullable(),
 teaching: teachingExplanationSchema.array().max(5).default([]),
 pendingCheck: pendingCheckSchema.nullable().default(null), checkResult: projectRunSchema.nullable().default(null)
}).strict().superRefine((a, ctx) => {
 const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
 const order = ['predict', 'observe', 'change', 'verify', 'reflect', 'complete'].indexOf(a.stage);
 if ((order >= 1) !== Boolean(a.prediction) || (order >= 2) !== Boolean(a.observation) || (order >= 3) !== Boolean(a.refreshes.length) || (order >= 4) !== Boolean(a.verification) || (order >= 5) !== Boolean(a.reflection) || (a.transfer && order !== 5)) fail('Learning prerequisites are inconsistent.');
 if ([a.baseline, a.current].some(source => source.text.length > 0 && source.endLine < source.startLine)) fail('A nonempty source excerpt has inconsistent line bounds.');
 if (!sameSelection(a.baseline, a.current) || (a.prediction && a.prediction.sourceHash !== a.baseline.sourceHash) || (a.observation && a.observation.sourceHash !== a.baseline.sourceHash)) fail('Recorded source identities are inconsistent.');
 let hash = a.baseline.sourceHash;
 for (const refresh of a.refreshes) {
  if (refresh.beforeHash !== hash || refresh.changed !== (refresh.beforeHash !== refresh.afterHash)) fail('Source refresh history is inconsistent.');
  hash = refresh.afterHash;
 }
 if (hash !== a.current.sourceHash) fail('The current source differs from its refresh history.');
 if (a.baseline.sourceHash === a.current.sourceHash && a.baseline.text !== a.current.text) fail('The same selected source identity has contradictory text.');
 if (a.verification) {
  if (a.verification.sourceHash !== a.current.sourceHash) fail('Verification refers to a different source.');
  if (a.verification.kind === 'script' && !validRun(a.verification.run, a.current)) fail('Script evidence is incomplete or refers to a different source.');
 }
 if (a.transfer && normalized(a.transfer.caseInput) === normalized(a.caseInput)) fail('Use a separate case for transfer.');
 const hashes = new Set([a.baseline.sourceHash, ...a.refreshes.map(r => r.afterHash)]);
 if (a.teaching.some(t => t.fileId !== a.current.fileId || t.path !== a.current.path || t.startLine !== a.current.startLine || !hashes.has(t.sourceHash) || t.endLine < t.startLine || (t.sourceHash === a.current.sourceHash && t.endLine !== a.current.endLine) || (t.sourceHash === a.baseline.sourceHash && t.endLine !== a.baseline.endLine) || !validTeachingCitations(t))) fail('Teaching interpretation refers to an inconsistent source excerpt or citation.');
 const p = a.pendingCheck, r = a.checkResult;
 if (p && (order < 3 || p.fileId !== a.current.fileId || p.sourceHash !== a.current.sourceHash || (p.status === 'starting' && (p.id !== null || r !== null)) || (p.status === 'accepted' && p.id === null))) fail('Pending command identities or prerequisites are inconsistent.');
 if (r && (!p || p.id !== r.id || !matchesCheck(r, p, a.current) || !validReceipt(r, a.current))) fail('Saved command receipt is inconsistent with its pending pointer.');
 if (a.verification && p && (p.status !== 'accepted' || !r || r.status === 'running')) fail('An unresolved command cannot precede an accepted requirement verdict.');
 if (a.verification?.kind === 'script' && (p || r) && (!p || p.status !== 'accepted' || !r || !sameReceiptEvidence(r, a.verification.run))) fail('Tracked script verification differs from its saved command receipt.');
});
export type ProjectAttempt = z.infer<typeof attemptSchema>;
const stateSchema = z.object({ version: z.literal(1), projectId: identitySchema, recordId: z.uuid(), serial: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 1), attempt: attemptSchema.nullable(), history: z.array(attemptSchema).max(HISTORY_LIMIT) }).strict().superRefine((s, ctx) => {
 const attempts = s.attempt ? [...s.history, s.attempt] : s.history;
 if (attempts.some(a => a.baseline.projectId !== s.projectId || a.current.projectId !== s.projectId) || new Set(attempts.map(a => a.id)).size !== attempts.length) ctx.addIssue({ code: 'custom', message: 'Project record identities are inconsistent.' });
});
export type ProjectState = z.infer<typeof stateSchema>;
export type ProjectAction = (
 | { type: 'start'; source: SourceSnapshot; requirement: string; caseInput: string }
 | { type: 'teaching'; result: TeachingExplanation }
 | { type: 'predict'; text: string; reasoning: string }
 | { type: 'observe'; text: string; source: SourceSnapshot }
 | { type: 'refresh'; source: SourceSnapshot }
 | { type: 'verifyRun'; run: ProjectRun; verdict: z.infer<typeof verdict>; reason: string; assistance: string }
 | { type: 'verifyManual'; description: string; evidence: string; verdict: z.infer<typeof verdict>; reason: string; assistance: string }
 | { type: 'reflect'; text: string }
 | { type: 'transfer'; caseInput: string; prediction: string; reasoning: string; assistance: string }
 | { type: 'beginCheck'; attemptId: string; operationId: string; fileId: string; sourceHash: string; manifestHash: string; scriptId: string }
 | { type: 'acceptCheck'; attemptId: string; operationId: string; run: ProjectRun }
 | { type: 'updateCheck'; attemptId: string; operationId: string; run: ProjectRun }
 | { type: 'loseCheck'; attemptId: string; operationId: string }
 | { type: 'clearCheck'; attemptId: string; operationId: string }
) & { attemptId?: string };
export const PROJECT_STORAGE_KEY = (projectId: string) => `vadhyar.project.v1.${identitySchema.parse(projectId)}`;
const normalized = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
const now = () => new Date().toISOString();
function sameSelection(a: SourceSnapshot, b: SourceSnapshot): boolean { return a.projectId === b.projectId && a.fileId === b.fileId && a.path === b.path && a.startLine === b.startLine; }
function validRun(run: ProjectRun, source: SourceSnapshot): boolean {
 return run.projectId === source.projectId && run.fileId === source.fileId && run.sourceHash === source.sourceHash && run.finishedAt !== null && Date.parse(run.finishedAt) >= Date.parse(run.startedAt) && ['passed', 'failed', 'error', 'timeout'].includes(run.status) && (run.status !== 'passed' || run.exitCode === 0) && (run.status !== 'failed' || (run.exitCode !== null && run.exitCode !== 0));
}
function validReceipt(run: ProjectRun, source: SourceSnapshot): boolean {
 if (run.projectId !== source.projectId || run.fileId !== source.fileId || run.sourceHash !== source.sourceHash) return false;
 if (run.status === 'running') return run.finishedAt === null && run.exitCode === null;
 if (run.status === 'stale') return run.finishedAt !== null && Date.parse(run.finishedAt) >= Date.parse(run.startedAt);
 return validRun(run, source);
}
function matchesCheck(run: ProjectRun, p: PendingCheck, source: SourceSnapshot): boolean { return run.projectId === source.projectId && run.fileId === p.fileId && run.sourceHash === p.sourceHash && run.manifestHash === p.manifestHash && run.scriptId === p.scriptId; }
function sameReceiptIdentity(a: ProjectRun, b: ProjectRun): boolean { return a.id === b.id && a.projectId === b.projectId && a.fileId === b.fileId && a.sourceHash === b.sourceHash && a.manifestHash === b.manifestHash && a.scriptId === b.scriptId && a.startedAt === b.startedAt; }
function sameReceiptEvidence(a: ProjectRun, b: ProjectRun): boolean { return sameReceiptIdentity(a, b) && a.status === b.status && a.exitCode === b.exitCode && a.finishedAt === b.finishedAt && a.output === b.output; }
function validTeachingCitations(t: TeachingExplanation): boolean { return t.explanation.summary.trim().length > 0 && t.model.trim().length > 0 && t.explanation.limits.length > 0 && t.explanation.conditions.every(c => c.startLine >= t.startLine && c.endLine <= t.endLine && c.endLine >= c.startLine); }
function require(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function archive(state: ProjectState): ProjectAttempt[] {
 if (!state.attempt) return state.history;
 require(state.history.length < HISTORY_LIMIT, 'Project history is full. Export the record before starting another attempt.');
 return [...state.history, state.attempt];
}
export function newProjectState(projectId: string): ProjectState { return stateSchema.parse({ version: 1, projectId, recordId: crypto.randomUUID(), serial: 0, attempt: null, history: [] }); }
export function projectTransition(input: ProjectState, action: ProjectAction): ProjectState {
 const state = stateSchema.parse(input);
 if (action.attemptId !== undefined) require(state.attempt?.id === action.attemptId, 'This action belongs to an earlier attempt. The current question and saved work were preserved.');
 if (action.type === 'start') {
  const source = sourceSnapshotSchema.parse(action.source);
  require(source.projectId === state.projectId, 'Choose source from the current project.');
  require(source.text.trim().length > 0 && source.endLine >= source.startLine, 'Choose a nonempty source excerpt with valid line bounds before starting a learning attempt.');
  return stateSchema.parse({ ...state, history: archive(state), attempt: { id: crypto.randomUUID(), stage: 'predict', baseline: source, current: source, requirement: action.requirement, caseInput: action.caseInput, prediction: null, observation: null, refreshes: [], verification: null, reflection: null, transfer: null } });
 }
 const a = state.attempt;
 require(a, 'Choose source and confirm a requirement before beginning.');
 const update = (change: Partial<ProjectAttempt>, history = state.history) => stateSchema.parse({ ...state, history, attempt: { ...a, ...change } });
 if (action.type === 'beginCheck' || action.type === 'acceptCheck' || action.type === 'updateCheck' || action.type === 'loseCheck' || action.type === 'clearCheck') {
  require(action.attemptId === a.id && a.stage === 'verify', 'Record commands only in the originating attempt’s verify stage.');
  if (action.type === 'beginCheck') {
   require(!a.pendingCheck && !a.checkResult, 'Clear the previous command explicitly or start another attempt before running a new command.');
   const pendingCheck = pendingCheckSchema.parse({ operationId: action.operationId, status: 'starting', id: null, fileId: action.fileId, sourceHash: action.sourceHash, manifestHash: action.manifestHash, scriptId: action.scriptId });
   require(pendingCheck.fileId === a.current.fileId && pendingCheck.sourceHash === a.current.sourceHash, 'Approve a command for the current source identity.');
   return update({ pendingCheck, checkResult: null });
  }
  const p = a.pendingCheck;
  require(p && p.operationId === action.operationId, 'The command operation changed. Its earlier response was not accepted.');
  if (action.type === 'loseCheck') return update({ pendingCheck: { ...p, status: 'unknown' } });
  if (action.type === 'clearCheck') {
   require(p.status === 'unknown' || (a.checkResult && a.checkResult.status !== 'running'), 'Only unknown or terminal commands can be cleared; a known running command must finish.');
   return update({ id: crypto.randomUUID(), pendingCheck: null, checkResult: null }, archive(state));
  }
  const run = projectRunSchema.parse(action.run);
  require(matchesCheck(run, p, a.current) && validReceipt(run, a.current), 'The command receipt must match its approved project, source, script and manifest identity.');
  if (action.type === 'acceptCheck') require(p.status !== 'accepted' || p.id === run.id, 'A different receipt cannot replace the accepted command.');
  else require(p.id === run.id, 'Retrieve the accepted command receipt before updating it.');
  if (p.id !== null) require(p.id === run.id, 'A different receipt cannot replace the accepted command.');
  if (a.checkResult) {
   require(sameReceiptIdentity(a.checkResult, run), 'The command receipt identity changed.');
   require(a.checkResult.status === 'running' || sameReceiptEvidence(a.checkResult, run), 'A terminal command receipt cannot regress or change its execution evidence.');
  }
  return update({ pendingCheck: { ...p, status: 'accepted', id: run.id }, checkResult: run });
 }
 if (action.type === 'teaching') {
  const result = teachingExplanationSchema.parse(action.result), source = a.current;
  require(result.fileId === source.fileId && result.sourceHash === source.sourceHash && result.path === source.path && result.startLine === source.startLine && result.endLine === source.endLine && validTeachingCitations(result), 'Teaching interpretation must match the current source excerpt and its cited lines.');
  require(a.teaching.length < 5, 'Teaching history is full. Export the record and start another attempt before generating more interpretations.');
  return update({ teaching: [...a.teaching, result] });
 }
 if (action.type === 'predict') {
  require(a.stage === 'predict', 'A prediction is already recorded for this source. Start a new attempt to record another.');
  return update({ stage: 'observe', prediction: { text: action.text, reasoning: action.reasoning, sourceHash: a.baseline.sourceHash, recordedAt: now() } });
 }
 if (action.type === 'observe') {
  require(a.stage === 'observe' && a.prediction, 'Record a prediction before recording an observation.');
  const fresh = sourceSnapshotSchema.safeParse(action.source);
  require(fresh.success, 'Refresh the matching saved source before recording an observation.');
  require(sameSelection(a.baseline, fresh.data) && fresh.data.sourceHash === a.baseline.sourceHash && fresh.data.text === a.baseline.text && fresh.data.endLine === a.baseline.endLine, 'The source changed after the prediction. Start a fresh attempt; the original prediction is preserved.');
  return update({ stage: 'change', observation: { kind: 'self-reported', text: action.text, sourceHash: a.baseline.sourceHash, recordedAt: now() } });
 }
 if (action.type === 'refresh') {
  require(a.observation, 'Observe the predicted case before refreshing source for verification.');
  const source = sourceSnapshotSchema.parse(action.source);
  require(sameSelection(a.baseline, source), 'Refresh the same selected project file and starting line; start another attempt for a different selection.');
  require(a.refreshes.length < 20, 'Source refresh history is full. Export and start another attempt.');
  const changed = a.current.sourceHash !== source.sourceHash;
  const refreshes = [...a.refreshes, { beforeHash: a.current.sourceHash, afterHash: source.sourceHash, changed, recordedAt: now() }];
  if (!changed) return update({ current: source, refreshes, stage: a.stage === 'change' ? 'verify' : a.stage });
  // Preserve accepted evidence and uncertain commands before invalidating their source context.
  const preserve = Boolean(a.verification || a.pendingCheck || a.checkResult);
  return update({ id: preserve ? crypto.randomUUID() : a.id, current: source, refreshes, stage: 'verify', verification: null, reflection: null, transfer: null, pendingCheck: null, checkResult: null }, preserve ? archive(state) : state.history);
 }
 if (action.type === 'verifyRun' || action.type === 'verifyManual') {
  require(a.stage === 'verify' || a.stage === 'reflect', 'Observe the case and refresh saved source before recording verification.');
  require(!a.pendingCheck || (a.pendingCheck.status === 'accepted' && a.checkResult && a.checkResult.status !== 'running'), 'Wait for the active command to finish, or explicitly clear an unknown command before recording a requirement verdict.');
  const fields = { sourceHash: a.current.sourceHash, verdict: action.verdict, reason: action.reason, assistance: action.assistance, recordedAt: now() };
  if (action.type === 'verifyRun') {
   const run = projectRunSchema.parse(action.run);
   require(validRun(run, a.current), 'Use a finished current-project script result for the current source; running, stale or contradictory results cannot be recorded.');
   if (run.status === 'error' || run.status === 'timeout') require(run.freshness === 'unknown' && action.verdict !== 'satisfied', 'Execution failure has unknown coverage; record only an uncertain or not-satisfied verdict with explicitly unknown freshness.');
   else require(run.freshness === 'current', 'Re-read the command receipt with current host freshness before recording a new script verdict.');
   if (a.pendingCheck || a.checkResult) require(a.pendingCheck?.status === 'accepted' && a.checkResult && validRun(a.checkResult, a.current) && sameReceiptEvidence(a.checkResult, run), 'An unknown, starting, running or different tracked receipt cannot supply this script verdict.');
   return update({ stage: 'reflect', verification: { kind: 'script', ...fields, run }, reflection: null, transfer: null, checkResult: a.pendingCheck ? run : a.checkResult });
  }
  return update({ stage: 'reflect', verification: { kind: 'manual', ...fields, description: action.description, evidence: action.evidence, selfReported: true }, reflection: null, transfer: null });
 }
 if (action.type === 'reflect') {
  require(a.stage === 'reflect' && a.verification, 'Record scoped verification and a human requirement verdict before reflecting.');
  return update({ stage: 'complete', reflection: { text: action.text, recordedAt: now() } });
 }
 require(action.type === 'transfer', 'Choose a supported project learning action.');
 require(a.stage === 'complete' && !a.transfer, 'Complete the reflection before recording a separate case.');
 require(normalized(action.caseInput) !== normalized(a.caseInput), 'Use a different, separate case from the original prediction.');
 return update({ transfer: { caseInput: action.caseInput, prediction: action.prediction, reasoning: action.reasoning, assistance: action.assistance, recordedAt: now() } });
}
export function restoreProjectState(raw: string | null, projectId: string): { state: ProjectState; error?: string } {
 const fresh = () => newProjectState(projectId);
 if (raw === null) return { state: fresh() };
 try {
  require(raw.length <= RECORD_LIMIT, 'Record exceeds its storage limit.');
  const state = stateSchema.parse(JSON.parse(raw));
  require(state.projectId === projectId, 'The record belongs to another project.');
  return { state };
 } catch { return { state: fresh(), error: 'Saved project data could not be read. The original is preserved; export a backup before explicitly resetting this project record.' }; }
}
export class ProjectStorageFailure extends Error { constructor() { super('Your action is kept in this tab but could not be saved. Export the visible project record before leaving, or retry saving.'); } }
type RecordStorage = Pick<Storage, 'getItem' | 'setItem'>;
export function resetProjectState(storage: RecordStorage, projectId: string): ProjectState {
 const fresh = newProjectState(projectId);
 try { storage.setItem(PROJECT_STORAGE_KEY(projectId), JSON.stringify(fresh)); } catch { throw new ProjectStorageFailure(); }
 return fresh;
}
export function persistProjectState(storage: RecordStorage, input: ProjectState, expectedSerial: number): ProjectState {
 const state = stateSchema.parse(input);
 require(state.serial === expectedSerial, 'Project progress changed in another tab or this save used an outdated revision. Reload before saving.');
 const key = PROJECT_STORAGE_KEY(state.projectId);
 let raw: string | null;
 try { raw = storage.getItem(key); } catch { throw new ProjectStorageFailure(); }
 if (raw !== null) {
  const existing = restoreProjectState(raw, state.projectId);
  require(!existing.error, existing.error ?? 'Saved project data is invalid.');
  require(existing.state.serial === expectedSerial && existing.state.recordId === state.recordId, 'Project progress changed in another tab. Reload before saving.');
 } else require(expectedSerial === 0, 'Project progress was removed in another tab. Reload before saving.');
 const saved = stateSchema.parse({ ...state, serial: expectedSerial + 1 });
 const encoded = JSON.stringify(saved);
 require(encoded.length <= RECORD_LIMIT, 'Project storage is full. Export records before resetting.');
 // shortcut: sequential-tab conflicts are detected; simultaneous localStorage writes require a coordinated store.
 try { storage.setItem(key, encoded); } catch { throw new ProjectStorageFailure(); }
 return saved;
}
export function recordProjectAction(state: ProjectState, action: ProjectAction, storage: RecordStorage): { state: ProjectState; warning?: string } {
 const next = projectTransition(state, action);
 try { return { state: persistProjectState(storage, next, state.serial) }; }
 catch (error) { if (error instanceof ProjectStorageFailure) return { state: next, warning: error.message }; throw error; }
}
function fenced(value: string): string { const ticks = '`'.repeat(Math.max(3, ...[...value.matchAll(/`+/g)].map(m => m[0].length + 1))); return `${ticks}\n${value}\n${ticks}`; }
export function exportProjectRecord(input: ProjectState): string {
 const state = stateSchema.parse(input);
 const attempts = [...state.history, ...(state.attempt ? [state.attempt] : [])];
 const records = attempts.map(a => {
  const v = a.verification;
  const p = a.pendingCheck, r = a.checkResult;
  const tracking = p ? `### Command tracking\n\nOperation identity: ${p.operationId}\nAcknowledgement: ${p.status}\nReceipt identity: ${p.id ?? 'Not received'}\nScript: ${p.scriptId}\nManifest identity: ${p.manifestHash}\nFile identity: ${p.fileId}\nSource identity: ${p.sourceHash}\n${p.status === 'starting' ? 'No acknowledgement was saved; the command may have executed. Do not automatically re-run it.' : p.status === 'unknown' ? 'Execution or receipt availability is unknown; the command may have executed. Do not automatically re-run it.' : 'Receipt acknowledged; saved status is historical until the host is re-read.'}\n\n` : '';
  const receipt = r ? `### Saved command receipt, not an accepted requirement verdict\n\nReceipt identity: ${r.id}\nScript: ${r.scriptId}\nManifest identity: ${r.manifestHash}\nSource identity: ${r.sourceHash}\nExecution status: ${r.status}; exit code: ${r.exitCode}\nLast reported host freshness: ${r.freshness ?? 'Not recorded (historical)'}\nStarted: ${r.startedAt}\nFinished: ${r.finishedAt ?? 'Not finished at the last read'}\nOutput:\n${fenced(r.output)}\n\n` : '';
  const teaching = a.teaching.map(t => `### Teaching interpretation, not a check${t.sourceHash !== a.current.sourceHash ? ' (historical)' : ''}\n\nModel: ${t.model}\nGenerated: ${t.generatedAt}\nSource: ${t.path}, lines ${t.startLine}–${t.endLine}\nFull-file identity: ${t.sourceHash}\n\n${t.explanation.summary}\n\n${t.explanation.conditions.map(c => `- Lines ${c.startLine}–${c.endLine}: ${c.explanation}`).join('\n')}\n\nQuestions:\n${t.explanation.questions.map(q => `- ${q}`).join('\n')}\n\nCoverage limits:\n${t.explanation.limits.map(l => `- ${l}`).join('\n')}\n`).join('\n');
  const check = !v ? 'Not recorded' : v.kind === 'manual' ? `Manual verification (self-reported)\nMethod: ${v.description}\nEvidence: ${v.evidence}` : `Existing project script: ${v.run.scriptId}\nStatus: ${v.run.status}; exit code: ${v.run.exitCode}\nManifest identity: ${v.run.manifestHash}\nOutput:\n${fenced(v.run.output)}`;
  return `## ${a.baseline.path} — ${a.stage}\n\nRecord: ${a.id}\nRequirement (human-confirmed): ${a.requirement}\nCase: ${a.caseInput}\nSource excerpt: lines ${a.baseline.startLine}–${a.baseline.endLine}; full-file identity: ${a.baseline.sourceHash}\nExcerpt coverage: ${a.baseline.truncated ? 'partial' : 'selected range'}; this is not whole-project coverage.\n\n${fenced(a.baseline.text)}\n\nPrediction: ${a.prediction?.text ?? 'Not recorded'}\nReasoning: ${a.prediction?.reasoning ?? 'Not recorded'}\nObservation (self-reported): ${a.observation?.text ?? 'Not recorded'}\nCurrent full-file identity: ${a.current.sourceHash}\nCurrent source excerpt:\n\n${fenced(a.current.text)}\n\nSource refreshes:\n${a.refreshes.map(r => `- ${r.changed ? 'Changed' : 'Unchanged'}: ${r.beforeHash} → ${r.afterHash} at ${r.recordedAt}`).join('\n') || 'Not refreshed'}\n\n${teaching}\n${tracking}${receipt}${check}\nRequirement verdict (human self-report): ${v?.verdict ?? 'Not recorded'}\nVerdict reason: ${v?.reason ?? 'Not recorded'}\nAssistance declaration (self-reported): ${v?.assistance ?? 'Not recorded'}\nReflection: ${a.reflection?.text ?? 'Not recorded'}\nSeparate learner-defined case: ${a.transfer?.caseInput ?? 'Not recorded'}\nSeparate prediction: ${a.transfer?.prediction ?? 'Not recorded'}\nSeparate reasoning: ${a.transfer?.reasoning ?? 'Not recorded'}\nSeparate assistance declaration (self-reported): ${a.transfer?.assistance ?? 'Not recorded'}\n`;
 });
 return `# Vadhyar project learning record\n\nProject identity: ${state.projectId}\nRecord identity: ${state.recordId}\nExisting script exit status does not prove requirement satisfaction. Observation, manual verification, human verdicts and assistance are self-reported. Source excerpts and selected checks have limited coverage; completion does not establish mastery, authorship, external assistance, policy permission or whole-project correctness. Local records are editable and are not tamper-evident; source freshness is checked by the host at capture/run time, not when restoring a saved record.\n\n${records.join('\n')}`;
}
