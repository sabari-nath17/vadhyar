import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const log = vscode.window.createOutputChannel('Vadhyar');
  context.subscriptions.push(log, vscode.commands.registerCommand('vadhyar.open', () => {
    if (!vscode.workspace.isTrusted) throw new Error('Trust the prepared NovaDesk workspace first.');
    const panel = vscode.window.createWebviewPanel('vadhyar', 'Vadhyar', vscode.ViewColumn.Beside, {});
    panel.webview.html = '<!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'"></head><body><h1>Vadhyar</h1><p>NovaDesk source handover. Panel actions arrive in S2b.</p></body></html>';
    log.appendLine('activation: prepared panel opened');
    return { opened: true };
  }));
  log.appendLine('activation: ready');
}
