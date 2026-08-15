import * as vscode from 'vscode';
import { AnalysisResult } from '@apisentry/types';

export class ContractPanel {
  public static currentPanel: ContractPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, result: AnalysisResult | null) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (ContractPanel.currentPanel) {
      ContractPanel.currentPanel.panel.reveal(column);
      if (result) {
        ContractPanel.currentPanel.update(result);
      }
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'apisentryExplorer',
      'APISentry Preview',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri]
      }
    );

    ContractPanel.currentPanel = new ContractPanel(panel, result);
  }

  private constructor(panel: vscode.WebviewPanel, result: AnalysisResult | null) {
    this.panel = panel;

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(message => {
      if (message.command === 'scanWorkspace') {
        vscode.commands.executeCommand('apisentry.scanWorkspace');
      }
    });

    if (result) {
      this.update(result);
    } else {
      this.updateEmpty();
    }
  }

  public update(result: AnalysisResult) {
    const errors = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APISentry IDE Preview</title>
  <style>
    :root {
      --bg-dark: var(--vscode-editor-background, #0B0F17);
      --bg-card: var(--vscode-editor-inactiveSelectionBackground, rgba(17, 24, 39, 0.7));
      --border-color: var(--vscode-widget-border, rgba(255, 255, 255, 0.1));
      --text-main: var(--vscode-editor-foreground, #F3F4F6);
      --text-muted: var(--vscode-descriptionForeground, #9CA3AF);
      --accent-cyan: #06B6D4;
      --accent-indigo: #6366F1;
      --accent-red: var(--vscode-errorForeground, #F43F5E);
      --accent-yellow: var(--vscode-editorWarning-foreground, #F59E0B);
      --accent-green: #10B981;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--vscode-font-family, system-ui, sans-serif); background: var(--bg-dark); color: var(--text-main); padding: 20px; }
    
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo { background: linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo)); color: white; font-weight: 800; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .title { font-size: 1.2rem; font-weight: 700; }
    
    .btn { background: var(--vscode-button-background, #06B6D4); color: var(--vscode-button-foreground, white); border: none; padding: 8px 16px; font-weight: 600; border-radius: 6px; cursor: pointer; }
    .btn:hover { background: var(--vscode-button-hoverBackground, #0891B2); }

    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .metric-card { background: var(--bg-card); border: 1px solid var(--border-color); padding: 14px; border-radius: 8px; }
    .metric-val { font-size: 1.6rem; font-weight: 800; }
    .metric-val.error { color: var(--accent-red); }
    .metric-val.warning { color: var(--accent-yellow); }

    .grid { display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }

    .panel { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; }
    .panel-title { font-weight: 600; margin-bottom: 12px; }

    .item { padding: 10px; border-radius: 6px; background: rgba(255,255,255,0.03); margin-bottom: 8px; font-size: 0.85rem; }
    .tag { font-weight: 700; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }
    .tag.GET { color: #34D399; }
    .tag.POST { color: #60A5FA; }
    .tag.PUT { color: #FBBF24; }

    .issue-card { border-left: 4px solid var(--accent-red); background: rgba(0,0,0,0.2); padding: 14px; border-radius: 6px; margin-bottom: 12px; }
    .issue-card.warning { border-left-color: var(--accent-yellow); }
    .issue-type { font-weight: 700; font-family: monospace; font-size: 0.85rem; margin-bottom: 4px; }
    .loc { font-family: monospace; font-size: 0.8rem; color: var(--vscode-textLink-foreground, #38BDF8); margin-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="logo">AS</div>
      <div class="title">APISentry Preview</div>
    </div>
    <button class="btn" onclick="scan()">Analyze Workspace Now</button>
  </div>

  <div class="metrics">
    <div class="metric-card"><div style="font-size:0.75rem; color:var(--text-muted);">Files</div><div class="metric-val">${result.metrics.filesDiscovered}</div></div>
    <div class="metric-card"><div style="font-size:0.75rem; color:var(--text-muted);">Consumers</div><div class="metric-val">${result.metrics.consumersDetected}</div></div>
    <div class="metric-card"><div style="font-size:0.75rem; color:var(--text-muted);">Providers</div><div class="metric-val">${result.metrics.providersDetected}</div></div>
    <div class="metric-card"><div style="font-size:0.75rem; color:var(--text-muted);">Errors</div><div class="metric-val error">${errors}</div></div>
    <div class="metric-card"><div style="font-size:0.75rem; color:var(--text-muted);">Warnings</div><div class="metric-val warning">${warnings}</div></div>
  </div>

  <div class="grid">
    <div class="panel">
      <div class="panel-title">Endpoints (${result.consumers.length + result.providers.length})</div>
      ${result.consumers.map(c => `
        <div class="item">
          <span class="tag ${c.method}">${c.method}</span> <span>${c.path}</span>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">Frontend Call</div>
        </div>
      `).join('')}
      ${result.providers.map(p => `
        <div class="item">
          <span class="tag ${p.method}">${p.method}</span> <span>${p.path}</span>
          <div style="font-size:0.7rem; color:#A7F3D0; margin-top:2px;">Backend Endpoint</div>
        </div>
      `).join('')}
    </div>

    <div class="panel">
      <div class="panel-title">Contract Issues (${result.issues.length})</div>
      ${result.issues.length === 0 ? '<p style="color:var(--accent-green);">🎉 All API contracts match!</p>' : ''}
      ${result.issues.map(issue => `
        <div class="issue-card ${issue.severity}">
          <div class="issue-type">[${issue.type}] ${issue.consumer ? `${issue.consumer.method} ${issue.consumer.path}` : ''}</div>
          <div>${issue.message}</div>
          <div class="loc">📍 ${issue.primaryLocation.filePath}:${issue.primaryLocation.startLine}:${issue.primaryLocation.startColumn}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function scan() {
      vscode.postMessage({ command: 'scanWorkspace' });
    }
  </script>
</body>
</html>`;

    this.panel.webview.html = html;
  }

  private updateEmpty() {
    this.panel.webview.html = `<!DOCTYPE html><html><body style="font-family:sans-serif; padding:20px; color:#fff; background:#0B0F17;">
      <h2>APISentry IDE Preview</h2>
      <button onclick="scan()" style="background:#06B6D4; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold; margin-top:12px;">Start Instant Analysis</button>
      <script>
        const vscode = acquireVsCodeApi();
        function scan() { vscode.postMessage({ command: 'scanWorkspace' }); }
      </script>
    </body></html>`;
  }

  public dispose() {
    ContractPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) x.dispose();
    }
  }
}
