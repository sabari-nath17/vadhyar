import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

export async function run() {
  const extension = vscode.extensions.getExtension('sabari-nath17.vadhyar');
  assert(extension, 'extension manifest discovered');
  const api = await extension.activate();
  assert(extension.isActive, 'real extension host activated');
  if (!vscode.workspace.isTrusted) {
    await vscode.commands.executeCommand('workbench.trust.manage');
    await new Promise<void>(resolve => {
      const listener = vscode.workspace.onDidGrantWorkspaceTrust(() => { listener.dispose(); resolve(); });
    });
  }
  assert(vscode.workspace.isTrusted, 'prepared workspace trusted');
  assert.deepEqual(await vscode.commands.executeCommand('vadhyar.open'), { opened: true });
  const state = await api.act({ type: 'ready' });
  assert.equal(state.refs.length, 1);
  await assert.rejects(api.act({ type: 'openSource', id: 'invented' }));
  await api.act({ type: 'openSource', id: state.refs[0].id });
  const editor = vscode.window.activeTextEditor;
  assert(editor);
  assert(editor.document.uri.fsPath.endsWith('/novadesk/src/approval.ts'));
  assert.equal(editor.selection.start.line, state.refs[0].startLine - 1);
  await writeFile('/tmp/vadhyar-host-evidence.json', JSON.stringify({ capturedAt: new Date().toISOString(), vscode: vscode.version, activated: true, panelOpened: true, trusted: true, sourceOpened: 'src/approval.ts', selectedLine: state.refs[0].startLine, invalidIdRejected: true }, null, 2));
}
