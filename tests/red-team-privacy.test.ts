import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { captureProject, newIntent, privateText } from '../src/project/model.js';
import { previewContext, previewHint } from '../src/extension/coach.js';
import { approvalReference, hash } from '../src/extension/source.js';
import type { Counterexample } from '../src/shared.js';

// All values are synthetic fixtures, never credentials.
const content = await readFile('novadesk/src/approval.ts', 'utf8');
const source = { path: 'src/approval.ts', absolutePath: '/synthetic/src/approval.ts', content, hash: hash(content) };
const text = await readFile('novadesk/vadhyar-requirement.md', 'utf8');
const requirement = { path: 'vadhyar-requirement.md', absolutePath: '/synthetic/vadhyar-requirement.md', content: text, hash: hash(text) };
const refs = [approvalReference(source)];

it.each(['apiKey', 'secret', 'password', 'token'])('rejects quoted %s fields before and after context serialization', key => {
  const data = JSON.stringify({ [key]: 'fixture-only-not-a-credential' });
  expect(privateText.test(data)).toBe(true);
  expect(privateText.test(JSON.stringify({ reasoning: data }))).toBe(true);
});

it('omits a configuration file with a quoted private field and rejects it as an intention', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-red-team-private-'));
  const data = JSON.stringify({ password: 'fixture-only-not-a-credential' });
  try {
    await writeFile(join(folder, 'config.json'), data);
    const snapshot = await captureProject(folder);
    expect(snapshot.files).toEqual([]);
    expect(snapshot.omitted).toEqual(['config.json']);
    expect(() => newIntent({ title: 'Configuration', request: data, expected: 'Keep credentials local', origin: 'manual' })).toThrow(/secret/i);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('blocks quoted private content in prepared source before creating an API preview', () => {
  const content = source.content + '\n// {"password":"fixture-only-not-a-credential"}';
  const changed = { ...source, content, hash: hash(content) };
  expect(() => previewContext('fixture-model', requirement, changed, { sourceHash: changed.hash, refs: [approvalReference(changed)], relationships: [] })).toThrow(/secret/i);
});

it('blocks an escaped quoted private field in prediction reasoning before a hint preview', () => {
  const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: '2026-10-11T00:00:00Z', predictedApproval: true, reasoning: '{"token":"fixture-only-not-a-credential"}', sourceHash: source.hash, requirementRevision: requirement.hash };
  const observed: Counterexample = { id: 'cf52e02d-2a29-4169-a044-72b88b3950bf', predictionId: prediction.id, caseId: 'other-client-active', startedAt: prediction.savedAt, finishedAt: prediction.savedAt, latencyMs: 1, sourceHash: source.hash, requirementRevision: requirement.hash, vitestVersion: '5.0.3', kind: 'completed', observedApproval: true, requirementPassed: false, exitCode: 1, executedCases: 1, skippedCases: 2 };
  expect(() => previewHint('fixture-model', requirement, source, refs, prediction, observed, [])).toThrow(/secret/i);
});

it('keeps ordinary references and numeric token counts available', () => {
  expect(privateText.test('const token = readToken();')).toBe(false);
  expect(privateText.test(JSON.stringify({ totalTokens: 12, token: 12, message: 'Keep tokens private.' }))).toBe(false);
});
