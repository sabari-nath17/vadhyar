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
  const record: Session = { schemaVersion: 1, requirements: [{ id: 'novadesk-approval-ownership', revision: hash(text), text, confirmedAt: new Date().toISOString() }], checkpoints: [{ capturedAt: new Date().toISOString(), path: 'src/approval.ts', content: source, hash: hash(source), requirementRevision: hash(text) }], predictions: [] };
  try {
    await saveSession(folder, record);
    expect(await loadSession(folder)).toEqual(record);
    const original = await readFile(join(folder, 'session.json'), 'utf8');
    await expect(saveSession(folder, { ...record, checkpoints: [{ ...record.checkpoints[0], hash: 'corrupt' }] })).rejects.toThrow();
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(original);
    await chmod(folder, 0o500);
    await expect(saveSession(folder, record)).rejects.toThrow();
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(original);
  } finally { await chmod(folder, 0o700); await rm(folder, { recursive: true, force: true }); }
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
