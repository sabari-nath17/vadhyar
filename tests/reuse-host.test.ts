import { mkdtemp, readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type * as VSCode from 'vscode';
import { hash, approvalReference } from '../src/extension/source.js';
import { loadSession, saveExplanation } from '../src/extension/session.js';

const host = vi.hoisted(() => ({ root: '', open: vi.fn(), pick: vi.fn(), save: vi.fn(), warning: vi.fn(), show: vi.fn(), command: vi.fn(), remove: vi.fn(), secretGet: vi.fn(), secretStore: vi.fn(), secretDelete: vi.fn(), documents: [] as { isDirty: boolean; uri: { fsPath: string } }[], changed: (_event: unknown) => {}, watchers: [] as ((event: unknown) => void)[] }));
vi.mock('vscode', () => {
  const disposable = { dispose() {} };
  class Range {
    start: { line: number; character: number }; end: { line: number; character: number };
    constructor(a: number, b: number, c: number, d: number) { this.start = { line: a, character: b }; this.end = { line: c, character: d }; }
  }
  return {
    workspace: {
      isTrusted: true, get workspaceFolders() { return [{ uri: { scheme: 'file', fsPath: host.root } }]; }, get textDocuments() { return host.documents; },
      getConfiguration: () => ({ get: () => 'fixture' }), registerTextDocumentContentProvider: () => disposable, onDidChangeTextDocument: (fn: typeof host.changed) => { host.changed = fn; return disposable; },
      createFileSystemWatcher: () => ({ onDidChange: (fn: typeof host.changed) => { host.watchers.push(fn); return disposable; }, onDidCreate: () => disposable, onDidDelete: () => disposable, dispose() {} }), fs: { delete: host.remove },
      openTextDocument: async (uri: { fsPath: string }) => { const text = await readFile(uri.fsPath, 'utf8'); return { isDirty: false, getText: () => text, lineAt: (line: number) => ({ text: text.split('\n')[line] }) }; },
    },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }), showOpenDialog: host.open, showQuickPick: host.pick, showSaveDialog: host.save, showWarningMessage: host.warning, showTextDocument: host.show },
    commands: { registerCommand: () => disposable, executeCommand: host.command },
    RelativePattern: class { constructor(public base: unknown, public pattern: string) {} },
    Uri: { file: (fsPath: string) => ({ scheme: 'file', fsPath }) }, Range,
    Selection: class { constructor(public start: unknown, public end: unknown) {} },
    ViewColumn: { One: 1 }, TextEditorRevealType: { InCenterIfOutsideViewport: 0 },
  };
});
import { activate } from '../src/extension/extension.js';

let folder: string;
let storage: string;
let app: ReturnType<typeof activate>;
const spec = '### Requirement: Archived\nArchived milestones SHALL be rejected.\n#### Scenario: Owner approval\n- **WHEN** the milestone is archived\n- **THEN** deny approval';

beforeEach(async () => {
  vi.clearAllMocks(); host.documents = []; host.watchers = []; host.secretGet.mockResolvedValue(undefined);
  host.remove.mockImplementation(async (uri: { fsPath: string }) => { await rm(uri.fsPath, { recursive: true }); });
  folder = await mkdtemp(join(tmpdir(), 'vadhyar-reuse-host-')); host.root = join(folder, 'workspace'); storage = join(folder, 'storage');
  await mkdir(join(host.root, 'src'), { recursive: true });
  await writeFile(join(host.root, 'src/approval.ts'), await readFile('novadesk/src/approval.ts'));
  await writeFile(join(host.root, 'vadhyar-requirement.md'), await readFile('novadesk/vadhyar-requirement.md'));
  await writeFile(join(host.root, 'spec.md'), spec);
  host.show.mockResolvedValue({ revealRange() {}, selection: undefined });
  app = activate({ storageUri: { fsPath: storage }, extensionUri: { fsPath: process.cwd() }, subscriptions: [], secrets: { get: host.secretGet, store: host.secretStore, delete: host.secretDelete } } as unknown as VSCode.ExtensionContext);
  await app.act({ type: 'ready' });
});
afterEach(async () => { await rm(folder, { recursive: true, force: true }); });

async function seedExplanation() {
  const content = await readFile(join(host.root, 'src/approval.ts'), 'utf8');
  const ref = approvalReference({ path: 'src/approval.ts', absolutePath: join(host.root, 'src/approval.ts'), content, hash: hash(content) });
  const state = app.inspect(); state.refs = [ref];
  state.explanation = { responseId: 'mock-host', model: 'mock', requestedModel: 'mock', latencyMs: 0, explanation: { summary: 'Mock explanation', steps: [1, 2].map(n => ({ title: `Step ${n}`, text: 'Inspect this decision.', sourceRefId: ref.id })) } };
  state.walkthrough = { sourceHash: ref.hash, requirementRevision: state.requirement!.revision, index: 0 };
  state.referencesRequirementRevision = state.requirement!.revision;
}

it('derives the evidence timeline and inert Markdown handover from persisted records and preserves cancelled exports', async () => {
  const state = app.inspect();
  await app.act({ type: 'confirmRequirement', revision: state.requirement!.revision });
  await app.act({ type: 'checkpoint' });
  await app.act({ type: 'savePrediction', predictedApproval: false, reasoning: '[unsafe](command:delete) <script>text</script>', sourceHash: state.sourceHash, requirementRevision: state.requirement!.revision });
  const saved = await loadSession(storage);
  expect(app.inspect()).toHaveProperty('evidence', expect.arrayContaining([expect.objectContaining({ kind: 'prediction', sourceHash: state.sourceHash, requirementRevision: state.requirement!.revision })]));
  const destination = join(folder, 'handover.md'); host.save.mockResolvedValue({ scheme: 'file', fsPath: destination });
  await app.act({ type: 'exportHandover' });
  const text = await readFile(destination, 'utf8');
  expect(text).toContain(saved.predictions[0].id);
  expect(text).toContain(state.sourceHash);
  expect(text).toContain('Earlier authorship and external assistance are unknown');
  expect(text).not.toContain('[unsafe](command:delete)'); expect(text).not.toContain('<script>');
  await writeFile(destination, 'Existing report'); host.warning.mockResolvedValue(undefined);
  await app.act({ type: 'exportHandover' }); expect(await readFile(destination, 'utf8')).toBe('Existing report');
  host.warning.mockResolvedValue('Replace'); await app.act({ type: 'exportHandover' });
  expect(await readFile(destination, 'utf8')).toBe(text);
  expect(await loadSession(storage)).toEqual(saved);
  host.save.mockImplementationOnce(async () => { await writeFile(join(host.root, 'src/approval.ts'), (await readFile(join(host.root, 'src/approval.ts'), 'utf8')) + '\nchanged'); return { scheme: 'file', fsPath: join(folder, 'stale-handover.md') }; });
  await expect(app.act({ type: 'exportHandover' })).rejects.toThrow(/changed|stale/i);
});

it('imports, confirms, restores, invalidates and returns to the prepared requirement without losing history', async () => {
  const original = app.inspect().requirement!;
  await app.act({ type: 'confirmRequirement', revision: original.revision });
  await seedExplanation();
  host.open.mockResolvedValue([{ scheme: 'file', fsPath: join(host.root, 'spec.md') }]); host.pick.mockResolvedValue({ label: 'Archived' });
  const imported = await app.act({ type: 'importRequirement' });
  expect(imported.explanation).toBeUndefined(); expect(imported.confirmed).toBe(false);
  expect(imported.requirement?.checksAvailable).toBe(false);
  await app.act({ type: 'confirmRequirement', revision: imported.requirement!.revision });
  expect((await loadSession(storage)).requirements).toHaveLength(2);
  expect((await app.act({ type: 'ready' })).requirement?.title).toBe('Archived');
  await expect(app.act({ type: 'savePrediction', predictedApproval: false, reasoning: 'Owner', sourceHash: imported.sourceHash!, requirementRevision: imported.requirement!.revision })).rejects.toThrow(/no trusted/);
  await expect(app.act({ type: 'runOwnership' })).rejects.toThrow(/no trusted/);
  await writeFile(join(host.root, 'spec.md'), spec + '\nNew detail.');
  expect((await app.act({ type: 'ready' })).confirmed).toBe(false);
  await rm(join(host.root, 'spec.md'));
  expect((await app.act({ type: 'usePreparedRequirement' })).requirement?.revision).toBe(original.revision);
  expect((await loadSession(storage)).requirements).toHaveLength(2);
});

it('marks saved source links and explanations stale after disk edits, dirty buffers and requirement revisions', async () => {
  await seedExplanation(); await app.act({ type: 'ready' });
  expect(app.inspect().explanationCurrent).toBe(true);
  const id = app.inspect().refs[0].id, source = join(host.root, 'src/approval.ts');
  await writeFile(source, (await readFile(source, 'utf8')) + '\n');
  await expect(app.act({ type: 'openSource', id })).rejects.toThrow(/stale|changed|refresh/i);
  expect(app.inspect()).toMatchObject({ referencesCurrent: false, explanationCurrent: false });
  await app.act({ type: 'ready' });
  expect(app.inspect().explanation?.responseId).toBe('mock-host');
  expect(app.inspect().explanationCurrent).toBe(false);
  await seedExplanation(); await app.act({ type: 'ready' });
  host.documents = [{ isDirty: true, uri: { fsPath: source } }];
  host.changed({ document: { uri: { scheme: 'file', fsPath: source, path: source } } });
  expect(app.inspect()).toMatchObject({ explanationCurrent: false, referencesCurrent: false, ownershipCurrent: false });
  await expect(app.act({ type: 'openSource', id: app.inspect().refs[0].id })).rejects.toThrow(/Save/);
  host.documents = [];
  const currentRef = app.inspect().refs[0], graphRef = { ...currentRef, id: 'graph-source-anchor' };
  app.inspect().refs.push(graphRef);
  app.inspect().graph = { version: '0.9.84', identity: hash('synthetic graph'), sourceHash: currentRef.hash, extractedAt: new Date().toISOString(), refs: [graphRef], relationships: [] };
  await writeFile(join(host.root, 'vadhyar-requirement.md'), (await readFile(join(host.root, 'vadhyar-requirement.md'), 'utf8')) + '\nNew revision.');
  await app.act({ type: 'ready' });
  expect(app.inspect()).toMatchObject({ confirmed: false, explanationCurrent: false, graphCurrent: false });
  await expect(app.act({ type: 'confirmMapping', identity: hash('synthetic graph') })).rejects.toThrow(/stale/);
  host.watchers[1]({ fsPath: join(process.cwd(), 'fixtures/novadesk/ownership.test.ts') });
  expect(app.inspect()).toMatchObject({ checksSupported: false, ownershipCurrent: false, counterexampleCurrent: false });
  await rm(source);
  await expect(app.act({ type: 'ready' })).rejects.toThrow();
  expect(app.inspect()).toMatchObject({ contextStale: true, explanationCurrent: false, referencesCurrent: false });
});

it('restores recorded explanations as historical when their source or requirement differs', async () => {
  await seedExplanation(); const state = app.inspect();
  await saveExplanation(storage, { capturedAt: new Date().toISOString(), requirementRevision: state.requirement!.revision, sourceHash: state.sourceHash!, contextIdentity: hash('synthetic'), graphIdentity: hash('synthetic graph'), graphifyVersion: '0.9.84', graphReferences: 1, graphRelationships: 0, ...state.explanation });
  await writeFile(join(host.root, 'src/approval.ts'), (await readFile(join(host.root, 'src/approval.ts'), 'utf8')) + '\n');
  app = activate({ storageUri: { fsPath: storage }, extensionUri: { fsPath: process.cwd() }, subscriptions: [], secrets: { get: host.secretGet } } as unknown as VSCode.ExtensionContext);
  await app.act({ type: 'ready' });
  expect(app.inspect().explanation?.responseId).toBe('mock-host');
  expect(app.inspect().explanationCurrent).toBe(false);
  await expect(app.act({ type: 'walkthroughStep', index: 0 })).rejects.toThrow(/stale|current/i);
});

it('uses native confirmation and clears only NovaDesk memory without changing credentials or Project Guide', async () => {
  const state = app.inspect(); await app.act({ type: 'confirmRequirement', revision: state.requirement!.revision });
  await writeFile(join(storage, 'project.json'), 'Project Guide record');
  await mkdir(join(storage, 'project-sources')); await writeFile(join(storage, 'project-sources/source'), 'Project Guide source');
  const prior = await readFile(join(storage, 'session.json'), 'utf8');
  host.warning.mockResolvedValue(undefined); await app.act({ type: 'clearNovaDeskSession' });
  expect(await readFile(join(storage, 'session.json'), 'utf8')).toBe(prior);
  expect(host.warning).toHaveBeenCalledWith('Clear NovaDesk session?', expect.objectContaining({ modal: true }), 'Clear NovaDesk session');
  host.secretGet.mockResolvedValue('synthetic credential presence');
  host.warning.mockResolvedValue('Clear NovaDesk session'); await app.act({ type: 'clearNovaDeskSession' });
  expect(app.inspect()).toMatchObject({ confirmed: false, hasKey: true, stage: 'confirm' });
  expect(app.inspect().sessionCleared).toBeTruthy();
  expect(await readFile(join(storage, 'project.json'), 'utf8')).toBe('Project Guide record');
  expect(await readFile(join(storage, 'project-sources/source'), 'utf8')).toBe('Project Guide source');
  expect(host.remove).toHaveBeenCalledWith(expect.objectContaining({ fsPath: expect.stringContaining('novadesk-clear-') }), { recursive: true, useTrash: true });
  expect(host.secretStore).not.toHaveBeenCalled(); expect(host.secretDelete).not.toHaveBeenCalled();
  expect(await readFile(join(host.root, 'src/approval.ts'), 'utf8')).toBe(await readFile('novadesk/src/approval.ts', 'utf8'));
  await expect(app.act({ type: 'clearNovaDeskSession', confirmed: true })).rejects.toThrow();
});

it('reveals memory even with corrupt session data and reports a clear failure without replacing valid records', async () => {
  await mkdir(storage); await writeFile(join(storage, 'session.json'), '{corrupt');
  await app.act({ type: 'showMemoryLocation' });
  expect(host.command).toHaveBeenCalledWith('revealFileInOS', expect.objectContaining({ fsPath: storage }));
  expect(await readFile(join(storage, 'session.json'), 'utf8')).toBe('{corrupt');
  host.warning.mockResolvedValue('Clear NovaDesk session'); host.remove.mockRejectedValueOnce(new Error('permissions'));
  await expect(app.act({ type: 'clearNovaDeskSession' })).rejects.toThrow(/not cleared/);
  expect(await readFile(join(storage, 'session.json'), 'utf8')).toBe('{corrupt');
  expect(app.inspect().error).toMatch(/not cleared/);
});

it('navigates, exports, confirms overwrite, and rejects changed saved source or requirement', async () => {
  await seedExplanation();
  expect((await app.act({ type: 'walkthroughStep', index: 1 })).walkthrough?.index).toBe(1);
  expect(host.show).toHaveBeenCalledTimes(1);
  await expect(app.act({ type: 'walkthroughStep', index: 3 })).rejects.toThrow(/Unknown/);
  const target = join(folder, 'example.tour'); host.save.mockResolvedValue({ scheme: 'file', fsPath: target });
  await app.act({ type: 'exportWalkthrough' });
  expect(JSON.parse(await readFile(target, 'utf8')).steps).toHaveLength(2);
  await writeFile(target, 'preserve me'); host.warning.mockResolvedValue(undefined);
  await app.act({ type: 'exportWalkthrough' }); expect(await readFile(target, 'utf8')).toBe('preserve me');
  host.warning.mockResolvedValue('Replace'); await app.act({ type: 'exportWalkthrough' });
  expect(JSON.parse(await readFile(target, 'utf8')).title).toContain('Vadhyar');
  await writeFile(join(host.root, 'src/approval.ts'), (await readFile(join(host.root, 'src/approval.ts'), 'utf8')) + '\n');
  await expect(app.act({ type: 'exportWalkthrough' })).rejects.toThrow(/stale/);
  await seedExplanation();
  host.save.mockImplementationOnce(async () => { await writeFile(join(host.root, 'vadhyar-requirement.md'), (await readFile(join(host.root, 'vadhyar-requirement.md'), 'utf8')) + '\nchanged'); return { scheme: 'file', fsPath: join(folder, 'stale.tour') }; });
  await expect(app.act({ type: 'exportWalkthrough' })).rejects.toThrow(/stale/);
});

it('cancels imports without changing the session and rejects outside or dirty specifications', async () => {
  const original = app.inspect().requirement;
  host.open.mockResolvedValue(undefined); await app.act({ type: 'importRequirement' }); expect(app.inspect().requirement).toEqual(original);
  await writeFile(join(folder, 'outside.md'), spec);
  host.open.mockResolvedValue([{ scheme: 'file', fsPath: join(folder, 'outside.md') }]);
  await expect(app.act({ type: 'importRequirement' })).rejects.toThrow(/inside/);
  host.open.mockResolvedValue([{ scheme: 'file', fsPath: join(host.root, 'spec.md') }]);
  host.documents = [{ isDirty: true, uri: { fsPath: join(host.root, 'spec.md') } }];
  await expect(app.act({ type: 'importRequirement' })).rejects.toThrow(/Save/);
});
