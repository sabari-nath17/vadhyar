import { cp, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';
import { runOwnership, validateOwnershipReport } from '../src/extension/checks.js';
import { hash } from '../src/extension/source.js';

const root = resolve(import.meta.dirname, '..');
const seed = await readFile(join(root, 'novadesk/src/approval.ts'), 'utf8');

it.each([
  ['seed', seed, { kind: 'completed', observedApproval: true, requirementPassed: false, exitCode: 1 }],
  ['correct edit', seed.replace("return actor.role === 'client';", "return actor.role === 'client' && actor.id === _milestone.ownerClientId;"), { kind: 'completed', observedApproval: false, requirementPassed: true, exitCode: 0 }],
  ['throwing source', seed.replace("return actor.role === 'client';", "throw new Error('fixture execution failed');"), { kind: 'executionError' }],
  ['hung source', seed.replace("return actor.role === 'client';", 'while (true) {}'), { kind: 'timeout' }],
])('executes only the counterexample and distinguishes %s', async (_name, content, expected) => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-runner-'));
  const source = { path: 'src/approval.ts', absolutePath: '/prepared/src/approval.ts', content, hash: hash(content) };
  const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: new Date().toISOString(), predictedApproval: false, reasoning: 'The requirement allows only the owner.', sourceHash: source.hash, requirementRevision: 'a'.repeat(64) };
  try {
    const result = await runOwnership(root, folder, source, prediction);
    expect(result).toMatchObject({ ...expected, predictionId: prediction.id, sourceHash: source.hash, requirementRevision: prediction.requirementRevision, caseId: 'other-client-active' });
    if (expected.kind === 'completed') expect(result).toMatchObject({ executedCases: 1, skippedCases: 2 });
    else expect(result).not.toHaveProperty('observedApproval');
  } finally { await rm(folder, { recursive: true, force: true }); }
}, 30_000);

it('rejects missing observations, unexpected case coverage and inconsistent process status', () => {
  const report = { numTotalTests: 3, numPendingTests: 2, numPassedTests: 0, numFailedTests: 1, success: false, testResults: [{ message: '', assertionResults: [
    { title: 'owner-client-active', status: 'skipped', meta: {} },
    { title: 'other-client-active', status: 'failed', meta: { approval: true } },
    { title: 'freelancer-active', status: 'skipped', meta: {} },
  ] }] };
  expect(validateOwnershipReport(report, 1)).toMatchObject({ observedApproval: true, requirementPassed: false });
  expect(() => validateOwnershipReport(report, 0)).toThrow();
  const missing = structuredClone(report); missing.testResults[0].assertionResults[1].meta = {};
  expect(() => validateOwnershipReport(missing, 1)).toThrow();
  const extra = structuredClone(report); extra.testResults[0].assertionResults[0].status = 'passed';
  expect(() => validateOwnershipReport(extra, 1)).toThrow();
  expect(() => validateOwnershipReport({ ...report, testResults: [] }, 1)).toThrow();
});

it('refuses changed trusted definitions and an absent or stale prediction before execution', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-integrity-'));
  const copy = join(folder, 'extension');
  const source = { path: 'src/approval.ts', absolutePath: '/prepared/src/approval.ts', content: seed, hash: hash(seed) };
  const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: new Date().toISOString(), predictedApproval: false, reasoning: 'Owner only.', sourceHash: source.hash, requirementRevision: 'a'.repeat(64) };
  try {
    await mkdir(copy);
    await cp(join(root, 'fixtures'), join(copy, 'fixtures'), { recursive: true });
    await cp(join(root, 'package-lock.json'), join(copy, 'package-lock.json'));
    await symlink(join(root, 'node_modules'), join(copy, 'node_modules'));
    expect(await runOwnership(copy, join(folder, 'runs'), source, prediction)).toMatchObject({ kind: 'completed', requirementPassed: false });
    await writeFile(join(copy, 'fixtures/novadesk/ownership.test.ts'), 'throw new Error("changed trusted harness");');
    const changed = await runOwnership(copy, join(folder, 'runs'), source, prediction);
    expect(changed.kind).toBe('executionError');
    expect(changed).not.toHaveProperty('observedApproval');
    await expect(runOwnership(root, join(folder, 'runs'), source, { ...prediction, sourceHash: 'b'.repeat(64) })).rejects.toThrow(/prediction/);
    await expect(runOwnership(root, join(folder, 'runs'), source, undefined as never)).rejects.toThrow();
  } finally { await rm(folder, { recursive: true, force: true }); }
});
