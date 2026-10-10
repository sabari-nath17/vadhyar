import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

export async function run() {
  const progress = (step: string) => writeFile('/tmp/vadhyar-host-progress.json', JSON.stringify({ step, at: new Date().toISOString() }));
  await progress('activating');
  const extension = vscode.extensions.getExtension('sabari-nath17.vadhyar');
  assert(extension, 'extension manifest discovered');
  const api = await extension.activate();
  await progress('extension activated');
  assert(extension.isActive, 'real extension host activated');
  if (!vscode.workspace.isTrusted) {
    await vscode.commands.executeCommand('workbench.trust.manage');
  }
  if (!vscode.workspace.isTrusted) {
    await new Promise<void>(resolve => {
      const listener = vscode.workspace.onDidGrantWorkspaceTrust(() => { listener.dispose(); resolve(); });
      if (vscode.workspace.isTrusted) { listener.dispose(); resolve(); }
    });
  }
  assert(vscode.workspace.isTrusted, 'prepared workspace trusted');
  assert.deepEqual(await vscode.commands.executeCommand('vadhyar.open'), { opened: true });
  await progress('panel opened');
  const state = await api.act({ type: 'ready' });
  assert.equal(state.refs.length, 1);
  await assert.rejects(api.act({ type: 'openSource', id: 'invented' }));
  await api.act({ type: 'openSource', id: state.refs[0].id });
  await progress('source opened');
  const editor = vscode.window.activeTextEditor;
  assert(editor);
  assert(editor.document.uri.fsPath.endsWith('/novadesk/src/approval.ts'));
  assert.equal(editor.selection.start.line, state.refs[0].startLine - 1);
  await assert.rejects(api.act({ type: 'confirmRequirement', revision: '0'.repeat(64) }));
  await api.act({ type: 'confirmRequirement', revision: state.requirement.revision });
  await progress('requirement confirmed');
  const captured = await api.act({ type: 'checkpoint' });
  assert(captured.confirmed);
  assert.equal(captured.checkpointHash, state.refs[0].hash);
  const resumed = await api.act({ type: 'ready' });
  await progress('snapshot restored');
  assert(resumed.confirmed && resumed.checkpointCount === captured.checkpointCount);
  const concurrent = await Promise.all([api.act({ type: 'checkpoint' }), api.act({ type: 'checkpoint' })]);
  await progress('concurrent writes preserved');
  assert.equal(concurrent[1].checkpointCount, captured.checkpointCount + 2);
  const extracted = await api.act({ type: 'refreshGraph' });
  assert.equal(extracted.graph.version, '0.9.84');
  assert.equal(extracted.graph.relationships.length, 3);
  await api.act({ type: 'confirmMapping', identity: extracted.graph.identity });
  await api.act({ type: 'openSource', id: extracted.refs[0].id });
  assert.equal(vscode.window.activeTextEditor?.selection.start.line, 11);
  await writeFile('/tmp/vadhyar-host-evidence.json', JSON.stringify({ capturedAt: new Date().toISOString(), vscode: vscode.version, activated: true, panelOpened: true, trusted: true, sourceOpened: 'src/approval.ts', selectedLine: state.refs[0].startLine, invalidIdRejected: true, confirmed: true, snapshotHash: captured.checkpointHash, restored: true, restoredOnActivation: state.confirmed && state.checkpointCount > 0, concurrentWritesPreserved: true, graphifyVersion: extracted.graph.version, graphIdentity: extracted.graph.identity, graphSourceHash: extracted.graph.sourceHash, graphReferences: extracted.refs.length, graphRelationships: extracted.graph.relationships.length, mappingConfirmed: true }, null, 2));
}
