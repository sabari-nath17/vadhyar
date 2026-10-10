import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

export async function run() {
  const extension = vscode.extensions.getExtension('sabari-nath17.vadhyar');
  assert(extension, 'extension manifest discovered');
  await extension.activate();
  assert(extension.isActive, 'real extension host activated');
  if (!vscode.workspace.isTrusted) {
    await vscode.commands.executeCommand('workbench.trust.manage');
    await new Promise<void>(resolve => {
      const listener = vscode.workspace.onDidGrantWorkspaceTrust(() => { listener.dispose(); resolve(); });
    });
  }
  assert(vscode.workspace.isTrusted, 'prepared workspace trusted');
  assert.deepEqual(await vscode.commands.executeCommand('vadhyar.open'), { opened: true });
  await writeFile('/tmp/vadhyar-host-evidence.json', JSON.stringify({ capturedAt: new Date().toISOString(), vscode: vscode.version, activated: true, panelOpened: true, trusted: true }, null, 2));
}
