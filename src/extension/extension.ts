import * as vscode from 'vscode';
import { randomBytes, randomUUID } from 'node:crypto';
import { rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { panelAction, type PanelState } from '../shared.js';
import { approvalReference, withApprovalReference, readPrepared, resolveReference, type PreparedFile } from './source.js';
import { loadSession, saveSession } from './session.js';
import { extractGraph } from './graphify.js';
import { explain, previewContext, previewHint, requestHint } from './coach.js';
import { runFullOwnership, runOwnership } from './checks.js';
import scenario from '../../fixtures/novadesk/scenario.json' with { type: 'json' };

export function activate(context: vscode.ExtensionContext) {
  const log = vscode.window.createOutputChannel('Vadhyar');
  let panel: vscode.WebviewPanel | undefined;
  let state: PanelState = { refs: [], busy: false };
  let queue: Promise<unknown> = Promise.resolve();
  let request: AbortController | undefined;
  let baseline: PreparedFile | undefined;
  const publish = () => panel?.webview.postMessage(state);
  const model = () => vscode.workspace.getConfiguration('vadhyar').get<string>('model', 'gpt-6-astra');
  async function setupKey() {
    const value = await vscode.window.showInputBox({ title: 'Vadhyar — OpenAI API key', prompt: 'Stored only in VS Code SecretStorage. Never paste this key in chat.', password: true, ignoreFocusOut: true, validateInput: text => /^\S{20,512}$/.test(text.trim()) ? undefined : 'Enter a nonempty API key (20–512 characters).' });
    if (value !== undefined) await context.secrets.store('openai.apiKey', value.trim());
    state = { ...state, hasKey: Boolean(await context.secrets.get('openai.apiKey')) };
    await publish();
  }

  async function prepared() {
    if (!vscode.workspace.isTrusted) throw new Error('Trust the prepared NovaDesk workspace first.');
    const folders = vscode.workspace.workspaceFolders;
    if (folders?.length !== 1 || folders[0].uri.scheme !== 'file') throw new Error('Open one local prepared NovaDesk folder.');
    const root = folders[0].uri.fsPath;
    const requirement = await readPrepared(root, scenario.requirementPath);
    if (!requirement.content.includes(`ID: ${scenario.requirementId}\n`)) throw new Error('Unsupported NovaDesk requirement.');
    const source = await readPrepared(root, scenario.entrypoint.path);
    if (vscode.workspace.textDocuments.some(doc => doc.isDirty && [source.absolutePath, requirement.absolutePath, join(root, source.path), join(root, requirement.path)].includes(doc.uri.fsPath))) throw new Error('Save prepared files before navigation or context capture.');
    return { root, source, requirement };
  }

  async function perform(raw: unknown) {
    const action = panelAction.parse(raw);
    log.appendLine(`action: ${action.type} started`);
    const { source, requirement } = await prepared();
    if (!context.storageUri) throw new Error('Workspace session storage is unavailable.');
    const folder = context.storageUri.fsPath;
    const session = await loadSession(folder);
    const req = { id: scenario.requirementId as 'novadesk-approval-ownership', revision: requirement.hash, text: requirement.content };
    if (action.type === 'ready') {
      if (!baseline || state.prediction?.requirementRevision !== req.revision) { baseline = undefined; state = { refs: [], busy: false }; }
      state = { ...state, refs: withApprovalReference(state.refs, source), busy: false };
    } else if (action.type === 'setupKey') {
      await setupKey();
    } else if (action.type === 'confirmRequirement') {
      if (action.revision !== requirement.hash || state.requirement?.revision !== action.revision) throw new Error('Requirement changed; refresh and confirm its current text.');
      if (!session.requirements.some(item => item.revision === req.revision)) session.requirements.push({ ...req, confirmedAt: new Date().toISOString() });
      await saveSession(folder, session);
    } else if (action.type === 'checkpoint') {
      if (!session.requirements.some(item => item.revision === req.revision)) throw new Error('Confirm the current requirement before capturing source.');
      session.checkpoints.push({ capturedAt: new Date().toISOString(), path: 'src/approval.ts', content: source.content, hash: source.hash, requirementRevision: req.revision });
      await saveSession(folder, session);
    } else if (action.type === 'savePrediction') {
      if (!session.requirements.some(item => item.revision === req.revision) || action.requirementRevision !== req.revision || action.sourceHash !== source.hash) throw new Error('Confirm the current requirement and refresh source before predicting.');
      if (state.prediction) throw new Error('A prediction is already saved for this interaction.');
      if (session.predictions.length >= 20) throw new Error('This session has reached its 20-prediction limit.');
      const prediction = { id: randomUUID(), savedAt: new Date().toISOString(), predictedApproval: action.predictedApproval, reasoning: action.reasoning, sourceHash: source.hash, requirementRevision: req.revision };
      session.predictions.push(prediction);
      await saveSession(folder, session);
      state = { ...state, prediction, counterexample: undefined };
    } else if (action.type === 'runCounterexample') {
      const prediction = session.predictions.find(item => item.id === action.predictionId);
      if (!prediction || state.prediction?.id !== prediction.id || prediction.sourceHash !== source.hash || prediction.requirementRevision !== req.revision) throw new Error('Save a prediction for the current source and requirement before running.');
      if (state.counterexample?.kind === 'completed') throw new Error('This counterexample is already observed. Edit and save source, open its diff, then rerun all ownership checks.');
      state = { ...state, counterexample: undefined, counterexampleRunning: true, busy: true, error: undefined }; void publish();
      const result = await runOwnership(context.extensionUri.fsPath, folder, source, prediction);
      const current = await prepared();
      if (current.source.hash !== source.hash || current.requirement.hash !== req.revision || state.prediction?.id !== prediction.id) throw new Error('Source or requirement changed during the run; no current outcome was accepted. Refresh and predict again.');
      if (result.kind === 'completed') baseline = source;
      state = { ...state, baselineHash: baseline?.hash, hints: [], counterexample: result, counterexampleRunning: false, busy: false };
      log.appendLine(`counterexample: ${result.kind}; runId=${result.id}; latencyMs=${result.latencyMs}`);
    } else if (['previewHint', 'hint', 'openDiff', 'runOwnership'].includes(action.type)) {
      const prediction = session.predictions.find(item => item.id === state.prediction?.id);
      const counterexample = state.counterexample;
      if (!baseline || !prediction || prediction.sourceHash !== baseline.hash || prediction.requirementRevision !== req.revision || counterexample?.kind !== 'completed' || counterexample.requirementPassed || counterexample.predictionId !== prediction.id) throw new Error('Observe the saved prediction’s failed ownership counterexample before guided editing.');
      if (session.activity.length >= 60) throw new Error('This session has reached its 60-activity limit.');
      if (action.type === 'previewHint' || action.type === 'hint') {
        const refs = [approvalReference(source)];
        const previous = state.hints?.map(item => item.result.hint) ?? [];
        if (previous.length >= 3) throw new Error('All three hint levels are used. Edit and save source, then open the diff and rerun checks.');
        const preview = previewHint(model(), requirement, source, refs, prediction, counterexample, previous);
        if (action.type === 'previewHint') {
          state = { ...state, hintPreview: preview, refs: withApprovalReference(state.refs, source) };
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
          state = { ...state, hints: [...(state.hints ?? []), evidence], hintPreview: undefined, refs: withApprovalReference(state.refs, source), busy: false };
          log.appendLine(`hint: validated; level=${result.hint.level}; responseId=${result.responseId}; latencyMs=${result.latencyMs}; totalTokens=${result.usage?.totalTokens ?? 'unavailable'}`);
        }
      } else if (action.type === 'openDiff') {
        if (source.hash === baseline.hash) throw new Error('Edit and save approval.ts yourself before opening the before/after diff.');
        await vscode.commands.executeCommand('vscode.diff', vscode.Uri.from({ scheme: 'vadhyar-before', path: '/src/approval.ts', query: baseline.hash }), vscode.Uri.file(source.absolutePath), 'NovaDesk — before edit ↔ saved source', { preview: true, viewColumn: vscode.ViewColumn.One });
        const current = await prepared();
        if (current.source.hash !== source.hash || current.requirement.hash !== req.revision || state.prediction?.id !== prediction.id) throw new Error('Source changed while opening the diff; save and open it again.');
        const diff = { id: randomUUID(), type: 'diff' as const, predictionId: prediction.id, recordedAt: new Date().toISOString(), sourceHash: source.hash, requirementRevision: req.revision, before: { content: baseline.content, hash: baseline.hash }, after: { content: source.content, hash: source.hash } };
        session.activity.push(diff);
        await saveSession(folder, session);
        state = { ...state, diff };
      } else if (action.type === 'runOwnership') {
        const diff = state.diff;
        if (!diff || diff.predictionId !== prediction.id || diff.before.hash !== baseline.hash || diff.after.hash !== source.hash || diff.requirementRevision !== req.revision) throw new Error('Open the before/after diff for your current saved source before rerunning.');
        state = { ...state, ownershipRun: undefined, ownershipRunning: true, busy: true, error: undefined }; void publish();
        const result = await runFullOwnership(context.extensionUri.fsPath, folder, source, prediction);
        const current = await prepared();
        if (current.source.hash !== source.hash || current.requirement.hash !== req.revision || state.prediction?.id !== prediction.id || state.diff?.id !== diff.id) throw new Error('Source changed during the rerun; no current verdict was accepted. Save and open the diff again.');
        session.activity.push({ type: 'ownership', diffId: diff.id, run: result });
        await saveSession(folder, session);
        state = { ...state, ownershipRun: result, ownershipRunning: false, busy: false };
        log.appendLine(`ownership: ${result.kind}; runId=${result.id}; latencyMs=${result.latencyMs}`);
      }
    } else if (action.type === 'refreshGraph') {
      if (!session.requirements.some(item => item.revision === req.revision)) throw new Error('Confirm the requirement before extraction.');
      state = { ...state, graph: undefined, mappingConfirmed: false, preview: undefined, explanation: undefined, refs: [], busy: true, error: undefined };
      void publish();
      const graph = await extractGraph(join(context.extensionUri.fsPath, '.venv-graphify/bin/graphify'), folder, source);
      const current = await prepared();
      if (current.source.hash !== source.hash || current.requirement.hash !== requirement.hash) throw new Error('Source or requirement changed during extraction; refresh.');
      state = { ...state, graph, refs: graph.refs, busy: false };
    } else if (action.type === 'confirmMapping') {
      if (!state.graph || action.identity !== state.graph.identity || state.graph.sourceHash !== source.hash || state.requirement?.revision !== req.revision) throw new Error('Graph mapping is missing or stale.');
      state = { ...state, mappingConfirmed: true, mappingRequirementRevision: req.revision };
    } else if (action.type === 'previewExplain' || action.type === 'explain') {
      if (!session.requirements.some(item => item.revision === req.revision) || !state.mappingConfirmed || state.mappingRequirementRevision !== req.revision || !state.graph) throw new Error('Confirm the current requirement and source mapping before explanation.');
      const graph = state.graph;
      const preview = previewContext(model(), requirement, source, graph);
      if (action.type === 'previewExplain') {
        state = { ...state, preview, explanation: undefined };
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
        const pending = join(folder, `gate-a-${randomUUID()}.tmp`);
        try { await writeFile(pending, JSON.stringify(evidence, null, 2), { flag: 'wx', mode: 0o600 }); await rename(pending, join(folder, 'gate-a.json')); }
        finally { await rm(pending, { force: true }); }
        state = { ...state, explanation: result, busy: false };
        log.appendLine(`explain: validated; latencyMs=${result.latencyMs}; totalTokens=${result.usage?.totalTokens ?? 'unavailable'}`);
      }
    } else if (action.type === 'openSource') {
      const ref = resolveReference(state.refs, action.id, source);
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(source.absolutePath));
      const editor = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One });
      const range = new vscode.Range(ref.startLine - 1, 0, ref.endLine - 1, doc.lineAt(ref.endLine - 1).text.length);
      editor.selection = new vscode.Selection(range.start, range.end);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
    state = { ...state, sourceHash: source.hash, requirement: req, confirmed: session.requirements.some(item => item.revision === req.revision), checkpointCount: session.checkpoints.length, checkpointHash: session.checkpoints.at(-1)?.hash, hasKey: Boolean(await context.secrets.get('openai.apiKey')), error: undefined };
    await publish();
    log.appendLine(`action: ${action.type} finished`);
    return state;
  }
  function act(raw: unknown) {
    const parsed = panelAction.safeParse(raw);
    if (parsed.success && parsed.data.type === 'cancelExplain') { request?.abort(); return Promise.resolve(state); }
    const result = queue.then(() => perform(raw));
    queue = result.catch(() => undefined);
    return result.catch(error => { state = { ...state, busy: false, counterexampleRunning: false, ownershipRunning: false }; throw error; });
  }

  context.subscriptions.push(log, vscode.workspace.registerTextDocumentContentProvider('vadhyar-before', {
    provideTextDocumentContent(uri) {
      if (!baseline || uri.path !== '/src/approval.ts' || uri.query !== baseline.hash) throw new Error('Captured before-edit source is unavailable.');
      return baseline.content;
    },
  }), vscode.commands.registerCommand('vadhyar.setupKey', setupKey), vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document.uri.scheme === 'file' && /\/(src\/approval\.ts|vadhyar-requirement\.md)$/.test(event.document.uri.path)) {
      if (!baseline || event.document.uri.path.endsWith('/vadhyar-requirement.md')) { baseline = undefined; state = { ...state, prediction: undefined, counterexample: undefined, baselineHash: undefined, hints: undefined }; }
      state = { ...state, refs: [], sourceHash: undefined, hintPreview: undefined, diff: undefined, ownershipRun: undefined, graph: undefined, mappingConfirmed: false, preview: undefined, explanation: undefined, error: `Prepared source changed; save and refresh current context.${baseline ? ' Before-edit evidence is retained for this interaction.' : ''}` };
      void publish();
    }
  }), vscode.commands.registerCommand('vadhyar.open', async () => {
    await prepared();
    if (panel) { panel.reveal(vscode.ViewColumn.Beside); return { opened: true }; }
    const dist = vscode.Uri.joinPath(context.extensionUri, 'dist');
    panel = vscode.window.createWebviewPanel('vadhyar', 'Vadhyar', vscode.ViewColumn.Beside, { enableScripts: true, localResourceRoots: [dist] });
    const nonce = randomBytes(16).toString('hex');
    const script = panel.webview.asWebviewUri(vscode.Uri.joinPath(dist, 'panel.js'));
    const style = panel.webview.asWebviewUri(vscode.Uri.joinPath(dist, 'panel.css'));
    panel.webview.html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource}; script-src 'nonce-${nonce}'"><link rel="stylesheet" href="${style}"></head><body><div id="root"></div><script nonce="${nonce}" src="${script}"></script></body></html>`;
    panel.onDidDispose(() => { panel = undefined; });
    panel.webview.onDidReceiveMessage(raw => void act(raw).catch(error => {
      state = { ...state, busy: false, error: error instanceof Error ? error.message.slice(0, 250) : 'Unsupported action.' };
      void publish(); log.appendLine('panel: action rejected');
    }));
    await act({ type: 'ready' });
    return { opened: true };
  }));
  log.appendLine('activation: ready');
  return { act, inspect: () => state };
}
