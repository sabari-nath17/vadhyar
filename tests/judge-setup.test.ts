import { Buffer } from 'node:buffer';
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

const { freshDestination, validatePrerequisites, validateSeedRunner, verifyArchive } = await import(new URL('../scripts/setup-judge.mjs', import.meta.url).href);
const supported = { platform: 'darwin', arch: 'arm64', node: 'v26.7.0', python: 'Python 3.13.15', vscode: '1.140.0' };

it('rejects unverified platforms and missing minimum prerequisites before installation', () => {
  expect(validatePrerequisites(supported)).toEqual(supported);
  for (const node of ['v22.22.0', 'v24.0.0', 'v26.0.0']) expect(() => validatePrerequisites({ ...supported, node })).not.toThrow();
  for (const changes of [{ platform: 'win32' }, { platform: 'linux' }, { arch: 'x64' }, { node: 'v20.0.0' }, { node: 'v22.21.0' }, { node: 'v23.0.0' }, { node: 'v25.0.0' }, { python: 'Python 3.9.1' }, { python: 'unknown' }, { vscode: '1.139.0' }]) expect(() => validatePrerequisites({ ...supported, ...changes })).toThrow();
});

it('refuses existing destinations and symlinks without altering saved data', async () => {
  const base = await mkdtemp(join(tmpdir(), 'vadhyar-judge-test-'));
  try {
    const saved = join(base, 'saved.txt'); await writeFile(saved, 'learner evidence');
    const link = join(base, 'link'); await symlink(base, link);
    await expect(freshDestination(base)).rejects.toThrow();
    await expect(freshDestination(saved)).rejects.toThrow();
    await expect(freshDestination(link)).rejects.toThrow();
    await expect(freshDestination('relative')).rejects.toThrow();
    expect(await readFile(saved, 'utf8')).toBe('learner evidence');
    await freshDestination(join(base, 'new'));
  } finally { await rm(base, { recursive: true, force: true }); }
});

it('rejects incomplete or changed installer bytes', () => {
  expect(() => verifyArchive(Buffer.from('wrong download'))).toThrow(/checksum/);
  expect(() => verifyArchive(Buffer.alloc(35501049))).toThrow(/checksum/);
});

it('recognizes the disclosed seed failure without claiming a passing requirement', () => {
  const assertions = [{ title: 'owner-client-active', status: 'passed', meta: { approval: true } }, { title: 'other-client-active', status: 'failed', meta: { approval: true } }, { title: 'freelancer-active', status: 'passed', meta: { approval: false } }];
  const report = { testResults: [{ assertionResults: assertions }] };
  expect(validateSeedRunner(report, 1)[1]).toEqual({ caseId: 'other-client-active', status: 'failed', actual: true });
  expect(() => validateSeedRunner(report, 0)).toThrow();
  expect(() => validateSeedRunner({}, 1)).toThrow();
  expect(() => validateSeedRunner({ testResults: [{ assertionResults: assertions.map(item => ({ ...item, status: 'passed' })) }] }, 1)).toThrow();
});
