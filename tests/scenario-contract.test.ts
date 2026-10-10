import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(join(root, 'fixtures/novadesk/scenario.json'), 'utf8'));

describe('trusted ownership scenario', () => {
  it('pins its harness and identifies its requirement and three ordinary cases', () => {
    expect(manifest.caseIds).toEqual(['owner-client-active', 'other-client-active', 'freelancer-active']);
    for (const [path, hash] of Object.entries(manifest.trustedHashes)) {
      expect(createHash('sha256').update(readFileSync(join(root, path))).digest('hex')).toBe(hash);
    }
    expect(manifest.allowedSources).toEqual(['src/approval.ts']);
    expect(readFileSync(join(root, 'novadesk/vadhyar-requirement.md'), 'utf8')).toContain(manifest.requirementId);
  });

  it.each([
    ['seed', undefined, ['passed', 'failed', 'passed']],
    ['correct edit', 'return actor.role === "client" && actor.id === _milestone.ownerClientId;', ['passed', 'passed', 'passed']],
    ['deny-all edit', 'return false;', ['failed', 'passed', 'passed']],
  ])('distinguishes %s using the real fixed harness', (_name, edit, expected) => {
    const copy = mkdtempSync(join(tmpdir(), 'vadhyar-policy-'));
    try {
      cpSync(join(root, 'novadesk'), join(copy, 'novadesk'), { recursive: true });
      cpSync(join(root, 'fixtures'), join(copy, 'fixtures'), { recursive: true });
      if (edit) {
        const source = join(copy, 'novadesk/src/approval.ts');
        writeFileSync(source, readFileSync(source, 'utf8').replace('return actor.role === \'client\';', edit));
      }
      const report = join(copy, 'report.json');
      const run = spawnSync(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--config', join(copy, 'fixtures/novadesk/vitest.config.ts'), '--reporter=json', `--outputFile=${report}`], {
        cwd: root, env: { PATH: process.env.PATH, HOME: process.env.HOME }, timeout: 20_000, encoding: 'utf8',
      });
      expect(run.error).toBeUndefined();
      const result = JSON.parse(readFileSync(report, 'utf8'));
      const cases = result.testResults.flatMap((suite: { assertionResults: { title: string; status: string }[] }) => suite.assertionResults);
      expect(cases.map((item: { title: string }) => item.title)).toEqual(manifest.caseIds);
      expect(cases.map((item: { status: string }) => item.status)).toEqual(expected);
      expect(run.status).toBe(expected.includes('failed') ? 1 : 0);
    } finally {
      rmSync(copy, { recursive: true, force: true });
    }
  }, 30_000);
});
