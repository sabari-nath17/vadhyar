import { describe, expect, it } from 'vitest';
import { checkReceiptBuffer } from './src/check-receipt.js';
import { newProjectState, recordProjectAction, projectTransition, type ProjectState, type TeachingExplanation } from './src/project-learning.js';
import { activityPoints } from './src/activity.js';
import type { ProjectRun, SourceSnapshot } from './src/project-types.js';

const source: SourceSnapshot = { projectId: 'a'.repeat(64), fileId: 'b'.repeat(64), path: 'rule.js', language: 'JavaScript', sourceHash: 'c'.repeat(64), startLine: 1, endLine: 1, text: 'export const allowed = count => count > 0;', fileBytes: 42, truncated: false, capturedAt: '2026-10-14T00:00:00.000Z' };
function starting(): ProjectState {
 let s = projectTransition(newProjectState(source.projectId), { type: 'start', source, requirement: 'A positive count must allow the operation.', caseInput: 'The count is a positive integer.' });
 s = projectTransition(s, { type: 'predict', text: 'The operation is allowed.', reasoning: 'The condition requires a positive count.' });
 s = projectTransition(s, { type: 'observe', source, text: 'I observed the operation allowed for this one input.' });
 s = projectTransition(s, { type: 'refresh', source });
 return projectTransition(s, { type: 'beginCheck', attemptId: s.attempt!.id, operationId: crypto.randomUUID(), fileId: source.fileId, sourceHash: source.sourceHash, scriptId: 'test', manifestHash: 'd'.repeat(64) });
}
const receipt = (status: 'running' | 'passed', output = ''): ProjectRun => ({ id: crypto.randomUUID(), projectId: source.projectId, fileId: source.fileId, scriptId: 'test', sourceHash: source.sourceHash, manifestHash: 'd'.repeat(64), status, output, exitCode: status === 'running' ? null : 0, freshness: status === 'running' ? 'unknown' : 'current', startedAt: '2026-10-14T00:00:00.000Z', finishedAt: status === 'running' ? null : '2026-10-14T00:00:01.000Z' });
function nearCapacity(state: ProjectState) {
 const s = structuredClone(state);
 s.history = Array.from({ length: 20 }, () => ({ ...structuredClone(s.attempt!), id: crypto.randomUUID(), pendingCheck: null, checkResult: null }));
 const teaching = (large: boolean): TeachingExplanation => ({ fileId: source.fileId, sourceHash: source.sourceHash, path: source.path, startLine: 1, endLine: 1, model: 'fixture-model', generatedAt: source.capturedAt, explanation: { summary: 's'.repeat(6000), conditions: Array.from({ length: large ? 20 : 1 }, () => ({ startLine: 1, endLine: 1, explanation: 'c'.repeat(3000) })), questions: [], limits: ['l'.repeat(2000)] } });
 const append = (value: TeachingExplanation) => {
  const a = s.history.find(a => a.teaching.length < 5)!; a.teaching.push(value);
  if (JSON.stringify(s).length > 2_998_000) { a.teaching.pop(); return false; }
  return true;
 };
 while (append(teaching(true))) { /* Fill only valid bounded fixture interpretations. */ }
 while (JSON.stringify(s).length < 2_978_000 && append(teaching(false))) { /* Keep room for the pre-run pointer, but not a full receipt. */ }
 const length = JSON.stringify(s).length;
 expect(length).toBeGreaterThan(2_976_000); expect(length).toBeLessThan(3_000_000);
 return s;
}
function storage(s: ProjectState) {
 let raw = JSON.stringify(s); let writes = 0;
 return { getItem: () => raw, setItem: (_key: string, value: string) => { raw = value; writes++; }, raw: () => raw, writes: () => writes };
}

describe('refused receipts remain separately recoverable without advancing the record', () => {
 it('buffers the accepted job and full output when the actual record cap refuses attachment', () => {
  const s = nearCapacity(starting()), st = storage(s), before = st.raw(), points = activityPoints(s), run = receipt('running', 'r'.repeat(24_000));
  const p = s.attempt!.pendingCheck!, action = { type: 'acceptCheck' as const, attemptId: s.attempt!.id, operationId: p.operationId, run };
  expect(() => recordProjectAction(s, action, st)).toThrow(/storage is full/);
  const held = checkReceiptBuffer(s.attempt!, p.operationId, run);
  expect(held.run.id).toBe(run.id); expect(held.run.output).toHaveLength(24_000);
  expect(JSON.parse(JSON.stringify(held)).run).toEqual(run);
  expect(s.attempt!.pendingCheck!.id).toBeNull(); expect(s.attempt!.checkResult).toBeNull();
  expect(st.raw()).toBe(before); expect(st.writes()).toBe(0); expect(activityPoints(s)).toBe(points);
 });
 it('buffers the terminal polling output when the actual record cap refuses the update', () => {
  const start = starting(), run = receipt('running');
  const s = nearCapacity(projectTransition(start, { type: 'acceptCheck', attemptId: start.attempt!.id, operationId: start.attempt!.pendingCheck!.operationId, run }));
  const st = storage(s), before = st.raw(), points = activityPoints(s), terminal = { ...receipt('passed', 't'.repeat(24_000)), id: run.id };
  const action = { type: 'updateCheck' as const, attemptId: s.attempt!.id, operationId: s.attempt!.pendingCheck!.operationId, run: terminal };
  expect(() => recordProjectAction(s, action, st)).toThrow(/storage is full/);
  const held = checkReceiptBuffer(s.attempt!, action.operationId, terminal);
  expect(held.run.status).toBe('passed'); expect(held.run.output).toBe(terminal.output);
  expect(s.attempt!.checkResult!.status).toBe('running');
  expect(st.raw()).toBe(before); expect(st.writes()).toBe(0); expect(activityPoints(s)).toBe(points);
 });
 it.each(['acceptCheck', 'updateCheck'] as const)('keeps %s conflicts distinct from accepted local progress', type => {
  const start = starting(), running = receipt('running');
  const s = type === 'acceptCheck' ? start : projectTransition(start, { type: 'acceptCheck', attemptId: start.attempt!.id, operationId: start.attempt!.pendingCheck!.operationId, run: running });
  const run = type === 'acceptCheck' ? running : { ...receipt('passed', 'terminal result'), id: running.id };
  const st = storage({ ...s, serial: s.serial + 1 }), before = st.raw(), stateBefore = JSON.stringify(s), points = activityPoints(s);
  const action = { type, attemptId: s.attempt!.id, operationId: s.attempt!.pendingCheck!.operationId, run };
  expect(() => recordProjectAction(s, action, st)).toThrow(/another tab/);
  expect(checkReceiptBuffer(s.attempt!, action.operationId, run).run).toEqual(run);
  expect(st.raw()).toBe(before); expect(st.writes()).toBe(0); expect(JSON.stringify(s)).toBe(stateBefore); expect(activityPoints(s)).toBe(points);
 });
 it('buffers a refused fresh unknown-scope read without replacing the earlier saved current receipt', () => {
  const start = starting(), old = receipt('passed', 'earlier result');
  const s = projectTransition(start, { type: 'acceptCheck', attemptId: start.attempt!.id, operationId: start.attempt!.pendingCheck!.operationId, run: old });
  const st = storage({ ...s, serial: s.serial + 1 }), before = st.raw(), fresh = { ...old, freshness: 'unknown' as const };
  const action = { type: 'updateCheck' as const, attemptId: s.attempt!.id, operationId: s.attempt!.pendingCheck!.operationId, run: fresh };
  expect(() => recordProjectAction(s, action, st)).toThrow(/another tab/);
  expect(checkReceiptBuffer(s.attempt!, action.operationId, fresh).run.freshness).toBe('unknown');
  expect(s.attempt!.checkResult!.freshness).toBe('current'); expect(st.raw()).toBe(before); expect(st.writes()).toBe(0);
 });
 it('retains the established memory-only contract for a genuine storage write failure', () => {
  const s = starting(), st = storage(s), before = st.raw(), run = receipt('running');
  const result = recordProjectAction(s, { type: 'acceptCheck', attemptId: s.attempt!.id, operationId: s.attempt!.pendingCheck!.operationId, run }, { getItem: st.getItem, setItem: () => { throw new Error('quota'); } });
  expect(result.warning).toMatch(/could not be saved/); expect(result.state.attempt!.checkResult).toEqual(run);
  expect(result.state.attempt!.pendingCheck!.id).toBe(run.id); expect(st.raw()).toBe(before); expect(activityPoints(result.state)).toBe(activityPoints(s));
 });
 it('refuses wrong operations/sources and contradictory results before exposing a buffer', () => {
  const s = starting(), run = receipt('running'), p = s.attempt!.pendingCheck!;
  expect(() => checkReceiptBuffer(s.attempt!, crypto.randomUUID(), run)).toThrow(/match/);
  expect(() => checkReceiptBuffer(s.attempt!, p.operationId, { ...run, sourceHash: 'f'.repeat(64) })).toThrow(/match/);
  expect(() => checkReceiptBuffer(s.attempt!, p.operationId, { ...receipt('passed'), exitCode: 2 })).toThrow(/match/);
 });
});
