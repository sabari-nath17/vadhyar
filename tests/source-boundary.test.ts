import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPrepared, approvalReference, withApprovalReference, resolveReference } from '../src/extension/source.js';
import { panelAction } from '../src/shared.js';

describe('host source boundary', () => {
  it('retains current graph links when refreshing or adding a hint reference, without duplicates or stale links', () => {
    const source = { path: 'src/approval.ts', absolutePath: '/prepared/src/approval.ts', content: 'export function canApproveMilestone() { return false; }', hash: 'a'.repeat(64) };
    const graph = { ...approvalReference(source), id: 'graph-current' };
    const stale = { ...graph, id: 'graph-old', hash: 'b'.repeat(64) };
    const refs = withApprovalReference([graph, stale], source);
    expect(refs.map(ref => ref.id)).toEqual([graph.id, approvalReference(source).id]);
    expect(withApprovalReference(refs, source)).toEqual(refs);
    expect(resolveReference(refs, graph.id, source)).toEqual(graph);
  });
  it('rejects arbitrary message fields and executable paths', () => {
    expect(panelAction.safeParse({ type: 'openSource', id: 'approval', path: '/etc/passwd' }).success).toBe(false);
    expect(panelAction.safeParse({ type: 'exec', command: 'whoami' }).success).toBe(false);
    const prediction = { type: 'savePrediction', predictedApproval: false, reasoning: 'Only the owner may approve.', sourceHash: 'a'.repeat(64), requirementRevision: 'b'.repeat(64) };
    expect(panelAction.safeParse(prediction).success).toBe(true);
    expect(panelAction.safeParse({ ...prediction, reasoning: ' ' }).success).toBe(false);
    expect(panelAction.safeParse({ ...prediction, expected: true }).success).toBe(false);
    const run = { type: 'runCounterexample', predictionId: '526f0aad-37ef-4fa4-82a8-cd6c56a35542' };
    expect(panelAction.safeParse(run).success).toBe(true);
    expect(panelAction.safeParse({ ...run, command: 'whoami' }).success).toBe(false);
    expect(panelAction.safeParse({ ...run, caseId: 'owner-client-active' }).success).toBe(false);
    for (const type of ['previewHint', 'openDiff', 'runOwnership']) {
      expect(panelAction.safeParse({ type }).success).toBe(true);
      expect(panelAction.safeParse({ type, command: 'whoami' }).success).toBe(false);
      expect(panelAction.safeParse({ type, cases: [] }).success).toBe(false);
      expect(panelAction.safeParse({ type, patch: 'replacement' }).success).toBe(false);
    }
    expect(panelAction.safeParse({ type: 'hint', identity: 'a'.repeat(64) }).success).toBe(true);
    expect(panelAction.safeParse({ type: 'hint', identity: 'a'.repeat(64), model: 'unpreviewed' }).success).toBe(false);
  });
  it('opens only a current, bounded host reference and rejects escaping symlinks', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'vadhyar-source-'));
    try {
      const root = join(folder, 'novadesk'); await mkdir(join(root, 'src'), { recursive: true });
      const code = 'export function canApproveMilestone() {\n  return true;\n}\n';
      await writeFile(join(root, 'src/approval.ts'), code);
      const source = await readPrepared(root, 'src/approval.ts');
      const ref = approvalReference(source);
      expect(resolveReference([ref], ref.id, source)).toEqual(ref);
      expect(() => resolveReference([ref], 'invented', source)).toThrow();
      expect(() => resolveReference([{ ...ref, endLine: 500 }], ref.id, source)).toThrow();
      await writeFile(join(root, 'src/approval.ts'), code.replace('true', 'false'));
      expect(() => resolveReference([ref], ref.id, { ...source, hash: 'changed' })).toThrow(/stale/);
      await expect(readPrepared(root, '../outside.ts')).rejects.toThrow();
      await writeFile(join(folder, 'outside.ts'), code);
      await rm(join(root, 'src/approval.ts'));
      await symlink(join(folder, 'outside.ts'), join(root, 'src/approval.ts'));
      await expect(readPrepared(root, 'src/approval.ts')).rejects.toThrow(/boundary/);
    } finally { await rm(folder, { recursive: true, force: true }); }
  });
});
