import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { runFullOwnership, runOwnership, validateFullOwnershipReport } from '../src/extension/checks.js';
import { hash } from '../src/extension/source.js';
import { loadSession, saveSession } from '../src/extension/session.js';

const seed = await readFile('novadesk/src/approval.ts', 'utf8');
const ownership = seed.replace("return actor.role === 'client';", "return actor.role === 'client' && actor.id === _milestone.ownerClientId;");
const correct = ownership.replace('actor.id === _milestone.ownerClientId;', "actor.id === _milestone.ownerClientId && _milestone.status === 'active';");
const requirement = 'Prepared archived transfer requirement';
const prediction = { id: '526f0aad-37ef-4fa4-82a8-cd6c56a35542', savedAt: new Date().toISOString(), predictedApproval: false, reasoning: 'Archived milestones must be denied.', sourceHash: hash(ownership), requirementRevision: hash(requirement), caseId: 'owner-client-archived' as const };

it('runs only the saved archived case before an edit and preserves ownership coverage on a full transfer rerun', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-transfer-'));
  const source = { path: 'src/approval.ts', absolutePath: '/prepared/src/approval.ts', content: ownership, hash: hash(ownership) };
  try {
    const counter = await runOwnership(process.cwd(), folder, source, prediction);
    expect(counter).toMatchObject({ kind: 'completed', caseId: 'owner-client-archived', observedApproval: true, requirementPassed: false, executedCases: 1, skippedCases: 3 });
    const session = await loadSession(folder);
    session.requirements.push({ id: 'novadesk-approval-ownership', text: requirement, revision: hash(requirement), confirmedAt: prediction.savedAt });
    session.predictions.push(prediction);
    session.activity.push({ type: 'counterexample', run: counter });
    await expect(saveSession(folder, session)).resolves.toBeUndefined();
    expect((await loadSession(folder)).activity[0]).toMatchObject({ type: 'counterexample', run: { caseId: 'owner-client-archived', skippedCases: 3 } });
    const before = await runFullOwnership(process.cwd(), folder, source, prediction);
    expect(before.kind).toBe('completed');
    if (before.kind !== 'completed') throw new Error('Expected real transfer outcome');
    expect(before.suiteId).toBe('transfer');
    expect(before.cases.map(item => item.status)).toEqual(['passed', 'passed', 'passed', 'failed']);
    const after = await runFullOwnership(process.cwd(), folder, { ...source, content: correct, hash: hash(correct) }, prediction);
    expect(after.kind).toBe('completed');
    if (after.kind !== 'completed') throw new Error('Expected real transfer outcome');
    expect(after.cases.map(item => item.id)).toEqual(['owner-client-active', 'other-client-active', 'freelancer-active', 'owner-client-archived']);
    expect(after.cases.map(item => item.status)).toEqual(['passed', 'passed', 'passed', 'passed']);
    expect(after).toMatchObject({ requirementPassed: true, exitCode: 0 });
    const denied = await runFullOwnership(process.cwd(), folder, { ...source, content: seed.replace("return actor.role === 'client';", 'return false;'), hash: hash(seed.replace("return actor.role === 'client';", 'return false;')) }, prediction);
    expect(denied).toMatchObject({ kind: 'completed', requirementPassed: false, exitCode: 1 });
  } finally { await rm(folder, { recursive: true, force: true }); }
}, 30_000);

it('rejects reduced or inconsistent transfer coverage and changed trusted transfer definitions', async () => {
  const report = { numTotalTests: 4, numPendingTests: 0, numPassedTests: 4, numFailedTests: 0, success: true, testResults: [{ message: '', assertionResults: [
    { title: 'owner-client-active', status: 'passed', meta: { approval: true } },
    { title: 'other-client-active', status: 'passed', meta: { approval: false } },
    { title: 'freelancer-active', status: 'passed', meta: { approval: false } },
    { title: 'owner-client-archived', status: 'passed', meta: { approval: false } },
  ] }] };
  expect(validateFullOwnershipReport(report, 0, true).requirementPassed).toBe(true);
  const missing = structuredClone(report); missing.testResults[0].assertionResults.pop();
  expect(() => validateFullOwnershipReport(missing, 0, true)).toThrow();
  const skipped = structuredClone(report); skipped.testResults[0].assertionResults[3].status = 'skipped';
  expect(() => validateFullOwnershipReport(skipped, 0, true)).toThrow();
  expect(() => validateFullOwnershipReport(report, 1, true)).toThrow();
  const folder = await mkdtemp(join(tmpdir(), 'vadhyar-transfer-integrity-'));
  const root = join(folder, 'extension');
  const source = { path: 'src/approval.ts', absolutePath: '/prepared/src/approval.ts', content: ownership, hash: hash(ownership) };
  try {
    await mkdir(root); await cp('fixtures', join(root, 'fixtures'), { recursive: true });
    await cp('package-lock.json', join(root, 'package-lock.json')); await symlink(join(process.cwd(), 'node_modules'), join(root, 'node_modules'));
    await writeFile(join(root, 'fixtures/novadesk/transfer.test.ts'), 'changed definition');
    expect(await runOwnership(root, join(folder, 'runs'), source, prediction)).toMatchObject({ kind: 'executionError' });
    await expect(runOwnership(process.cwd(), folder, source, { ...prediction, caseId: 'arbitrary' } as never)).rejects.toThrow();
    const throwing = seed.replace("return actor.role === 'client';", "throw new Error('execution failure');");
    const failed = await runFullOwnership(process.cwd(), folder, { ...source, content: throwing, hash: hash(throwing) }, prediction);
    expect(failed.kind).toBe('executionError'); expect(failed).not.toHaveProperty('cases');
  } finally { await rm(folder, { recursive: true, force: true }); }
});
