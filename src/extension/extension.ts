import * as vscode from 'vscode';
import { randomBytes, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { availableSteps, panelAction, type PanelState, type RunIdentity } from '../shared.js';
import { hash, approvalReference, withApprovalReference, readPrepared, resolveReference, type PreparedFile } from './source.js';
import { clearNovaDeskSession, loadExplanation, loadSession, saveExplanation, saveSession } from './session.js';
import { extractGraph } from './graphify.js';
import { explain, previewContext, previewHint, requestHint } from './coach.js';
import { parseSpecification, readSpecification, selectRequirement } from './requirements.js';
import { codeTour } from './walkthrough.js';
import { handoverReport, sessionEvidence } from './handover.js';
import { ownershipInputs, runFullOwnership, runOwnership } from './checks.js';
import { createProjectController } from '../project/controller.js';
import scenario from '../../fixtures/novadesk/scenario.json' with { type: 'json' };

export function activate(context: vscode.ExtensionContext) {
  const log = vscode.window.createOutputChannel('Vadhyar');
  let panel: vscode.WebviewPanel | undefined;
  let projectPanel: vscode.WebviewPanel | undefined;
  let project: ReturnType<typeof createProjectController> | undefined;
  function projectController() {
    project ??= createProjectController(context, value => { void projectPanel?.webview.postMessage({ refs: [], busy: value.busy, project: value }); }, setupKey);
    return project;
  }
  let state: PanelState = { refs: [], busy: false };
  let queue: Promise<unknown> = Promise.resolve();
  let request: AbortController | undefined;
  let baseline: PreparedFile | undefined;
  const publish = () => panel?.webview.postMessage(state);
  const model = () => vscode.workspace.getConfiguration('vadhyar').get<string>('model', 'gpt-6-astra');
  async function exportText(title: string, name: string, extension: string, text: string, validate: () => Promise<void>) {
    const target = await vscode.window.showSaveDialog({ title, defaultUri: vscode.Uri.file(join(workspaceRoot(), name)), filters: { [extension]: [extension] } });
    if (!target) return false;
    if (target.scheme !== 'file' || !target.fsPath.endsWith(`.${extension}`)) throw new Error(`Choose a local .${extension} file.`);
    let existing: string | undefined;
    try {
      const info = await lstat(target.fsPath);
      if (!info.isFile() || info.isSymbolicLink() || info.size > (extension === 'tour' ? 100_000 : 900_000)) throw new Error('Export destination must be a regular bounded file.');
      existing = await readFile(target.fsPath, 'utf8');
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (existing !== undefined && await vscode.window.showWarningMessage('Replace the existing export file?', { modal: true }, 'Replace') !== 'Replace') return false;
    await validate();
    if (existing === undefined) await writeFile(target.fsPath, text, { flag: 'wx', mode: 0o600 });
    else {
      if ((await lstat(target.fsPath)).isSymbolicLink() || await readFile(target.fsPath, 'utf8') !== existing) throw new Error('Destination changed; export again.');
      const pending = join(dirname(target.fsPath), `.vadhyar-${randomUUID()}.tmp`);
      try { await writeFile(pending, text, { flag: 'wx', mode: 0o600 }); await rename(pending, target.fsPath); }
      finally { await rm(pending, { force: true }); }
    }
    return true;
  }

  async function setupKey() {
    const value = await vscode.window.showInputBox({ title: 'Vadhyar — OpenAI API key', prompt: 'Stored only in VS Code SecretStorage. Never paste this key in chat.', password: true, ignoreFocusOut: true, validateInput: text => /^\S{20,512}$/.test(text.trim()) ? undefined : 'Enter a nonempty API key (20–512 characters).' });
    if (value !== undefined) await context.secrets.store('openai.apiKey', value.trim());
    state = { ...state, hasKey: Boolean(await context.secrets.get('openai.apiKey')) };
    await publish();
  }

  function workspaceRoot() {
    if (!vscode.workspace.isTrusted) throw new Error('Trust the prepared NovaDesk workspace first.');
    const folders = vscode.workspace.workspaceFolders;
    if (folders?.length !== 1 || folders[0].uri.scheme !== 'file') throw new Error('Open one local prepared NovaDesk folder.');
    return folders[0].uri.fsPath;
  }

  async function prepared() {
    const root = workspaceRoot();
    const saved = context.storageUri ? await loadSession(context.storageUri.fsPath) : undefined;
    const transfer = saved?.activeExercise === 'transfer';
    let requirement = await readPrepared(root, transfer ? scenario.transfer.requirementPath : scenario.requirementPath);
    if (!requirement.content.includes(`ID: ${scenario.requirementId}\n`)) throw new Error('Unsupported NovaDesk requirement.');
    let req: NonNullable<PanelState['requirement']> = { id: scenario.requirementId, revision: requirement.hash, text: requirement.content, ...(transfer ? { sourcePath: scenario.transfer.requirementPath, title: 'Archived milestone transfer', checksAvailable: requirement.hash === scenario.transfer.trustedHashes['fixtures/novadesk/transfer.md'] } : {}) };
    const selected = saved?.activeImport;
    if (selected) {
      const imported = selectRequirement(await readSpecification(root, selected.path), selected.title);
      requirement = imported.file; req = imported.requirement;
    }
    const source = await readPrepared(root, scenario.entrypoint.path);
    if (vscode.workspace.textDocuments.some(doc => doc.isDirty && [source.absolutePath, requirement.absolutePath, join(root, source.path), join(root, requirement.path)].includes(doc.uri.fsPath))) throw new Error('Save prepared files before navigation or context capture.');
    return { root, source, requirement, req };
  }

  async function openSource(id: string, source: PreparedFile, preserveFocus = false) {
    if (!state.referencesCurrent) throw new Error('Source references are stale; save and refresh current context.');
    const ref = resolveReference(state.refs, id, source);
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(source.absolutePath));
    if (doc.isDirty || hash(doc.getText()) !== source.hash) throw new Error('Source changed; refresh before navigating.');
    const editor = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One, preserveFocus });
    const range = new vscode.Range(ref.startLine - 1, 0, ref.endLine - 1, doc.lineAt(ref.endLine - 1).text.length);
    editor.selection = new vscode.Selection(range.start, range.end);
    editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }

  function invalidate(message: string) {
    state = { ...state, contextStale: true, evidence: state.evidence?.map(item => ({ ...item, current: false })), referencesCurrent: false, explanationCurrent: false, graphCurrent: false, counterexampleCurrent: false, ownershipCurrent: false, mappingConfirmed: false, preview: undefined, hintPreview: undefined, error: message };
    void publish();
  }

  const sameChecks = (run: RunIdentity | undefined, inputs: Awaited<ReturnType<typeof ownershipInputs>> | undefined) => Boolean(run?.fingerprints && inputs && Object.entries(inputs.fingerprints).every(([key, value]) => run.fingerprints?.[key as keyof typeof inputs.fingerprints] === value));

  async function freshness(source: PreparedFile, req: NonNullable<PanelState['requirement']>, pending = false) {
    const inputs = req.checksAvailable === false ? undefined : await ownershipInputs(context.extensionUri.fsPath, req.sourcePath === scenario.transfer.requirementPath).catch(() => undefined);
    const referencesCurrent = state.referencesRequirementRevision === req.revision && state.refs.length > 0 && state.refs.every(ref => ref.hash === source.hash);
    const currentRun = (run?: RunIdentity) => Boolean(!pending && run?.sourceHash === source.hash && run.requirementRevision === req.revision && sameChecks(run, inputs));
    state = { ...state, contextStale: false, checksSupported: Boolean(inputs), referencesCurrent, graphCurrent: Boolean(referencesCurrent && state.graph?.sourceHash === source.hash && state.graph.refs.every(ref => state.refs.some(current => current.id === ref.id))), explanationCurrent: Boolean(referencesCurrent && state.walkthrough?.sourceHash === source.hash && state.walkthrough.requirementRevision === req.revision && state.explanation?.explanation.steps.every(step => state.refs.some(ref => ref.id === step.sourceRefId))), counterexampleCurrent: currentRun(state.counterexample), ownershipCurrent: currentRun(state.ownershipRun) };
    if (state.sourceHash !== source.hash || state.requirement?.revision !== req.revision) state = { ...state, mappingConfirmed: false, preview: undefined, hintPreview: undefined, confirmed: state.requirement?.revision === req.revision && state.confirmed };
    return inputs;
  }

  async function perform(raw: unknown) {
    const action = panelAction.parse(raw);
    log.appendLine(`action: ${action.type} started`);
    if (!context.storageUri) throw new Error('Workspace session storage is unavailable.');
    const folder = context.storageUri.fsPath;
    if (action.type === 'showMemoryLocation' || action.type === 'clearNovaDeskSession') {
      const root = workspaceRoot();
      if (action.type === 'showMemoryLocation') {
        await mkdir(folder, { recursive: true });
        const info = await lstat(folder);
        if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Memory must be a regular local directory.');
        await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(folder));
        state = { ...state, memoryLocation: folder, error: undefined };
      } else {
        const choice = await vscode.window.showWarningMessage('Clear NovaDesk session?', { modal: true, detail: `Removes Vadhyar’s NovaDesk learning records, saved explanation and extraction/check scratch data. Project Guide records, workspace files and stored credentials stay. Uses OS Trash when supported. This starts a new NovaDesk session.\n\nWorkspace: ${root}` }, 'Clear NovaDesk session');
        if (choice !== 'Clear NovaDesk session') return state;
        await clearNovaDeskSession(folder, path => vscode.workspace.fs.delete(vscode.Uri.file(path), { recursive: true, useTrash: true }));
        baseline = undefined;
        state = { refs: [], busy: false, confirmed: false, stage: 'confirm', sessionCleared: randomUUID(), hasKey: Boolean(await context.secrets.get('openai.apiKey')), memoryLocation: state.memoryLocation, notice: 'NovaDesk session cleared. Project Guide, workspace files and credentials were preserved.' };
        const notice = state.notice;
        try { await perform({ type: 'ready' }); }
        catch { state = { ...state, error: 'Session cleared, but the current requirement or source is unavailable. Restore prepared files, then refresh.' }; }
        state = { ...state, notice };
      }
      await publish(); return state;
    }
    const session = await loadSession(folder).catch(error => { invalidate('Saved session is unavailable. Its file is preserved; show memory location to inspect it.'); throw error; });
    if (action.type === 'importRequirement' || action.type === 'usePreparedRequirement') {
      const root = workspaceRoot();
      if (action.type === 'importRequirement') {
        const picked = await vscode.window.showOpenDialog({ title: 'Import an OpenSpec Markdown requirement', defaultUri: vscode.Uri.file(root), canSelectMany: false, filters: { Markdown: ['md'] } });
        if (!picked?.[0]) return state;
        if (picked[0].scheme !== 'file') throw new Error('Choose a local workspace specification.');
        const file = await readSpecification(root, relative(root, picked[0].fsPath));
        if (vscode.workspace.textDocuments.some(doc => doc.isDirty && doc.uri.fsPath === file.absolutePath)) throw new Error('Save the specification before importing.');
        const items = parseSpecification(file.content);
        const choice = await vscode.window.showQuickPick(items.map(item => ({ label: item.title, description: `${item.scenarios.length} descriptive scenarios` })), { title: 'Select one requirement to understand' });
        if (!choice) return state;
        const current = await readSpecification(root, file.path);
        if (current.hash !== file.hash) throw new Error('Specification changed during selection; import again.');
        session.activeImport = { path: file.path, title: choice.label };
      } else delete session.activeImport;
      delete session.activeExercise;
      await saveSession(folder, session);
      baseline = undefined; state = { refs: [], busy: false };
      return perform({ type: 'ready' });
    }
    let current;
    try { current = await prepared(); }
    catch (error) { invalidate('Current context is unavailable. Save prepared files, then refresh; recorded evidence is historical.'); throw error; }
    const { source, requirement, req } = current;
    if (state.requirement && state.requirement.revision !== req.revision) baseline = undefined;
    const inputs = await freshness(source, req);
    if (action.type === 'startTransfer') {
      if (session.activeExercise || session.activeImport || !state.ownershipCurrent || state.ownershipRun?.kind !== 'completed' || !state.ownershipRun.requirementPassed || state.ownershipRun.suiteId !== 'ownership') throw new Error('Pass all three current ownership checks before starting the transfer.');
      const assets = await ownershipInputs(context.extensionUri.fsPath, true);
      const content = assets.assets.find(asset => asset.path === 'fixtures/novadesk/transfer.md')!.content;
      const target = join(current.root, scenario.transfer.requirementPath);
      try {
        const info = await lstat(target);
        if (!info.isFile() || info.isSymbolicLink() || (await readPrepared(current.root, scenario.transfer.requirementPath)).hash !== hash(content)) throw new Error('The transfer requirement file already contains different work; preserve it and use a fresh prepared copy.');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        await writeFile(target, content, { flag: 'wx', mode: 0o600 });
      }
      session.activeExercise = 'transfer';
      await saveSession(folder, session);
      baseline = undefined; state = { refs: [], busy: false };
      return perform({ type: 'ready' });
    }
    if (req.checksAvailable === false && ['savePrediction', 'runCounterexample', 'previewHint', 'hint', 'openDiff', 'runOwnership', 'saveReflection'].includes(action.type)) throw new Error('Imported scenarios are descriptive and have no trusted executable mapping. Use the prepared requirement for ownership checks.');
    if (!inputs && ['savePrediction', 'runCounterexample', 'previewHint', 'hint', 'runOwnership'].includes(action.type)) throw new Error('Trusted ownership definitions are changed or unavailable. Restore the bundled checks before continuing.');
    let learning = session.learning.find(item => item.requirementRevision === req.revision);
    if (action.type === 'ready') {
      const prediction = req.checksAvailable === false ? undefined : learning?.predictionId ? session.predictions.find(item => item.id === learning?.predictionId) : session.predictions.filter(item => item.requirementRevision === req.revision).at(-1);
      const events = session.activity.filter(item => (item.type === 'ownership' || item.type === 'counterexample' ? item.run : item).predictionId === prediction?.id);
      const counter = events.filter(item => item.type === 'counterexample').at(-1);
      const diff = events.filter(item => item.type === 'diff').at(-1);
      const ownership = events.filter(item => item.type === 'ownership').at(-1);
      const before = learning?.baseline ?? (diff?.type === 'diff' ? diff.before : session.checkpoints.filter(item => item.hash === prediction?.sourceHash && item.requirementRevision === req.revision).at(-1)) ?? (prediction?.sourceHash === source.hash ? source : undefined);
      baseline = before && prediction && before.hash === prediction.sourceHash ? { ...source, content: before.content, hash: before.hash } : undefined;
      if (!state.explanation) {
        const recorded = await loadExplanation(folder);
        if (recorded) state = { ...state, explanation: recorded, walkthrough: { sourceHash: recorded.sourceHash, requirementRevision: recorded.requirementRevision, index: 0 } };
      }
      state = { ...state, exercise: session.activeExercise ?? 'ownership', prediction, baselineHash: baseline?.hash, counterexample: counter?.type === 'counterexample' ? counter.run : undefined, hints: events.filter(item => item.type === 'hint'), diff: diff?.type === 'diff' ? diff : undefined, ownershipRun: ownership?.type === 'ownership' ? ownership.run : undefined, reflections: events.filter(item => item.type === 'reflection'), busy: false, counterexampleRunning: false, ownershipRunning: false, sourceHash: source.hash, requirement: req, confirmed: session.requirements.some(item => item.revision === req.revision) };
      const suggested = state.ownershipRun ? 'verify' : state.diff ? 'change' : state.counterexample?.kind === 'completed' ? 'observe' : prediction ? 'predict' : state.confirmed ? 'understand' : 'confirm';
      const stage = learning?.stage ?? suggested;
      const available = availableSteps(state);
      state = { ...state, stage: available.includes(stage) ? stage : available.at(-1), refs: withApprovalReference(state.refs.filter(ref => ref.id.startsWith('approval-') || state.referencesRequirementRevision === req.revision), source), referencesRequirementRevision: req.revision, notice: learning?.pending ? 'The previous check was interrupted. No outcome was accepted for that execution; retry explicitly.' : prediction && !counter ? 'Saved prediction restored. No counterexample outcome is stored; run the saved case explicitly.' : undefined };
    } else if (action.type === 'setupKey') {
      await setupKey();
    } else if (action.type === 'confirmRequirement') {
      if (action.revision !== requirement.hash || state.requirement?.revision !== action.revision) throw new Error('Requirement changed; refresh and confirm its current text.');
      if (!session.requirements.some(item => item.revision === req.revision)) session.requirements.push({ ...req, confirmedAt: new Date().toISOString() });
      if (!learning && req.checksAvailable !== false) { learning = { requirementRevision: req.revision, sourceHash: source.hash, stage: 'understand' }; session.learning.push(learning); }
      await saveSession(folder, session);
      state = { ...state, stage: learning?.stage ?? 'understand' };
    } else if (action.type === 'checkpoint') {
      if (!session.requirements.some(item => item.revision === req.revision)) throw new Error('Confirm the current requirement before capturing source.');
      session.checkpoints.push({ capturedAt: new Date().toISOString(), path: 'src/approval.ts', content: source.content, hash: source.hash, requirementRevision: req.revision });
      if (learning) learning.checkpointHash = source.hash;
      await saveSession(folder, session);
    } else if (action.type === 'savePrediction') {
      if (!session.requirements.some(item => item.revision === req.revision) || action.requirementRevision !== req.revision || action.sourceHash !== source.hash) throw new Error('Confirm the current requirement and refresh source before predicting.');
      if (state.prediction) throw new Error('A prediction is already saved for this interaction.');
      if (session.predictions.length >= 20) throw new Error('This session has reached its 20-prediction limit.');
      const prediction = { id: randomUUID(), savedAt: new Date().toISOString(), predictedApproval: action.predictedApproval, reasoning: action.reasoning, sourceHash: source.hash, requirementRevision: req.revision, ...(session.activeExercise ? { caseId: 'owner-client-archived' as const } : {}) };
      session.predictions.push(prediction);
      learning ??= { requirementRevision: req.revision, sourceHash: source.hash, stage: 'predict' };
      if (!session.learning.includes(learning)) session.learning.push(learning);
      Object.assign(learning, { stage: 'predict', sourceHash: source.hash, predictionId: prediction.id, baseline: { content: source.content, hash: source.hash } });
      await saveSession(folder, session);
      baseline = source;
      state = { ...state, prediction, baselineHash: source.hash, counterexample: undefined, stage: 'predict' };
    } else if (action.type === 'runCounterexample') {
      const prediction = session.predictions.find(item => item.id === action.predictionId);
      const runSource = baseline && baseline.hash === prediction?.sourceHash ? baseline : source;
      if (!prediction || state.prediction?.id !== prediction.id || prediction.sourceHash !== runSource.hash || prediction.requirementRevision !== req.revision) throw new Error('Save a prediction for the current source and requirement before running.');
      if (state.counterexample?.kind === 'completed') throw new Error('This counterexample is already observed. Edit and save source, open its diff, then rerun all ownership checks.');
      if (session.activity.length >= 60) throw new Error('This session has reached its 60-activity limit.');
      learning ??= { requirementRevision: req.revision, sourceHash: source.hash, stage: 'predict', predictionId: prediction.id, baseline: { content: runSource.content, hash: runSource.hash } };
      if (!session.learning.includes(learning)) session.learning.push(learning);
      learning.pending = { kind: 'counterexample', startedAt: new Date().toISOString(), sourceHash: runSource.hash };
      await saveSession(folder, session);
      state = { ...state, counterexample: undefined, counterexampleRunning: true, busy: true, error: undefined }; void publish();
      const result = await runOwnership(context.extensionUri.fsPath, folder, runSource, prediction);
      session.activity.push({ type: 'counterexample', run: result });
      delete learning.pending;
      learning.stage = result.kind === 'completed' ? 'observe' : 'predict';
      await saveSession(folder, session);
      const current = await prepared();
      if (current.source.hash !== source.hash || current.requirement.hash !== req.revision || state.prediction?.id !== prediction.id) throw new Error('Source or requirement changed during the run; no current outcome was accepted. Refresh and predict again.');
      if (result.kind === 'completed') baseline = runSource;
      state = { ...state, baselineHash: baseline?.hash, hints: state.hints ?? [], counterexample: result, stage: learning.stage, counterexampleRunning: false, busy: false, notice: undefined };
      log.appendLine(`counterexample: ${result.kind}; runId=${result.id}; latencyMs=${result.latencyMs}`);
    } else if (['previewHint', 'hint', 'openDiff', 'runOwnership'].includes(action.type)) {
      const prediction = session.predictions.find(item => item.id === state.prediction?.id);
      const counterexample = state.counterexample;
      if (!baseline || !prediction || prediction.sourceHash !== baseline.hash || prediction.requirementRevision !== req.revision || counterexample?.kind !== 'completed' || counterexample.requirementPassed || counterexample.predictionId !== prediction.id) throw new Error('Observe the saved prediction’s failed ownership counterexample before guided editing.');
      if (session.activity.length >= 60) throw new Error('This session has reached its 60-activity limit.');
      if (action.type === 'previewHint' || action.type === 'hint') {
        if (!sameChecks(counterexample, inputs)) throw new Error('Recorded counterexample uses stale trusted check definitions. Restore its bundled definitions before requesting guidance.');
        const refs = [approvalReference(source)];
        const previous = state.hints?.map(item => item.result.hint) ?? [];
        if (previous.length >= 3) throw new Error('All three hint levels are used. Edit and save source, then open the diff and rerun checks.');
        const preview = previewHint(model(), requirement, source, refs, prediction, counterexample, previous);
        if (action.type === 'previewHint') {
          state = { ...state, hintPreview: preview, refs: withApprovalReference(state.refs, source), referencesRequirementRevision: req.revision };
        } else {
          if (state.hintPreview?.identity !== preview.identity || action.identity !== preview.identity) throw new Error('Hint preview is missing or stale; preview the current context again.');
          state = { ...state, hasKey: Boolean(await context.secrets.get('openai.apiKey')) }; await publish();
          if (!state.hasKey) await setupKey();
          const key = await context.secrets.get('openai.apiKey');
          if (!key) throw new Error('Secure key entry was cancelled; no hint request was made.');
          const beforeRequest = await prepared();
          if (beforeRequest.source.hash !== source.hash || beforeRequest.requirement.hash !== req.revision || model() !== preview.model || state.hintPreview?.identity !== preview.identity) throw new Error('Context changed; preview the hint again before sharing.');
          state = { ...state, busy: true, error: undefined }; void publish();
          request = new AbortController();
          let result;
          try { result = await requestHint(key, preview, refs, previous.length + 1, request.signal); }
          finally { request = undefined; }
          const current = await prepared();
          if (current.source.hash !== source.hash || current.requirement.hash !== req.revision || model() !== preview.model || state.hintPreview?.identity !== preview.identity || state.prediction?.id !== prediction.id) throw new Error('Context changed during the request; no hint was accepted.');
          const evidence = { id: randomUUID(), type: 'hint' as const, predictionId: prediction.id, recordedAt: new Date().toISOString(), sourceHash: source.hash, requirementRevision: req.revision, counterexampleId: counterexample.id, contextIdentity: preview.identity, result };
          session.activity.push(evidence);
          await saveSession(folder, session);
          state = { ...state, hints: [...(state.hints ?? []), evidence], hintPreview: undefined, refs: withApprovalReference(state.refs, source), referencesRequirementRevision: req.revision, busy: false };
          log.appendLine(`hint: validated; level=${result.hint.level}; responseId=${result.responseId}; latencyMs=${result.latencyMs}; totalTokens=${result.usage?.totalTokens ?? 'unavailable'}`);
        }
      } else if (action.type === 'openDiff') {
        if (source.hash === baseline.hash) throw new Error('Edit and save approval.ts yourself before opening the before/after diff.');
        await vscode.commands.executeCommand('vscode.diff', vscode.Uri.from({ scheme: 'vadhyar-before', path: '/src/approval.ts', query: baseline.hash }), vscode.Uri.file(source.absolutePath), 'NovaDesk — before edit ↔ saved source', { preview: true, viewColumn: vscode.ViewColumn.One });
        const current = await prepared();
        if (current.source.hash !== source.hash || current.requirement.hash !== req.revision || state.prediction?.id !== prediction.id) throw new Error('Source changed while opening the diff; save and open it again.');
        const diff = { id: randomUUID(), type: 'diff' as const, predictionId: prediction.id, recordedAt: new Date().toISOString(), sourceHash: source.hash, requirementRevision: req.revision, before: { content: baseline.content, hash: baseline.hash }, after: { content: source.content, hash: source.hash } };
        session.activity.push(diff);
        if (learning) { learning.sourceHash = source.hash; learning.stage = 'change'; }
        await saveSession(folder, session);
        state = { ...state, diff, stage: 'change' };
      } else if (action.type === 'runOwnership') {
        const diff = state.diff;
        if (!diff || diff.predictionId !== prediction.id || diff.before.hash !== baseline.hash || diff.after.hash !== source.hash || diff.requirementRevision !== req.revision) throw new Error('Open the before/after diff for your current saved source before rerunning.');
        if (!learning) throw new Error('Refresh the saved interaction before rerunning.');
        learning.pending = { kind: 'ownership', startedAt: new Date().toISOString(), sourceHash: source.hash, diffId: diff.id };
        await saveSession(folder, session);
        state = { ...state, ownershipRun: undefined, ownershipRunning: true, busy: true, error: undefined }; void publish();
        const result = await runFullOwnership(context.extensionUri.fsPath, folder, source, prediction);
        session.activity.push({ type: 'ownership', diffId: diff.id, run: result });
        delete learning.pending; learning.stage = 'verify'; learning.sourceHash = source.hash;
        await saveSession(folder, session);
        const current = await prepared();
        if (current.source.hash !== source.hash || current.requirement.hash !== req.revision || state.prediction?.id !== prediction.id || state.diff?.id !== diff.id) throw new Error('Source changed during the rerun; no current verdict was accepted. Save and open the diff again.');
        state = { ...state, ownershipRun: result, stage: 'verify', ownershipRunning: false, busy: false };
        log.appendLine(`ownership: ${result.kind}; runId=${result.id}; latencyMs=${result.latencyMs}`);
      }
    } else if (action.type === 'setStage') {
      if (!session.requirements.some(item => item.revision === req.revision) || !availableSteps({ ...state, sourceHash: source.hash, requirement: req }).includes(action.stage)) throw new Error('This learning stage is not available for the saved interaction.');
      learning ??= { requirementRevision: req.revision, sourceHash: source.hash, stage: action.stage, predictionId: state.prediction?.id, baseline: baseline ? { content: baseline.content, hash: baseline.hash } : undefined };
      if (!session.learning.includes(learning)) session.learning.push(learning);
      learning.stage = action.stage; learning.sourceHash = source.hash;
      await saveSession(folder, session);
      state = { ...state, stage: action.stage };
    } else if (action.type === 'saveReflection') {
      if (!state.ownershipCurrent || !state.prediction || state.prediction.requirementRevision !== req.revision || !state.ownershipRun || action.sourceHash !== source.hash || action.requirementRevision !== req.revision) throw new Error('Rerun checks for the current source before recording its reflection.');
      if (session.activity.length >= 60) throw new Error('This session has reached its 60-activity limit.');
      const reflection = { type: 'reflection' as const, id: randomUUID(), predictionId: state.prediction.id, recordedAt: new Date().toISOString(), sourceHash: source.hash, requirementRevision: req.revision, text: action.text };
      session.activity.push(reflection);
      await saveSession(folder, session);
      state = { ...state, reflections: [...(state.reflections ?? []), reflection] };
    } else if (action.type === 'refreshGraph') {
      if (!session.requirements.some(item => item.revision === req.revision)) throw new Error('Confirm the requirement before extraction.');
      state = { ...state, mappingConfirmed: false, preview: undefined, graphCurrent: false, explanationCurrent: false, referencesCurrent: false, busy: true, error: undefined };
      void publish();
      const executable = vscode.workspace.getConfiguration('vadhyar').get<string>('graphifyPath') || join(context.extensionUri.fsPath, '.venv-graphify/bin/graphify');
      const graph = await extractGraph(executable, folder, source);
      const current = await prepared();
      if (current.source.hash !== source.hash || current.requirement.hash !== requirement.hash) throw new Error('Source or requirement changed during extraction; refresh.');
      state = { ...state, graph, refs: withApprovalReference(graph.refs, source), referencesRequirementRevision: req.revision, busy: false };
    } else if (action.type === 'confirmMapping') {
      if (!state.graphCurrent || !state.graph || action.identity !== state.graph.identity || state.requirement?.revision !== req.revision) throw new Error('Graph mapping is missing or stale.');
      state = { ...state, mappingConfirmed: true, mappingRequirementRevision: req.revision };
    } else if (action.type === 'previewExplain' || action.type === 'explain') {
      if (!session.requirements.some(item => item.revision === req.revision) || !state.mappingConfirmed || state.mappingRequirementRevision !== req.revision || !state.graphCurrent || !state.graph) throw new Error('Confirm the current requirement and source mapping before explanation.');
      const graph = state.graph;
      const preview = previewContext(model(), requirement, source, graph);
      if (action.type === 'previewExplain') {
        state = { ...state, preview };
      } else {
        if (!state.preview || action.identity !== preview.identity || state.preview.identity !== preview.identity) throw new Error('Sharing preview is missing or stale; preview current context again.');
        const key = await context.secrets.get('openai.apiKey');
        if (!key) throw new Error('Set an OpenAI API key securely in VS Code first.');
        state = { ...state, busy: true, error: undefined }; void publish();
        request = new AbortController();
        let result;
        try { result = await explain(key, preview, state.refs, request.signal); }
        finally { request = undefined; }
        const current = await prepared();
        if (current.source.hash !== source.hash || current.requirement.hash !== requirement.hash || model() !== preview.model || state.preview?.identity !== preview.identity) throw new Error('Context changed during the request; response rejected as stale.');
        const evidence = { capturedAt: new Date().toISOString(), requirementRevision: req.revision, sourceHash: source.hash, contextIdentity: preview.identity, graphIdentity: graph.identity, graphifyVersion: graph.version, graphReferences: graph.refs.length, graphRelationships: graph.relationships.length, ...result };
        await saveExplanation(folder, evidence);
        state = { ...state, explanation: result, walkthrough: { sourceHash: source.hash, requirementRevision: req.revision, index: 0 }, busy: false };
        await openSource(result.explanation.steps[0].sourceRefId, source, true);
        log.appendLine(`explain: validated; latencyMs=${result.latencyMs}; totalTokens=${result.usage?.totalTokens ?? 'unavailable'}`);
      }
    } else if (action.type === 'walkthroughStep' || action.type === 'exportWalkthrough') {
      if (!state.explanationCurrent) throw new Error('Recorded explanation is stale or its source links are unavailable. Refresh current context first.');
      if (!state.explanation || !state.walkthrough) throw new Error('Generate a current explanation first.');
      const explanation = state.explanation;
      const identity = state.walkthrough;
      const tour = codeTour(explanation, state.refs, source, identity, req.revision);
      if (action.type === 'walkthroughStep') {
        const step = explanation.explanation.steps[action.index];
        if (!step) throw new Error('Unknown walkthrough step.');
        await openSource(step.sourceRefId, source, true);
        state = { ...state, walkthrough: { ...identity, index: action.index } };
      } else {
        const exported = await exportText('Export CodeTour walkthrough', 'vadhyar.tour', 'tour', JSON.stringify(tour, null, 2) + '\n', async () => {
          const current = await prepared();
          codeTour(explanation, state.refs, current.source, identity, current.req.revision);
        });
        if (!exported) return state;
        state = { ...state, notice: 'Walkthrough exported in CodeTour format.' };
      }
    } else if (action.type === 'exportHandover') {
      const rows = sessionEvidence(session, { sourceHash: source.hash, requirementRevision: req.revision, fingerprints: inputs?.fingerprints, explanationCurrent: Boolean(state.explanationCurrent) }, await loadExplanation(folder));
      const text = handoverReport(session, rows);
      const captured = JSON.stringify(session);
      const exported = await exportText('Export NovaDesk evidence handover', 'vadhyar-handover.md', 'md', text, async () => {
        const latest = await prepared();
        const checks = await freshness(latest.source, latest.req);
        if (latest.source.hash !== source.hash || latest.req.revision !== req.revision || JSON.stringify(await loadSession(folder)) !== captured || JSON.stringify(checks?.fingerprints) !== JSON.stringify(inputs?.fingerprints)) throw new Error('Evidence inputs changed during export; refresh and export again.');
      });
      if (!exported) return state;
      state = { ...state, notice: 'NovaDesk handover exported from recorded evidence.' };
    } else if (action.type === 'openSource') {
      await openSource(action.id, source);
    }
    const latest = await prepared().catch(error => { invalidate('Current context is unavailable. Recorded evidence is historical; save and refresh.'); throw error; });
    const latestInputs = await freshness(latest.source, latest.req, Boolean(learning?.pending));
    if (latest.source.hash !== source.hash || latest.req.revision !== req.revision) { invalidate('Source or requirement changed during this action; refresh current context.'); throw new Error(state.error); }
    state = { ...state, sourceHash: source.hash, requirement: req, confirmed: session.requirements.some(item => item.revision === req.revision), checkpointCount: session.checkpoints.length, checkpointHash: learning?.checkpointHash ?? session.checkpoints.filter(item => item.requirementRevision === req.revision).at(-1)?.hash, hasKey: Boolean(await context.secrets.get('openai.apiKey')), error: undefined };
    state = { ...state, evidence: sessionEvidence(session, { sourceHash: source.hash, requirementRevision: req.revision, fingerprints: learning?.pending ? undefined : latestInputs?.fingerprints, explanationCurrent: Boolean(state.explanationCurrent) }, await loadExplanation(folder)) };
    await publish();
    log.appendLine(`action: ${action.type} finished`);
    return state;
  }
  function act(raw: unknown) {
    const parsed = panelAction.safeParse(raw);
    if (parsed.success && parsed.data.type === 'cancelExplain') { request?.abort(); return Promise.resolve(state); }
    const result = queue.then(() => perform(raw));
    queue = result.catch(() => undefined);
    return result.catch(error => { state = { ...state, busy: false, counterexampleRunning: false, ownershipRunning: false, error: error instanceof Error ? error.message.slice(0, 250) : 'Unsupported action.' }; void publish(); throw error; });
  }

  const workspace = vscode.workspace.workspaceFolders?.[0]?.uri;
  if (workspace?.scheme === 'file') {
    const sources = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(workspace, '{src/approval.ts,**/*.md}'));
    const definitions = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(context.extensionUri, '{fixtures/novadesk/*.test.ts,fixtures/novadesk/*config.ts,fixtures/novadesk/transfer.md,package-lock.json,node_modules/vitest/package.json}'));
    const changed = (uri: vscode.Uri) => {
      if ([join(workspace.fsPath, 'src/approval.ts'), join(workspace.fsPath, scenario.requirementPath), ...(state.requirement?.sourcePath ? [join(workspace.fsPath, state.requirement.sourcePath)] : [])].includes(uri.fsPath)) {
        if (uri.fsPath.endsWith('.md')) state = { ...state, confirmed: false };
        invalidate('Prepared source or requirement changed on disk. Refresh; saved evidence remains historical.');
      }
    };
    const checksChanged = () => {
      state = { ...state, evidence: state.evidence?.map(item => ({ ...item, current: false })), counterexampleCurrent: false, ownershipCurrent: false, checksSupported: false, hintPreview: undefined, error: 'Trusted check definitions changed. Refresh after restoring the bundled checks; prior outcomes are historical.' };
      void publish();
    };
    context.subscriptions.push(sources, definitions, sources.onDidChange(changed), sources.onDidCreate(changed), sources.onDidDelete(changed), definitions.onDidChange(checksChanged), definitions.onDidCreate(checksChanged), definitions.onDidDelete(checksChanged));
  }

  context.subscriptions.push({ dispose() { project?.dispose(); projectPanel?.dispose(); } },
    vscode.commands.registerCommand('vadhyar.captureIntent', (raw: unknown) => projectController().captureIntent(raw)),
    vscode.commands.registerCommand('vadhyar.project', async () => {
      const guide = projectController();
      if (projectPanel) { projectPanel.reveal(vscode.ViewColumn.Beside); await guide.act({ type: 'projectReady' }); return { opened: true }; }
      const dist = vscode.Uri.joinPath(context.extensionUri, 'dist');
      projectPanel = vscode.window.createWebviewPanel('vadhyar-project', 'Vadhyar — Project Guide', vscode.ViewColumn.Beside, { enableScripts: true, localResourceRoots: [dist] });
      const nonce = randomBytes(16).toString('hex'); const base = `${projectPanel.webview.asWebviewUri(dist)}/`;
      const script = projectPanel.webview.asWebviewUri(vscode.Uri.joinPath(dist, 'panel.js')); const style = projectPanel.webview.asWebviewUri(vscode.Uri.joinPath(dist, 'panel.css'));
      projectPanel.webview.html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri ${projectPanel.webview.cspSource}; style-src ${projectPanel.webview.cspSource}; img-src ${projectPanel.webview.cspSource}; font-src ${projectPanel.webview.cspSource}; script-src 'nonce-${nonce}'"><base href="${base}"><link rel="stylesheet" href="${style}"></head><body><div id="root"></div><script nonce="${nonce}" src="${script}"></script></body></html>`;
      projectPanel.onDidDispose(() => { projectPanel = undefined; });
      projectPanel.webview.onDidReceiveMessage(raw => {
        const operationId = randomUUID(), started = Date.now(); log.appendLine(`project action started; operationId=${operationId}`);
        const task = raw?.type === 'setupKey' ? setupKey().then(() => guide.act({ type: 'projectReady' })) : guide.act(raw?.type === 'ready' ? { type: 'projectReady' } : raw);
        void task.then(() => { log.appendLine(`project action completed; operationId=${operationId}; latencyMs=${Date.now() - started}`); }, () => { log.appendLine(`project action failed; operationId=${operationId}; latencyMs=${Date.now() - started}; category=operation`); });
      });
      await guide.act({ type: 'projectReady' }); return { opened: true };
    }));
  context.subscriptions.push(log, vscode.workspace.registerTextDocumentContentProvider('vadhyar-before', {
    provideTextDocumentContent(uri) {
      if (!baseline || uri.path !== '/src/approval.ts' || uri.query !== baseline.hash) throw new Error('Captured before-edit source is unavailable.');
      return baseline.content;
    },
  }), vscode.commands.registerCommand('vadhyar.setupKey', setupKey), vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document.uri.scheme === 'file' && (/\/(src\/approval\.ts|vadhyar-(requirement|transfer)\.md)$/.test(event.document.uri.path) || (state.requirement?.sourcePath && event.document.uri.fsPath === join(workspaceRoot(), state.requirement.sourcePath)))) {
      if (event.document.uri.path.endsWith('.md')) state = { ...state, confirmed: false };
      invalidate('Prepared source or requirement changed; save and refresh. Recorded evidence is retained as historical.');
    }
  }), vscode.commands.registerCommand('vadhyar.open', async () => {
    const root = workspaceRoot();
    try { if (!(await readFile(join(root, scenario.requirementPath), 'utf8')).includes(`ID: ${scenario.requirementId}\n`)) return vscode.commands.executeCommand('vadhyar.project'); }
    catch { return vscode.commands.executeCommand('vadhyar.project'); }
    if (panel) { panel.reveal(panel.viewColumn); return { opened: true }; }
    const dist = vscode.Uri.joinPath(context.extensionUri, 'dist');
    panel = vscode.window.createWebviewPanel('vadhyar', 'Vadhyar', vscode.ViewColumn.Beside, { enableScripts: true, localResourceRoots: [dist] });
    const nonce = randomBytes(16).toString('hex');
    const base = `${panel.webview.asWebviewUri(dist)}/`;
    const script = panel.webview.asWebviewUri(vscode.Uri.joinPath(dist, 'panel.js'));
    const style = panel.webview.asWebviewUri(vscode.Uri.joinPath(dist, 'panel.css'));
    panel.webview.html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri ${panel.webview.cspSource}; style-src ${panel.webview.cspSource}; img-src ${panel.webview.cspSource}; font-src ${panel.webview.cspSource}; script-src 'nonce-${nonce}'"><base href="${base}"><link rel="stylesheet" href="${style}"></head><body><div id="root"></div><script nonce="${nonce}" src="${script}"></script></body></html>`;
    panel.onDidDispose(() => { panel = undefined; });
    panel.webview.onDidReceiveMessage(raw => void act(raw).catch(error => {
      state = { ...state, busy: false, error: error instanceof Error ? error.message.slice(0, 250) : 'Unsupported action.' };
      void publish(); log.appendLine('panel: action rejected');
    }));
    try { await act({ type: 'ready' }); }
    catch (error) { state = { refs: [], busy: false, error: error instanceof Error ? error.message.slice(0, 250) : 'Requirement unavailable. Import it again or use the prepared requirement.' }; await publish(); }
    return { opened: true };
  }));
  log.appendLine('activation: ready');
  return { act, inspect: () => state, projectAct: (raw: unknown) => projectController().act(raw), inspectProject: () => project?.inspect() };
}
