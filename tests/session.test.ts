import { chmod, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { loadSession, saveSession, type Session } from '../src/extension/session.js';
import { hash } from '../src/extension/source.js';

it('round-trips exact snapshots and preserves the old record after a rejected or failed write', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-session-'));
  const text = 'Only its owning client may approve.';
  const source = 'export function canApproveMilestone() { return true; }\n';
  const record: Session = { schemaVersion: 1, requirements: [{ id: 'novadesk-approval-ownership', revision: hash(text), text, confirmedAt: new Date().toISOString() }], checkpoints: [{ capturedAt: new Date().toISOString(), path: 'src/approval.ts', content: source, hash: hash(source), requirementRevision: hash(text) }] };
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
