import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { previewHint, validateHint } from '../src/extension/coach.js';
import { approvalReference, hash } from '../src/extension/source.js';
import type { Counterexample, Hint } from '../src/shared.js';

const content = await readFile('novadesk/src/approval.ts', 'utf8');
const source = { path: 'src/approval.ts', absolutePath: '/prepared/src/approval.ts', content, hash: hash(content) };
const text = await readFile('novadesk/vadhyar-requirement.md', 'utf8');
const requirement = { path: 'vadhyar-requirement.md', absolutePath: '/prepared/vadhyar-requirement.md', content: text, hash: hash(text) };
const refs = [approvalReference(source)];
const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: new Date().toISOString(), predictedApproval: false, reasoning: 'Owner only.', sourceHash: source.hash, requirementRevision: requirement.hash };
const observed: Counterexample = { id: 'cf52e02d-2a29-4169-a044-72b88b3950bf', predictionId: prediction.id, caseId: 'other-client-active', startedAt: prediction.savedAt, finishedAt: prediction.savedAt, latencyMs: 1, sourceHash: source.hash, requirementRevision: requirement.hash, vitestVersion: '5.0.3', kind: 'completed', observedApproval: true, requirementPassed: false, exitCode: 1, executedCases: 1, skippedCases: 2 };
const response = (value: unknown) => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] });

it('previews progressive hint context from the requirement, current source, prediction and observation', () => {
  const previous: Hint[] = [];
  for (let level = 1; level <= 3; level++) {
    const preview = previewHint('configured-model', requirement, source, refs, prediction, observed, previous);
    const payload = JSON.parse(preview.text);
    expect(payload.hintLevel).toBe(level);
    expect(payload.prediction.id).toBe(prediction.id);
    expect(payload.observedCounterexample.observedApproval).toBe(true);
    expect(payload.source.hash).toBe(source.hash);
    expect(preview.model).toBe('configured-model');
    expect(preview.text).not.toMatch(/ownership\.test|return actor\.role.*&&|reference solution/);
    previous.push({ level, text: 'Follow the supplied source and compare the observed inputs.', sourceRefId: refs[0].id });
  }
  expect(() => previewHint('configured-model', requirement, source, refs, prediction, observed, previous)).toThrow();
});

it('blocks missing/stale observations, invalid progression and secret-bearing reasoning', () => {
  expect(() => previewHint('model', requirement, source, refs, prediction, { ...observed, predictionId: 'other' }, [])).toThrow();
  expect(() => previewHint('model', { ...requirement, path: 'outside.md' }, source, refs, prediction, observed, [])).toThrow(/unsupported/);
  expect(() => previewHint('model', requirement, source, refs, prediction, { ...observed, kind: 'timeout', message: 'timeout' }, [])).toThrow();
  expect(() => previewHint('model', requirement, source, refs, { ...prediction, requirementRevision: 'a'.repeat(64) }, observed, [])).toThrow();
  expect(() => previewHint('model', requirement, source, refs, prediction, observed, [{ level: 2, text: 'Skipped level', sourceRefId: refs[0].id }])).toThrow();
  expect(() => previewHint('model', requirement, source, refs, { ...prediction, reasoning: 'sk-FAKEONLY12345678901234567890' }, observed, [])).toThrow(/secret/);
});

it('validates hint level/IDs and rejects code, extra executable fields, refusals and incomplete output', () => {
  const hint = { level: 1, text: 'What makes a client the owner of this particular milestone?', sourceRefId: refs[0].id };
  expect(validateHint(response(hint), refs, 1)).toEqual(hint);
  expect(() => validateHint(response(hint), refs, 2)).toThrow();
  expect(() => validateHint(response({ ...hint, sourceRefId: 'invented' }), refs, 1)).toThrow();
  expect(() => validateHint(response({ ...hint, text: "return actor.role === 'client' && actor.id === milestone.ownerClientId;" }), refs, 1)).toThrow();
  expect(() => validateHint(response({ ...hint, text: 'actor.role == "client" ? actor.id == _milestone.ownerClientId : false' }), refs, 1)).toThrow();
  expect(() => validateHint(response({ ...hint, patch: 'completed fix' }), refs, 1)).toThrow();
  expect(() => validateHint({ status: 'incomplete', output: [] }, refs, 1)).toThrow();
  expect(() => validateHint({ status: 'completed', output: [{ content: [{ type: 'refusal', text: 'no' }] }] }, refs, 1)).toThrow();
});
