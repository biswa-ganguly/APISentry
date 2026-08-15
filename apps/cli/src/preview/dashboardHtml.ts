export function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APISentry - Instant API Contract Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0B0F17;
      --bg-card: rgba(17, 24, 39, 0.7);
      --bg-card-hover: rgba(31, 41, 55, 0.8);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-main: #F3F4F6;
      --text-muted: #9CA3AF;
      --accent-cyan: #06B6D4;
      --accent-indigo: #6366F1;
      --accent-red: #F43F5E;
      --accent-yellow: #F59E0B;
      --accent-green: #10B981;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-dark);
      background-image: 
        radial-gradient(at 10% 10%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
        radial-gradient(at 90% 90%, rgba(6, 182, 212, 0.15) 0px, transparent 50%);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      border-bottom: 1px solid var(--border-color);
      backdrop-filter: blur(16px);
      background: rgba(11, 15, 23, 0.8);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo));
      color: white;
      font-weight: 800;
      font-size: 1.1rem;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
    }

    .title {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .title span {
      color: var(--text-muted);
      font-weight: 400;
      font-size: 0.9rem;
      margin-left: 8px;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    select, button {
      font-family: var(--font-sans);
      font-size: 0.9rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    select {
      background: rgba(31, 41, 55, 0.8);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      outline: none;
      cursor: pointer;
    }

    select:hover {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-primary {
      background: linear-gradient(135deg, #06B6D4, #3B82F6);
      color: white;
      border: none;
      font-weight: 600;
      padding: 10px 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    main {
      flex: 1;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(12px);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metric-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
    }

    .metric-value.error { color: var(--accent-red); }
    .metric-value.warning { color: var(--accent-yellow); }
    .metric-value.healthy { color: var(--accent-green); }

    .content-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 24px;
    }

    @media (max-width: 900px) {
      .content-grid { grid-template-columns: 1fr; }
    }

    .panel {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(12px);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
      font-weight: 600;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .search-input {
      background: rgba(31, 41, 55, 0.6);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 8px 12px;
      border-radius: 6px;
      width: 100%;
      font-size: 0.85rem;
      margin: 12px 20px 0 20px;
      width: calc(100% - 40px);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent-cyan);
    }

    .endpoint-list {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 600px;
      overflow-y: auto;
    }

    .endpoint-item {
      padding: 12px 14px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .endpoint-item:hover, .endpoint-item.active {
      background: var(--bg-card-hover);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .endpoint-path {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 500;
    }

    .method-tag {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .method-tag.GET { background: rgba(16, 185, 129, 0.15); color: #34D399; }
    .method-tag.POST { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
    .method-tag.PUT { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }
    .method-tag.DELETE { background: rgba(244, 63, 94, 0.15); color: #F87171; }

    .issue-list {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .issue-card {
      background: rgba(17, 24, 39, 0.9);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .issue-card.error { border-left: 4px solid var(--accent-red); }
    .issue-card.warning { border-left: 4px solid var(--accent-yellow); }
    .issue-card.info { border-left: 4px solid var(--accent-cyan); }

    .issue-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .issue-type {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
    }

    .issue-type.error { background: rgba(244, 63, 94, 0.15); color: var(--accent-red); }
    .issue-type.warning { background: rgba(245, 158, 11, 0.15); color: var(--accent-yellow); }

    .issue-message {
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .location-box {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 10px 14px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: #7DD3FC;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .location-title {
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .empty-state {
      padding: 60px 20px;
      text-align: center;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="logo-badge">AS</div>
      <div class="title">
        APISentry Live Preview
        <span>Static API Contract Guard</span>
      </div>
    </div>
    <div class="header-controls">
      <select id="fixtureSelect" onchange="loadSelectedFixture()">
        <option value="">📁 Target Workspace (Current Root)</option>
        <option value="fixtures/request-mismatch">⚡ Fixture: Request Field Mismatch</option>
        <option value="fixtures/nested-router">⚡ Fixture: Nested Express Router</option>
        <option value="fixtures/missing-endpoint">⚡ Fixture: Missing Endpoint</option>
        <option value="fixtures/method-mismatch">⚡ Fixture: Method Mismatch</option>
        <option value="fixtures/valid-express-react">⚡ Fixture: Valid Express + React</option>
        <option value="fixtures/zod-validation">⚡ Fixture: Zod Validation</option>
        <option value="fixtures/response-mismatch">⚡ Fixture: Response Mismatch</option>
      </select>
      <button class="btn-primary" onclick="triggerScan()">
        <span id="btnSpinner" class="spinner" style="display:none;"></span>
        <span>Run Instant Analysis</span>
      </button>
    </div>
  </header>

  <main>
    <div class="metrics-row">
      <div class="metric-card">
        <div class="metric-label">Files Analyzed</div>
        <div class="metric-value" id="valFiles">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Frontend Callers</div>
        <div class="metric-value" id="valConsumers">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Backend Endpoints</div>
        <div class="metric-value" id="valProviders">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Contract Errors</div>
        <div class="metric-value error" id="valErrors">0</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Contract Warnings</div>
        <div class="metric-value warning" id="valWarnings">0</div>
      </div>
    </div>

    <div class="content-grid">
      <div class="panel">
        <div class="panel-header">
          <span>Discovered Endpoints</span>
          <span id="endpointCount" style="font-size: 0.8rem; color: var(--text-muted);">0 items</span>
        </div>
        <input type="text" id="searchInput" class="search-input" placeholder="Filter endpoints..." oninput="filterEndpoints()">
        <div class="endpoint-list" id="endpointList">
          <div class="empty-state">No endpoints loaded yet. Click "Run Instant Analysis".</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <span>Contract Mismatch Issues</span>
          <span id="issueCount" style="font-size: 0.8rem; color: var(--text-muted);">0 issues</span>
        </div>
        <div class="issue-list" id="issueList">
          <div class="empty-state">
            <div class="empty-icon">🛡️</div>
            <h3>Ready to analyze API contracts</h3>
            <p style="margin-top:8px;">Select a project or test fixture and click "Run Instant Analysis"</p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    let currentResult = null;

    async function triggerScan() {
      const btnSpinner = document.getElementById('btnSpinner');
      btnSpinner.style.display = 'inline-block';
      const fixtureSelect = document.getElementById('fixtureSelect');
      const fixture = fixtureSelect.value;

      try {
        const url = fixture ? \`/api/scan-fixture?fixture=\${encodeURIComponent(fixture)}\` : '/api/scan';
        const res = await fetch(url);
        const data = await res.json();
        currentResult = data;
        renderDashboard(data);
      } catch (err) {
        alert('Failed to execute scan: ' + err.message);
      } finally {
        btnSpinner.style.display = 'none';
      }
    }

    function loadSelectedFixture() {
      triggerScan();
    }

    function renderDashboard(data) {
      document.getElementById('valFiles').innerText = data.metrics.filesDiscovered;
      document.getElementById('valConsumers').innerText = data.metrics.consumersDetected;
      document.getElementById('valProviders').innerText = data.metrics.providersDetected;

      const errors = data.issues.filter(i => i.severity === 'error').length;
      const warnings = data.issues.filter(i => i.severity === 'warning').length;

      document.getElementById('valErrors').innerText = errors;
      document.getElementById('valWarnings').innerText = warnings;

      renderEndpoints(data.consumers, data.providers);
      renderIssues(data.issues);
    }

    function renderEndpoints(consumers, providers) {
      const list = document.getElementById('endpointList');
      document.getElementById('endpointCount').innerText = \`\${consumers.length + providers.length} endpoints\`;

      if (consumers.length === 0 && providers.length === 0) {
        list.innerHTML = '<div class="empty-state">No endpoints detected in workspace.</div>';
        return;
      }

      let html = '';
      consumers.forEach(c => {
        html += \`
          <div class="endpoint-item">
            <div>
              <span class="method-tag \${c.method}">\${c.method}</span>
              <span class="endpoint-path" style="margin-left:8px;">\${c.path}</span>
            </div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Frontend Call</span>
          </div>
        \`;
      });

      providers.forEach(p => {
        html += \`
          <div class="endpoint-item">
            <div>
              <span class="method-tag \${p.method}">\${p.method}</span>
              <span class="endpoint-path" style="margin-left:8px;">\${p.path}</span>
            </div>
            <span style="font-size:0.75rem; color:#A7F3D0;">Backend Provider</span>
          </div>
        \`;
      });

      list.innerHTML = html;
    }

    function renderIssues(issues) {
      const list = document.getElementById('issueList');
      document.getElementById('issueCount').innerText = \`\${issues.length} issues\`;

      if (issues.length === 0) {
        list.innerHTML = \`
          <div class="empty-state">
            <div class="empty-icon">🎉</div>
            <h3>All API contracts are healthy!</h3>
            <p style="margin-top:8px;">Frontend calls match backend definitions perfectly.</p>
          </div>
        \`;
        return;
      }

      let html = '';
      issues.forEach(issue => {
        html += \`
          <div class="issue-card \${issue.severity}">
            <div class="issue-header">
              <span class="issue-type \${issue.severity}">\${issue.type}</span>
              <span style="font-family:var(--font-mono); font-size:0.8rem; opacity:0.7;">\${issue.consumer ? \`\${issue.consumer.method} \${issue.consumer.path}\` : ''}</span>
            </div>
            <div class="issue-message">\${escapeHtml(issue.message)}</div>
            <div class="location-box">
              <div class="location-title">Frontend Caller Location</div>
              <div>📍 \${issue.primaryLocation.filePath}:\${issue.primaryLocation.startLine}:\${issue.primaryLocation.startColumn}</div>
              \${issue.relatedLocations && issue.relatedLocations.length > 0 ? \`
                <div class="location-title" style="margin-top:6px;">Backend Definition Location</div>
                <div>🔗 \${issue.relatedLocations[0].filePath}:\${issue.relatedLocations[0].startLine}:\${issue.relatedLocations[0].startColumn}</div>
              \` : ''}
            </div>
          </div>
        \`;
      });

      list.innerHTML = html;
    }

    function filterEndpoints() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const items = document.querySelectorAll('.endpoint-item');
      items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    // Run initial scan on load
    window.addEventListener('DOMContentLoaded', triggerScan);
  </script>
</body>
</html>`;
}
