import * as vscode from 'vscode';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { panelAction, type PanelState } from '../shared.js';
import { approvalReference, readPrepared, resolveReference } from './source.js';
import { loadSession, saveSession } from './session.js';
import { extractGraph } from './graphify.js';
import scenario from '../../fixtures/novadesk/scenario.json' with { type: 'json' };

export function activate(context: vscode.ExtensionContext) {
  const log = vscode.window.createOutputChannel('Vadhyar');
  let panel: vscode.WebviewPanel | undefined;
  let state: PanelState = { refs: [], busy: false };
  let queue: Promise<unknown> = Promise.resolve();
  const publish = () => panel?.webview.postMessage(state);

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
    } else if (action.type === 'confirmRequirement') {
      if (action.revision !== requirement.hash || state.requirement?.revision !== action.revision) throw new Error('Requirement changed; refresh and confirm its current text.');
      if (!session.requirements.some(item => item.revision === req.revision)) session.requirements.push({ ...req, confirmedAt: new Date().toISOString() });
      await saveSession(folder, session);
    } else if (action.type === 'checkpoint') {
      if (!session.requirements.some(item => item.revision === req.revision)) throw new Error('Confirm the current requirement before capturing source.');
      session.checkpoints.push({ capturedAt: new Date().toISOString(), path: 'src/approval.ts', content: source.content, hash: source.hash, requirementRevision: req.revision });
      await saveSession(folder, session);
    } else if (action.type === 'refreshGraph') {
      if (!session.requirements.some(item => item.revision === req.revision)) throw new Error('Confirm the requirement before extraction.');
      state = { ...state, graph: undefined, mappingConfirmed: false, refs: [], busy: true, error: undefined };
      void publish();
      const graph = await extractGraph(join(context.extensionUri.fsPath, '.venv-graphify/bin/graphify'), folder, source);
      const current = await prepared();
      if (current.source.hash !== source.hash || current.requirement.hash !== requirement.hash) throw new Error('Source or requirement changed during extraction; refresh.');
      state = { ...state, graph, refs: graph.refs, busy: false };
    } else if (action.type === 'confirmMapping') {
      if (!state.graph || action.identity !== state.graph.identity || state.graph.sourceHash !== source.hash) throw new Error('Graph mapping is missing or stale.');
      state = { ...state, mappingConfirmed: true };
    } else if (action.type === 'openSource') {
      const ref = resolveReference(state.refs, action.id, source);
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(source.absolutePath));
      const editor = await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.One });
      const range = new vscode.Range(ref.startLine - 1, 0, ref.endLine - 1, doc.lineAt(ref.endLine - 1).text.length);
      editor.selection = new vscode.Selection(range.start, range.end);
      editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
    state = { ...state, requirement: req, confirmed: session.requirements.some(item => item.revision === req.revision), checkpointCount: session.checkpoints.length, checkpointHash: session.checkpoints.at(-1)?.hash, error: undefined };
    await publish();
    log.appendLine(`action: ${action.type} finished`);
    return state;
  }
  function act(raw: unknown) {
    const result = queue.then(() => perform(raw));
    queue = result.catch(() => undefined);
    return result.catch(error => { state = { ...state, busy: false }; throw error; });
  }

  context.subscriptions.push(log, vscode.commands.registerCommand('vadhyar.open', async () => {
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
