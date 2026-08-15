import * as vscode from 'vscode';
import fs from 'node:fs';
import path from 'node:path';
import { AnalysisResult, ContractIssue } from '@apisentry/types';

export class ContractPanel {
  public static currentPanel: ContractPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private static logoBase64: string = '';
  private static htmlTemplate: string = '';
  private static cssContent: string = '';

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

    // Load HTML and CSS templates
    if (!ContractPanel.htmlTemplate || !ContractPanel.cssContent) {
      try {
        const webviewDir = path.join(extensionUri.fsPath, 'src', 'webview');
        const htmlPath = path.join(webviewDir, 'dashboard.html');
        const cssPath = path.join(webviewDir, 'styles.css');

        if (fs.existsSync(htmlPath)) {
          ContractPanel.htmlTemplate = fs.readFileSync(htmlPath, 'utf-8');
        }
        if (fs.existsSync(cssPath)) {
          ContractPanel.cssContent = fs.readFileSync(cssPath, 'utf-8');
        }
      } catch {
        // Fallback handled gracefully
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

    if (result) {
      this.update(result, '');
    } else {
      this.updateEmpty();
    }
  }

  public update(result: AnalysisResult, selectedPreset: string = '') {
    const errors = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;

    const logoHtml = ContractPanel.logoBase64
      ? `<img src="${ContractPanel.logoBase64}" class="logo-img" alt="APISentry">`
      : `<div class="logo-img" style="background:linear-gradient(135deg, #06B6D4, #6366F1); display:flex; align-items:center; justify-content:center; font-weight:bold; color:white;">AS</div>`;

    const presetsOptions = `
      <option value="" ${selectedPreset === '' ? 'selected' : ''}>📁 Current IDE Workspace</option>
      <option value="fixtures/request-mismatch" ${selectedPreset.includes('request-mismatch') ? 'selected' : ''}>⚡ Preset: Request Field Mismatch</option>
      <option value="fixtures/nested-router" ${selectedPreset.includes('nested-router') ? 'selected' : ''}>⚡ Preset: Nested Express Router</option>
      <option value="fixtures/missing-endpoint" ${selectedPreset.includes('missing-endpoint') ? 'selected' : ''}>⚡ Preset: Missing Endpoint</option>
      <option value="fixtures/method-mismatch" ${selectedPreset.includes('method-mismatch') ? 'selected' : ''}>⚡ Preset: Method Mismatch</option>
      <option value="fixtures/valid-express-react" ${selectedPreset.includes('valid-express-react') ? 'selected' : ''}>⚡ Preset: Valid Express + React</option>
      <option value="fixtures/zod-validation" ${selectedPreset.includes('zod-validation') ? 'selected' : ''}>⚡ Preset: Zod Validation</option>
      <option value="fixtures/response-mismatch" ${selectedPreset.includes('response-mismatch') ? 'selected' : ''}>⚡ Preset: Response Mismatch</option>
    `;

    const consumersHtml = result.consumers.map(c => `
      <div class="item endpoint-item">
        <div>
          <span class="tag ${c.method}">${c.method}</span> <span style="font-family:var(--font-mono); font-weight:600;">${c.path}</span>
        </div>
        <span style="font-size:0.72rem; color:var(--text-muted); font-weight:600;">Frontend</span>
      </div>
    `).join('');

    const providersHtml = result.providers.map(p => `
      <div class="item endpoint-item">
        <div>
          <span class="tag ${p.method}">${p.method}</span> <span style="font-family:var(--font-mono); font-weight:600;">${p.path}</span>
        </div>
        <span style="font-size:0.72rem; color:#A7F3D0; font-weight:600;">Backend</span>
      </div>
    `).join('');

    const issuesHtml = result.issues.length === 0 ? `
      <div style="padding:50px; text-align:center; color:var(--accent-green);">
        <div style="font-size:3rem; margin-bottom:12px;">🎉</div>
        <h3 style="font-weight:800;">All API contracts match perfectly!</h3>
        <p style="font-size:0.9rem; color:var(--text-muted); margin-top:6px;">No breaking changes detected between frontend callers and backend endpoints.</p>
      </div>
    ` : result.issues.map((issue, idx) => this.renderIssueCardHtml(issue, idx)).join('');

    let html = ContractPanel.htmlTemplate || this.getDefaultFallbackHtml();

    html = html
      .replace('/* STYLES_INJECT_PLACEHOLDER */', ContractPanel.cssContent || this.getDefaultFallbackCss())
      .replace('<!-- LOGO_INJECT_PLACEHOLDER -->', logoHtml)
      .replace('<!-- PRESETS_INJECT_PLACEHOLDER -->', presetsOptions)
      .replace('<!-- FILES_VAL -->', String(result.metrics.filesDiscovered))
      .replace('<!-- CONSUMERS_VAL -->', String(result.metrics.consumersDetected))
      .replace('<!-- PROVIDERS_VAL -->', String(result.metrics.providersDetected))
      .replace('<!-- ERRORS_VAL -->', String(errors))
      .replace('<!-- WARNINGS_VAL -->', String(warnings))
      .replace('<!-- ENDPOINTS_COUNT -->', `${result.consumers.length + result.providers.length} items`)
      .replace('<!-- ENDPOINTS_LIST_INJECT -->', consumersHtml + providersHtml)
      .replace('<!-- ISSUES_COUNT -->', `${result.issues.length} issues`)
      .replace('<!-- ISSUES_LIST_INJECT -->', issuesHtml);

    this.panel.webview.html = html;
  }

  private renderIssueCardHtml(issue: ContractIssue, idx: number): string {
    const loc = issue.primaryLocation;
    const rel = issue.relatedLocations && issue.relatedLocations.length > 0 ? issue.relatedLocations[0] : null;

    let errorDetail = '';
    let expectedDetail = '';
    let solutionCode = '';

    if (issue.type === 'MISSING_REQUEST_FIELD') {
      const fieldMatch = issue.message.match(/field "([^"]+)"/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'field';

      const sentSchema: Record<string, string> = {};
      if (issue.consumer?.request?.body) {
        issue.consumer.request.body.forEach(f => { sentSchema[f.name] = f.type || 'string'; });
      }

      const expectedSchema: Record<string, string> = {};
      if (issue.provider?.request?.body) {
        issue.provider.request.body.forEach(f => { expectedSchema[f.name] = f.type || 'string'; });
      } else {
        expectedSchema[fieldName] = 'string';
      }

      errorDetail = `// Current Frontend Payload (Missing: "${fieldName}")\n{\n` +
        Object.keys(sentSchema).map(k => `  "${k}": "${sentSchema[k]}"`).join(',\n') +
        `\n  // ❌ Missing required property: "${fieldName}"\n}`;

      expectedDetail = `// Correct Backend Route Schema\n{\n` +
        Object.keys(expectedSchema).map(k => `  "${k}": "${expectedSchema[k]}"${k === fieldName ? '  <-- REQUIRED' : ''}`).join(',\n') +
        `\n}`;

      solutionCode = `// Updated Frontend API Request Body Fix:\naxios.post("${issue.consumer?.path || '/api/register'}", {\n` +
        Object.keys(expectedSchema).map(k => `  ${k}: ${k === fieldName ? `/* Add ${fieldName} */ ""` : k}`).join(',\n') +
        `\n});`;
    } else if (issue.type === 'UNKNOWN_REQUEST_FIELD') {
      const fieldMatch = issue.message.match(/field "([^"]+)"/);
      const fieldName = fieldMatch ? fieldMatch[1] : 'field';

      const sentSchema: Record<string, string> = {};
      if (issue.consumer?.request?.body) {
        issue.consumer.request.body.forEach(f => { sentSchema[f.name] = f.type || 'string'; });
      }

      const expectedSchema: Record<string, string> = {};
      if (issue.provider?.request?.body) {
        issue.provider.request.body.forEach(f => { expectedSchema[f.name] = f.type || 'string'; });
      }

      errorDetail = `// Current Sent Payload\n{\n` +
        Object.keys(sentSchema).map(k => `  "${k}": "${sentSchema[k]}"${k === fieldName ? '  <-- ❌ UNKNOWN FIELD' : ''}`).join(',\n') +
        `\n}`;

      expectedDetail = `// Backend Zod Schema Validator\n{\n` +
        Object.keys(expectedSchema).map(k => `  "${k}": "${expectedSchema[k]}"`).join(',\n') +
        `\n}`;

      solutionCode = `// Corrected Payload (Remove "${fieldName}" or add to backend schema):\nconst requestBody = {\n` +
        Object.keys(sentSchema).filter(k => k !== fieldName).map(k => `  ${k}: ${k}`).join(',\n') +
        `\n};`;
    } else if (issue.type === 'METHOD_MISMATCH') {
      errorDetail = `// Frontend call verb:\nHTTP ${issue.consumer?.method || 'POST'} ${issue.consumer?.path || ''}`;
      expectedDetail = `// Backend route verb:\nHTTP ${issue.provider?.method || 'PUT'} ${issue.provider?.path || ''}`;
      solutionCode = `// Correct HTTP verb in frontend call:\nawait axios.${(issue.provider?.method || 'PUT').toLowerCase()}("${issue.consumer?.path || '/api'}");`;
    } else if (issue.type === 'ENDPOINT_NOT_FOUND') {
      errorDetail = `// Unmatched Call:\nHTTP ${issue.consumer?.method} ${issue.consumer?.path}`;
      expectedDetail = `// Expected Handler:\nNo Express route matching "${issue.consumer?.path}"`;
      solutionCode = `// Express Router Fix (Add endpoint in backend):\napp.${(issue.consumer?.method || 'GET').toLowerCase()}("${issue.consumer?.path}", (req, res) => {\n  res.json({ success: true });\n});`;
    } else {
      errorDetail = issue.message;
      expectedDetail = 'Backend contract schema';
      solutionCode = '// Align frontend request payload with backend schema definition.';
    }

    return `
      <div class="issue-card ${issue.severity}">
        <div class="issue-header">
          <span class="issue-type ${issue.severity}">[${issue.type}] ${issue.consumer ? `${issue.consumer.method} ${issue.consumer.path}` : ''}</span>
        </div>

        <div class="issue-message">${issue.message}</div>

        <div class="diff-comparison">
          <div class="diff-box error-box">
            <div class="diff-box-title">❌ Current Sent Payload (Frontend)</div>
            <div class="schema-header">Detected Payload Schema</div>
            <div class="diff-code">${this.escapeHtml(errorDetail)}</div>
            <a class="loc-link" onclick="openFile('${loc.filePath.replace(/\\/g, '\\\\')}', ${loc.startLine}, ${loc.startColumn})">📍 ${path.basename(loc.filePath)}:${loc.startLine}:${loc.startColumn}</a>
          </div>

          <div class="diff-box expected-box">
            <div class="diff-box-title">✅ Correct Expected Schema (Backend)</div>
            <div class="schema-header">Backend Route Schema</div>
            <div class="diff-code">${this.escapeHtml(expectedDetail)}</div>
            ${rel ? `<a class="loc-link" onclick="openFile('${rel.filePath.replace(/\\/g, '\\\\')}', ${rel.startLine}, ${rel.startColumn})">🔗 ${path.basename(rel.filePath)}:${rel.startLine}:${rel.startColumn}</a>` : '<div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">No provider file</div>'}
          </div>
        </div>

        <div class="solution-box">
          <div class="solution-header">💡 Suggested Code Fix & Patch:</div>
          <div class="solution-code" id="solution-code-${idx}">${this.escapeHtml(solutionCode)}</div>
        </div>
      </div>
    `;
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  private updateEmpty() {
    this.panel.webview.html = `<!DOCTYPE html><html><body style="font-family:'Montserrat', sans-serif; padding:24px; color:#fff; background:#0B0F17;">
      <h2>APISentry IDE Dashboard</h2>
      <button onclick="scan()" style="background:linear-gradient(135deg, #06B6D4, #3B82F6); color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; margin-top:16px;">Start Instant Analysis</button>
      <script>
        const vscode = acquireVsCodeApi();
        function scan() { vscode.postMessage({ command: 'scanWorkspace' }); }
      </script>
    </body></html>`;
  }

  private getDefaultFallbackHtml(): string {
    return `<!DOCTYPE html><html><head><style>/* STYLES_INJECT_PLACEHOLDER */</style></head><body>
      <div class="header"><div class="brand"><!-- LOGO_INJECT_PLACEHOLDER --><div class="title-box"><div class="title">APISentry IDE Dashboard</div><div class="subtitle">Real-time Static API Contract Guard</div></div></div><div class="controls"><select id="fixtureSelect" onchange="runPresetScan(this.value)"><!-- PRESETS_INJECT_PLACEHOLDER --></select><button class="btn" onclick="scan()">Analyze Workspace Now</button></div></div>
      <div class="metrics"><div class="metric-card"><div class="metric-label">Files Analyzed</div><div class="metric-val"><!-- FILES_VAL --></div></div><div class="metric-card"><div class="metric-label">Frontend Callers</div><div class="metric-val"><!-- CONSUMERS_VAL --></div></div><div class="metric-card"><div class="metric-label">Backend Endpoints</div><div class="metric-val"><!-- PROVIDERS_VAL --></div></div><div class="metric-card"><div class="metric-label">Contract Errors</div><div class="metric-val error"><!-- ERRORS_VAL --></div></div><div class="metric-card"><div class="metric-label">Contract Warnings</div><div class="metric-val warning"><!-- WARNINGS_VAL --></div></div></div>
      <div class="grid"><div class="panel"><div class="panel-title"><span>Discovered Endpoints</span><span><!-- ENDPOINTS_COUNT --></span></div><input type="text" class="search-input" placeholder="Filter endpoints..." oninput="filterEndpoints(this.value)"><div id="endpointList" style="display:flex; flex-direction:column; gap:8px;"><!-- ENDPOINTS_LIST_INJECT --></div></div><div class="panel"><div class="panel-title"><span>Contract Issues & Correct Schemas</span><span><!-- ISSUES_COUNT --></span></div><!-- ISSUES_LIST_INJECT --></div></div>
      <script>const vscode = acquireVsCodeApi(); function scan() { const select = document.getElementById('fixtureSelect'); vscode.postMessage({ command: 'scanWorkspace', fixture: select ? select.value : '' }); } function runPresetScan(val) { vscode.postMessage({ command: 'scanWorkspace', fixture: val }); } function openFile(filePath, line, column) { vscode.postMessage({ command: 'openFile', filePath, line, column }); } function filterEndpoints(q) { document.querySelectorAll('.endpoint-item').forEach(item => { item.style.display = item.innerText.toLowerCase().includes(q.toLowerCase()) ? 'flex' : 'none'; }); }</script>
    </body></html>`;
  }

  private getDefaultFallbackCss(): string {
    return `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap'); :root { --bg-dark: #0B0F17; --bg-card: rgba(17, 24, 39, 0.75); --text-main: #F3F4F6; --text-muted: #9CA3AF; --accent-cyan: #06B6D4; --accent-red: #F43F5E; --accent-yellow: #F59E0B; --font-montserrat: 'Montserrat', sans-serif; --font-mono: 'JetBrains Mono', monospace; } body { font-family: var(--font-montserrat); background: var(--bg-dark); color: var(--text-main); padding: 24px; } .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; } .brand { display: flex; align-items: center; gap: 14px; } .logo-img { width: 44px; height: 44px; border-radius: 10px; } .title { font-size: 1.25rem; font-weight: 800; } .subtitle { font-size: 0.8rem; color: var(--text-muted); } .controls { display: flex; gap: 14px; } select, .btn { font-family: var(--font-montserrat); padding: 9px 14px; border-radius: 8px; font-weight: 600; } .btn { background: #06B6D4; color: white; border: none; cursor: pointer; } .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 24px; } .metric-card { background: var(--bg-card); padding: 16px; border-radius: 12px; } .metric-val { font-size: 1.8rem; font-weight: 800; } .metric-val.error { color: var(--accent-red); } .metric-val.warning { color: var(--accent-yellow); } .grid { display: grid; grid-template-columns: 340px 1fr; gap: 24px; } .panel { background: var(--bg-card); padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 16px; } .issue-card { background: rgba(17, 24, 39, 0.9); padding: 20px; border-radius: 12px; margin-bottom: 16px; } .diff-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 12px 0; } .diff-box { background: rgba(0,0,0,0.4); padding: 14px; border-radius: 10px; } .diff-code { font-family: var(--font-mono); font-size: 0.84rem; } .solution-box { background: rgba(6, 182, 212, 0.1); padding: 14px; border-radius: 10px; } .solution-code { font-family: var(--font-mono); font-size: 0.84rem; color: #A7F3D0; }`;
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
