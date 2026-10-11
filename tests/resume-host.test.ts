import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type * as VSCode from 'vscode';
import { hash } from '../src/extension/source.js';
import { loadSession, saveSession } from '../src/extension/session.js';

const host = vi.hoisted(() => ({ root: '', commands: new Map<string, (...args: unknown[]) => unknown>(), before: undefined as ((uri: { path: string; query: string }) => string) | undefined, panels: [] as { close: () => void; receive: (raw: unknown) => void }[], reveals: [] as unknown[], panelColumn: 3 }));
vi.mock('vscode', () => {
  const disposable = { dispose() {} };
  return {
    workspace: { isTrusted: true, get workspaceFolders() { return [{ uri: { scheme: 'file', fsPath: host.root } }]; }, textDocuments: [], getConfiguration: () => ({ get: () => 'fixture' }), onDidChangeTextDocument: () => disposable, onDidSaveTextDocument: () => disposable, createFileSystemWatcher: () => ({ onDidChange: () => disposable, onDidCreate: () => disposable, onDidDelete: () => disposable, dispose() {} }), registerTextDocumentContentProvider: (_: string, provider: { provideTextDocumentContent: typeof host.before }) => { host.before = provider.provideTextDocumentContent; return disposable; } },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }), createWebviewPanel: () => {
      const callbacks = { close() {}, receive(_raw: unknown) {} }; host.panels.push(callbacks);
      return { viewColumn: host.panelColumn, webview: { postMessage() {}, asWebviewUri: () => '/dist', cspSource: 'test', onDidReceiveMessage: (receive: typeof callbacks.receive) => { callbacks.receive = receive; } }, onDidDispose: (close: typeof callbacks.close) => { callbacks.close = close; }, reveal(column: unknown) { host.reveals.push(column); } };
    } },
    commands: { registerCommand: (name: string, command: (...args: unknown[]) => unknown) => { host.commands.set(name, command); return disposable; }, executeCommand: async () => undefined },
    Uri: { file: (fsPath: string) => ({ scheme: 'file', fsPath }), parse: (value: string) => value, from: (value: unknown) => value, joinPath: () => ({}) }, ViewColumn: { One: 1, Two: 2, Beside: -2 },
    RelativePattern: class { constructor(public base: unknown, public pattern: string) {} },
  };
});
import { activate } from '../src/extension/extension.js';

let folder: string, storage: string, seed: string;
let app: ReturnType<typeof activate>;
function start(extensionRoot = process.cwd()) {
  return activate({ storageUri: { fsPath: storage }, extensionUri: { fsPath: extensionRoot }, subscriptions: [], secrets: { get: async () => undefined } } as unknown as VSCode.ExtensionContext);
}
beforeEach(async () => {
  host.commands.clear(); host.panels = []; host.reveals = []; host.panelColumn = 3;
  folder = await mkdtemp(join(tmpdir(), 'vadhyar-resume-host-')); storage = join(folder, 'storage'); host.root = join(folder, 'novadesk');
  seed = await readFile('novadesk/src/approval.ts', 'utf8');
  await mkdir(join(host.root, 'src'), { recursive: true });
  await writeFile(join(host.root, 'src/approval.ts'), seed);
  await writeFile(join(host.root, 'vadhyar-requirement.md'), await readFile('novadesk/vadhyar-requirement.md'));
  app = start(); await app.act({ type: 'ready' });
});
afterEach(async () => { await rm(folder, { recursive: true, force: true }); });
async function predict() {
  const state = app.inspect();
  await app.act({ type: 'confirmRequirement', revision: state.requirement!.revision });
  await app.act({ type: 'checkpoint' });
  return app.act({ type: 'savePrediction', predictedApproval: false, reasoning: 'Only the owner should approve.', sourceHash: state.sourceHash!, requirementRevision: state.requirement!.revision });
}

it('reopens the existing NovaDesk panel in its current editor column', async () => {
  const open = host.commands.get('vadhyar.open')!;
  await open(); await open();
  expect(host.panels).toHaveLength(1);
  expect(host.reveals).toEqual([3]);
});

it('keeps repeated Project Guide opens in the existing column', async () => {
  const open = host.commands.get('vadhyar.project')!;
  await open(); await open();
  expect(host.panels).toHaveLength(1);
  expect(host.reveals).toEqual([3]);
});

it('reveals a Project Guide created in an empty first column beside the native diff', async () => {
  host.panelColumn = 1;
  await host.commands.get('vadhyar.project')!();
  await app.projectAct({ type: 'projectStart' });
  host.panels[0].receive({ type: 'projectOpenDiff', path: 'src/approval.ts', snapshot: app.inspectProject()!.snapshot });
  await vi.waitFor(() => expect(host.reveals).toEqual([2]));
});

it('starts a separate archived transfer only after current ownership passes, then restores its prediction, edits and four real checks', async () => {
  await expect(app.act({ type: 'startTransfer' })).rejects.toThrow();
  const original = (await predict()).prediction!;
  await app.act({ type: 'runCounterexample', predictionId: original.id });
  const ownership = seed.replace("return actor.role === 'client';", "return actor.role === 'client' && actor.id === _milestone.ownerClientId;");
  await writeFile(join(host.root, 'src/approval.ts'), ownership);
  await app.act({ type: 'openDiff' }); await app.act({ type: 'runOwnership' });
  const old = await loadSession(storage);
  await writeFile(join(host.root, 'vadhyar-transfer.md'), 'Existing unrelated requirement');
  await expect(app.act({ type: 'startTransfer' })).rejects.toThrow(/different work/);
  expect(await readFile(join(host.root, 'vadhyar-transfer.md'), 'utf8')).toBe('Existing unrelated requirement');
  expect(await loadSession(storage)).toEqual(old);
  await rm(join(host.root, 'vadhyar-transfer.md'));
  const transfer = await app.act({ type: 'startTransfer' });
  expect(transfer).toMatchObject({ exercise: 'transfer', confirmed: false, stage: 'confirm' });
  expect(transfer.prediction).toBeUndefined();
  expect(transfer.requirement?.revision).not.toBe(original.requirementRevision);
  expect((await loadSession(storage)).activity).toEqual(old.activity);
  await app.act({ type: 'confirmRequirement', revision: transfer.requirement!.revision });
  await app.act({ type: 'checkpoint' });
  const saved = await app.act({ type: 'savePrediction', predictedApproval: false, reasoning: 'Archived should deny.', sourceHash: transfer.sourceHash, requirementRevision: transfer.requirement!.revision });
  expect(saved.prediction).toMatchObject({ caseId: 'owner-client-archived', sourceHash: hash(ownership) });
  await expect(app.act({ type: 'runCounterexample', predictionId: saved.prediction!.id, caseId: 'invented', command: 'arbitrary' })).rejects.toThrow();
  await app.act({ type: 'runCounterexample', predictionId: saved.prediction!.id });
  expect(app.inspect().counterexample).toMatchObject({ kind: 'completed', observedApproval: true, requirementPassed: false, skippedCases: 3 });
  const correct = ownership.replace('actor.id === _milestone.ownerClientId;', "actor.id === _milestone.ownerClientId && _milestone.status === 'active';");
  await writeFile(join(host.root, 'src/approval.ts'), correct);
  await app.act({ type: 'openDiff' }); await app.act({ type: 'runOwnership' });
  expect(app.inspect()).toMatchObject({ ownershipCurrent: true, ownershipRun: { kind: 'completed', suiteId: 'transfer', requirementPassed: true } });
  const verified = app.inspect().ownershipRun;
  expect(verified?.kind === 'completed' && verified.cases).toHaveLength(4);
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect()).toMatchObject({ exercise: 'transfer', stage: 'verify', ownershipCurrent: true, prediction: saved.prediction });
  expect((await loadSession(storage)).requirements).toHaveLength(2);
  await writeFile(join(host.root, 'vadhyar-transfer.md'), transfer.requirement!.text + '\nA changed requirement.\n');
  await app.act({ type: 'ready' });
  expect(app.inspect()).toMatchObject({ confirmed: false, checksSupported: false });
  await expect(app.act({ type: 'runOwnership' })).rejects.toThrow();
}, 30_000);

it('resumes the saved prediction, actual counterexample, diff, full run and local reflection across controller restarts and panel reopen', async () => {
  const prediction = (await predict()).prediction!;
  app = start(); const resumedPrediction = await app.act({ type: 'ready' });
  expect(resumedPrediction.prediction).toEqual(prediction);
  expect(resumedPrediction).toMatchObject({ stage: 'predict', checkpointHash: hash(seed) });
  expect(resumedPrediction.counterexample).toBeUndefined();
  await app.act({ type: 'runCounterexample', predictionId: prediction.id });
  expect(app.inspect().counterexample).toMatchObject({ kind: 'completed', observedApproval: true, requirementPassed: false });
  const withHint = await loadSession(storage);
  const observed = app.inspect().counterexample!;
  withHint.activity.push({ type: 'hint', id: '539e5cab-f890-46a4-aa6f-a4268676074d', predictionId: prediction.id, recordedAt: prediction.savedAt, sourceHash: prediction.sourceHash, requirementRevision: prediction.requirementRevision, counterexampleId: observed.id, contextIdentity: hash('synthetic hint context'), result: { responseId: 'synthetic-resume-test', model: 'test', requestedModel: 'test', latencyMs: 0, hint: { level: 1, text: 'Which value identifies the owner?', sourceRefId: `approval-${prediction.sourceHash}` } } });
  await saveSession(storage, withHint);
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect().hints).toHaveLength(1);
  await app.act({ type: 'setStage', stage: 'change' });
  await host.commands.get('vadhyar.open')!(); host.panels.at(-1)!.close();
  await host.commands.get('vadhyar.open')!();
  expect(app.inspect().stage).toBe('change');
  const correct = seed.replace("return actor.role === 'client';", "return actor.role === 'client' && actor.id === _milestone.ownerClientId;");
  await writeFile(join(host.root, 'src/approval.ts'), correct);
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect().counterexampleCurrent).toBe(false);
  expect(app.inspect().prediction).toEqual(prediction);
  await app.act({ type: 'openDiff' });
  expect(host.before!({ path: '/src/approval.ts', query: hash(seed) })).toBe(seed);
  await app.act({ type: 'runOwnership' });
  expect(app.inspect()).toMatchObject({ ownershipCurrent: true, ownershipRun: { kind: 'completed', requirementPassed: true } });
  await app.act({ type: 'saveReflection', text: 'Role checks do not identify the owner.', sourceHash: hash(correct), requirementRevision: prediction.requirementRevision });
  await app.act({ type: 'setStage', stage: 'verify' });
  const before = app.inspect();
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect()).toMatchObject({ prediction, counterexample: before.counterexample, diff: before.diff, ownershipRun: before.ownershipRun, reflections: before.reflections, stage: 'verify', ownershipCurrent: true });
  expect((await loadSession(storage)).activity.map(item => item.type)).toEqual(['counterexample', 'hint', 'diff', 'ownership', 'reflection']);
  const interrupted = await loadSession(storage);
  interrupted.learning[0].pending = { kind: 'ownership', startedAt: new Date().toISOString(), sourceHash: hash(correct), diffId: before.diff!.id };
  await saveSession(storage, interrupted);
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect().ownershipCurrent).toBe(false);
  expect(app.inspect().notice).toMatch(/interrupted/i);
  expect(app.inspect().ownershipRun).toEqual(before.ownershipRun);
  delete interrupted.learning[0].pending;
  await saveSession(storage, interrupted);
  const runtime = join(folder, 'runtime');
  for (const file of ['fixtures/novadesk/ownership.test.ts', 'fixtures/novadesk/vitest.config.ts', 'node_modules/vitest/package.json', 'package-lock.json']) {
    const target = join(runtime, file); await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, await readFile(file));
  }
  app = start(runtime); await app.act({ type: 'ready' });
  expect(app.inspect().ownershipCurrent).toBe(true);
  await writeFile(join(runtime, 'package-lock.json'), (await readFile(join(runtime, 'package-lock.json'), 'utf8')) + '\n');
  app = start(runtime); await app.act({ type: 'ready' });
  expect(app.inspect().ownershipRun).toEqual(before.ownershipRun);
  expect(app.inspect().ownershipCurrent).toBe(false);
  await writeFile(join(host.root, 'src/approval.ts'), correct + '\n');
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect().ownershipRun).toEqual(before.ownershipRun);
  expect(app.inspect().ownershipCurrent).toBe(false);
  await expect(app.act({ type: 'runOwnership' })).rejects.toThrow(/diff/);
});

it('resumes an interrupted check as an execution problem without inventing an outcome', async () => {
  const prediction = (await predict()).prediction!;
  const session = await loadSession(storage);
  expect(session.learning[0]).toBeDefined();
  session.learning[0].pending = { kind: 'counterexample', startedAt: new Date().toISOString(), sourceHash: prediction.sourceHash };
  await saveSession(storage, session);
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect().notice).toMatch(/interrupted/i);
  expect(app.inspect()).toMatchObject({ busy: false, prediction });
  expect(app.inspect().counterexample).toBeUndefined();
  await app.act({ type: 'runCounterexample', predictionId: prediction.id });
  expect((await loadSession(storage)).learning[0].pending).toBeUndefined();
  expect(app.inspect().counterexample).toMatchObject({ kind: 'completed', requirementPassed: false });
});

it('persists execution errors separately and does not restore them as learner verdicts', async () => {
  await writeFile(join(host.root, 'src/approval.ts'), seed.replace("return actor.role === 'client';", "throw new Error('test execution problem');"));
  await app.act({ type: 'ready' });
  const prediction = (await predict()).prediction!;
  await app.act({ type: 'runCounterexample', predictionId: prediction.id });
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect().counterexample).toMatchObject({ kind: 'executionError' });
  expect(app.inspect().counterexample).not.toHaveProperty('observedApproval');
  expect(app.inspect().stage).toBe('predict');
  await expect(app.act({ type: 'setStage', stage: 'change' })).rejects.toThrow(/not available/);
  await expect(app.act({ type: 'saveReflection', text: 'Should not be a verdict.', sourceHash: prediction.sourceHash, requirementRevision: prediction.requirementRevision })).rejects.toThrow(/Rerun/);
  const session = await loadSession(storage);
  const error = session.activity.at(-1);
  if (error?.type !== 'counterexample' || error.run.kind !== 'executionError') throw new Error('Missing execution problem.');
  error.run.kind = 'timeout'; error.run.message = 'Synthetic persisted timeout; no approval recorded.';
  await saveSession(storage, session);
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect().counterexample).toMatchObject({ kind: 'timeout' });
  expect(app.inspect().counterexample).not.toHaveProperty('observedApproval');
});

it('restores legacy hints and runs as historical while recovering their exact baseline without inventing the missing observation', async () => {
  const prediction = (await predict()).prediction!;
  await app.act({ type: 'runCounterexample', predictionId: prediction.id });
  const correct = seed.replace("return actor.role === 'client';", "return actor.role === 'client' && actor.id === _milestone.ownerClientId;");
  await writeFile(join(host.root, 'src/approval.ts'), correct);
  await app.act({ type: 'ready' }); await app.act({ type: 'openDiff' }); await app.act({ type: 'runOwnership' });
  const session = await loadSession(storage);
  const legacy = { ...session, schemaVersion: 1, learning: undefined, activity: session.activity.filter(item => item.type !== 'counterexample').map(item => item.type === 'ownership' ? { ...item, run: { ...item.run, fingerprints: undefined } } : item) };
  await writeFile(join(storage, 'session.json'), JSON.stringify(legacy));
  const original = await readFile(join(storage, 'session.json'), 'utf8');
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect()).toMatchObject({ baselineHash: hash(seed), ownershipCurrent: false, ownershipRun: { kind: 'completed', requirementPassed: true } });
  expect(app.inspect().counterexample).toBeUndefined();
  expect(app.inspect().notice).toMatch(/No counterexample/);
  expect(await readFile(join(storage, 'session.json'), 'utf8')).toBe(original);
  await app.act({ type: 'runCounterexample', predictionId: prediction.id });
  expect(app.inspect().counterexample).toMatchObject({ sourceHash: hash(seed), requirementPassed: false });
  expect(app.inspect().counterexampleCurrent).toBe(false);
  await app.act({ type: 'openDiff' }); await app.act({ type: 'runOwnership' });
  expect(app.inspect().ownershipCurrent).toBe(true);
});

it('does not attach evidence from a prior requirement revision to a changed requirement', async () => {
  await predict();
  await writeFile(join(host.root, 'vadhyar-requirement.md'), (await readFile(join(host.root, 'vadhyar-requirement.md'), 'utf8')) + '\nNew revision.');
  app = start(); await app.act({ type: 'ready' });
  expect(app.inspect().confirmed).toBe(false);
  expect(app.inspect().prediction).toBeUndefined();
  expect((await loadSession(storage)).predictions).toHaveLength(1);
  await expect(app.act({ type: 'setStage', stage: 'verify' })).rejects.toThrow();
});

it('marks outcomes historical and rejects guidance when the trusted case definitions change', async () => {
  const prediction = (await predict()).prediction!;
  await app.act({ type: 'runCounterexample', predictionId: prediction.id });
  const observed = app.inspect().counterexample;
  const runtime = join(folder, 'altered-runtime');
  for (const file of ['fixtures/novadesk/ownership.test.ts', 'fixtures/novadesk/vitest.config.ts', 'node_modules/vitest/package.json', 'package-lock.json']) {
    const target = join(runtime, file); await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, await readFile(file));
  }
  await writeFile(join(runtime, 'fixtures/novadesk/ownership.test.ts'), 'changed trusted definition');
  app = start(runtime); await app.act({ type: 'ready' });
  expect(app.inspect()).toMatchObject({ checksSupported: false, counterexampleCurrent: false, counterexample: observed });
  await expect(app.act({ type: 'previewHint' })).rejects.toThrow(/Trusted ownership definitions/);
  expect((await loadSession(storage)).activity.at(-1)).toMatchObject({ type: 'counterexample', run: observed });
});

it('retains an actual outcome as historical when source changes while the runner executes', async () => {
  const prediction = (await predict()).prediction!;
  const running = app.act({ type: 'runCounterexample', predictionId: prediction.id });
  const rejected = expect(running).rejects.toThrow(/changed during the run/);
  await vi.waitFor(() => expect(app.inspect().counterexampleRunning).toBe(true));
  await writeFile(join(host.root, 'src/approval.ts'), seed + '\n');
  await rejected;
  await app.act({ type: 'ready' });
  expect(app.inspect()).toMatchObject({ counterexampleCurrent: false, counterexample: { kind: 'completed', requirementPassed: false, sourceHash: prediction.sourceHash } });
});
