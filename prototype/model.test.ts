import { describe, expect, it } from 'vitest';
import { checkCases, exportNotes, newState, persistState, recordAction, restoreState, STORAGE_KEY, transition } from './src/model.js';
const ready = () => transition(transition(newState(), { type: 'confirm' }), { type: 'next' });
const predicted = () => transition(ready(), { type: 'predict', answer: 'block', reasoning: 'Only the owning client should approve.' });
describe('browser mock evidence', () => {
 it('discloses the different-client seed and evaluates the selected ownership fix', () => {
  expect(checkCases(false).find(c => c.id === 'other')).toMatchObject({ allowed: true, passed: false });
  expect(checkCases(true)).toHaveLength(3); expect(checkCases(true).every(c => c.passed)).toBe(true);
 });
 it('gates observation on a saved prediction and nonempty reasoning', () => {
  expect(() => transition(ready(), { type: 'observe' })).toThrow();
  expect(() => transition(ready(), { type: 'predict', answer: 'allow', reasoning: '' })).toThrow();
  const state = predicted(); expect(state.attempt.step).toBe(3); expect(state.attempt.prediction?.answer).toBe('block');
 });
 it('locks the exact case, rule and prepared source before any change', () => {
  const state = predicted();
  expect(state.attempt.prediction).toMatchObject({ input: 'Different client; active milestone', question: 'Will this saved code allow approval?', rule: 'Only the owning client may approve an active milestone.' });
  expect(state.attempt.prediction).toHaveProperty('source');
  expect((state.attempt.prediction as unknown as {source:string}).source).not.toContain('actor.id ===');
 });
 it('keeps the observation separate from the intended rule and permits a failed check before fixing', () => {
  const state = transition(transition(predicted(), { type: 'observe' }), { type: 'next' });
  const failed = transition(state, { type: 'check' }); expect(failed.attempt.checked).toBe(false);
  expect(() => transition(failed, { type: 'reflect', text: 'I tested the ownership condition.' })).toThrow();
  const fixed = transition(failed, { type: 'fix', fixed: true }); expect(fixed.attempt.checked).toBeNull();
  const checked = transition(fixed, { type: 'check' });
  const done = transition(checked, { type: 'reflect', text: 'A role is not enough; identity needs to match.' });
  expect(done.attempt.step).toBe(6); expect(done.notes).toHaveLength(1);
  expect(restoreState(JSON.stringify({ ...done, notes: [] })).error).toBeTruthy();
 });
 it('preserves the exact prediction and snapshot when a later change starts a fresh lesson', () => {
  const state = transition(predicted(), { type: 'changeProject' });
  expect(state.revision).toBe(2); expect(state.attempt.revision).toBe(1);
  expect(() => transition(state, { type: 'changeProject' })).toThrow(/already applied/);
  expect(() => transition(state, { type: 'observe' })).toThrow(/changed/);
  const fresh = transition(state, { type: 'newLesson' });
  expect(fresh.history[0].prediction?.reasoning).toContain('owning client'); expect(fresh.history[0].revision).toBe(1);
  expect(fresh.attempt.revision).toBe(2); expect(fresh.attempt.step).toBe(0);
 });
 it('restores valid records and retains corrupt-record information without overwriting it', () => {
  const state = predicted(); expect(restoreState(JSON.stringify(state)).state.attempt).toEqual(state.attempt);
  expect(restoreState('{bad').error).toBeTruthy();
  expect(restoreState(JSON.stringify({ ...state, attempt: { ...state.attempt, prediction: null } })).error).toBeTruthy();
 });
 it('detects conflicting tabs and never acknowledges a failed local write', () => {
  const data = new Map<string,string>(); const storage = { getItem: (key:string) => data.get(key) ?? null, setItem: (key:string,value:string) => { data.set(key,value); } };
  const saved = persistState(storage, predicted(), 0); expect(saved.serial).toBe(1);
  expect(() => persistState(storage, newState(), 0)).toThrow(/another tab/i);
  expect(JSON.parse(data.get(STORAGE_KEY)!).attempt.prediction.answer).toBe('block');
  expect(() => persistState({ getItem: () => null, setItem: () => { throw new Error('Quota exceeded'); } }, predicted(), 0)).toThrow(/could not be saved/);
 });
 it('exports recorded reflections and notes as plain Markdown', () => {
  const state = transition(newState(), { type: 'note', title: 'Permission rule', body: 'Check the owner identity, not just the role.' });
  expect(exportNotes(state)).toContain('Permission rule'); expect(exportNotes(state)).toContain('not just the role');
 });
 it('exports the prediction context and separate transfer answer for review', () => {
  const changed = transition(transition(transition(predicted(), { type: 'observe' }), { type: 'next' }), { type: 'fix', fixed: true });
  const reflected = transition(transition(changed, { type: 'check' }), { type: 'reflect', text: 'Role must be paired with ownership.' });
  const done = transition(reflected, { type: 'transfer', answer: 'block', reasoning: 'An archived milestone cannot be approved.' });
  expect(exportNotes(done)).toContain('Different client; active milestone');
  expect(exportNotes(done)).toContain('actor.role'); expect(exportNotes(done)).toContain('Separate archived case: block');
 });
 it('continues in memory on storage failure but never overwrites unreadable or conflicting records', () => {
  const storage = { getItem: () => null, setItem: () => { throw new Error('Quota'); } };
  const saved = recordAction(ready(), { type: 'predict', answer: 'allow', reasoning: 'The role alone passes the condition.' }, storage);
  expect(saved.state.attempt.prediction?.answer).toBe('allow'); expect(saved.warning).toMatch(/not.*saved/i); expect(saved.state.serial).toBe(0);
  const denied = recordAction(saved.state, { type: 'page', page: 'Project' }, { getItem: () => { throw new Error('Access denied'); }, setItem: () => {} });
  expect(denied.state.page).toBe('Project'); expect(denied.state.attempt.prediction?.answer).toBe('allow');
  const recovered = persistState({ getItem: () => null, setItem: () => {} }, denied.state, 0); expect(recovered.serial).toBe(1); expect(recovered.attempt.prediction?.answer).toBe('allow');
  expect(() => recordAction(ready(), { type: 'page', page: 'Project' }, { getItem: () => '{bad', setItem: () => {} })).toThrow(/preserved/);
  expect(() => recordAction(ready(), { type: 'page', page: 'Project' }, { getItem: () => JSON.stringify({ ...newState(), serial: 3 }), setItem: () => {} })).toThrow(/another tab/);
 });
 it('rejects a stale tab even when a reset record has the same serial', () => {
  const data = new Map<string,string>(); const storage = { getItem: (key:string) => data.get(key) ?? null, setItem: (key:string,value:string) => { data.set(key,value); } };
  const old = persistState(storage, predicted(), 0); data.clear();
  persistState(storage, transition(newState(), { type: 'note', title: 'New record', body: 'Keep this note after the reset.' }), 0);
  expect(() => persistState(storage, transition(old, { type: 'observe' }), old.serial)).toThrow(/another tab/);
  expect(JSON.parse(data.get(STORAGE_KEY)!).notes).toHaveLength(1);
 });
 it('rejects contradictory restored check evidence', () => {
  const checking = transition(transition(predicted(), { type: 'observe' }), { type: 'next' });
  const failed = transition(checking, { type: 'check' });
  expect(restoreState(JSON.stringify({ ...failed, attempt: { ...failed.attempt, checked: true } })).error).toBeTruthy();
  expect(restoreState(JSON.stringify({ ...failed, attempt: { ...failed.attempt, reflection: 'An invented early reflection.' } })).error).toBeTruthy();
  expect(restoreState(JSON.stringify({ ...predicted(), attempt: { ...predicted().attempt, step: 2 } })).error).toBeTruthy();
 });
 it('retains valid early-preview records while assigning a stable record identity', () => {
  const early = { ...predicted() } as Record<string,unknown>; delete early.recordId;
  const restored = restoreState(JSON.stringify(early)); expect(restored.error).toBeUndefined(); expect(restored.state.recordId).toBe(restored.state.attempt.id);
 });
});
