import * as vscode from 'vscode';
import fs from 'node:fs';
import path from 'node:path';
import { AnalysisResult } from '@apisentry/types';

export class ContractPanel {
  public static currentPanel: ContractPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private static logoBase64: string = '';
  private extensionUri: vscode.Uri;
  private lastResult: AnalysisResult | null = null;
  private selectedPreset: string = '';

  public static createOrShow(extensionUri: vscode.Uri, result: AnalysisResult | null) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (!ContractPanel.logoBase64) {
      try {
        const iconPath = path.join(extensionUri.fsPath, 'icon.png');
        if (fs.existsSync(iconPath)) {
          ContractPanel.logoBase64 = `data:image/png;base64,${fs.readFileSync(iconPath).toString('base64')}`;
        }
      } catch {
        // Fallback
      }
    }

    if (ContractPanel.currentPanel) {
      ContractPanel.currentPanel.panel.reveal(column);
      if (result) {
        ContractPanel.currentPanel.update(result, '');
      }
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'apisentryExplorer',
      'APISentry Preview',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'dist'),
          vscode.Uri.joinPath(extensionUri, 'src')
        ]
      }
    );

    ContractPanel.currentPanel = new ContractPanel(panel, extensionUri, result);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, result: AnalysisResult | null) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.lastResult = result;

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(message => {
      if (message.command === 'ready') {
        this.postData();
      } else if (message.command === 'scanWorkspace') {
        this.selectedPreset = message.fixture || '';
        this.panel.webview.postMessage({ type: 'SCAN_START' });
        vscode.commands.executeCommand('apisentry.scanWorkspace', message.fixture);
      } else if (message.command === 'openFile') {
        const uri = vscode.Uri.file(message.filePath);
        vscode.window.showTextDocument(uri, {
          selection: new vscode.Range(
            Math.max(0, message.line - 1),
            Math.max(0, message.column - 1),
            Math.max(0, message.line - 1),
            Math.max(0, message.column + 10)
          )
        });
      }
    });

    this.initWebviewHtml();
  }

  private initWebviewHtml() {
    const webview = this.panel.webview;
    const scriptPathOnDisk = vscode.Uri.joinPath(this.extensionUri, 'dist', 'webview', 'index.js');
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    this.panel.webview.html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APISentry IDE Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Montserrat', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          }
        }
      }
    }
  </script>
</head>
<body class="bg-[#0B0F17] text-[#F3F4F6] font-sans min-h-screen antialiased bg-[radial-gradient(at_10%_10%,rgba(99,102,241,0.15)_0px,transparent_50%),radial-gradient(at_90%_90%,rgba(6,182,212,0.15)_0px,transparent_50%)]">
  <div id="root"></div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
  }

  public update(result: AnalysisResult, selectedPreset: string = '') {
    this.lastResult = result;
    if (selectedPreset) this.selectedPreset = selectedPreset;
    this.postData();
  }

  private postData() {
    this.panel.webview.postMessage({
      type: 'UPDATE_DATA',
      result: this.lastResult,
      logoBase64: ContractPanel.logoBase64,
      selectedPreset: this.selectedPreset
    });
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
