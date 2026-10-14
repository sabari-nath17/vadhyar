import { z } from 'zod';
export type Page = 'Today' | 'Learn' | 'Practice' | 'Project' | 'Progress' | 'Notebook' | 'Website';
export type Attempt = { id: string; revision: number; step: number; prediction: { answer: 'allow' | 'block'; reasoning: string; question: string; input: string; rule: string; source: string } | null; observed: boolean; fixed: boolean; checked: boolean | null; hints: number; reflection: string; transfer: { answer: 'allow' | 'block'; reasoning: string } | null };
export type Note = { id: string; title: string; body: string };
export type State = { version: 1; recordId: string; serial: number; revision: number; page: Page; mode: 'guided' | 'developer'; goal: string; attempt: Attempt; history: Attempt[]; notes: Note[]; practice: { id: string; question: string; answer: string; reasoning: string }[] };
export type Action = { type: 'confirm' | 'next' | 'observe' | 'check' | 'newLesson' | 'changeProject' } | { type: 'predict' | 'transfer'; answer: 'allow' | 'block'; reasoning: string } | { type: 'fix'; fixed: boolean } | { type: 'reflect'; text: string } | { type: 'hint' } | { type: 'page'; page: Page } | { type: 'mode'; mode: State['mode'] } | { type: 'goal'; goal: string } | { type: 'note'; title: string; body: string } | { type: 'practice'; question: string; answer: string; reasoning: string };
export const STORAGE_KEY = 'vadhyar.mock.v1';
export const pages: Page[] = ['Today', 'Learn', 'Practice', 'Project', 'Progress', 'Notebook'];
export const steps = ['Confirm', 'Understand', 'Predict', 'Observe', 'Change', 'Verify'];
export const preparedCase = { question: 'Will this saved code allow approval?', input: 'Different client; active milestone', rule: 'Only the owning client may approve an active milestone.' };
export function preparedSource(fixed: boolean, revision: number): string { return ['export function canApprove(actor, milestone) {', '  return actor.role === "client"', ...(fixed ? ['    && actor.id === milestone.clientId'] : []), ...(revision > 1 ? ['    && !milestone.archived'] : []), '  ;', '}'].join('\n'); }
export function newAttempt(revision: number): Attempt { return { id: crypto.randomUUID(), revision, step: 0, prediction: null, observed: false, fixed: false, checked: null, hints: 0, reflection: '', transfer: null }; }
export function newState(): State { return { version: 1, recordId: crypto.randomUUID(), serial: 0, revision: 1, page: 'Today', mode: 'guided', goal: 'Understand my project', attempt: newAttempt(1), history: [], notes: [], practice: [] }; }
const answer = z.enum(['allow', 'block']);
const text = z.string().trim().min(8).max(2000);
const attemptSchema = z.object({ id: z.uuid(), revision: z.number().int().min(1).max(100), step: z.number().int().min(0).max(6), prediction: z.object({ answer, reasoning: text, question: z.literal(preparedCase.question), input: z.literal(preparedCase.input), rule: z.literal(preparedCase.rule), source: z.string().max(800) }).strict().nullable(), observed: z.boolean(), fixed: z.boolean(), checked: z.boolean().nullable(), hints: z.number().int().min(0).max(3), reflection: z.string().max(2000), transfer: z.object({ answer, reasoning: text }).strict().nullable() }).strict().superRefine((a, ctx) => {
 if ((a.step >= 3 && !a.prediction) || (a.step >= 4 && !a.observed) || (a.step >= 5 && a.checked === null) || (a.step === 6 && (!a.fixed || a.checked !== true || a.reflection.trim().length < 8)) || (a.transfer && a.step !== 6)) ctx.addIssue({ code: 'custom', message: 'Attempt prerequisites are inconsistent.' });
 if ((a.step < 3 && a.prediction) || (a.step < 6 && a.reflection.length > 0)) ctx.addIssue({ code: 'custom', message: 'Recorded answer precedes its stage.' });
 if (a.prediction && a.prediction.source !== preparedSource(false, a.revision)) ctx.addIssue({ code: 'custom', message: 'Prepared prediction source differs.' });
 if ((a.checked !== null && (a.checked !== a.fixed || a.step < 5)) || (a.fixed && a.step < 4) || (a.observed && a.step < 3) || (a.hints > 0 && a.step < 4)) ctx.addIssue({ code: 'custom', message: 'Prepared results are inconsistent.' });
});
const stateSchema: z.ZodType<State> = z.object({ version: z.literal(1), recordId: z.uuid(), serial: z.number().int().nonnegative(), revision: z.number().int().min(1).max(100), page: z.enum([...pages, 'Website']), mode: z.enum(['guided', 'developer']), goal: z.string().min(1).max(80), attempt: attemptSchema, history: z.array(attemptSchema).max(40), notes: z.array(z.object({ id: z.uuid(), title: z.string().trim().min(1).max(80), body: z.string().trim().min(1).max(4000) }).strict()).max(40), practice: z.array(z.object({ id: z.uuid(), question: z.enum(['inputs', 'states']), answer: z.string().max(80), reasoning: text }).strict()).max(40) }).strict().superRefine((s, ctx) => {
 const ids = [s.attempt.id, ...s.history.map(a => a.id)];
 if (new Set(ids).size !== ids.length || [...s.history, s.attempt].some(a => a.revision > s.revision)) ctx.addIssue({ code: 'custom', message: 'Recorded identities are inconsistent.' });
 if ([...s.history, s.attempt].some(a => a.step === 6 && !s.notes.some(n => n.id === a.id && n.body === a.reflection))) ctx.addIssue({ code: 'custom', message: 'Recorded reflection note is missing.' });
});
export const practiceQuestions = [
 { id: 'inputs', title: 'Inputs and validation', question: 'An empty project title reaches this condition. Is the input accepted?', code: 'if (!title.trim()) return false;', choices: ['Reject input', 'Accept input'], correct: 'Reject input', explanation: 'An empty string stays empty after trim. The guard returns false before saving.' },
 { id: 'states', title: 'State transitions', question: 'A milestone is already archived. What should this transition do?', code: 'if (milestone.archived) return "blocked";', choices: ['Block transition', 'Allow transition'], correct: 'Block transition', explanation: 'Archived state is a guard. This prepared example rejects the transition before changing data.' }
];
export function checkCases(fixed: boolean): { id: string; label: string; allowed: boolean; passed: boolean }[] {
 return [{ id: 'owner', label: 'Owning client', role: 'client', owns: true, expected: true }, { id: 'other', label: 'Different client', role: 'client', owns: false, expected: false }, { id: 'freelancer', label: 'Freelancer', role: 'freelancer', owns: false, expected: false }].map(c => {
  // shortcut: evaluates this prepared rule only; replace with a trusted adapter for real project checks.
  const allowed = c.role === 'client' && (!fixed || c.owns);
  return { id: c.id, label: c.label, allowed, passed: allowed === c.expected };
 });
}
export function transition(state: State, action: Action): State {
 const a = state.attempt;
 const require = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
 const update = (change: Partial<Attempt>) => ({ ...state, attempt: { ...a, ...change } });
 if (action.type === 'page') return { ...state, page: action.page };
 if (action.type === 'mode') return { ...state, mode: action.mode };
 if (action.type === 'goal') return { ...state, goal: action.goal };
 if (action.type === 'note') return stateSchema.parse({ ...state, notes: [...state.notes, { id: crypto.randomUUID(), title: action.title, body: action.body }] });
 if (action.type === 'practice') {
  const q = practiceQuestions.find(q => q.id === action.question);
  require(Boolean(q?.choices.includes(action.answer)), 'Choose a prepared answer.');
  return stateSchema.parse({ ...state, practice: [...state.practice, { id: crypto.randomUUID(), question: action.question, answer: action.answer, reasoning: action.reasoning }] });
 }
 if (action.type === 'changeProject') { require(state.revision === 1, 'The one prepared later change is already applied.'); return { ...state, revision: 2, page: 'Project' }; }
 if (action.type === 'newLesson') {
  require(state.history.length < 40, 'History is full. Export it before resetting this prototype.');
  return { ...state, page: 'Learn', attempt: newAttempt(state.revision), history: a.prediction ? [...state.history, a] : state.history };
 }
 require(a.revision === state.revision, 'The prepared source changed. Start a fresh lesson; this attempt is preserved.');
 if (action.type === 'confirm') { require(a.step === 0, 'Confirm the current rule first.'); return update({ step: 1 }); }
 if (action.type === 'next') {
  require(a.step === 1 || (a.step === 3 && a.observed), 'Complete the current task before continuing.');
  return update({ step: a.step + 1 });
 }
 if (action.type === 'predict') { require(a.step === 2 && !a.prediction, 'A prediction is already recorded or is not ready.'); return update({ prediction: { ...preparedCase, source: preparedSource(false, a.revision), answer: action.answer, reasoning: text.parse(action.reasoning) }, step: 3 }); }
 if (action.type === 'observe') { require(a.step === 3 && Boolean(a.prediction), 'Record a prediction before revealing the result.'); return update({ observed: true }); }
 if (action.type === 'hint') { require(a.step === 4 || a.step === 5, 'Hints are available while investigating the change.'); return update({ hints: Math.min(3, a.hints + 1) }); }
 if (action.type === 'fix') { require(a.step === 4 || a.step === 5, 'Observe the prepared case before changing it.'); return update({ fixed: action.fixed, checked: null, step: 4 }); }
 if (action.type === 'check') { require(a.step === 4 || a.step === 5, 'Observe and investigate before running mock checks.'); return update({ checked: checkCases(a.fixed).every(c => c.passed), step: 5 }); }
 if (action.type === 'reflect') {
  require(a.step === 5 && a.fixed && a.checked === true, 'Run the current mock checks successfully before reflecting.');
  const body = text.parse(action.text);
  return stateSchema.parse({ ...update({ reflection: body, step: 6 }), notes: [...state.notes, { id: a.id, title: 'Ownership: lesson reflection', body }] });
 }
 if (action.type === 'transfer') { require(a.step === 6 && !a.transfer, 'Complete the lesson before the independent question.'); return update({ transfer: { answer: action.answer, reasoning: text.parse(action.reasoning) } }); }
 return state;
}
export function restoreState(raw: string | null): { state: State; error?: string } {
 if (!raw) return { state: newState() };
 try { if (raw.length > 600_000) throw new Error('Record too large'); const parsed = JSON.parse(raw);
  // shortcut: early mock previews lacked recordId; derive it from their valid attempt, then save it explicitly.
  if (parsed?.version === 1 && parsed.recordId === undefined) parsed.recordId = parsed.attempt?.id;
  return { state: stateSchema.parse(parsed) }; }
 catch { return { state: newState(), error: 'Saved prototype data could not be read. It is preserved. Download a backup or reset only this prototype.' }; }
}
export class StorageFailure extends Error { constructor() { super('Your action is kept in this tab but could not be saved. Export the visible record before leaving, or retry saving.'); } }
export function recordAction(state: State, action: Action, storage: Pick<Storage, 'getItem' | 'setItem'>): { state: State; warning?: string } {
 const next = stateSchema.parse(transition(state, action));
 try { return { state: persistState(storage, next, state.serial) }; } catch (e) { if (e instanceof StorageFailure) return { state: next, warning: e.message }; throw e; }
}
export function persistState(storage: Pick<Storage, 'getItem' | 'setItem'>, state: State, expected: number): State {
 let raw: string | null;
 try { raw = storage.getItem(STORAGE_KEY); } catch { throw new StorageFailure(); }
 if (raw) {
  const existing = restoreState(raw);
  if (existing.error) throw new Error(existing.error);
  if (existing.state.serial !== expected || existing.state.recordId !== state.recordId) throw new Error('Progress changed in another tab. Reload before saving.');
 }
 else if (expected > 0) throw new Error('Progress was removed in another tab. Reload before saving.');
 const saved = stateSchema.parse({ ...state, serial: expected + 1 });
 const encoded = JSON.stringify(saved);
 if (encoded.length > 600_000) throw new Error('Prototype storage is full. Export your records before resetting.');
 try { storage.setItem(STORAGE_KEY, encoded); } catch { throw new StorageFailure(); }
 return saved;
}
export function exportNotes(state: State): string {
 const records = [state.attempt, ...state.history].filter(a => a.prediction).map(a => {
  const p = a.prediction!;
  return `### Prepared source r${a.revision}${a.revision !== state.revision ? ' (historical)' : ''}\n\nQuestion: ${p.question}\nInput: ${p.input}\nRule: ${p.rule}\n\nRecorded source:\n\n\`\`\`ts\n${p.source}\n\`\`\`\n\nPrediction: ${p.answer}\nReasoning: ${p.reasoning}\nObserved mock result: ${a.observed ? 'allowed' : 'not revealed'}\nOwnership condition selected: ${a.fixed}\nPrepared hints used: ${a.hints}\nMock checks: ${a.checked === null ? 'not run' : a.checked ? '3 prepared cases passed' : 'different-client case failed'}\n\nReflection: ${a.reflection || 'not recorded'}\nSeparate archived case: ${a.transfer ? a.transfer.answer + '\nReasoning: ' + a.transfer.reasoning : 'not recorded'}\n`;
 });
 return '# Vadhyar prototype learning record\n\nPrepared browser data; no real repository verification or mastery claim. No course permission, authorship, external assistance or human review is verified. Prepared explanations and proposed conditions were available; optional hint counts do not indicate an unaided attempt.\n\n' + state.notes.map(n => `## ${n.title}\n\n${n.body}\n`).join('\n') + '\n## Lesson records\n\n' + records.join('\n') + '\n## Separate prepared practice\n\n' + state.practice.map(p => `- ${practiceQuestions.find(q => q.id === p.question)?.title}: ${p.answer}\n  Reasoning: ${p.reasoning}\n`).join('\n');
}
