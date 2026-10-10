import * as vscode from 'vscode';
import { randomBytes, randomUUID } from 'node:crypto';
import { rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { panelAction, type PanelState } from '../shared.js';
import { approvalReference, readPrepared, resolveReference } from './source.js';
import { loadSession, saveSession } from './session.js';
import { extractGraph } from './graphify.js';
import { explain, previewContext } from './coach.js';
import { runOwnership } from './checks.js';
import scenario from '../../fixtures/novadesk/scenario.json' with { type: 'json' };

export function activate(context: vscode.ExtensionContext) {
  const log = vscode.window.createOutputChannel('Vadhyar');
  let panel: vscode.WebviewPanel | undefined;
  let state: PanelState = { refs: [], busy: false };
  let queue: Promise<unknown> = Promise.resolve();
  let request: AbortController | undefined;
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
      state = { refs: [approvalReference(source)], busy: false };
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
      if (state.counterexample?.kind === 'completed') throw new Error('This counterexample is already observed. Learner edits and reruns follow in S7.');
      state = { ...state, counterexample: undefined, counterexampleRunning: true, busy: true, error: undefined }; void publish();
      const result = await runOwnership(context.extensionUri.fsPath, folder, source, prediction);
      const current = await prepared();
      if (current.source.hash !== source.hash || current.requirement.hash !== req.revision || state.prediction?.id !== prediction.id) throw new Error('Source or requirement changed during the run; no current outcome was accepted. Refresh and predict again.');
      state = { ...state, counterexample: result, counterexampleRunning: false, busy: false };
      log.appendLine(`counterexample: ${result.kind}; runId=${result.id}; latencyMs=${result.latencyMs}`);
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
    return result.catch(error => { state = { ...state, busy: false, counterexampleRunning: false }; throw error; });
  }

  context.subscriptions.push(log, vscode.commands.registerCommand('vadhyar.setupKey', setupKey), vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document.uri.scheme === 'file' && /\/(src\/approval\.ts|vadhyar-requirement\.md)$/.test(event.document.uri.path)) {
      state = { ...state, refs: [], sourceHash: undefined, prediction: undefined, counterexample: undefined, graph: undefined, mappingConfirmed: false, preview: undefined, explanation: undefined, error: 'Prepared source changed; save and refresh current context.' };
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
