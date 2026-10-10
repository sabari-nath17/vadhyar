import { randomUUID } from 'node:crypto';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { loadSession, saveSession, type Session } from '../src/extension/session.js';
import { hash } from '../src/extension/source.js';

it('round-trips exact snapshots and preserves the old record after a rejected or failed write', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-session-'));
  const text = 'Only its owning client may approve.';
  const source = 'export function canApproveMilestone() { return true; }\n';
  const record: Session = { schemaVersion: 2, learning: [], requirements: [{ id: 'novadesk-approval-ownership', revision: hash(text), text, confirmedAt: new Date().toISOString() }], checkpoints: [{ capturedAt: new Date().toISOString(), path: 'src/approval.ts', content: source, hash: hash(source), requirementRevision: hash(text) }], predictions: [], activity: [] };
  try {
    await saveSession(folder, record);
    expect(await loadSession(folder)).toEqual(record);
    const original = await readFile(join(folder, 'session.json'), 'utf8');
    await expect(saveSession(folder, { ...record, checkpoints: [{ ...record.checkpoints[0], hash: 'corrupt' }] })).rejects.toThrow();
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(original);
    const before = { content: 'b'.repeat(20_000), hash: hash('b'.repeat(20_000)) };
    const after = { content: 'a'.repeat(20_000), hash: hash('a'.repeat(20_000)) };
    const prediction = { id: randomUUID(), savedAt: new Date().toISOString(), predictedApproval: false, reasoning: 'Owner only.', sourceHash: before.hash, requirementRevision: hash(text) };
    const activity = Array.from({ length: 30 }, () => ({ type: 'diff' as const, id: randomUUID(), predictionId: prediction.id, recordedAt: prediction.savedAt, sourceHash: after.hash, requirementRevision: hash(text), before, after }));
    await expect(saveSession(folder, { ...record, predictions: [prediction], activity })).rejects.toThrow(/size/);
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(original);
    await chmod(folder, 0o500);
    await expect(saveSession(folder, record)).rejects.toThrow();
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(original);
  } finally { await chmod(folder, 0o700); await rm(folder, { recursive: true, force: true }); }
});

it('records actual hint use, exact native-diff snapshots and a correlated full ownership result', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-activity-'));
  const at = new Date().toISOString();
  const text = 'Owner only.';
  const before = { content: 'before', hash: hash('before') };
  const after = { content: 'after', hash: hash('after') };
  const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: at, predictedApproval: false, reasoning: 'Owner only.', sourceHash: before.hash, requirementRevision: hash(text) };
  const diff = { type: 'diff' as const, id: 'cf52e02d-2a29-4169-a044-72b88b3950bf', predictionId: prediction.id, recordedAt: at, sourceHash: after.hash, requirementRevision: hash(text), before, after };
  const record: Session = { schemaVersion: 2, learning: [], requirements: [{ id: 'novadesk-approval-ownership', revision: hash(text), text, confirmedAt: at }], checkpoints: [], predictions: [prediction], activity: [
    { type: 'hint', id: '539e5cab-f890-46a4-aa6f-a4268676074d', predictionId: prediction.id, recordedAt: at, sourceHash: before.hash, requirementRevision: hash(text), counterexampleId: 'bab1e214-aa7e-4c3c-b12a-f88bb7629264', contextIdentity: hash('context'), result: { responseId: 'test-parser-response', model: 'configured', requestedModel: 'configured', latencyMs: 1, hint: { level: 1, text: 'How does this identify the owner?', sourceRefId: `approval-${before.hash}` } } },
    diff,
    { type: 'ownership', diffId: diff.id, run: { id: '326264fb-f054-4153-a8c4-c0667f980420', predictionId: prediction.id, sourceHash: after.hash, requirementRevision: hash(text), baselineHash: before.hash, suiteId: 'ownership', startedAt: at, finishedAt: at, latencyMs: 1, vitestVersion: '5.0.3', kind: 'completed', cases: [ { id: 'owner-client-active', expectedApproval: true, observedApproval: true, status: 'passed' }, { id: 'other-client-active', expectedApproval: false, observedApproval: false, status: 'passed' }, { id: 'freelancer-active', expectedApproval: false, observedApproval: false, status: 'passed' } ], requirementPassed: true, exitCode: 0 } },
  ] };
  try {
    await saveSession(folder, record);
    expect(await loadSession(folder)).toEqual(record);
    const saved = await readFile(join(folder, 'session.json'), 'utf8');
    await expect(saveSession(folder, { ...record, activity: [{ ...diff, before: { ...before, hash: after.hash } }] })).rejects.toThrow(/diff/);
    await expect(saveSession(folder, { ...record, activity: record.activity.slice(2) })).rejects.toThrow(/diff/);
    const runEvent = record.activity[2];
    if (runEvent.type !== 'ownership' || runEvent.run.kind !== 'completed') throw new Error('Test record is incomplete.');
    await expect(saveSession(folder, { ...record, activity: [diff, { ...runEvent, run: { ...runEvent.run, requirementPassed: false } }] })).rejects.toThrow(/outcome/);
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(saved);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('saves a prediction before execution while preserving existing checkpoint records', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-prediction-'));
  const text = 'Only its owning client may approve.';
  const requirement = { id: 'novadesk-approval-ownership' as const, revision: hash(text), text, confirmedAt: new Date().toISOString() };
  const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: new Date().toISOString(), predictedApproval: false, reasoning: 'Only the owner may approve.', sourceHash: hash('source'), requirementRevision: requirement.revision };
  try {
    await writeFile(join(folder, 'session.json'), JSON.stringify({ schemaVersion: 1, requirements: [requirement], checkpoints: [] }));
    const old = await loadSession(folder);
    await saveSession(folder, { ...old, predictions: [prediction] });
    expect((await loadSession(folder)).predictions).toEqual([prediction]);
    const saved = await readFile(join(folder, 'session.json'), 'utf8');
    await expect(saveSession(folder, { ...old, predictions: [{ ...prediction, requirementRevision: 'b'.repeat(64) }] })).rejects.toThrow();
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(saved);
  } finally { await rm(folder, { recursive: true, force: true }); }
});
