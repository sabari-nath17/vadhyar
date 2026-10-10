import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPrepared, approvalReference, resolveReference } from '../src/extension/source.js';
import { panelAction } from '../src/shared.js';

describe('host source boundary', () => {
  it('rejects arbitrary message fields and executable paths', () => {
    expect(panelAction.safeParse({ type: 'openSource', id: 'approval', path: '/etc/passwd' }).success).toBe(false);
    expect(panelAction.safeParse({ type: 'exec', command: 'whoami' }).success).toBe(false);
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
