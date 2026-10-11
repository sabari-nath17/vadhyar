import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { loadSession, saveSession } from '../src/extension/session.js';
import { hash } from '../src/extension/source.js';

it('migrates legacy records in memory without rewriting the session or adjacent evidence', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-migration-'));
  const at = new Date().toISOString(), text = 'Owner only.', revision = hash(text);
  const legacy = { schemaVersion: 1, activeImport: { path: 'spec.md', title: 'Imported ownership' }, requirements: [{ id: 'novadesk-approval-ownership', revision, text, confirmedAt: at }], checkpoints: [{ capturedAt: at, path: 'src/approval.ts', content: 'seed', hash: hash('seed'), requirementRevision: revision }], predictions: [{ id: randomUUID(), savedAt: at, predictedApproval: false, reasoning: 'Owner only.', sourceHash: hash('seed'), requirementRevision: revision }], activity: [] };
  const original = JSON.stringify(legacy);
  try {
    await writeFile(join(folder, 'session.json'), original);
    await writeFile(join(folder, 'gate-a.json'), 'gate evidence');
    await writeFile(join(folder, 'project.json'), 'project evidence');
    const migrated = await loadSession(folder);
    expect(migrated).toMatchObject({ ...legacy, schemaVersion: 2, learning: [] });
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(original);
    await saveSession(folder, migrated);
    expect((await loadSession(folder)).checkpoints).toEqual(legacy.checkpoints);
    expect(await readFile(join(folder, 'gate-a.json'), 'utf8')).toBe('gate evidence');
    expect(await readFile(join(folder, 'project.json'), 'utf8')).toBe('project evidence');
    const valid = await readFile(join(folder, 'session.json'), 'utf8');
    await expect(saveSession(folder, { ...migrated, schemaVersion: 99 } as never)).rejects.toThrow();
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(valid);
    await writeFile(join(folder, 'session-interrupted.tmp'), '{partial');
    expect(await loadSession(folder)).toEqual(migrated);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('rejects corrupt and unsupported stored records without erasing their recoverable bytes', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-corrupt-'));
  try {
    for (const invalid of ['{partial', JSON.stringify({ schemaVersion: 99, requirements: [], checkpoints: [] })]) {
      await writeFile(join(folder, 'session.json'), invalid);
      await expect(loadSession(folder)).rejects.toThrow();
      expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(invalid);
    }
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('round-trips an observed attempt, stage, baseline and reflection with validated identities', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-attempt-'));
  const at = new Date().toISOString(), text = 'Owner only.', revision = hash(text);
  const baseline = { content: 'seed', hash: hash('seed') };
  const prediction = { id: randomUUID(), savedAt: at, predictedApproval: false, reasoning: 'Owner only.', sourceHash: baseline.hash, requirementRevision: revision };
  const run = { id: randomUUID(), predictionId: prediction.id, sourceHash: baseline.hash, requirementRevision: revision, startedAt: at, finishedAt: at, latencyMs: 1, vitestVersion: '5.0.3', caseId: 'other-client-active', kind: 'completed', observedApproval: true, requirementPassed: false, exitCode: 1, executedCases: 1, skippedCases: 2 };
  const reflection = { id: randomUUID(), type: 'reflection', predictionId: prediction.id, recordedAt: at, sourceHash: baseline.hash, requirementRevision: revision, text: 'Role and owner are different checks.' };
  try {
    const record = { ...(await loadSession(folder)), requirements: [{ id: 'novadesk-approval-ownership', text, revision, confirmedAt: at }], predictions: [prediction], learning: [{ requirementRevision: revision, sourceHash: baseline.hash, stage: 'change', predictionId: prediction.id, baseline }], activity: [{ type: 'counterexample', run }, reflection] };
    await saveSession(folder, record as never);
    expect(await loadSession(folder)).toEqual(record);
    const saved = await readFile(join(folder, 'session.json'), 'utf8');
    await expect(saveSession(folder, { ...record, learning: [{ ...record.learning[0], baseline: { ...baseline, content: 'tampered' } }] } as never)).rejects.toThrow(/identity/);
    await expect(saveSession(folder, { ...record, activity: [{ type: 'counterexample', run: { ...run, requirementPassed: true } }] } as never)).rejects.toThrow(/outcome/);
    await expect(saveSession(folder, { ...record, activity: [{ ...reflection, requirementRevision: hash('other rule') }] } as never)).rejects.toThrow(/prediction/);
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(saved);
  } finally { await rm(folder, { recursive: true, force: true }); }
});
