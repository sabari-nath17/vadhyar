import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it, vi } from 'vitest';
import { clearNovaDeskSession, loadExplanation, loadSession, saveExplanation, saveSession } from '../src/extension/session.js';
import { hash } from '../src/extension/source.js';

it('clears only NovaDesk-owned data and leaves Project Guide and other stored files alone', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-clear-'));
  try {
    await saveSession(folder, await loadSession(folder));
    await writeFile(join(folder, 'gate-a.json'), 'recorded explanation');
    await mkdir(join(folder, 'graph-Ab1234/input'), { recursive: true });
    await writeFile(join(folder, 'graph-Ab1234/input/approval.ts'), 'owned scratch');
    await mkdir(join(folder, 'ownership-Ab1234/novadesk/src'), { recursive: true });
    await writeFile(join(folder, 'ownership-Ab1234/novadesk/src/approval.ts'), 'owned check source');
    await mkdir(join(folder, 'project-sources')); await writeFile(join(folder, 'project-sources/hash'), 'project source');
    await writeFile(join(folder, 'project.json'), 'project record');
    await writeFile(join(folder, 'other.txt'), 'unrelated');
    const trash = vi.fn(async (path: string) => { await rm(path, { recursive: true }); });
    await clearNovaDeskSession(folder, trash);
    expect(trash).toHaveBeenCalledOnce();
    expect((await loadSession(folder)).predictions).toEqual([]);
    expect((await readdir(folder)).sort()).toEqual(['other.txt', 'project-sources', 'project.json']);
    expect(await readFile(join(folder, 'project.json'), 'utf8')).toBe('project record');
    expect(await readFile(join(folder, 'project-sources/hash'), 'utf8')).toBe('project source');
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('retains primary records after partial native deletion and preserves interrupted recovery data', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-clear-partial-'));
  try {
    await saveSession(folder, await loadSession(folder));
    const previous = await readFile(join(folder, 'session.json'), 'utf8');
    await expect(clearNovaDeskSession(folder, async path => { await rm(join(path, 'session.json')); throw new Error('partial deletion'); })).rejects.toThrow(/not cleared/);
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(previous);
    await mkdir(join(folder, 'novadesk-clear-Ab1234'));
    await writeFile(join(folder, 'novadesk-clear-Ab1234/session.json'), previous);
    await rm(join(folder, 'session.json'));
    await expect(loadSession(folder)).rejects.toThrow(/interrupted/);
    await expect(clearNovaDeskSession(folder, vi.fn())).rejects.toThrow(/recovery/);
    expect(await readFile(join(folder, 'novadesk-clear-Ab1234/session.json'), 'utf8')).toBe(previous);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('restores the previous valid files when native removal fails', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-clear-fail-'));
  try {
    await saveSession(folder, await loadSession(folder));
    const previous = await readFile(join(folder, 'session.json'), 'utf8');
    await writeFile(join(folder, 'gate-a.json'), 'prior explanation');
    await expect(clearNovaDeskSession(folder, async () => { throw new Error('native removal failed'); })).rejects.toThrow(/not cleared/);
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(previous);
    expect(await readFile(join(folder, 'gate-a.json'), 'utf8')).toBe('prior explanation');
    expect((await readdir(folder)).sort()).toEqual(['gate-a.json', 'session.json']);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('never overwrites a later valid record during clear recovery', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-clear-race-'));
  try {
    await saveSession(folder, await loadSession(folder));
    const later = (await readFile(join(folder, 'session.json'), 'utf8')) + '\n';
    await expect(clearNovaDeskSession(folder, async () => {
      await writeFile(join(folder, 'session.json'), later);
      throw new Error('native deletion failed after another writer saved');
    })).rejects.toThrow(/Recovery records/);
    expect(await readFile(join(folder, 'session.json'), 'utf8')).toBe(later);
    expect((await loadSession(folder)).schemaVersion).toBe(2);
    const recovery = (await readdir(folder)).find(name => name.startsWith('novadesk-clear-'))!;
    expect(await readFile(join(folder, recovery, 'session.json'), 'utf8')).not.toBe(later);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('refuses a symlink or ambiguous scratch folder before moving any records', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-clear-boundary-'));
  try {
    await writeFile(join(folder, 'outside'), 'preserve outside');
    await symlink(join(folder, 'outside'), join(folder, 'session.json'));
    const remove = vi.fn();
    await expect(clearNovaDeskSession(folder, remove)).rejects.toThrow(/regular|symbolic|safely/);
    expect(remove).not.toHaveBeenCalled();
    expect(await readFile(join(folder, 'outside'), 'utf8')).toBe('preserve outside');
    await rm(join(folder, 'session.json'));
    await saveSession(folder, await loadSession(folder));
    await mkdir(join(folder, 'graph-Ab1234'));
    await expect(clearNovaDeskSession(folder, remove)).rejects.toThrow(/safely/);
    expect((await loadSession(folder)).schemaVersion).toBe(2);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

it('validates recorded explanations without accepting corrupt output or changing valid records after a failed save', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-recorded-explanation-'));
  const record = { capturedAt: new Date().toISOString(), requirementRevision: hash('requirement'), sourceHash: hash('source'), contextIdentity: hash('context'), graphIdentity: hash('graph'), graphifyVersion: '0.9.84', graphReferences: 1, graphRelationships: 0, responseId: 'synthetic-record', model: 'test', requestedModel: 'test', latencyMs: 0, explanation: { summary: 'Synthetic recorded explanation.', steps: [{ title: 'Inspect', text: 'Read the ownership decision.', sourceRefId: `approval-${hash('source')}` }] } };
  try {
    await saveExplanation(folder, record);
    expect(await loadExplanation(folder)).toEqual(record);
    const valid = await readFile(join(folder, 'gate-a.json'), 'utf8');
    await expect(saveExplanation(folder, { ...record, sourceHash: 'invalid' } as never)).rejects.toThrow();
    expect(await readFile(join(folder, 'gate-a.json'), 'utf8')).toBe(valid);
    await writeFile(join(folder, 'gate-a.json'), '{corrupt');
    await expect(loadExplanation(folder)).rejects.toThrow(/explanation/);
    expect(await readFile(join(folder, 'gate-a.json'), 'utf8')).toBe('{corrupt');
  } finally { await rm(folder, { recursive: true, force: true }); }
});
