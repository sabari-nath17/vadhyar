import { readFile } from 'node:fs/promises';
import { afterEach, expect, it, vi } from 'vitest';
import { explain, previewContext, previewHint, requestHint, validateExplanation, validateHint } from '../src/extension/coach.js';
import { approvalReference, hash } from '../src/extension/source.js';
import type { Counterexample } from '../src/shared.js';

const content = await readFile('novadesk/src/approval.ts', 'utf8');
const source = { path: 'src/approval.ts', absolutePath: '/synthetic/src/approval.ts', content, hash: hash(content) };
const text = await readFile('novadesk/vadhyar-requirement.md', 'utf8');
const requirement = { path: 'vadhyar-requirement.md', absolutePath: '/synthetic/vadhyar-requirement.md', content: text, hash: hash(text) };
const refs = [approvalReference(source)];
const preview = previewContext('fixture-model', requirement, source, { sourceHash: source.hash, refs, relationships: [] });
const explanation = { summary: 'The decision currently checks role.', steps: [{ title: 'Decision', text: 'Inspect the current permission decision.', sourceRefId: refs[0].id }] };
const envelope = (value: unknown) => ({ id: 'synthetic-response', model: 'fixture-model', status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] });
afterEach(() => vi.unstubAllGlobals());

it('rejects unsupported positive verification claims while accepting a clear evidence limitation', () => {
  expect(() => validateExplanation(envelope({ ...explanation, summary: 'All tests passed. The feature is verified.' }), refs)).toThrow();
  expect(() => validateHint(envelope({ level: 1, text: 'All checks have passed. You have mastered this code.', sourceRefId: refs[0].id }), refs, 1)).toThrow();
  expect(validateExplanation(envelope({ ...explanation, summary: 'Source alone cannot establish whether the checks pass.' }), refs).summary).toMatch(/cannot establish/);
});

it('grounds progressive transfer guidance in the disclosed lifecycle challenge, without a completed fix', async () => {
  const transferText = await readFile('fixtures/novadesk/transfer.md', 'utf8');
  const req = { ...requirement, path: 'vadhyar-transfer.md', content: transferText, hash: hash(transferText) };
  const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: '2026-10-11T00:00:00Z', predictedApproval: true, reasoning: 'Trace the current source.', sourceHash: source.hash, requirementRevision: req.hash, caseId: 'owner-client-archived' as const };
  const observed: Counterexample = { id: 'cf52e02d-2a29-4169-a044-72b88b3950bf', predictionId: prediction.id, caseId: prediction.caseId, startedAt: prediction.savedAt, finishedAt: prediction.savedAt, latencyMs: 1, sourceHash: source.hash, requirementRevision: req.hash, vitestVersion: '5.0.3', kind: 'completed', observedApproval: true, requirementPassed: false, exitCode: 1, executedCases: 1, skippedCases: 3 };
  const hint = previewHint('fixture-model', req, source, refs, prediction, observed, []);
  expect(hint.instruction).toMatch(/lifecycle/i);
  expect(hint.instruction).not.toContain('withheld archived-task solution');
  expect(JSON.parse(hint.text).observedCounterexample.caseId).toBe(prediction.caseId);
  expect(() => previewHint('fixture-model', req, source, refs, prediction, { ...observed, caseId: 'other-client-active' }, [])).toThrow();
});

it('rejects malformed completed-response metadata before publishing coaching output', async () => {
  for (const value of [{ ...envelope(explanation), id: '' }, { ...envelope(explanation), model: undefined }, { ...envelope(explanation), usage: { input_tokens: -1, output_tokens: 2, total_tokens: 1 } }]) {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } })));
    await expect(explain('synthetic-not-a-credential', preview, refs, new AbortController().signal)).rejects.toThrow(/metadata|malformed/i);
  }
});

it.each([401, 403, 429, 503])('keeps HTTP %s as a sanitized execution error with no automatic retry', async status => {
  const fetch = vi.fn(async () => new Response(JSON.stringify({ error: { message: 'private-request-data', type: 'synthetic_failure' } }), { status, headers: { 'content-type': 'application/json' } }));
  vi.stubGlobal('fetch', fetch);
  await expect(explain('synthetic-not-a-credential', preview, refs, new AbortController().signal)).rejects.toThrow(`HTTP ${status}`);
  expect(fetch).toHaveBeenCalledTimes(1);
  await expect(requestHint('synthetic-not-a-credential', preview, refs, 1, new AbortController().signal)).rejects.toThrow(`HTTP ${status}`);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('keeps cancellation, connection failure and malformed JSON as errors, never accepted explanations', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('private-request-data'); }));
  await expect(explain('synthetic-not-a-credential', preview, refs, new AbortController().signal)).rejects.toThrow('OpenAI connection failed or timed out; retry explicitly.');
  const cancelled = new AbortController(); cancelled.abort();
  await expect(explain('synthetic-not-a-credential', preview, refs, cancelled.signal)).rejects.toThrow(/cancelled/);
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ...envelope(explanation), output: [{ type: 'message', content: [{ type: 'output_text', text: '{invalid' }] }] }), { headers: { 'content-type': 'application/json' } })));
  await expect(explain('synthetic-not-a-credential', preview, refs, new AbortController().signal)).rejects.toThrow(/malformed/);
});
