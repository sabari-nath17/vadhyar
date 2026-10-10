import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { z } from 'zod';
import scenario from '../../fixtures/novadesk/scenario.json' with { type: 'json' };
import { predictionSchema, type Counterexample, type OwnershipCase, type OwnershipRun, type Prediction, type RunIdentity, type RunnerOutcome } from '../shared.js';
import { hash, type PreparedFile } from './source.js';

const run = promisify(execFile);
function validateReport(raw: unknown, exitCode: number, full: boolean) {
  const report = z.object({
    numTotalTests: z.literal(3), numPendingTests: z.literal(full ? 0 : 2), numPassedTests: z.number().int(), numFailedTests: z.number().int(), success: z.boolean(),
    testResults: z.array(z.object({ message: z.literal(''), assertionResults: z.array(z.object({ title: z.string(), status: z.enum(['passed', 'failed', 'skipped']), meta: z.object({ approval: z.boolean().optional() }) })) })).length(1),
  }).parse(raw);
  const cases = report.testResults[0].assertionResults;
  if (cases.length !== 3 || cases.some((item, index) => item.title !== scenario.caseIds[index] || (!full && index !== 1 && item.status !== 'skipped'))) throw new Error('Unexpected ownership case coverage.');
  const outcomes: OwnershipCase[] = cases.flatMap((item, index) => {
    if (!full && index !== 1) return [];
    const actual = item.meta.approval;
    if (typeof actual !== 'boolean') throw new Error('Runner did not observe a boolean approval.');
    const expected = index === 0;
    if (item.status !== (actual === expected ? 'passed' : 'failed')) throw new Error('Runner status and observation disagree.');
    return [{ id: item.title as OwnershipCase['id'], observedApproval: actual, expectedApproval: expected, status: item.status as 'passed' | 'failed' }];
  });
  const passes = outcomes.filter(item => item.status === 'passed').length;
  const passed = passes === outcomes.length;
  if (exitCode !== (passed ? 0 : 1) || report.success !== passed || report.numPassedTests !== passes || report.numFailedTests !== outcomes.length - passes) throw new Error('Runner status and observation disagree.');
  return { cases: outcomes, requirementPassed: passed, exitCode: exitCode as 0 | 1 };
}

export async function runOwnership(root: string, folder: string, source: PreparedFile, prediction: Prediction): Promise<Counterexample> {
  const result = await executeOwnership(root, folder, source, prediction, false);
  return result.kind === 'completed' ? { ...result, caseId: 'other-client-active', observedApproval: result.cases[0].observedApproval, executedCases: 1, skippedCases: 2 } : { ...result, caseId: 'other-client-active' };
}

export function validateOwnershipReport(raw: unknown, exitCode: number) {
  const result = validateReport(raw, exitCode, false);
  return { observedApproval: result.cases[0].observedApproval, requirementPassed: result.requirementPassed, exitCode: result.exitCode, executedCases: 1 as const, skippedCases: 2 as const };
}

export function validateFullOwnershipReport(raw: unknown, exitCode: number) { return validateReport(raw, exitCode, true); }

export async function runFullOwnership(root: string, folder: string, source: PreparedFile, prediction: Prediction): Promise<OwnershipRun> {
  return { ...await executeOwnership(root, folder, source, prediction, true), baselineHash: prediction.sourceHash, suiteId: 'ownership' };
}

async function executeOwnership(root: string, folder: string, source: PreparedFile, prediction: Prediction, full: boolean): Promise<RunIdentity & RunnerOutcome> {
  predictionSchema.parse(prediction);
  if (source.path !== 'src/approval.ts' || hash(source.content) !== source.hash || (!full && prediction.sourceHash !== source.hash)) throw new Error('Save a prediction for the current source before running.');
  const startedAt = new Date().toISOString();
  const started = Date.now();
  const base = { id: randomUUID(), predictionId: prediction.id, startedAt, sourceHash: source.hash, requirementRevision: prediction.requirementRevision, vitestVersion: '5.0.3' as const };
  let fingerprints: Counterexample['fingerprints'];
  const finish = () => ({ ...base, fingerprints, finishedAt: new Date().toISOString(), latencyMs: Date.now() - started });
  let copy: string | undefined;
  try {
    const assets = await Promise.all(Object.entries(scenario.trustedHashes).map(async ([path, expected]) => {
      const content = await readFile(join(root, path), 'utf8');
      if (hash(content) !== expected) throw new Error('Trusted ownership definitions changed.');
      return { path, content };
    }));
    const lock = await readFile(join(root, 'package-lock.json'), 'utf8');
    const installed = JSON.parse(await readFile(join(root, 'node_modules/vitest/package.json'), 'utf8'));
    if (installed.version !== '5.0.3') throw new Error('Unsupported Vitest version.');
    fingerprints = { harness: hash(assets[0].content), config: hash(assets[1].content), lock: hash(lock) };
    await mkdir(folder, { recursive: true });
    copy = await mkdtemp(join(folder, 'ownership-'));
    await mkdir(join(copy, 'fixtures/novadesk'), { recursive: true });
    await mkdir(join(copy, 'novadesk/src'), { recursive: true });
    await mkdir(join(copy, 'home'));
    await Promise.all([...assets.map(asset => writeFile(join(copy!, asset.path), asset.content, { flag: 'wx', mode: 0o600 })), writeFile(join(copy, 'novadesk/src/approval.ts'), source.content, { flag: 'wx', mode: 0o600 })]);
    const reportPath = join(copy, 'report.json');
    let exitCode = 0;
    try {
      await run(process.execPath, [join(root, 'node_modules/vitest/vitest.mjs'), 'run', '--config', join(copy, 'fixtures/novadesk/vitest.config.ts'), ...(!full ? ['--testNamePattern', '^other-client-active$'] : []), '--pool=threads', '--maxWorkers=1', '--reporter=json', `--outputFile=${reportPath}`], {
        cwd: root, env: { PATH: '/usr/bin:/bin', HOME: join(copy, 'home'), ELECTRON_RUN_AS_NODE: '1' }, timeout: 20_000, killSignal: 'SIGKILL', maxBuffer: 65_536,
      });
    } catch (error) {
      const failure = error as { code?: string | number | null; killed?: boolean; signal?: string };
      if (failure.killed && failure.signal === 'SIGKILL' && failure.code === null) return { ...finish(), kind: 'timeout', message: 'Ownership runner timed out. No outcome was accepted; retry after checking the source.' };
      if (failure.code !== 1) return { ...finish(), kind: 'executionError', message: 'Ownership runner could not execute. Check the prepared dependencies and retry; no outcome was accepted.' };
      exitCode = 1;
    }
    if ((await stat(reportPath)).size > 100_000) throw new Error('Ownership report exceeds supported size.');
    const result = validateReport(JSON.parse(await readFile(reportPath, 'utf8')), exitCode, full);
    return { ...finish(), kind: 'completed', ...result };
  } catch {
    return { ...finish(), kind: 'executionError', message: 'Ownership runner could not produce a valid result. Check the source and restore trusted fixtures/dependencies, then retry. No prediction verdict was recorded.' };
  } finally { if (copy) await rm(copy, { recursive: true, force: true }); }
}
